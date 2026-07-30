import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from packages.agents import (
    CoreAgent,
    DataSyncAgent,
    EraFactionAgent,
    MapAgent,
    OperationsAgent,
    MaintenanceAgent,
    PersonnelAgent
)
from packages.database.db import get_db

def run_agent_pipeline_sequence():
    print("==========================================================")
    print("STARTING BT-MANAGER DOMAIN AGENTS SEQUENTIAL PIPELINE")
    print("==========================================================")

    # STEP 1: CoreAgent
    print("\n--- [1/7] CoreAgent: Setting up Standalone DB & Seeding Campaign ---")
    CoreAgent.setup_database()
    db = next(get_db())
    campaign = CoreAgent.get_campaign(db)
    print(f"[OK] Campaign Active: '{campaign.name}' | Balance: ${campaign.cbill_balance:,.2f} C-Bills | {campaign.wp_balance} WP | {campaign.sp_balance} SP")

    # STEP 2: DataSyncAgent
    print("\n--- [2/7] DataSyncAgent: Syncing MUL, MegaMek & Sarna.net Data ---")
    mul_data = DataSyncAgent.fetch_mul_unit_preview("Marauder", era_code="3025")
    megamek_items = DataSyncAgent.get_megamek_equipment_db()
    print(f"[OK] MUL Preview for 'Marauder' (3025): BV2={mul_data['bv2']}, Tonnage={mul_data['tonnage']}T, Available={mul_data['is_era_available']}")
    print(f"[OK] MegaMek Equipment Registry: {len(megamek_items)} standard weapons/components loaded.")

    # STEP 3: EraFactionAgent
    print("\n--- [3/7] EraFactionAgent: Filtering Market Mechs by Era & Faction ---")
    mechs_3025 = EraFactionAgent.filter_market_units_by_era_and_faction("3025", "Mercenary")
    mechs_3050 = EraFactionAgent.filter_market_units_by_era_and_faction("3050", "Mercenary")
    print(f"[OK] Market Mechs in Era 3025 (Succession Wars): {len(mechs_3025)} chassis available.")
    print(f"[OK] Market Mechs in Era 3050 (Clan Invasion): {len(mechs_3050)} chassis available (Includes Clan technology).")

    # STEP 4: MapAgent
    print("\n--- [4/7] MapAgent: Computing Galactic Star Map Jump Vectors ---")
    systems = MapAgent.get_star_map("3025")
    jump_info = MapAgent.calculate_jump_cost(light_years=45.0, jumpship_fee_per_ly=2000.0)
    print(f"[OK] Star Map loaded with {len(systems)} Inner Sphere planetary systems.")
    print(f"[OK] Jump Transit Outreach -> Tukayyid (45 LY): {jump_info['jumps_required']} Jump(s), Fee: ${jump_info['estimated_cbill_cost']:,.2f} C-Bills")

    # STEP 5: OperationsAgent
    print("\n--- [5/7] OperationsAgent: Generating Contract, Timeline & Combat AAR ---")
    mission = OperationsAgent.generate_procedural_contract(db)
    print(f"[OK] Generated Procedural Contract: '{mission.name}' (Employer: {mission.employer}, Payout: ${mission.cbill_reward:,.2f} C-Bills)")
    time_res = OperationsAgent.advance_timeline(db, days=7)
    print(f"[OK] Advanced Timeline: {time_res['message']} (New Date: {time_res['current_date']}, Overhead: ${time_res['overhead_incurred']:,.2f})")

    # STEP 6: MaintenanceAgent
    print("\n--- [6/7] MaintenanceAgent: MechLab Fitting & Unit Procurement ---")
    fit_metrics = MaintenanceAgent.validate_build_loadout(
        tonnage=75,
        components=["PPC", "Medium Laser", "Medium Laser", "Heat Sink"],
        double_heat_sinks=False
    )
    print(f"[OK] MechLab Build Validation (75T Marauder Refit): Valid={fit_metrics['is_valid']}, Weight={fit_metrics['equipment_tonnage']}T, Heat={fit_metrics['alpha_strike_heat']} pts, Dissipation={fit_metrics['heat_dissipation']} pts")

    buy_res = MaintenanceAgent.purchase_unit(
        db=db,
        chassis="Centurion",
        model="CN9-A",
        tonnage=50,
        bv2=945,
        cbill_cost=4500000.0,
        wp_cost=450,
        tech_base="Inner Sphere"
    )
    print(f"[OK] Procurement Market: {buy_res['message']}")

    # STEP 7: PersonnelAgent
    print("\n--- [7/7] PersonnelAgent: MechWarrior XP, Skill Upgrade & SPA Perk ---")
    pilot = campaign.pilots[0] if campaign.pilots else None
    if pilot:
        xp_res = PersonnelAgent.award_xp(db, pilot_id=pilot.id, xp_amount=25, kills_added=1)
        upg_res = PersonnelAgent.upgrade_pilot_skill(db, pilot_id=pilot.id, skill_type="gunnery")
        spa_res = PersonnelAgent.assign_spa(db, pilot_id=pilot.id, spa_name="Sharpshooter (+1 Accuracy to Called Shots)")
        print(f"[OK] Pilot '{pilot.name} ({pilot.callsign})': Gunnery upgraded to {upg_res['gunnery']}, XP remaining={upg_res['remaining_xp']}, SPA Perk='{spa_res['spa']}'")

    print("\n==========================================================")
    print("PIPELINE COMPLETE: ALL 7 DOMAIN AGENTS EXECUTED IN ORDER")
    print("==========================================================")

if __name__ == "__main__":
    run_agent_pipeline_sequence()
