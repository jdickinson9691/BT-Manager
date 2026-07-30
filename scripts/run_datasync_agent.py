import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from packages.agents.data_sync_agent import DataSyncAgent
from packages.data_importer.sarna_client import SarnaClient

def main():
    print("==========================================================")
    print("RUNNING DATASYNCAGENT EXECUTABLE CONTRACT")
    print("==========================================================")

    # 1. Master Unit List (MUL) Queries
    print("\n--- [1/3] Master Unit List (MUL) Data Sync ---")
    test_chassis = ["Marauder", "Timber Wolf", "Atlas", "Centurion"]
    for c in test_chassis:
        res = DataSyncAgent.fetch_mul_unit_preview(c, era_code="3025")
        print(f"[OK] MUL Unit '{c}': Model={res['model']}, Tonnage={res['tonnage']}T, BV2={res['bv2']}, TechBase={res['tech_base']}, 3025 Era Available={res['is_era_available']}")

    # 2. MegaMek Equipment Registry Sync
    print("\n--- [2/3] MegaMek Weapon & Component Registry ---")
    eq_db = DataSyncAgent.get_megamek_equipment_db()
    print(f"[OK] MegaMek Equipment Definitions Loaded ({len(eq_db)} items):")
    for eq in eq_db[:4]:
        print(f"     - {eq['name']} ({eq['tech_base']}): Tonnage={eq['tonnage']}T, Heat={eq['heat']} pts, Range={eq['short_range']}/{eq['med_range']}/{eq['long_range']}, BV2={eq['bv2']}")

    # 3. Sarna.net Wiki Sitemap Integration
    print("\n--- [3/3] Sarna.net Wiki Article Resolution ---")
    sarna_marauder = SarnaClient.get_mech_wiki_url("Marauder")
    sarna_timber = SarnaClient.get_mech_wiki_url("Timber Wolf")
    print(f"[OK] Sarna Article 'Marauder': {sarna_marauder}")
    print(f"[OK] Sarna Article 'Timber Wolf': {sarna_timber}")

    print("\n==========================================================")
    print("DATASYNCAGENT EXECUTION COMPLETED SUCCESSFULLY")
    print("==========================================================")

if __name__ == "__main__":
    main()
