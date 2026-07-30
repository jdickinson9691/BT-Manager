import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from packages.agents.core_agent import CoreAgent
from packages.database.db import get_db

def main():
    print("==========================================================")
    print("RUNNING COREAGENT EXECUTABLE CONTRACT")
    print("==========================================================")

    # 1. Setup Database & Schema Migrations
    CoreAgent.setup_database()
    print("[OK] Database schema initialized and column migrations applied.")

    # 2. Get / Seed Campaign
    db = next(get_db())
    campaign = CoreAgent.get_campaign(db)
    print(f"[OK] Active Campaign: '{campaign.name}' (Current Date: {campaign.current_date})")

    # 3. Get Financial Ledger Summary
    summary = CoreAgent.get_ledger_summary(db)
    print(f"[OK] Ledger Summary:")
    print(f"     - C-Bill Treasury: ${summary['CBills']:,.2f}")
    print(f"     - Warchest Balance: {summary['WP']} WP")
    print(f"     - Support Points: {summary['SP']} SP")
    print(f"     - MRB Rating: {summary['mrb_rating']} (Reputation: {summary['reputation_score']})")

    # 4. Export JSON Save State Preview
    save_payload = CoreAgent.export_campaign_json(db)
    print(f"[OK] JSON Save State Export:")
    print(f"     - Units in Roster: {len(save_payload['units'])}")
    print(f"     - MechWarriors: {len(save_payload['pilots'])}")
    print(f"     - Active/Completed Missions: {len(save_payload['missions'])}")
    print(f"     - Warehouse Inventory: {len(save_payload['inventory'])}")
    print(f"     - Log Entries: {len(save_payload['logs'])}")

    print("==========================================================")
    print("COREAGENT EXECUTION COMPLETED SUCCESSFULLY")
    print("==========================================================")

if __name__ == "__main__":
    main()
