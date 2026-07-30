import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from packages.agents import (
    CoreAgent,
    EraFactionAgent,
    MapAgent,
    OperationsAgent,
    MaintenanceAgent,
    PersonnelAgent
)
from packages.database.db import get_db

def main():
    print("==========================================================")
    print("RUNNING REMAINING DOMAIN AGENTS IN SEQUENTIAL ORDER (3 -> 7)")
    print("==========================================================")

    db = next(get_db())
    campaign = CoreAgent.get_campaign(db)

    # STEP 3: EraFactionAgent
    print("\n--- [3/7] EraFactionAgent: Era & Faction Market Domain ---")
    eras = EraFactionAgent.get_supported_eras()
    print(f"[OK] Supported BattleTech Eras Loaded ({len(eras)} Eras):")
    for era in eras:
        print(f"     - Era {era['code']}: {era['name']} ({era['years']}) [Clans Present: {era['has_clans']}]")

    mechs_3025 = EraFactionAgent.filter_market_units_by_era_and_faction("3025", "Mercenary")
    mechs_3050 = EraFactionAgent.filter_market_units_by_era_and_faction("3050", "Mercenary")
    print(f"[OK] Market mechs in 3025: {len(mechs_3025)} chassis verified by MUL.")
    print(f"[OK] Market mechs in 3050: {len(mechs_3050)} chassis verified by MUL.")

    # STEP 4: MapAgent
    print("\n--- [4/7] MapAgent: Galactic Star Map & Jump Distance ---")
    systems = MapAgent.get_star_map("3025")
    jump_info = MapAgent.calculate_jump_cost(light_years=62.5, jumpship_fee_per_ly=2000.0)
    print(f"[OK] Galactic Star Map: {len(systems)} Inner Sphere planetary systems loaded.")
    print(f"[OK] Jump Transit Outreach -> Solaris VII (62.5 LY): {jump_info['jumps_required']} Jump(s), Total Fee: ${jump_info['estimated_cbill_cost']:,.2f} C-Bills")

    # STEP 5: OperationsAgent
    print("\n--- [5/7] OperationsAgent: Procedural Briefs & Timeline ---")
    mission = OperationsAgent.generate_procedural_contract(db)
    print(f"[OK] Generated Contract Brief: '{mission.name}' | Employer: {mission.employer} | Reward: ${mission.cbill_reward:,.2f} C-Bills, +{mission.wp_reward} WP")

    time_res = OperationsAgent.advance_timeline(db, days=14)
    print(f"[OK] Advanced Campaign Timeline: {time_res['message']} (New Date: {time_res['current_date']}, Overhead: ${time_res['overhead_incurred']:,.2f})")

    # STEP 6: MaintenanceAgent
    print("\n--- [6/7] MaintenanceAgent: MechLab Fitting & Market Procurement ---")
    build_val = MaintenanceAgent.validate_build_loadout(
        tonnage=100,
        components=["AC/20", "PPC", "LRM-20", "Medium Laser", "Medium Laser", "Heat Sink"],
        double_heat_sinks=True
    )
    print(f"[OK] MechLab Build Validation (100T Atlas Loadout): Valid={build_val['is_valid']}, Weight={build_val['equipment_tonnage']}T, Heat={build_val['alpha_strike_heat']} pts, Dissipation={build_val['heat_dissipation']} pts")

    buy_res = MaintenanceAgent.purchase_unit(
        db=db,
        chassis="Hunchback",
        model="HBK-4G",
        tonnage=50,
        bv2=1041,
        cbill_cost=3800000.0,
        wp_cost=380,
        tech_base="Inner Sphere"
    )
    print(f"[OK] Procurement Market: {buy_res['message']}")

    # STEP 7: PersonnelAgent
    print("\n--- [7/7] PersonnelAgent: Pilot Skill Upgrades & SPA Perk ---")
    pilot = campaign.pilots[0] if campaign.pilots else None
    if pilot:
        xp_res = PersonnelAgent.award_xp(db, pilot_id=pilot.id, xp_amount=30, kills_added=1)
        upg_res = PersonnelAgent.upgrade_pilot_skill(db, pilot_id=pilot.id, skill_type="piloting")
        spa_res = PersonnelAgent.assign_spa(db, pilot_id=pilot.id, spa_name="Tactical Genius (Reroll Initiative Once)")
        print(f"[OK] Pilot '{pilot.name} ({pilot.callsign})': Piloting upgraded to {upg_res['piloting']}, Remaining XP={upg_res['remaining_xp']}, SPA Perk='{spa_res['spa']}'")

    print("\n==========================================================")
    print("REMAINING DOMAIN AGENTS EXECUTION COMPLETED SUCCESSFULLY")
    print("==========================================================")

if __name__ == "__main__":
    main()
