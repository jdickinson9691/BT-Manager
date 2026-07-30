from typing import List, Dict, Any
from packages.agents.data_sync_agent import DataSyncAgent

class EraFactionAgent:
    """Agent 7: Era & Faction Domain Agent
    Responsibilities: Filters Master Unit List (MUL) chassis procurement, contract availability,
    and galactic star map planetary borders strictly by active BattleTech Era and Player Faction.
    """

    ERAS = {
        "2750": {"name": "Star League", "years": "2571–2780", "has_clans": False},
        "3025": {"name": "Late Succession Wars / Renaissance", "years": "3020–3049", "has_clans": False},
        "3050": {"name": "Clan Invasion", "years": "3050–3061", "has_clans": True},
        "3062": {"name": "Civil War", "years": "3062–3067", "has_clans": True},
        "3067": {"name": "Jihad", "years": "3068–3085", "has_clans": True},
        "3135": {"name": "Dark Age", "years": "3086–3150", "has_clans": True},
        "3151": {"name": "ilClan", "years": "3151+", "has_clans": True}
    }

    @classmethod
    def get_supported_eras(cls) -> List[Dict[str, Any]]:
        """Returns list of supported BattleTech Eras with metadata."""
        return [{"code": code, **meta} for code, meta in cls.ERAS.items()]

    @classmethod
    def filter_market_units_by_era_and_faction(
        cls,
        era_code: str = "3025",
        faction: str = "Mercenary"
    ) -> List[Dict[str, Any]]:
        """Filters available market mechs according to Master Unit List (MUL) era availability and faction tech base rules."""
        era_info = cls.ERAS.get(era_code, cls.ERAS["3025"])
        all_mechs = [
            {"chassis": "Centurion", "model": "CN9-A", "tonnage": 50, "bv2": 945, "cbill_cost": 4500000.0, "wp_cost": 450, "tech_base": "Inner Sphere", "era_code": "3025"},
            {"chassis": "Hunchback", "model": "HBK-4G", "tonnage": 50, "bv2": 1041, "cbill_cost": 3800000.0, "wp_cost": 380, "tech_base": "Inner Sphere", "era_code": "3025"},
            {"chassis": "Catapult", "model": "CPT-C1", "tonnage": 65, "bv2": 1399, "cbill_cost": 5900000.0, "wp_cost": 590, "tech_base": "Inner Sphere", "era_code": "3025"},
            {"chassis": "Atlas", "model": "AS7-D", "tonnage": 100, "bv2": 1897, "cbill_cost": 9600000.0, "wp_cost": 960, "tech_base": "Inner Sphere", "era_code": "3025"},
            {"chassis": "Timber Wolf", "model": "Prime", "tonnage": 75, "bv2": 2737, "cbill_cost": 14200000.0, "wp_cost": 1420, "tech_base": "Clan", "era_code": "3050"},
            {"chassis": "Mad Cat", "model": "Prime", "tonnage": 75, "bv2": 2737, "cbill_cost": 14200000.0, "wp_cost": 1420, "tech_base": "Clan", "era_code": "3050"}
        ]

        filtered = []
        for m in all_mechs:
            # If Clan tech, require Clan era (3050+)
            if m["tech_base"] == "Clan" and not era_info["has_clans"]:
                continue
            
            mul_data = DataSyncAgent.fetch_mul_unit_preview(m["chassis"], era_code)
            if mul_data["is_era_available"]:
                m_copy = dict(m)
                m_copy["mul_verified"] = True
                filtered.append(m_copy)

        return filtered
