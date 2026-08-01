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

    CLIMATES = [
        {"name": "Standard Moderate", "modifier": "Normal Heat Dissipation (+0 Heat)", "heat_penalty": 0},
        {"name": "Arid / Extreme Heat (+20%)", "modifier": "Heat Sink Dissipation: -15% Penalty (+2 Heat/turn)", "heat_penalty": 2},
        {"name": "Sub-Zero Ice World", "modifier": "Heat Sink Dissipation: +15% Bonus (-1 Heat/turn)", "heat_penalty": -1},
        {"name": "Vacuum / Airless Moon", "modifier": "Energy Weapons: +1 Heat; Life Support Check Required", "heat_penalty": 1},
        {"name": "Low Gravity (0.5g)", "modifier": "Movement: +1 Jump MP Bonus; Piloting Check +1", "heat_penalty": 0}
    ]

    @classmethod
    def generate_procedural_contract(cls, era: str = "3025") -> Dict[str, Any]:
        """Generates a procedural mission contract brief with official Campaign Operations v5.0 payout & Tactical Ops climate."""
        employer = random.choice(cls.EMPLOYERS)
        mission_type = random.choice(cls.MISSION_TYPES)
        location = random.choice(cls.LOCATIONS)
        enemy = random.choice(cls.ENEMY_FACTIONS)
        climate = random.choice(cls.CLIMATES)

        difficulty_tier = random.choice(["Low", "Medium", "High", "Extreme"])
        difficulty_tier = random.choice(["Low", "Medium", "High", "Extreme"])
        difficulty_mult = {"Low": 0.8, "Medium": 1.0, "High": 1.4, "Extreme": 2.0}[difficulty_tier]

        # Chaos Campaign Rules Formula: Base Warchest Points * Risk Factor
        wp_reward = int(400 * difficulty_mult)
        sp_reward = int(200 * difficulty_mult)

        intel_summary = (
            f"Employer {employer} requests immediate deployment to {location} for a {mission_type}. "
            f"Intel indicates resistance from {enemy}. Planetary climate: {climate['name']} ({climate['modifier']}). "
            f"Tactical threat rating assessed as {difficulty_tier} Risk."
        )

        return {
            "name": f"{mission_type} on {location.split()[0]}",
            "employer": employer,
            "enemy_faction": enemy,
            "mission_type": mission_type,
            "difficulty": difficulty_tier,
            "wp_reward": wp_reward,
            "sp_reward": sp_reward,
            "salvage_rights": random.choice(["Exchange Value (25%)", "Shared (50%)", "Full Salvage (100%)"]),
            "blc_coverage": 0.5 if difficulty_tier in ["Medium", "High"] else 0.75 if difficulty_tier == "Extreme" else 0.25,
            "climate": climate["name"],
            "climate_modifier": climate["modifier"],
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
            f"Salvage ops secured {recovered_items_count} component item(s) and field support scrap."
            if recovered_items_count > 0 else
            "Salvage rights yield nominal battlefield recovery."
        )

        return f"{random.choice(openings)} {random.choice(highlights)} {salvage_text}"

    @classmethod
    def negotiate_contract(
        cls,
        db: Session,
        mission_id: int,
        payout_multiplier: float = 1.0,
        salvage_pct: float = 50.0,
        blc_pct: float = 50.0,
        player_lance_bv: int = 5463
    ) -> Dict[str, Any]:
        """Calculates negotiated payout in Warchest Points (WP/SP), OpFor threat multiplier, and Enemy BV."""
        from packages.database.models import Mission
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if not mission:
            raise ValueError("Mission contract not found")

        base_wp = mission.wp_reward or 400
        negotiated_wp = int(round(base_wp * payout_multiplier))
        negotiated_sp = int(round(getattr(mission, 'sp_reward', 200) or 200 * payout_multiplier))

        payout_ratio = payout_multiplier
        salvage_ratio = salvage_pct / 50.0
        blc_ratio = blc_pct / 50.0

        threat_multiplier = round(1.0 + (payout_ratio - 1.0) * 0.25 + (salvage_ratio - 1.0) * 0.20 + (blc_ratio - 1.0) * 0.15, 2)
        threat_multiplier = max(0.75, min(2.25, threat_multiplier))

        opfor_enemy_bv = int(round(player_lance_bv * threat_multiplier))

        if threat_multiplier < 0.85:
            threat_rating = "🟢 Low Threat (Local Planetary Militia)"
            opfor_units = ["Locust LCT-1V (20T)", "Stinger STG-3R (20T)", "Scorpion Tank (35T)", "Vedette Tank (50T)"]
        elif threat_multiplier <= 1.15:
            threat_rating = "🟡 Moderate Threat (Standard House Line Garrison)"
            opfor_units = ["Wasp WSP-1A (20T)", "Hunchback HBK-4G (50T)", "Catapult CPLT-A1 (65T)", "Warhammer WHM-6R (70T)"]
        elif threat_multiplier <= 1.45:
            threat_rating = "🟠 High Threat (Veteran Regular Command Regulars)"
            opfor_units = ["Griffin GRF-1N (55T)", "Marauder MAD-3R (75T)", "Warhammer WHM-6R (70T)", "Awesome AWS-8Q (80T)"]
        else:
            threat_rating = "🔴 Extreme Threat (Elite House Guards & Clan Star)"
            opfor_units = ["Timber Wolf Prime (75T)", "Dire Wolf Prime (100T)", "Mad Dog Prime (60T)", "Summoner Prime (70T)"]

        return {
            "mission_id": mission.id,
            "mission_name": mission.name,
            "original_wp": base_wp,
            "negotiated_wp": negotiated_wp,
            "negotiated_sp": negotiated_sp,
            "payout_multiplier": payout_multiplier,
            "salvage_pct": salvage_pct,
            "blc_pct": blc_pct,
            "threat_multiplier": threat_multiplier,
            "player_lance_bv": player_lance_bv,
            "opfor_enemy_bv": opfor_enemy_bv,
            "opfor_threat_rating": threat_rating,
            "opfor_composition": opfor_units
        }

    @classmethod
    def generate_opfor_roster(cls, target_bv: int = 5000, era_code: str = "3025", enemy_faction: str = "OpFor Force") -> Dict[str, Any]:
        """Generates structured enemy units (Mechs & Combat Vehicles) and MechWarriors targeting specified BV2, era, and faction rules."""
        from packages.data_importer.master_unit_database import MasterUnitDatabase
        
        # Source from Master Unit Database filtered by Era and Opposing Faction
        preset_units = MasterUnitDatabase.filter_units(era_code=era_code, faction=enemy_faction)
        if not preset_units:
            preset_units = MasterUnitDatabase.filter_units(era_code=era_code)

        # Select 4 enemy units (mix of mechs & tanks) aiming for target BV
        sorted_units = sorted(preset_units, key=lambda x: x.get("bv2", 1000), reverse=(target_bv >= 4000))
        opfor_units = []
        accumulated_bv = 0
        for i in range(4):
            u_choice = sorted_units[i % len(sorted_units)]
            u_copy = dict(u_choice)
            opfor_units.append(u_copy)
            accumulated_bv += u_copy.get("bv2", 1200)


        # Enemy pilots
        first_names = ["Marcus", "Elena", "Viktor", "Kendra", "Hans", "Sergei", "Sven", "Tariq"]
        last_names = ["Trent", "Vance", "Steiner", "Marik", "Kurita", "Liao", "Davion", "Kerensky"]
        callsigns = ["Ironhide", "Valkyrie", "Ghost", "Spectre", "Reaper", "Hellhound", "Shadow", "Saber"]

        opfor_pilots = []
        for i in range(len(opfor_units)):
            name = f"Commander {first_names[i % len(first_names)]} {last_names[(i+2) % len(last_names)]}"
            cs = callsigns[i % len(callsigns)]
            gunnery = 3 if target_bv > 6000 else 4
            piloting = 4 if target_bv > 6000 else 5
            spa = "Sharpshooter (+1 Accuracy)" if i == 0 and target_bv > 5500 else "None"
            opfor_pilots.append({
                "name": name,
                "callsign": cs,
                "gunnery": gunnery,
                "piloting": piloting,
                "spa": spa,
                "unit_chassis": opfor_units[i]["chassis"]
            })

        return {
            "target_bv": target_bv,
            "actual_bv": accumulated_bv,
            "bv_match_pct": round((accumulated_bv / target_bv * 100.0) if target_bv > 0 else 100.0, 1),
            "enemy_faction": enemy_faction,
            "opfor_units": opfor_units,
            "opfor_pilots": opfor_pilots,
            "available_faction_units": preset_units
        }

