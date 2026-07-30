import unittest
from packages.agents import (
    CoreAgent,
    OperationsAgent,
    MapAgent,
    MaintenanceAgent,
    PersonnelAgent,
    DataSyncAgent,
    EraFactionAgent
)
from packages.database.db import get_db, init_db

class TestDomainAgents(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        CoreAgent.setup_database()

    def setUp(self):
        self.db = next(get_db())
        self.campaign = CoreAgent.get_campaign(self.db)

    def test_core_agent_ledger(self):
        summary = CoreAgent.get_ledger_summary(self.db)
        self.assertIn("WP", summary)
        self.assertIn("SP", summary)
        self.assertIn("CBills", summary)

    def test_operations_agent_advance(self):
        initial_date = self.campaign.current_date
        res = OperationsAgent.advance_timeline(self.db, days=1)
        self.assertNotEqual(initial_date, res["current_date"])

    def test_map_agent_starmap(self):
        systems = MapAgent.get_star_map()
        self.assertGreater(len(systems), 0)
        self.assertEqual(systems[0]["name"], "Terra")

    def test_data_sync_agent_mul_query(self):
        res = DataSyncAgent.fetch_mul_unit_preview("Marauder", era_code="3025")
        self.assertEqual(res["chassis"], "Marauder")
        self.assertTrue(res["is_era_available"])

    def test_era_faction_agent_market_filtering(self):
        eras = EraFactionAgent.get_supported_eras()
        self.assertGreater(len(eras), 0)
        
        units_3025 = EraFactionAgent.filter_market_units_by_era_and_faction("3025", "Mercenary")
        units_3050 = EraFactionAgent.filter_market_units_by_era_and_faction("3050", "Mercenary")
        
        # 3025 should NOT include Clan Timber Wolf, 3050 SHOULD include Clan Timber Wolf
        clan_in_3025 = any(u["tech_base"] == "Clan" for u in units_3025)
        clan_in_3050 = any(u["tech_base"] == "Clan" for u in units_3050)
        
        self.assertFalse(clan_in_3025)
        self.assertTrue(clan_in_3050)

if __name__ == "__main__":
    unittest.main()
