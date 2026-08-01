from typing import List, Dict, Any, Optional

class MasterUnitDatabase:
    """Master Unit List (MUL) Registry & Database
    Comprehensive database of BattleTech BattleMechs, OmniMechs, IndustrialMechs, and Combat Vehicles
    categorized strictly by Faction, Era (2750 to 3151), Tech Base, Tonnage Class, and BV2.
    """

    UNITS = [
        # =========================================================================
        # LIGHT MECHS (20 - 35 TON)
        # =========================================================================
        {"chassis": "Locust", "model": "LCT-1V", "tonnage": 20, "bv2": 432, "wp_cost": 150, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Davion", "House Kurita", "House Steiner", "House Marik", "House Liao", "Mercenaries", "Pirates"]},
        {"chassis": "Wasp", "model": "WSP-1A", "tonnage": 20, "bv2": 384, "wp_cost": 140, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Davion", "House Kurita", "House Steiner", "House Marik", "House Liao", "Mercenaries", "Pirates"]},
        {"chassis": "Stinger", "model": "STG-3R", "tonnage": 20, "bv2": 359, "wp_cost": 135, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Davion", "House Kurita", "House Steiner", "House Marik", "House Liao", "Mercenaries", "Pirates"]},
        {"chassis": "UrbanMech", "model": "UM-R60", "tonnage": 30, "bv2": 504, "wp_cost": 180, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Liao", "House Davion", "House Kurita", "Mercenaries", "Pirates"]},
        {"chassis": "Commando", "model": "COM-2D", "tonnage": 25, "bv2": 541, "wp_cost": 190, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062"], "factions": ["House Steiner", "Mercenaries"]},
        {"chassis": "Panther", "model": "PNT-9R", "tonnage": 35, "bv2": 769, "wp_cost": 270, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Kurita", "Mercenaries"]},
        {"chassis": "Jenner", "model": "JR7-D", "tonnage": 35, "bv2": 875, "wp_cost": 310, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068"], "factions": ["House Kurita", "Mercenaries"]},
        {"chassis": "Valkyrie", "model": "VLK-QA", "tonnage": 30, "bv2": 723, "wp_cost": 250, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2821", "3025", "3050", "3062"], "factions": ["House Davion", "Mercenaries"]},
        {"chassis": "Raven", "model": "RVN-3L", "tonnage": 35, "bv2": 878, "wp_cost": 320, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["House Liao", "Mercenaries"]},
        {"chassis": "Kit Fox (Uller)", "model": "Prime", "tonnage": 30, "bv2": 1184, "wp_cost": 420, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["Clan Jade Falcon", "Clan Wolf", "Clan Ghost Bear", "Clan Smoke Jaguar"]},
        {"chassis": "Mist Lynx (Koshi)", "model": "Prime", "tonnage": 25, "bv2": 956, "wp_cost": 340, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068"], "factions": ["Clan Smoke Jaguar", "Clan Jade Falcon", "Clan Wolf"]},
        {"chassis": "Malak", "model": "C-MLK-O Dominus", "tonnage": 30, "bv2": 980, "wp_cost": 340, "tech_base": "Word of Blake", "type": "OmniMech", "eras": ["3068"], "factions": ["Word of Blake", "ComStar"]},

        # =========================================================================
        # MEDIUM MECHS (40 - 55 TON)
        # =========================================================================
        {"chassis": "Centurion", "model": "CN9-A", "tonnage": 50, "bv2": 945, "wp_cost": 350, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Davion", "Mercenaries"]},
        {"chassis": "Hunchback", "model": "HBK-4G", "tonnage": 50, "bv2": 1041, "wp_cost": 380, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Marik", "House Kurita", "House Steiner", "House Davion", "House Liao", "Mercenaries", "Pirates"]},
        {"chassis": "Shadow Hawk", "model": "SHD-2H", "tonnage": 55, "bv2": 1064, "wp_cost": 390, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Davion", "House Steiner", "House Kurita", "House Marik", "House Liao", "Mercenaries"]},
        {"chassis": "Wolverine", "model": "WVR-6R", "tonnage": 55, "bv2": 1101, "wp_cost": 400, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Marik", "House Davion", "House Steiner", "House Kurita", "Mercenaries"]},
        {"chassis": "Griffin", "model": "GRF-1N", "tonnage": 55, "bv2": 1272, "wp_cost": 450, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Steiner", "House Davion", "House Marik", "House Kurita", "Mercenaries"]},
        {"chassis": "Enforcer", "model": "ENF-4R", "tonnage": 50, "bv2": 1028, "wp_cost": 370, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2821", "3025", "3050", "3062"], "factions": ["House Davion", "Mercenaries"]},
        {"chassis": "Vindicator", "model": "VND-1R", "tonnage": 45, "bv2": 1024, "wp_cost": 360, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2821", "3025", "3050", "3062", "3068"], "factions": ["House Liao", "Mercenaries"]},
        {"chassis": "Bushwacker", "model": "BSW-S2", "tonnage": 55, "bv2": 1410, "wp_cost": 500, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["3050", "3062", "3068"], "factions": ["House Steiner", "House Davion", "Mercenaries"]},
        {"chassis": "Stormcrow (Ryoken)", "model": "Prime", "tonnage": 55, "bv2": 2074, "wp_cost": 750, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["Clan Jade Falcon", "Clan Wolf", "Clan Ghost Bear", "Clan Smoke Jaguar"]},
        {"chassis": "Ice Ferret (Fenris)", "model": "Prime", "tonnage": 45, "bv2": 1412, "wp_cost": 500, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068"], "factions": ["Clan Wolf", "Clan Ice Hellion"]},
        {"chassis": "Preta", "model": "C-PRT-O Dominus", "tonnage": 45, "bv2": 1350, "wp_cost": 480, "tech_base": "Word of Blake", "type": "OmniMech", "eras": ["3068"], "factions": ["Word of Blake", "ComStar"]},

        # =========================================================================
        # HEAVY MECHS (60 - 75 TON)
        # =========================================================================
        {"chassis": "Marauder", "model": "MAD-3R", "tonnage": 75, "bv2": 1363, "wp_cost": 500, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Davion", "House Kurita", "House Steiner", "House Marik", "House Liao", "Mercenaries"]},
        {"chassis": "Warhammer", "model": "WHM-6R", "tonnage": 70, "bv2": 1299, "wp_cost": 480, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Davion", "House Kurita", "House Steiner", "House Marik", "House Liao", "Mercenaries"]},
        {"chassis": "Catapult", "model": "CPLT-A1", "tonnage": 65, "bv2": 1285, "wp_cost": 460, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Kurita", "House Liao", "House Davion", "Mercenaries"]},
        {"chassis": "Archer", "model": "ARC-2R", "tonnage": 70, "bv2": 1477, "wp_cost": 520, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Marik", "House Steiner", "House Davion", "House Kurita", "Mercenaries"]},
        {"chassis": "Thunderbolt", "model": "TDB-5S", "tonnage": 65, "bv2": 1335, "wp_cost": 470, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Steiner", "House Davion", "House Marik", "Mercenaries"]},
        {"chassis": "Rifleman", "model": "RFL-3N", "tonnage": 60, "bv2": 1039, "wp_cost": 380, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068"], "factions": ["House Davion", "House Steiner", "House Kurita", "Mercenaries"]},
        {"chassis": "Dragon", "model": "DRG-1N", "tonnage": 60, "bv2": 1125, "wp_cost": 400, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062"], "factions": ["House Kurita", "Mercenaries"]},
        {"chassis": "Orion", "model": "ON1-K", "tonnage": 75, "bv2": 1429, "wp_cost": 510, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068"], "factions": ["House Marik", "House Steiner", "ComStar", "Mercenaries"]},
        {"chassis": "Cataphract", "model": "CTF-1X", "tonnage": 70, "bv2": 1320, "wp_cost": 470, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["3025", "3050", "3062"], "factions": ["House Liao", "House Davion", "Mercenaries"]},
        {"chassis": "Timber Wolf (Mad Cat)", "model": "Prime", "tonnage": 75, "bv2": 2737, "wp_cost": 950, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["Clan Jade Falcon", "Clan Wolf", "Clan Ghost Bear", "Clan Smoke Jaguar"]},
        {"chassis": "Mad Dog (Vulture)", "model": "Prime", "tonnage": 60, "bv2": 2210, "wp_cost": 800, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["Clan Ghost Bear", "Clan Smoke Jaguar", "Clan Jade Falcon", "Clan Wolf"]},
        {"chassis": "Summoner (Thor)", "model": "Prime", "tonnage": 70, "bv2": 2450, "wp_cost": 880, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["Clan Jade Falcon", "Clan Smoke Jaguar", "Clan Wolf"]},
        {"chassis": "Grigori", "model": "C-GRG-O Dominus", "tonnage": 60, "bv2": 1680, "wp_cost": 600, "tech_base": "Word of Blake", "type": "OmniMech", "eras": ["3068"], "factions": ["Word of Blake", "ComStar"]},

        # =========================================================================
        # ASSAULT MECHS (80 - 100 TON)
        # =========================================================================
        {"chassis": "Atlas", "model": "AS7-D", "tonnage": 100, "bv2": 1897, "wp_cost": 750, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Steiner", "House Davion", "House Kurita", "House Marik", "House Liao", "Mercenaries"]},
        {"chassis": "Awesome", "model": "AWS-8Q", "tonnage": 80, "bv2": 1605, "wp_cost": 620, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Marik", "House Steiner", "House Kurita", "Mercenaries"]},
        {"chassis": "BattleMaster", "model": "BLR-1G", "tonnage": 85, "bv2": 1512, "wp_cost": 580, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068"], "factions": ["House Steiner", "House Davion", "House Marik", "House Kurita", "Mercenaries"]},
        {"chassis": "Stalker", "model": "STK-3H", "tonnage": 85, "bv2": 1570, "wp_cost": 600, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["2750", "2821", "3025", "3050", "3062", "3068"], "factions": ["House Marik", "House Steiner", "House Liao", "Mercenaries"]},
        {"chassis": "King Crab", "model": "KGC-000", "tonnage": 100, "bv2": 1810, "wp_cost": 720, "tech_base": "Inner Sphere SLDF", "type": "BattleMech", "eras": ["2750", "3050", "3062", "3068", "3151"], "factions": ["ComStar", "Word of Blake", "House Steiner", "Mercenaries"]},
        {"chassis": "Highlander", "model": "HGN-732", "tonnage": 90, "bv2": 2180, "wp_cost": 820, "tech_base": "Inner Sphere SLDF", "type": "BattleMech", "eras": ["2750", "3050", "3062", "3068"], "factions": ["ComStar", "House Steiner", "House Northwind Highlanders", "Mercenaries"]},
        {"chassis": "Fafnir", "model": "FNR-5", "tonnage": 100, "bv2": 2480, "wp_cost": 920, "tech_base": "Inner Sphere", "type": "BattleMech", "eras": ["3062", "3068", "3151"], "factions": ["House Steiner", "Mercenaries"]},
        {"chassis": "Dire Wolf (Daishi)", "model": "Prime", "tonnage": 100, "bv2": 3042, "wp_cost": 1150, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["Clan Smoke Jaguar", "Clan Wolf", "Clan Jade Falcon", "Clan Ghost Bear"]},
        {"chassis": "Executioner (Gladiator)", "model": "Prime", "tonnage": 95, "bv2": 2680, "wp_cost": 980, "tech_base": "Clan", "type": "OmniMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["Clan Ghost Bear", "Clan Smoke Jaguar"]},
        {"chassis": "Kodiak", "model": "Standard", "tonnage": 100, "bv2": 2980, "wp_cost": 1100, "tech_base": "Clan", "type": "BattleMech", "eras": ["3050", "3062", "3068", "3151"], "factions": ["Clan Ghost Bear"]},
        {"chassis": "Archangel", "model": "C-ANG-O Dominus", "tonnage": 100, "bv2": 2350, "wp_cost": 890, "tech_base": "Word of Blake", "type": "OmniMech", "eras": ["3068"], "factions": ["Word of Blake", "ComStar"]},
        {"chassis": "Seraph", "model": "C-SRP-O Dominus", "tonnage": 85, "bv2": 2120, "wp_cost": 800, "tech_base": "Word of Blake", "type": "OmniMech", "eras": ["3068"], "factions": ["Word of Blake", "ComStar"]},

        # =========================================================================
        # COMBAT VEHICLES (TANKS, HOVERCRAFT, VTOLS)
        # =========================================================================
        {"chassis": "Demolisher Heavy Tank", "model": "Standard", "tonnage": 80, "bv2": 1080, "wp_cost": 320, "tech_base": "Inner Sphere", "type": "Combat Vehicle", "eras": ["2821", "3025", "3050", "3062", "3068", "3151"], "factions": ["House Kurita", "House Steiner", "House Davion", "House Marik", "House Liao", "Mercenaries", "Pirates"]},
        {"chassis": "Manticore Heavy Tank", "model": "Standard", "tonnage": 60, "bv2": 993, "wp_cost": 300, "tech_base": "Inner Sphere", "type": "Combat Vehicle", "eras": ["2750", "2821", "3025", "3050", "3062", "3068"], "factions": ["House Davion", "House Steiner", "House Marik", "House Kurita", "House Liao", "Mercenaries"]},
        {"chassis": "SRM Carrier", "model": "Standard", "tonnage": 60, "bv2": 816, "wp_cost": 250, "tech_base": "Inner Sphere", "type": "Combat Vehicle", "eras": ["2821", "3025", "3050", "3062", "3068"], "factions": ["House Kurita", "House Liao", "House Davion", "House Marik", "Mercenaries", "Pirates"]},
        {"chassis": "LRM Carrier", "model": "Standard", "tonnage": 60, "bv2": 833, "wp_cost": 260, "tech_base": "Inner Sphere", "type": "Combat Vehicle", "eras": ["2821", "3025", "3050", "3062", "3068"], "factions": ["House Marik", "House Davion", "House Kurita", "House Steiner", "House Liao", "Mercenaries"]},
        {"chassis": "Vedette Medium Tank", "model": "Standard", "tonnage": 50, "bv2": 475, "wp_cost": 160, "tech_base": "Inner Sphere", "type": "Combat Vehicle", "eras": ["2821", "3025", "3050", "3062", "3068"], "factions": ["House Davion", "House Steiner", "House Marik", "House Kurita", "Mercenaries"]},
        {"chassis": "Scorpion Light Tank", "model": "Standard", "tonnage": 35, "bv2": 348, "wp_cost": 120, "tech_base": "Inner Sphere", "type": "Combat Vehicle", "eras": ["2821", "3025", "3050", "3062", "3068"], "factions": ["House Steiner", "House Kurita", "House Liao", "House Davion", "Mercenaries", "Pirates"]},
        {"chassis": "Saladin Assault Hover Tank", "model": "Standard", "tonnage": 35, "bv2": 597, "wp_cost": 200, "tech_base": "Inner Sphere", "type": "Hovercraft", "eras": ["2821", "3025", "3050", "3062", "3068"], "factions": ["House Davion", "House Kurita", "House Marik", "Mercenaries", "Pirates"]},
        {"chassis": "Pegasus Scout Hover Tank", "model": "Standard", "tonnage": 35, "bv2": 622, "wp_cost": 210, "tech_base": "Inner Sphere", "type": "Hovercraft", "eras": ["2821", "3025", "3050", "3062", "3068"], "factions": ["House Liao", "House Davion", "House Marik", "Mercenaries"]},
        {"chassis": "Warrior Attack Helicopter", "model": "H-7", "tonnage": 21, "bv2": 412, "wp_cost": 150, "tech_base": "Inner Sphere", "type": "VTOL", "eras": ["3025", "3050", "3062", "3068"], "factions": ["House Davion", "House Steiner", "Mercenaries"]},
        {"chassis": "Yellow Jacket Gunship", "model": "Standard", "tonnage": 30, "bv2": 780, "wp_cost": 260, "tech_base": "Inner Sphere", "type": "VTOL", "eras": ["3050", "3062", "3068"], "factions": ["House Davion", "House Steiner", "House Liao", "Mercenaries"]},
        {"chassis": "Alacorn Heavy Tank", "model": "Mk VI", "tonnage": 95, "bv2": 1640, "wp_cost": 550, "tech_base": "Inner Sphere SLDF", "type": "Combat Vehicle", "eras": ["2750", "3050", "3062", "3068"], "factions": ["ComStar", "House Steiner", "Word of Blake", "Mercenaries"]}
    ]

    @classmethod
    def get_all_units(cls) -> List[Dict[str, Any]]:
        """Returns the full master unit registry."""
        return cls.UNITS

    @classmethod
    def filter_units(
        cls,
        era_code: str = "3025",
        faction: Optional[str] = None,
        unit_type: Optional[str] = None,
        tech_base: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Filters units dynamically by Era, Faction, Unit Type, and Tech Base."""
        results = []
        for u in cls.UNITS:
            # Check Era match
            if era_code and era_code not in u.get("eras", []):
                continue
            
            # Check Faction match (if provided, match or allow general Mercenary/Pirates)
            if faction:
                faction_match = False
                u_factions = u.get("factions", [])
                for f in u_factions:
                    if f.lower() in faction.lower() or faction.lower() in f.lower():
                        faction_match = True
                        break
                if not faction_match and "Mercenaries" not in u_factions and "Pirates" not in u_factions:
                    continue

            # Check Unit Type match (e.g. BattleMech vs Combat Vehicle)
            if unit_type and u.get("type", "").lower() != unit_type.lower():
                continue

            # Check Tech Base match
            if tech_base and tech_base != "Mixed Tech" and u.get("tech_base", "").lower() != tech_base.lower():
                continue

            results.append(dict(u))

        return results if results else [dict(u) for u in cls.UNITS if era_code in u.get("eras", [])]
