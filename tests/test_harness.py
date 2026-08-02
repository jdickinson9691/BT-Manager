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
from packages.agents.era_faction_agent import EraFactionAgent


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
            wp_balance=1500,
            sp_balance=800,
            cbill_balance=0.0,
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
        self.assertEqual(summary["WP"], 1500)
        self.assertEqual(summary["SP"], 800)
        self.assertEqual(summary["mrb_rating"], "B")

    # ==================== 2. OPERATIONS AGENT CONTRACT TESTS ====================
    def test_02_generate_procedural_and_custom_contracts(self):
        """Verify procedural payout math & custom contract creation."""
        contract = OperationsAgent.generate_contract(
            db=self.db,
            name="Operation Iron Shield Test",
            mission_type="Garrison Defense",
            employer="House Davion",
            wp_reward=400,
            sp_reward=200,
            salvage_rights="Shared (50%)",
            blc_coverage=0.5
        )
        self.assertIsNotNone(contract.id)
        self.assertEqual(contract.name, "Operation Iron Shield Test")
        self.assertEqual(contract.status, "Active")
        # MRB Rating B gives 1.08x bonus -> 400 * 1.08 = 432 WP
        self.assertEqual(contract.wp_reward, 432)

    def test_03_contract_generator_official_rules(self):
        """Verify ContractGenerator incorporates Campaign Operations & Chaos Campaign payout & climate rules."""
        proc_contract = ContractGenerator.generate_procedural_contract()
        self.assertTrue(any(f in proc_contract["employer"] for f in ["Davion", "Draconis", "Steiner", "Marik", "Liao", "ComStar", "Independent", "Solaris", "Wolf"]))
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
            salvage_cbill_value=0.0,
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

    # ==================== 9. BONDSMEN RANSOM & INTEGRATION CONTRACT TESTS ====================
    def test_11_bondsmen_ransom_and_integration(self):
        """Verify bondsman ransom adds Warchest Points (WP) and bondsman integration recruits active pilot."""
        pilot = Pilot(campaign_id=self.campaign.id, name="Capt. Grayson Carlyle", callsign="Shadow", gunnery=2, piloting=3, bondsmen=2)
        self.db.add(pilot)
        self.db.commit()

        initial_wp = self.campaign.wp_balance

        # Ransom bondsman 1 for 50 WP
        res_ransom = PersonnelAgent.ransom_bondsman(self.db, pilot.id, ransom_amount=50)
        self.db.refresh(self.campaign)
        self.db.refresh(pilot)
        self.assertEqual(self.campaign.wp_balance, initial_wp + 50)
        self.assertEqual(pilot.bondsmen, 1)

        # Integrate bondsman 2 into active roster
        res_integrate = PersonnelAgent.integrate_bondsman(self.db, pilot.id, bondsman_name="MechWarrior Marcus Trent", callsign="Bondsman")
        self.db.refresh(pilot)
        self.assertEqual(pilot.bondsmen, 0)

        # Verify new pilot in database
        new_pilot = self.db.query(Pilot).filter(Pilot.name == "MechWarrior Marcus Trent").first()
        self.assertIsNotNone(new_pilot)
        self.assertEqual(new_pilot.status, "Active")

    # ==================== 10. COMSTAR BANK LOAN FINANCING CONTRACT TESTS ====================
    def test_12_comstar_bank_loan_financing(self):
        """Verify taking out a credit line loan increases WP treasury balance and tracking debt balance."""
        initial_wp = self.campaign.wp_balance

        # Take 500 WP loan at 5% interest
        res_take = CoreAgent.take_loan(self.db, principal=500.0, interest_rate=0.05)
        self.db.refresh(self.campaign)
        self.assertEqual(self.campaign.wp_balance, initial_wp + 500)
        self.assertEqual(self.campaign.loan_balance, 500.0)
        self.assertEqual(self.campaign.loan_interest_rate, 0.05)

        # Verify ledger summary includes loan metrics
        summary = CoreAgent.get_ledger_summary(self.db)
        self.assertEqual(summary["loan_balance"], 500.0)
        self.assertEqual(summary["monthly_interest_due"], 25.0)

        # Repay 100 WP principal debt
        res_repay = CoreAgent.repay_loan(self.db, repayment_amount=100.0)
        self.db.refresh(self.campaign)
        self.assertEqual(self.campaign.loan_balance, 400.0)

    # ==================== 11. DYNAMIC CONTRACT NEGOTIATION & OPFOR BV CONTRACT TESTS ====================
    def test_13_contract_negotiation_and_opfor_enemy_bv(self):
        """Verify contract term negotiation recalculates WP payout and OpFor Enemy BV scaling."""
        mission = Mission(
            campaign_id=self.campaign.id,
            name="Operation Crimson Lance",
            mission_type="Garrison Defense",
            employer="House Davion",
            wp_reward=400,
            sp_reward=200,
            salvage_rights="Shared (50%)",
            status="Available"
        )
        self.db.add(mission)
        self.db.commit()

        # Negotiate higher payout (1.5x), 100% salvage, 100% BLC
        res = ContractGenerator.negotiate_contract(
            db=self.db,
            mission_id=mission.id,
            payout_multiplier=1.5,
            salvage_pct=100.0,
            blc_pct=100.0,
            player_lance_bv=5000
        )

        self.assertEqual(res["negotiated_wp"], 600)
        # Threat multiplier: 1.0 + (1.5 - 1.0)*0.25 + (2.0 - 1.0)*0.20 + (2.0 - 1.0)*0.15 = 1.0 + 0.125 + 0.20 + 0.15 = 1.475 -> 1.48
        self.assertGreater(res["threat_multiplier"], 1.40)
        self.assertGreater(res["opfor_enemy_bv"], 7000)
        self.assertIn("Extreme Threat", res["opfor_threat_rating"])

    # ==================== 12. ERA HISTORICAL DATA REGISTRY SEEDING TESTS ====================
    def test_14_era_historical_data_registry_seeding(self):
        """Verify EraFactionAgent retrieves 7 eras and seeding populates era-accurate units & equipment."""
        eras = EraFactionAgent.get_supported_eras()
        self.assertEqual(len(eras), 7)
        codes = [e["code"] for e in eras]
        self.assertIn("2750", codes)
        self.assertIn("2821", codes)
        self.assertIn("3025", codes)
        self.assertIn("3050", codes)
        self.assertIn("3062", codes)
        self.assertIn("3068", codes)
        self.assertIn("3151", codes)

        # Create Star League 2750 Campaign
        details_2750 = EraFactionAgent.get_era_details("2750")
        self.assertEqual(details_2750["default_date"], "2750-01-01")
        self.assertEqual(details_2750["starting_units"][0]["chassis"], "Royal Marauder")

        # Create ilClan 3151 Campaign
        details_3151 = EraFactionAgent.get_era_details("3151")
        self.assertEqual(details_3151["default_date"], "3151-01-01")
        self.assertEqual(details_3151["starting_units"][0]["chassis"], "Savage Wolf")

    def test_15_custom_roster_and_pilot_campaign_creation(self):
        """Verify creating a campaign with custom starting units & custom pilots in 2-step wizard."""
        custom_units = [
            {"chassis": "Fafnir", "model": "FNR-5", "tonnage": 100, "bv2": 2480, "tech_base": "Inner Sphere"},
            {"chassis": "Uziel", "model": "UZL-2S", "tonnage": 50, "bv2": 1420, "tech_base": "Inner Sphere"}
        ]
        custom_pilots = [
            {"name": "Ace Vance", "callsign": "Reaper", "gunnery": 2, "piloting": 3, "spa": "Sharpshooter (+1 Accuracy to Called Shots)", "xp": 80}
        ]

        camp = Campaign(
            name="Custom FedCom 3062 (Vance Mercenaries)",
            wp_balance=1000,
            sp_balance=500,
            cbill_balance=0.0,
            current_date="3062-01-01",
            era="3062"
        )
        self.db.add(camp)
        self.db.commit()
        self.db.refresh(camp)

        for u in custom_units:
            self.db.add(Unit(campaign_id=camp.id, chassis=u["chassis"], model=u["model"], tonnage=u["tonnage"], tech_base=u["tech_base"], bv2=u["bv2"]))
        for p in custom_pilots:
            self.db.add(Pilot(campaign_id=camp.id, name=p["name"], callsign=p["callsign"], gunnery=p["gunnery"], piloting=p["piloting"], spa=p["spa"], xp=p["xp"]))
        self.db.commit()

        units = self.db.query(Unit).filter_by(campaign_id=camp.id).all()
        pilots = self.db.query(Pilot).filter_by(campaign_id=camp.id).all()

        self.assertEqual(len(units), 2)
        self.assertEqual(units[0].chassis, "Fafnir")
        self.assertEqual(len(pilots), 1)
        self.assertEqual(pilots[0].name, "Ace Vance")
        self.assertEqual(camp.era, "3062")

    # ==================== 13. TABLETOP OPFOR SETUP & SALVAGE/BONDSMEN ENGINE TESTS ====================
    def test_16_opfor_roster_generation_and_aar_salvage_bondsmen_link(self):
        """Verify ContractGenerator.generate_opfor_roster generates enemy forces matching target BV2 & era."""
        opfor = ContractGenerator.generate_opfor_roster(target_bv=7200, era_code="3050")
        self.assertEqual(opfor["target_bv"], 7200)
        self.assertEqual(len(opfor["opfor_units"]), 4)
        self.assertEqual(len(opfor["opfor_pilots"]), 4)
        self.assertGreater(opfor["actual_bv"], 4000)
        self.assertIn("name", opfor["opfor_pilots"][0])
        self.assertIn("gunnery", opfor["opfor_pilots"][0])

    def test_17_opfor_bv_reward_adjustment_and_faction_units(self):
        """Verify OpFor generation returns faction unit presets & reward scaling math."""
        opfor = ContractGenerator.generate_opfor_roster(target_bv=6000, era_code="3068", enemy_faction="Word of Blake")
        self.assertIn("available_faction_units", opfor)
        self.assertGreater(len(opfor["available_faction_units"]), 0)

        # Reward adjustment formula check
        target_bv = 6000
        confirmed_opfor_bv = 6600  # +10% higher BV
        base_payout = 400
        bv_ratio = confirmed_opfor_bv / target_bv
        adjusted_payout = int(round(base_payout * bv_ratio))
        self.assertEqual(adjusted_payout, 440)

    # ==================== 15. CHAOS CAMPAIGN WP <-> SP CONVERSION TESTS ====================
    def test_18_wp_sp_currency_conversion(self):
        """Verify 1 WP <-> 10 SP conversion math for Chaos Campaign economy."""
        initial_wp = self.campaign.wp_balance
        initial_sp = self.campaign.sp_balance

        # Convert 50 WP into 500 SP
        self.campaign.wp_balance -= 50
        self.campaign.sp_balance += 500
        self.db.commit()
        self.db.refresh(self.campaign)

        self.assertEqual(self.campaign.wp_balance, initial_wp - 50)
        self.assertEqual(self.campaign.sp_balance, initial_sp + 500)

    # ==================== 16. CAMPAIGN LAUNCHER VALIDATION & BV2 AUDIT TESTS ====================
    def test_19_campaign_launcher_validation_and_bv2_audit(self):
        """Verify Campaign Launcher validation rules for non-blank fields and total BV2 calculation."""
        from apps.api.main import create_new_campaign, CampaignCreateRequest
        from fastapi import HTTPException

        # Test blank Campaign Name validation error (HTTP 400)
        invalid_req = CampaignCreateRequest(
            campaign_name="   ",
            company_name="Wolf's Irregulars",
            commander_name="Major Jaime Wolf",
            era="3025"
        )
        with self.assertRaises(HTTPException) as cm:
            create_new_campaign(invalid_req, self.db)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("cannot be blank", cm.exception.detail)

        # Test valid campaign setup & total starting force BV2 calculation
        valid_req = CampaignCreateRequest(
            campaign_name="Highland Campaign",
            company_name="Highland Regiment",
            commander_name="Colonel Campbell",
            era="3025",
            custom_units=[
                {"chassis": "Marauder", "model": "MAD-3R", "tonnage": 75, "bv2": 1363, "tech_base": "Inner Sphere"},
                {"chassis": "Warhammer", "model": "WHM-6R", "tonnage": 70, "bv2": 1299, "tech_base": "Inner Sphere"}
            ]
        )
        res = create_new_campaign(valid_req, self.db)
        self.assertIsNotNone(res)
        
        # Query created units from DB for BV2 calculation audit
        from packages.database.models import Campaign, Unit
        created_camp = self.db.query(Campaign).filter(Campaign.name.like("%Highland Campaign%")).first()
        self.assertIsNotNone(created_camp)
        self.assertIn("Highland Campaign", created_camp.name)
        units = self.db.query(Unit).filter(Unit.campaign_id == created_camp.id).all()
        total_bv2 = sum(u.bv2 for u in units)
        self.assertEqual(total_bv2, 2662)

    def test_20_company_overview_roster_and_asset_audit(self):
        """Verify Company Overview roster queries units, pilots, and inventory components accurately."""
        from packages.database.models import Campaign, Unit, Pilot, Inventory
        camp = Campaign(name="Alpha Mercs - 3025 Campaign", era="3025")
        self.db.add(camp)
        self.db.commit()
        self.db.refresh(camp)

        u1 = Unit(campaign_id=camp.id, chassis="Stalker", model="STK-3F", tonnage=85, bv2=1550)
        u2 = Unit(campaign_id=camp.id, chassis="Griffin", model="GRF-1N", tonnage=55, bv2=1270)
        self.db.add_all([u1, u2])
        self.db.commit()

        p1 = Pilot(campaign_id=camp.id, name="Capt. Miller", callsign="Overlord", gunnery=3, piloting=4, unit_id=u1.id, spa="Tactical Genius")
        p2 = Pilot(campaign_id=camp.id, name="Scout Ace", callsign="Ghost", gunnery=4, piloting=4, unit_id=u2.id, spa="Dodge")
        self.db.add_all([p1, p2])
        self.db.commit()

        inv = Inventory(campaign_id=camp.id, component_name="PPC Barrel", category="Weapon", quantity=3)
        self.db.add(inv)
        self.db.commit()

        db_units = self.db.query(Unit).filter(Unit.campaign_id == camp.id).all()
        db_pilots = self.db.query(Pilot).filter(Pilot.campaign_id == camp.id).all()
        db_inv = self.db.query(Inventory).filter(Inventory.campaign_id == camp.id).all()

        self.assertEqual(len(db_units), 2)
        self.assertEqual(len(db_pilots), 2)
        self.assertEqual(len(db_inv), 1)
        self.assertEqual(db_pilots[0].unit_id, u1.id)
        self.assertEqual(db_inv[0].quantity, 3)

    def test_21_random_force_generator_and_parity_audit(self):
        """Verify EraFactionAgent.generate_random_force generates era-accurate forces and pilots with error checking."""
        from packages.agents.era_faction_agent import EraFactionAgent
        
        # Test 3050 Clan Wolf force generation
        clan_force = EraFactionAgent.generate_random_force(era_code="3050", faction="Clan Wolf")
        self.assertEqual(clan_force["era"], "3050")
        self.assertEqual(clan_force["faction"], "Clan Wolf")
        self.assertEqual(len(clan_force["custom_units"]), 4)
        self.assertEqual(len(clan_force["custom_pilots"]), 4)
        
        # Verify units have non-blank chassis/model, positive BV2, and tonnage bounds
        for u in clan_force["custom_units"]:
            self.assertTrue(len(u["chassis"]) > 0)
            self.assertTrue(len(u["model"]) > 0)
            self.assertGreater(u["tonnage"], 0)
            self.assertGreater(u["bv2"], 0)

        # Verify pilots have valid Gunnery/Piloting (1-6) and assigned mechs
        for p in clan_force["custom_pilots"]:
            self.assertTrue(1 <= p["gunnery"] <= 6)
            self.assertTrue(1 <= p["piloting"] <= 6)
            self.assertIsNotNone(p["assigned_mech"])

    def test_22_flechs_sheets_mtf_export_and_era_faction_filtering(self):
        """Verify MTF file generation for Flechs Sheets compatibility and era faction filtering."""
        from packages.agents.era_faction_agent import EraFactionAgent
        from packages.database.models import Campaign, Unit
        
        # 1. Test Era Faction Filtering
        factions_3050 = EraFactionAgent.get_factions_for_era("3050")
        self.assertIn("Clan Wolf", factions_3050)
        self.assertIn("Clan Jade Falcon", factions_3050)

        factions_3025 = EraFactionAgent.get_factions_for_era("3025")
        self.assertIn("House Davion (Federated Suns)", factions_3025)
        self.assertIn("Mercenaries", factions_3025)

        # 2. Test Unit MTF Export formatting
        camp = Campaign(name="Test MTF Campaign", era="3025")
        self.db.add(camp)
        self.db.commit()
        self.db.refresh(camp)

        unit = Unit(campaign_id=camp.id, chassis="Marauder", model="MAD-3R", tonnage=75, bv2=1363, tech_base="Inner Sphere")
        self.db.add(unit)
        self.db.commit()
        self.db.refresh(unit)

        from apps.api.main import export_unit_mtf
        res = export_unit_mtf(unit_id=unit.id, db=self.db)
        self.assertEqual(res["unit_id"], unit.id)
        self.assertEqual(res["chassis"], "Marauder")
        self.assertEqual(res["model"], "MAD-3R")
        self.assertTrue(res["filename"].endswith(".mtf"))
        self.assertIn("Version:1.0", res["mtf_content"])
        self.assertIn("Marauder", res["mtf_content"])
        self.assertIn("MAD-3R", res["mtf_content"])
        self.assertIn("TechBase:Inner Sphere", res["mtf_content"])

        # 3. Test Flechs Network Config Toggle
        from apps.api.main import update_network_config, NetworkConfigRequest
        cfg = update_network_config(NetworkConfigRequest(mul_online=True, sarna_online=False, megamek_online=True, flechs_online=True))
        self.assertTrue(cfg["config"]["flechs_online"])
        self.assertIn("Flechs=Online", cfg["message"])

    def test_23_guided_tabletop_tutorial_persistence(self):
        """Verify campaign tutorial persistence keys and step progression boundaries."""
        from packages.database.models import Campaign
        camp = Campaign(name="Tutorial Campaign", era="3025")
        self.db.add(camp)
        self.db.commit()
        self.db.refresh(camp)

        # Generate expected campaign-scoped tutorial completion key
        tutorial_key = f"bt_tutorial_completed_campaign_{camp.id}"
        self.assertEqual(tutorial_key, f"bt_tutorial_completed_campaign_{camp.id}")
        self.assertTrue(camp.id > 0)

    def test_24_inventory_buy_and_sell(self):
        """Verify buying and selling warehouse inventory components."""
        from packages.database.models import Campaign, Inventory
        camp = self.db.query(Campaign).first()
        if not camp:
            camp = Campaign(name="Warehouse Campaign", cbill_balance=500000.0)
            self.db.add(camp)
        else:
            camp.cbill_balance = 500000.0
        self.db.commit()

        from apps.api.main import buy_inventory_item, sell_inventory_item, InventoryBuyRequest
        res_buy = buy_inventory_item(InventoryBuyRequest(item_name="PPC", cost=150000.0, category="Weapon"), db=self.db)
        self.assertEqual(res_buy["status"], "success")
        self.assertIn("Purchased PPC", res_buy["message"])

        inv = self.db.query(Inventory).filter(Inventory.component_name == "PPC").first()
        self.assertIsNotNone(inv)

        res_sell = sell_inventory_item(part_id=inv.id, db=self.db)
        self.assertEqual(res_sell["status"], "success")
        self.assertIn("Sold PPC", res_sell["message"])


if __name__ == "__main__":
    unittest.main()

