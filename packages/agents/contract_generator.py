import random
from typing import Dict, Any

class ContractGenerator:
    """AI Procedural Contract Briefing & Combat Narrative Generator.
    Generates dynamic mercenary mission briefs and After-Action Report (AAR) stories.
    """

    EMPLOYERS = [
        "House Davion (Federated Suns)",
        "House Draconis Combine",
        "House Steiner (Lyran Commonwealth)",
        "House Marik (Free Worlds League)",
        "House Liao (Capellan Confederation)",
        "ComStar",
        "Wolf's Dragoons",
        "Solaris VII Arena Management"
    ]

    MISSION_TYPES = [
        "Planetary Defense & Patrol",
        "Deep Reconnaissance Raid",
        "Supply Convoy Escort",
        "Objective Raid & Extraction",
        "Industrial Facility Siege",
        "Pirate Hunt & Sector Clearance"
    ]

    LOCATIONS = [
        "Solaris VII Arena District",
        "Outreach Training Grounds",
        "Galax Shipyards",
        "Tukayyid Lowland Swamps",
        "Twycross Canyon Pass",
        "New Avalon Perimeter Sector",
        "Luthien Industrial Zone"
    ]

    ENEMY_FACTIONS = [
        "Local Pirate Banditti",
        "Renegade Mercenary Company",
        "House Kurita Frontline Forces",
        "Clan Jade Falcon Recon Binary",
        "Capellan Maskirovka Cell",
        "Unsanctioned Insurgent Cell"
    ]

    TERRAINS = [
        "Desert Dunes & Dust Storms",
        "Urban Metropolis",
        "Volcanic Ridge",
        "Sub-Zero Glacier",
        "Dense Jungle Canopy"
    ]

    @classmethod
    def generate_procedural_contract(cls, era: str = "3025") -> Dict[str, Any]:
        """Generates a procedural mission contract brief with intel summary and payout math."""
        employer = random.choice(cls.EMPLOYERS)
        mission_type = random.choice(cls.MISSION_TYPES)
        location = random.choice(cls.LOCATIONS)
        enemy = random.choice(cls.ENEMY_FACTIONS)
        terrain = random.choice(cls.TERRAINS)

        difficulty_tier = random.choice(["Low", "Medium", "High", "Extreme"])
        difficulty_mult = {"Low": 0.8, "Medium": 1.0, "High": 1.4, "Extreme": 2.0}[difficulty_tier]

        base_cbill = round(2500000.0 * difficulty_mult, 2)
        wp_reward = int(300 * difficulty_mult)

        intel_summary = (
            f"Employer {employer} requests immediate deployment to {location} for a {mission_type}. "
            f"Intel indicates resistance from {enemy} operating in {terrain}. "
            f"Tactical threat rating assessed as {difficulty_tier} Risk."
        )

        return {
            "name": f"{mission_type} on {location.split()[0]}",
            "employer": employer,
            "mission_type": mission_type,
            "difficulty": difficulty_tier,
            "base_cbill": base_cbill,
            "wp_reward": wp_reward,
            "salvage_rights": random.choice(["Standard (25%)", "Shared (50%)", "Full Salvage (100%)"]),
            "intel_summary": intel_summary
        }

    @classmethod
    def generate_aar_narrative(
        cls,
        mission_name: str,
        units_engaged: int,
        salvage_cash: float,
        recovered_items_count: int
    ) -> str:
        """Generates a dynamic combat narrative log for After-Action Reports."""
        openings = [
            f"Mercenary forces engaged hostile units during Operation '{mission_name}'.",
            f"Tactical engagements concluded for '{mission_name}'. Forces maintained defensive lines under heavy fire.",
            f"Contract objectives fulfilled for '{mission_name}' after a fierce confrontation."
        ]

        highlights = [
            f"{units_engaged} Mech(s) were fielded in the engagement frame.",
            f"Long-range weapons fire damaged armor plates, but fire discipline held the perimeter.",
            f"Precision PPC and Autocannon strikes disabled key hostile components."
        ]

        salvage_text = (
            f"Salvage ops secured ${salvage_cash:,.2f} C-Bills in liquid component value and {recovered_items_count} component item(s)."
            if salvage_cash > 0 or recovered_items_count > 0 else
            "Salvage rights yield nominal battlefield recovery."
        )

        return f"{random.choice(openings)} {random.choice(highlights)} {salvage_text}"
