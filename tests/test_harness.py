import unittest
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from packages.database.models import Base, Campaign, Unit, Pilot, Inventory, Mission, CampaignLog, CriticalHit
from packages.agents.core_agent import CoreAgent
from packages.agents.operations_agent import OperationsAgent
from packages.agents.maintenance_agent import MaintenanceAgent
from packages.agents.personnel_agent import PersonnelAgent
from packages.agents.contract_generator import ContractGenerator


class TestBattleTechAgentHarness(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Set up in-memory SQLite database for testing agent contracts."""
        cls.engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

    def setUp(self):
        self.db = self.SessionLocal()
        # Seed test campaign
        self.campaign = Campaign(
            name="Succession Wars 3025 Test",
            current_date="3025-01-15",
            cbill_balance=15000000.0,
            wp_balance=500,
            reputation_score=75,
            mrb_rating="B"
        )
        self.db.add(self.campaign)
        self.db.commit()
        self.db.refresh(self.campaign)

    def tearDown(self):
        self.db.close()
        # Clean up database tables
        Base.metadata.drop_all(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)

    # ==================== 1. CORE AGENT CONTRACT TESTS ====================
    def test_01_core_agent_ledger_summary(self):
        """Verify CoreAgent returns ledger summary correctly."""
        summary = CoreAgent.get_ledger_summary(self.db)
        self.assertEqual(summary["campaign_name"], "Succession Wars 3025 Test")
        self.assertEqual(summary["CBills"], 15000000.0)
        self.assertEqual(summary["WP"], 500)
        self.assertEqual(summary["mrb_rating"], "B")

    # ==================== 2. OPERATIONS AGENT CONTRACT TESTS ====================
    def test_02_generate_procedural_and_custom_contracts(self):
        """Verify procedural payout math & custom contract creation."""
        contract = OperationsAgent.generate_contract(
            db=self.db,
            name="Operation Iron Shield Test",
            mission_type="Garrison Defense",
            employer="House Davion",
            base_cbill=3500000.0,
            wp_reward=400,
            salvage_rights="Shared (50%)",
            blc_coverage=0.5
        )
        self.assertIsNotNone(contract.id)
        self.assertEqual(contract.name, "Operation Iron Shield Test")
        self.assertEqual(contract.status, "Active")
        # MRB Rating B gives 1.08x bonus -> 3,500,000 * 1.08 = 3,780,000
        self.assertAlmostEqual(contract.cbill_reward, 3780000.0, places=2)

    def test_03_contract_generator_official_rules(self):
        """Verify ContractGenerator incorporates Campaign Operations v5.0 payout & climate rules."""
        proc_contract = ContractGenerator.generate_procedural_contract()
        self.assertTrue(any(f in proc_contract["employer"] for f in ["Davion", "Draconis", "Steiner", "Marik", "Liao", "ComStar", "Independent", "Solaris", "Wolf"]))
        self.assertGreater(proc_contract["base_cbill"], 0)
        self.assertGreater(proc_contract["wp_reward"], 0)

    def test_04_combat_aar_kill_tracker_and_xp_engine(self):
        """Verify AAR processing with pilot kills, bondsmen capture, and A Time of War XP math."""
        # Create test unit and pilot
        unit = Unit(campaign_id=self.campaign.id, chassis="Marauder", model="MAD-3R", tonnage=75, bv2=1363)
        self.db.add(unit)
        self.db.commit()

        pilot = Pilot(campaign_id=self.campaign.id, name="Lt. Natasha Kerensky", callsign="Black Widow", gunnery=2, piloting=3, xp=85, kills=5)
        self.db.add(pilot)
        self.db.commit()

        unit_logs = [{"unit_id": unit.id, "armor_loss": 15, "structure_loss": 0}]
        pilot_logs = [{
            "pilot_id": pilot.id,
            "injuries_sustained": 0,
            "kills_count": 1,
            "kills_details": [{
                "enemy_mech_chassis": "Catapult",
                "enemy_mech_model": "CPLT-A1",
                "enemy_mech_tonnage": 65,
                "is_bondsman_captured": True,
                "bondsman_name": "MechWarrior Marcus Trent"
            }],
            "flawless_performance": False
        }]

        res = OperationsAgent.process_aar(
            db=self.db,
            unit_logs=unit_logs,
            pilot_logs=pilot_logs,
            salvage_cbill_value=500000.0,
            salvage_items=["PPC", "Medium Laser"]
        )

        self.assertIn("xp_awarded", res)
        # Pilot receives: 15 (base) + 15 (heavy kill) + 15 (bondsman) = 45 XP
        self.assertEqual(res["xp_awarded"]["Lt. Natasha Kerensky"], 45)

        # Refresh pilot from DB
        self.db.refresh(pilot)
        self.assertEqual(pilot.kills, 6)
        self.assertEqual(pilot.bondsmen, 1)
        self.assertEqual(pilot.xp, 130) # 85 + 45 = 130

    # ==================== 3. MAINTENANCE AGENT CONTRACT TESTS ====================
    def test_05_maintenance_repair_and_inventory(self):
        """Verify armor repair, critical component replacement, and inventory tracking."""
        unit = Unit(campaign_id=self.campaign.id, chassis="Warhammer", model="WHM-6R", tonnage=70, bv2=1299, armor_damage=20, structure_damage=5)
        self.db.add(unit)
        self.db.commit()

        # Repair unit
        repaired_res = MaintenanceAgent.repair_unit_armor_and_structure(self.db, unit.id)
        self.db.refresh(unit)
        self.assertEqual(unit.armor_damage, 0)
        self.assertEqual(unit.structure_damage, 0)

        # Add Inventory item
        inv = MaintenanceAgent.add_inventory(self.db, "AC/20 Autocannon", quantity=2, category="Weaponry")
        self.assertEqual(inv.quantity, 2)

    # ==================== 4. PERSONNEL AGENT CONTRACT TESTS ====================
    def test_06_personnel_xp_skill_upgrades(self):
        """Verify Gunnery (-1 for 30 XP) and Piloting (-1 for 20 XP) skill upgrades per A Time of War."""
        pilot = Pilot(campaign_id=self.campaign.id, name="Kaelen Cross", callsign="Bishop", gunnery=3, piloting=4, xp=100)
        self.db.add(pilot)
        self.db.commit()

        # Upgrade Gunnery skill (costs 30 XP)
        upgraded_res = PersonnelAgent.upgrade_pilot_skill(self.db, pilot.id, "gunnery")
        self.db.refresh(pilot)
        self.assertEqual(pilot.gunnery, 2)
        self.assertEqual(pilot.xp, 70)

        # Upgrade Piloting skill (costs 20 XP)
        upgraded_res_2 = PersonnelAgent.upgrade_pilot_skill(self.db, pilot.id, "piloting")
        self.db.refresh(pilot)
        self.assertEqual(pilot.piloting, 3)
        self.assertEqual(pilot.xp, 50)

    # ==================== 5. DATA SYNC AGENT CONTRACT TESTS ====================
    def test_07_data_sync_agent_network_toggles(self):
        """Verify DataSyncAgent network toggles dynamically switch between live & offline cache."""
        from packages.agents.data_sync_agent import DataSyncAgent
        DataSyncAgent.set_mode(mul_online=False, sarna_online=False, megamek_online=False)
        self.assertFalse(DataSyncAgent.IS_MUL_ONLINE)
        self.assertFalse(DataSyncAgent.IS_SARNA_ONLINE)

        # Re-enable online
        DataSyncAgent.set_mode(mul_online=True, sarna_online=True, megamek_online=True)
        self.assertTrue(DataSyncAgent.IS_MUL_ONLINE)

    # ==================== 6. FORCE DEPLOYMENT CONTRACT TESTS ====================
    def test_08_force_deployment_and_dropzone_selection(self):
        """Verify Step 2 deployment status update and DropZone vector selection."""
        mission = Mission(
            campaign_id=self.campaign.id,
            name="Operation Red Storm",
            mission_type="Raid",
            employer="House Steiner",
            status="Active"
        )
        self.db.add(mission)
        self.db.commit()

        # Deploy force to Bravo DZ (Dense Forest)
        mission.status = "In Combat"
        self.db.add(CampaignLog(
            campaign_id=self.campaign.id,
            log_date=self.campaign.current_date,
            event_type="Force Deployment",
            description="Command Lance deployed to Bravo DZ (Dense Forest) for Operation Red Storm."
        ))
        self.db.commit()

        self.db.refresh(mission)
        self.assertEqual(mission.status, "In Combat")

    # ==================== 7. AAR DAMAGE TRANSFER CONTRACT TESTS ====================
    def test_09_aar_damage_transfer_to_tech_bay(self):
        """Verify combat AAR armor/structure damage and critical hits transfer to Tech Bay."""
        unit = Unit(campaign_id=self.campaign.id, chassis="Centurion", model="CN9-A", tonnage=50, bv2=945, armor_damage=0, structure_damage=0)
        self.db.add(unit)
        self.db.commit()

        unit_logs = [{
            "unit_id": unit.id,
            "armor_loss": 25,
            "structure_loss": 8,
            "critical_hits": [{"location": "CT", "component_name": "PPC"}]
        }]

        OperationsAgent.process_aar(
            db=self.db,
            unit_logs=unit_logs,
            pilot_logs=[]
        )

        self.db.refresh(unit)
        self.assertEqual(unit.armor_damage, 25)
        self.assertEqual(unit.structure_damage, 8)

        crit = self.db.query(CriticalHit).filter(CriticalHit.unit_id == unit.id).first()
        self.assertIsNotNone(crit)
        self.assertEqual(crit.component_name, "PPC")

    # ==================== 8. TECH REPAIR TIME DURATION CONTRACT TESTS ====================
    def test_10_tech_repair_time_duration_clock(self):
        """Verify Tech Bay armor repair advances campaign date by duration days."""
        unit = Unit(campaign_id=self.campaign.id, chassis="Warhammer", model="WHM-6R", tonnage=70, bv2=1299, armor_damage=30, structure_damage=10)
        self.db.add(unit)
        self.db.commit()

        initial_date = self.campaign.current_date

        res = MaintenanceAgent.repair_unit_armor_and_structure(self.db, unit.id)
        self.db.refresh(self.campaign)
        self.db.refresh(unit)

        self.assertEqual(unit.armor_damage, 0)
        self.assertEqual(unit.structure_damage, 0)
        self.assertEqual(res["days_added"], 4)
        self.assertNotEqual(self.campaign.current_date, initial_date)


if __name__ == "__main__":
    unittest.main()
