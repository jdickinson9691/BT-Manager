import math
from typing import List, Dict, Any

class MapAgent:
    """Agent 3: Galactic Map Agent
    Responsibilities: Custom canvas rendering data for Inner Sphere star maps,
    coordinate mapping, jump distance calculations, and faction color highlights per era.
    """

    FACTION_COLORS = {
        "House Davion": "#fed7aa",
        "House Draconis Combine": "#f87171",
        "House Steiner": "#60a5fa",
        "House Marik": "#a78bfa",
        "House Liao": "#34d399",
        "ComStar": "#f43f5e",
        "Wolf's Dragoons": "#fb923c",
        "Clan Jade Falcon": "#10b981",
        "Clan Wolf": "#ef4444",
        "Clan Smoke Jaguar": "#9333ea",
        "Free Rasalhague Republic": "#38bdf8",
        "Magistracy of Canopus": "#f472b6",
        "Independent": "#a1a1aa"
    }

    STAR_SYSTEMS_3025 = [
        {"name": "Terra", "faction": "ComStar", "x": 0.0, "y": 0.0, "jump_cost": 50000},
        {"name": "Outreach", "faction": "Wolf's Dragoons", "x": 18.5, "y": -12.1, "jump_cost": 50000},
        {"name": "New Avalon", "faction": "House Davion", "x": 42.0, "y": -35.0, "jump_cost": 140000},
        {"name": "Tharkad", "faction": "House Steiner", "x": -41.0, "y": 38.0, "jump_cost": 160000},
        {"name": "Luthien", "faction": "House Draconis Combine", "x": 48.0, "y": 52.0, "jump_cost": 250000},
        {"name": "Sian", "faction": "House Liao", "x": 22.0, "y": -58.0, "jump_cost": 180000},
        {"name": "Atreus", "faction": "House Marik", "x": -38.0, "y": -28.0, "jump_cost": 150000},
        {"name": "Solaris VII", "faction": "Independent", "x": -22.0, "y": 18.0, "jump_cost": 120000},
        {"name": "Tukayyid", "faction": "ComStar", "x": -15.2, "y": 22.4, "jump_cost": 100000},
        {"name": "Hesperus II", "faction": "House Steiner", "x": -28.0, "y": 21.0, "jump_cost": 130000},
        {"name": "Galax", "faction": "House Davion", "x": 38.5, "y": -22.1, "jump_cost": 120000},
        {"name": "Kathil", "faction": "House Davion", "x": 41.0, "y": -42.0, "jump_cost": 140000},
        {"name": "Robinson", "faction": "House Davion", "x": 44.0, "y": 21.0, "jump_cost": 150000},
        {"name": "Benjamin", "faction": "House Draconis Combine", "x": 26.0, "y": 31.0, "jump_cost": 160000},
        {"name": "Canopus IV", "faction": "Magistracy of Canopus", "x": -62.0, "y": -68.0, "jump_cost": 220000},
        {"name": "Rasalhague", "faction": "Free Rasalhague Republic", "x": 5.0, "y": 68.0, "jump_cost": 190000}
    ]

    STAR_SYSTEMS_3050 = STAR_SYSTEMS_3025 + [
        {"name": "Twycross", "faction": "Clan Jade Falcon", "x": -55.0, "y": 60.0, "jump_cost": 280000},
        {"name": "Strana Mechty", "faction": "Clan Wolf", "x": 0.0, "y": 95.0, "jump_cost": 500000},
        {"name": "Huntress", "faction": "Clan Smoke Jaguar", "x": -22.0, "y": 89.0, "jump_cost": 480000}
    ]

    @classmethod
    def get_star_map(cls, era: str = "Late Succession War - Renaissance (3020–3049)") -> List[Dict[str, Any]]:
        """Returns coordinate mapping and faction colors for the given era."""
        raw_systems = cls.STAR_SYSTEMS_3050 if "3050" in era else cls.STAR_SYSTEMS_3025
        systems = []
        for sys in raw_systems:
            system_copy = dict(sys)
            system_copy["color"] = cls.FACTION_COLORS.get(sys["faction"], "#a1a1aa")
            systems.append(system_copy)
        return systems

    @classmethod
    def calculate_jump_distance(cls, x1: float, y1: float, x2: float, y2: float) -> float:
        """Calculates Euclidean distance in Light-Years between two star systems."""
        distance = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        return round(distance, 2)

    @classmethod
    def calculate_jump_cost(cls, light_years: float, jumpship_fee_per_ly: float = 2000.0) -> Dict[str, float]:
        """Calculates transit costs for a given light-year distance."""
        jumps_required = math.ceil(light_years / 30.0)  # Max JumpShip range is 30 LY
        total_cost = round(light_years * jumpship_fee_per_ly, 2)
        return {
            "light_years": light_years,
            "jumps_required": max(1, jumps_required),
            "estimated_cbill_cost": total_cost
        }
