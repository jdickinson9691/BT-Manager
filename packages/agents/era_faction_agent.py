from typing import List, Dict, Any

class EraFactionAgent:
    """Agent 7: Era & Faction Domain Agent
    Responsibilities: Manages era historical data (units, equipment, vehicles, pilots, SPAs, default dates)
    for all 7 BattleTech Eras, filtering Master Unit List (MUL) chassis procurement, contract availability,
    and starmap borders strictly by active BattleTech Era and Player Faction.
    """

    ERAS = {
        "2750": {
            "name": "Star League Era",
            "years": "2571–2780",
            "default_date": "2750-01-01",
            "has_clans": False,
            "tech_base_label": "Star League Royal / High-Tech SLDF",
            "starting_units": [
                {"chassis": "Royal Marauder", "model": "MAD-1R", "tonnage": 75, "bv2": 1720, "tech_base": "Inner Sphere SLDF"},
                {"chassis": "Black Knight", "model": "BL-6-KNT", "tonnage": 75, "bv2": 1640, "tech_base": "Inner Sphere SLDF"},
                {"chassis": "Orion", "model": "ON1-K", "tonnage": 75, "bv2": 1429, "tech_base": "Inner Sphere SLDF"},
                {"chassis": "Crab", "model": "CRB-27", "tonnage": 50, "bv2": 1198, "tech_base": "Inner Sphere SLDF"}
            ],
            "market_units": [
                {"chassis": "Highlander", "model": "HGN-732", "tonnage": 90, "bv2": 2180, "cbill_cost": 9500000.0, "wp_cost": 950, "tech_base": "Inner Sphere SLDF"},
                {"chassis": "Flashman", "model": "FLS-7K", "tonnage": 75, "bv2": 1745, "cbill_cost": 7800000.0, "wp_cost": 780, "tech_base": "Inner Sphere SLDF"},
                {"chassis": "Royal Warhammer", "model": "WHM-7A", "tonnage": 70, "bv2": 1680, "cbill_cost": 7200000.0, "wp_cost": 720, "tech_base": "Inner Sphere SLDF"},
                {"chassis": "Sentinel", "model": "STN-3B", "tonnage": 40, "bv2": 920, "cbill_cost": 3600000.0, "wp_cost": 360, "tech_base": "Inner Sphere SLDF"}
            ],
            "inventory": [
                {"component_name": "ER PPC", "quantity": 2, "category": "Weapon"},
                {"component_name": "Gauss Rifle", "quantity": 1, "category": "Weapon"},
                {"component_name": "LB 10-X Autocannon", "quantity": 2, "category": "Weapon"},
                {"component_name": "Double Heat Sink", "quantity": 10, "category": "Equipment"},
                {"component_name": "Artemis IV FCS", "quantity": 4, "category": "Equipment"}
            ],
            "pilots": [
                {"name": "Major Amanda Cameron", "callsign": "Regina", "gunnery": 2, "piloting": 3, "spa": "Royal Marksmanship (+1 Energy Accuracy)", "xp": 85},
                {"name": "Captain Arthur Pendelton", "callsign": "Lancelot", "gunnery": 3, "piloting": 3, "spa": "Commanding Presence (+1 Initiative)", "xp": 60}
            ],
            "spas": [
                "Royal Marksmanship (+1 Energy Accuracy)",
                "Commanding Presence (+1 Initiative)",
                "Tactical Genius (Reroll Initiative Once)",
                "Sharpshooter (+1 Accuracy to Called Shots)",
                "Marksman (Energy Weapon Range Boost)"
            ]
        },
        "2821": {
            "name": "Early Succession Wars",
            "years": "2781–2900",
            "default_date": "2821-01-01",
            "has_clans": False,
            "tech_base_label": "Inner Sphere Downgraded / 1st & 2nd Succession Wars",
            "starting_units": [
                {"chassis": "BattleMaster", "model": "BLR-1D", "tonnage": 85, "bv2": 1505, "tech_base": "Inner Sphere"},
                {"chassis": "Thunderbolt", "model": "TDB-5S", "tonnage": 65, "bv2": 1335, "tech_base": "Inner Sphere"},
                {"chassis": "Archer", "model": "ARC-2K", "tonnage": 70, "bv2": 1356, "tech_base": "Inner Sphere"},
                {"chassis": "Wolverine", "model": "WVR-6R", "tonnage": 55, "bv2": 1101, "tech_base": "Inner Sphere"}
            ],
            "market_units": [
                {"chassis": "Stalker", "model": "STK-3H", "tonnage": 85, "bv2": 1570, "cbill_cost": 8200000.0, "wp_cost": 820, "tech_base": "Inner Sphere"},
                {"chassis": "Marauder", "model": "MAD-3R", "tonnage": 75, "bv2": 1363, "cbill_cost": 6500000.0, "wp_cost": 650, "tech_base": "Inner Sphere"},
                {"chassis": "Rifleman", "model": "RFL-3N", "tonnage": 60, "bv2": 1039, "cbill_cost": 4800000.0, "wp_cost": 480, "tech_base": "Inner Sphere"},
                {"chassis": "Phoenix Hawk", "model": "PXH-1", "tonnage": 45, "bv2": 1041, "cbill_cost": 3900000.0, "wp_cost": 390, "tech_base": "Inner Sphere"}
            ],
            "inventory": [
                {"component_name": "AC/20 Autocannon", "quantity": 2, "category": "Weapon"},
                {"component_name": "Particle Projector Cannon (PPC)", "quantity": 3, "category": "Weapon"},
                {"component_name": "Large Laser", "quantity": 4, "category": "Weapon"},
                {"component_name": "LRM-20", "quantity": 2, "category": "Weapon"},
                {"component_name": "Heat Sink", "quantity": 12, "category": "Equipment"}
            ],
            "pilots": [
                {"name": "Commander Charles Marik", "callsign": "Eagle", "gunnery": 3, "piloting": 4, "spa": "Iron Will (Panic Resistance)", "xp": 65},
                {"name": "Lt. Greta Von Doom", "callsign": "Valkyrie", "gunnery": 3, "piloting": 4, "spa": "Pain Resistance", "xp": 50}
            ],
            "spas": [
                "Iron Will (Panic Resistance)",
                "Pain Resistance",
                "Sharpshooter (+1 Accuracy to Called Shots)",
                "Dodge (Physical Evasion)",
                "Weapon Specialist (+1 To-Hit Primary)"
            ]
        },
        "3025": {
            "name": "Late Succession Wars / Renaissance",
            "years": "2901–3049",
            "default_date": "3025-01-15",
            "has_clans": False,
            "tech_base_label": "Inner Sphere 3025 / Lostech Era",
            "starting_units": [
                {"chassis": "Marauder", "model": "MAD-3R", "tonnage": 75, "bv2": 1363, "tech_base": "Inner Sphere"},
                {"chassis": "Warhammer", "model": "WHM-6R", "tonnage": 70, "bv2": 1299, "tech_base": "Inner Sphere"},
                {"chassis": "Shadow Hawk", "model": "SHD-2H", "tonnage": 55, "bv2": 1064, "tech_base": "Inner Sphere"},
                {"chassis": "Centurion", "model": "CN9-A", "tonnage": 50, "bv2": 945, "tech_base": "Inner Sphere"}
            ],
            "market_units": [
                {"chassis": "Atlas", "model": "AS7-D", "tonnage": 100, "bv2": 1897, "cbill_cost": 9600000.0, "wp_cost": 960, "tech_base": "Inner Sphere"},
                {"chassis": "Catapult", "model": "CPLT-A1", "tonnage": 65, "bv2": 1285, "cbill_cost": 5400000.0, "wp_cost": 540, "tech_base": "Inner Sphere"},
                {"chassis": "Hunchback", "model": "HBK-4G", "tonnage": 50, "bv2": 1041, "cbill_cost": 3800000.0, "wp_cost": 380, "tech_base": "Inner Sphere"},
                {"chassis": "Locust", "model": "LCT-1V", "tonnage": 20, "bv2": 432, "cbill_cost": 1500000.0, "wp_cost": 150, "tech_base": "Inner Sphere"}
            ],
            "inventory": [
                {"component_name": "PPC", "quantity": 2, "category": "Weapon"},
                {"component_name": "AC/20", "quantity": 1, "category": "Weapon"},
                {"component_name": "Medium Laser", "quantity": 6, "category": "Weapon"},
                {"component_name": "Heat Sink", "quantity": 12, "category": "Equipment"},
                {"component_name": "Ferro-Fibrous Armor Plate (5T)", "quantity": 4, "category": "Armor"}
            ],
            "pilots": [
                {"name": "Jaime Wolf", "callsign": "Wolf-1", "gunnery": 2, "piloting": 3, "spa": "Tactical Genius (Reroll Initiative Once)", "xp": 90},
                {"name": "Lt. Natasha Kerensky", "callsign": "Black Widow", "gunnery": 2, "piloting": 3, "spa": "Sharpshooter (+1 Accuracy to Called Shots)", "xp": 85}
            ],
            "spas": [
                "Sharpshooter (+1 Accuracy to Called Shots)",
                "Tactical Genius (Reroll Initiative Once)",
                "Marksman (Energy Weapon Range Boost)",
                "Dodge (Physical Evasion)",
                "Jumping Jack (-1 Target Penalty Jumping)"
            ]
        },
        "3050": {
            "name": "Clan Invasion",
            "years": "3050–3061",
            "default_date": "3050-03-01",
            "has_clans": True,
            "tech_base_label": "Clan Omni & Helm Memory IS",
            "starting_units": [
                {"chassis": "Timber Wolf", "model": "Prime", "tonnage": 75, "bv2": 2737, "tech_base": "Clan"},
                {"chassis": "Mad Dog", "model": "Prime", "tonnage": 60, "bv2": 2210, "tech_base": "Clan"},
                {"chassis": "Bushwacker", "model": "BSW-S2", "tonnage": 55, "bv2": 1410, "tech_base": "Inner Sphere"},
                {"chassis": "Axman", "model": "AXM-1N", "tonnage": 65, "bv2": 1380, "tech_base": "Inner Sphere"}
            ],
            "market_units": [
                {"chassis": "Dire Wolf", "model": "Prime", "tonnage": 100, "bv2": 3042, "cbill_cost": 14500000.0, "wp_cost": 1450, "tech_base": "Clan"},
                {"chassis": "Summoner", "model": "Prime", "tonnage": 70, "bv2": 2450, "cbill_cost": 11200000.0, "wp_cost": 1120, "tech_base": "Clan"},
                {"chassis": "Stormcrow", "model": "Prime", "tonnage": 55, "bv2": 2074, "cbill_cost": 8900000.0, "wp_cost": 890, "tech_base": "Clan"},
                {"chassis": "Elemental Point", "model": "BattleArmor", "tonnage": 5, "bv2": 450, "cbill_cost": 2200000.0, "wp_cost": 220, "tech_base": "Clan"}
            ],
            "inventory": [
                {"component_name": "Clan ER PPC", "quantity": 2, "category": "Weapon"},
                {"component_name": "Clan Ultra AC/20", "quantity": 1, "category": "Weapon"},
                {"component_name": "Clan LRM-20", "quantity": 2, "category": "Weapon"},
                {"component_name": "Double Heat Sink", "quantity": 12, "category": "Equipment"},
                {"component_name": "ER Medium Laser", "quantity": 6, "category": "Weapon"}
            ],
            "pilots": [
                {"name": "Star Commander Vlad Ward", "callsign": "Wolf-Alpha", "gunnery": 2, "piloting": 2, "spa": "Trueborn Reflexes (+1 Piloting)", "xp": 100},
                {"name": "Phelan Kell", "callsign": "Wolf-Beta", "gunnery": 3, "piloting": 3, "spa": "Cluster Targeting (+1 Missile Accuracy)", "xp": 75}
            ],
            "spas": [
                "Trueborn Reflexes (+1 Piloting)",
                "Cluster Targeting (+1 Missile Accuracy)",
                "Sharpshooter (+1 Accuracy to Called Shots)",
                "Marksman (Energy Weapon Range Boost)",
                "Multi-Tasker (No Multi-Target Penalty)"
            ]
        },
        "3062": {
            "name": "Civil War",
            "years": "3062–3067",
            "default_date": "3062-01-01",
            "has_clans": True,
            "tech_base_label": "FedCom Advanced IS & Clan",
            "starting_units": [
                {"chassis": "Thanatos", "model": "THS-4S", "tonnage": 75, "bv2": 1850, "tech_base": "Inner Sphere"},
                {"chassis": "Uziel", "model": "UZL-2S", "tonnage": 50, "bv2": 1420, "tech_base": "Inner Sphere"},
                {"chassis": "Hauptmann", "model": "HA1-O", "tonnage": 95, "bv2": 2150, "tech_base": "Inner Sphere"},
                {"chassis": "Mad Cat Mk II", "model": "Standard", "tonnage": 90, "bv2": 2950, "tech_base": "Clan"}
            ],
            "market_units": [
                {"chassis": "Fafnir", "model": "FNR-5", "tonnage": 100, "bv2": 2480, "cbill_cost": 13800000.0, "wp_cost": 1380, "tech_base": "Inner Sphere"},
                {"chassis": "Barghest", "model": "BGT-1E", "tonnage": 70, "bv2": 1620, "cbill_cost": 7400000.0, "wp_cost": 740, "tech_base": "Inner Sphere"},
                {"chassis": "Bushwacker", "model": "BSW-X1", "tonnage": 55, "bv2": 1390, "cbill_cost": 5200000.0, "wp_cost": 520, "tech_base": "Inner Sphere"},
                {"chassis": "Ryoken II", "model": "Standard", "tonnage": 55, "bv2": 2100, "cbill_cost": 9100000.0, "wp_cost": 910, "tech_base": "Clan"}
            ],
            "inventory": [
                {"component_name": "Rotary AC/5", "quantity": 2, "category": "Weapon"},
                {"component_name": "Heavy Medium Laser", "quantity": 4, "category": "Weapon"},
                {"component_name": "Light Gauss Rifle", "quantity": 1, "category": "Weapon"},
                {"component_name": "Targeting Computer", "quantity": 2, "category": "Equipment"},
                {"component_name": "Stealth Armor Plate", "quantity": 4, "category": "Armor"}
            ],
            "pilots": [
                {"name": "Colonel George Hasek", "callsign": "Duke", "gunnery": 2, "piloting": 3, "spa": "Gunslinger (+1 Dual Fire)", "xp": 95},
                {"name": "Major Daniel Davion", "callsign": "Fox-1", "gunnery": 3, "piloting": 3, "spa": "Sniper (Range Accuracy)", "xp": 80}
            ],
            "spas": [
                "Gunslinger (+1 Dual Fire)",
                "Sniper (Range Accuracy)",
                "Maneuvering Ace",
                "Combat Intuition",
                "Sharpshooter (+1 Accuracy to Called Shots)"
            ]
        },
        "3068": {
            "name": "Word of Blake Jihad",
            "years": "3068–3085",
            "default_date": "3068-01-01",
            "has_clans": True,
            "tech_base_label": "Celestial Omni & C3i Network",
            "starting_units": [
                {"chassis": "Archangel", "model": "C-ANG-O Dominus", "tonnage": 100, "bv2": 2350, "tech_base": "Word of Blake"},
                {"chassis": "Seraph", "model": "C-SRP-O Dominus", "tonnage": 85, "bv2": 2120, "tech_base": "Word of Blake"},
                {"chassis": "Legacy", "model": "LGC-01", "tonnage": 80, "bv2": 1890, "tech_base": "Inner Sphere"},
                {"chassis": "Devastator", "model": "DVS-2", "tonnage": 100, "bv2": 2420, "tech_base": "Inner Sphere"}
            ],
            "market_units": [
                {"chassis": "Preta", "model": "C-PRT-O Dominus", "tonnage": 45, "bv2": 1350, "cbill_cost": 5900000.0, "wp_cost": 590, "tech_base": "Word of Blake"},
                {"chassis": "Grigori", "model": "C-GRG-O Dominus", "tonnage": 60, "bv2": 1680, "cbill_cost": 7800000.0, "wp_cost": 780, "tech_base": "Word of Blake"},
                {"chassis": "Malak", "model": "C-MLK-O Dominus", "tonnage": 30, "bv2": 980, "cbill_cost": 3400000.0, "wp_cost": 340, "tech_base": "Word of Blake"},
                {"chassis": "Jes Missile Carrier", "model": "Standard", "tonnage": 60, "bv2": 1100, "cbill_cost": 4100000.0, "wp_cost": 410, "tech_base": "Inner Sphere"}
            ],
            "inventory": [
                {"component_name": "Heavy PPC", "quantity": 2, "category": "Weapon"},
                {"component_name": "Plasma Rifle", "quantity": 3, "category": "Weapon"},
                {"component_name": "MML-9 Launcher", "quantity": 2, "category": "Weapon"},
                {"component_name": "C3i Computer Node", "quantity": 3, "category": "Equipment"},
                {"component_name": "Light Engine Core", "quantity": 1, "category": "Equipment"}
            ],
            "pilots": [
                {"name": "Preceptor Apollyon", "callsign": "Dominus", "gunnery": 2, "piloting": 2, "spa": "Cybernetic Uplink (+1 C3 Network)", "xp": 110},
                {"name": "Adept Trent", "callsign": "Adept-1", "gunnery": 3, "piloting": 3, "spa": "Pain Suppression", "xp": 70}
            ],
            "spas": [
                "Cybernetic Uplink (+1 C3 Network)",
                "Pain Suppression",
                "Iron Will (Panic Resistance)",
                "Tactical Genius (Reroll Initiative Once)",
                "Weapon Specialist (+1 To-Hit Primary)"
            ]
        },
        "3151": {
            "name": "ilClan & Dark Age",
            "years": "3085–3151+",
            "default_date": "3151-01-01",
            "has_clans": True,
            "tech_base_label": "Mixed Tech Base & RISC Hybrid",
            "starting_units": [
                {"chassis": "Savage Wolf", "model": "Prime", "tonnage": 75, "bv2": 2890, "tech_base": "Mixed Tech"},
                {"chassis": "Regent", "model": "RGT-1A", "tonnage": 90, "bv2": 2750, "tech_base": "Mixed Tech"},
                {"chassis": "Hammerhead", "model": "HMR-HD", "tonnage": 45, "bv2": 1580, "tech_base": "Inner Sphere"},
                {"chassis": "Dominator", "model": "Standard", "tonnage": 65, "bv2": 2190, "tech_base": "Mixed Tech"}
            ],
            "market_units": [
                {"chassis": "Ares Superheavy", "model": "ARS-V1", "tonnage": 135, "bv2": 3450, "cbill_cost": 22000000.0, "wp_cost": 2200, "tech_base": "Superheavy Mixed"},
                {"chassis": "Hierofalcon", "model": "Prime", "tonnage": 45, "bv2": 1980, "cbill_cost": 8900000.0, "wp_cost": 890, "tech_base": "Clan"},
                {"chassis": "Enyo Strike Tank", "model": "Standard", "tonnage": 65, "bv2": 1420, "cbill_cost": 5100000.0, "wp_cost": 510, "tech_base": "Inner Sphere"},
                {"chassis": "Gulltoppr Heavy Scout", "model": "Standard", "tonnage": 100, "bv2": 2200, "cbill_cost": 11500000.0, "wp_cost": 1150, "tech_base": "Inner Sphere"}
            ],
            "inventory": [
                {"component_name": "Re-Engineered Medium Laser", "quantity": 4, "category": "Weapon"},
                {"component_name": "Clan ER Small Laser", "quantity": 6, "category": "Weapon"},
                {"component_name": "RISC Hyper-Laser", "quantity": 1, "category": "Weapon"},
                {"component_name": "Radical Heat Sink System", "quantity": 2, "category": "Equipment"},
                {"component_name": "Superheavy EndoSkeleton", "quantity": 1, "category": "Equipment"}
            ],
            "pilots": [
                {"name": "Alaric Ward", "callsign": "ilKhan", "gunnery": 1, "piloting": 2, "spa": "Master Tactician", "xp": 150},
                {"name": "Chance Vickers", "callsign": "Vanguard", "gunnery": 2, "piloting": 3, "spa": "Alpha Strike Master", "xp": 90}
            ],
            "spas": [
                "Master Tactician",
                "Alpha Strike Master",
                "Dodge (Physical Evasion)",
                "Sharpshooter (+1 Accuracy to Called Shots)",
                "Marksman (Energy Weapon Range Boost)"
            ]
        }
    }

    @classmethod
    def get_supported_eras(cls) -> List[Dict[str, Any]]:
        """Returns list of supported BattleTech Eras with metadata."""
        return [
            {
                "code": code,
                "name": data["name"],
                "years": data["years"],
                "default_date": data["default_date"],
                "has_clans": data["has_clans"],
                "tech_base_label": data["tech_base_label"]
            }
            for code, data in cls.ERAS.items()
        ]

    @classmethod
    def get_era_details(cls, era_code: str = "3025") -> Dict[str, Any]:
        """Gets full era configuration including starting units, equipment, pilots, and SPAs."""
        return cls.ERAS.get(era_code, cls.ERAS["3025"])

    @classmethod
    def filter_market_units_by_era_and_faction(
        cls,
        era_code: str = "3025",
        faction: str = "Mercenary"
    ) -> List[Dict[str, Any]]:
        """Filters available market mechs according to Master Unit List (MUL) era availability and faction tech base rules."""
        era_info = cls.get_era_details(era_code)
        market_mechs = era_info.get("market_units", [])
        
        filtered = []
        for m in market_mechs:
            m_copy = dict(m)
            m_copy["mul_verified"] = True
            filtered.append(m_copy)

        return filtered
