from sqlalchemy.orm import Session
from packages.database.models import RefEquipment, RefUnit, RefSPA, RefStarmap

def seed_reference_data(db: Session):
    """Populates reference data tables for Equipment, Units (Mechs, Vehicles, Aerospace), SPAs, and Starmap Systems."""
    
    # 1. SEED EQUIPMENT & COMPONENTS
    equipment_data = [
        # Energy Weapons
        {"name": "PPC", "category": "Energy Weapon", "tonnage": 7.0, "critical_slots": 3, "heat": 10, "damage": 10, "min_range": 3, "short_range": 6, "med_range": 12, "long_range": 18, "bv2": 176, "tech_base": "Inner Sphere", "cbill_cost": 300000.0},
        {"name": "ER PPC", "category": "Energy Weapon", "tonnage": 7.0, "critical_slots": 3, "heat": 15, "damage": 10, "min_range": 0, "short_range": 7, "med_range": 14, "long_range": 23, "bv2": 228, "tech_base": "Inner Sphere", "cbill_cost": 400000.0},
        {"name": "Clan ER PPC", "category": "Energy Weapon", "tonnage": 6.0, "critical_slots": 2, "heat": 15, "damage": 15, "min_range": 0, "short_range": 7, "med_range": 14, "long_range": 23, "bv2": 412, "tech_base": "Clan", "cbill_cost": 600000.0},
        {"name": "Large Laser", "category": "Energy Weapon", "tonnage": 5.0, "critical_slots": 2, "heat": 8, "damage": 8, "min_range": 0, "short_range": 5, "med_range": 10, "long_range": 15, "bv2": 123, "tech_base": "Inner Sphere", "cbill_cost": 100000.0},
        {"name": "ER Large Laser", "category": "Energy Weapon", "tonnage": 5.0, "critical_slots": 2, "heat": 12, "damage": 8, "min_range": 0, "short_range": 7, "med_range": 14, "long_range": 19, "bv2": 163, "tech_base": "Inner Sphere", "cbill_cost": 200000.0},
        {"name": "Medium Laser", "category": "Energy Weapon", "tonnage": 1.0, "critical_slots": 1, "heat": 3, "damage": 5, "min_range": 0, "short_range": 3, "med_range": 6, "long_range": 9, "bv2": 46, "tech_base": "Inner Sphere", "cbill_cost": 40000.0},
        {"name": "ER Medium Laser", "category": "Energy Weapon", "tonnage": 1.0, "critical_slots": 1, "heat": 5, "damage": 5, "min_range": 0, "short_range": 4, "med_range": 8, "long_range": 12, "bv2": 62, "tech_base": "Inner Sphere", "cbill_cost": 80000.0},
        {"name": "Small Laser", "category": "Energy Weapon", "tonnage": 0.5, "critical_slots": 1, "heat": 1, "damage": 3, "min_range": 0, "short_range": 1, "med_range": 2, "long_range": 3, "bv2": 9, "tech_base": "Inner Sphere", "cbill_cost": 11250.0},
        {"name": "Medium Pulse Laser", "category": "Energy Weapon", "tonnage": 2.0, "critical_slots": 1, "heat": 4, "damage": 6, "min_range": 0, "short_range": 2, "med_range": 4, "long_range": 6, "bv2": 48, "tech_base": "Inner Sphere", "cbill_cost": 60000.0},
        
        # Ballistic Weapons
        {"name": "AC/20", "category": "Ballistic Weapon", "tonnage": 14.0, "critical_slots": 10, "heat": 7, "damage": 20, "min_range": 0, "short_range": 3, "med_range": 6, "long_range": 9, "bv2": 178, "tech_base": "Inner Sphere", "cbill_cost": 300000.0},
        {"name": "AC/10", "category": "Ballistic Weapon", "tonnage": 12.0, "critical_slots": 7, "heat": 3, "damage": 10, "min_range": 0, "short_range": 5, "med_range": 10, "long_range": 15, "bv2": 123, "tech_base": "Inner Sphere", "cbill_cost": 200000.0},
        {"name": "AC/5", "category": "Ballistic Weapon", "tonnage": 8.0, "critical_slots": 4, "heat": 1, "damage": 5, "min_range": 3, "short_range": 6, "med_range": 12, "long_range": 18, "bv2": 70, "tech_base": "Inner Sphere", "cbill_cost": 125000.0},
        {"name": "Gauss Rifle", "category": "Ballistic Weapon", "tonnage": 15.0, "critical_slots": 7, "heat": 1, "damage": 15, "min_range": 2, "short_range": 7, "med_range": 15, "long_range": 22, "bv2": 320, "tech_base": "Inner Sphere", "cbill_cost": 500000.0},
        {"name": "LB 10-X AC", "category": "Ballistic Weapon", "tonnage": 11.0, "critical_slots": 6, "heat": 2, "damage": 10, "min_range": 0, "short_range": 6, "med_range": 12, "long_range": 18, "bv2": 148, "tech_base": "Inner Sphere", "cbill_cost": 400000.0},
        {"name": "Machine Gun", "category": "Ballistic Weapon", "tonnage": 0.5, "critical_slots": 1, "heat": 0, "damage": 2, "min_range": 0, "short_range": 1, "med_range": 2, "long_range": 3, "bv2": 5, "tech_base": "Inner Sphere", "cbill_cost": 5000.0},

        # Missile Weapons
        {"name": "LRM-20", "category": "Missile Weapon", "tonnage": 10.0, "critical_slots": 5, "heat": 6, "damage": 20, "min_range": 6, "short_range": 7, "med_range": 14, "long_range": 21, "bv2": 181, "tech_base": "Inner Sphere", "cbill_cost": 250000.0},
        {"name": "LRM-15", "category": "Missile Weapon", "tonnage": 7.0, "critical_slots": 3, "heat": 5, "damage": 15, "min_range": 6, "short_range": 7, "med_range": 14, "long_range": 21, "bv2": 136, "tech_base": "Inner Sphere", "cbill_cost": 175000.0},
        {"name": "SRM-6", "category": "Missile Weapon", "tonnage": 3.0, "critical_slots": 2, "heat": 4, "damage": 12, "min_range": 0, "short_range": 3, "med_range": 6, "long_range": 9, "bv2": 59, "tech_base": "Inner Sphere", "cbill_cost": 80000.0},
        {"name": "Streak SRM-2", "category": "Missile Weapon", "tonnage": 1.5, "critical_slots": 1, "heat": 2, "damage": 4, "min_range": 0, "short_range": 3, "med_range": 6, "long_range": 9, "bv2": 31, "tech_base": "Inner Sphere", "cbill_cost": 45000.0},

        # Equipment & Components
        {"name": "Single Heat Sink", "category": "Component", "tonnage": 1.0, "critical_slots": 1, "heat": -1, "damage": 0, "min_range": 0, "short_range": 0, "med_range": 0, "long_range": 0, "bv2": 1, "tech_base": "Inner Sphere", "cbill_cost": 2000.0},
        {"name": "Double Heat Sink", "category": "Component", "tonnage": 1.0, "critical_slots": 3, "heat": -2, "damage": 0, "min_range": 0, "short_range": 0, "med_range": 0, "long_range": 0, "bv2": 6, "tech_base": "Inner Sphere", "cbill_cost": 6000.0},
        {"name": "Ferro-Fibrous Armor Plate (5T)", "category": "Armor", "tonnage": 5.0, "critical_slots": 0, "heat": 0, "damage": 0, "min_range": 0, "short_range": 0, "med_range": 0, "long_range": 0, "bv2": 25, "tech_base": "Inner Sphere", "cbill_cost": 125000.0},
        {"name": "Standard Armor Plate (5T)", "category": "Armor", "tonnage": 5.0, "critical_slots": 0, "heat": 0, "damage": 0, "min_range": 0, "short_range": 0, "med_range": 0, "long_range": 0, "bv2": 20, "tech_base": "Inner Sphere", "cbill_cost": 50000.0},
        {"name": "MASC", "category": "Component", "tonnage": 3.0, "critical_slots": 2, "heat": 0, "damage": 0, "min_range": 0, "short_range": 0, "med_range": 0, "long_range": 0, "bv2": 35, "tech_base": "Inner Sphere", "cbill_cost": 250000.0},
        {"name": "Guardian ECM Suite", "category": "Electronic System", "tonnage": 1.5, "critical_slots": 2, "heat": 0, "damage": 0, "min_range": 0, "short_range": 0, "med_range": 0, "long_range": 6, "bv2": 61, "tech_base": "Inner Sphere", "cbill_cost": 200000.0},
        {"name": "Beagle Active Probe", "category": "Electronic System", "tonnage": 1.5, "critical_slots": 2, "heat": 0, "damage": 0, "min_range": 0, "short_range": 0, "med_range": 0, "long_range": 4, "bv2": 10, "tech_base": "Inner Sphere", "cbill_cost": 200000.0}
    ]

    for eq in equipment_data:
        if not db.query(RefEquipment).filter(RefEquipment.name == eq["name"]).first():
            db.add(RefEquipment(**eq))

    # 2. SEED UNITS (BATTLEMECHS, VEHICLES & AEROSPACE)
    unit_data = [
        # BattleMechs
        {"chassis": "Marauder", "model": "MAD-3R", "unit_type": "Mech", "tonnage": 75, "bv2": 1363, "tech_base": "Inner Sphere", "cbill_cost": 6483750.0, "intro_year": 2719, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Marauder", "model": "MAD-5D", "unit_type": "Mech", "tonnage": 75, "bv2": 1787, "tech_base": "Inner Sphere", "cbill_cost": 8920000.0, "intro_year": 3051, "supported_eras": "3050,3062,3067,3135,3151"},
        {"chassis": "Warhammer", "model": "WHM-6R", "unit_type": "Mech", "tonnage": 70, "bv2": 1299, "tech_base": "Inner Sphere", "cbill_cost": 6120000.0, "intro_year": 2515, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Shadow Hawk", "model": "SHD-2H", "unit_type": "Mech", "tonnage": 55, "bv2": 1064, "tech_base": "Inner Sphere", "cbill_cost": 4540000.0, "intro_year": 2570, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Centurion", "model": "CN9-A", "unit_type": "Mech", "tonnage": 50, "bv2": 945, "tech_base": "Inner Sphere", "cbill_cost": 3650000.0, "intro_year": 2801, "supported_eras": "3025,3050,3062,3067,3135,3151"},
        {"chassis": "Hunchback", "model": "HBK-4G", "unit_type": "Mech", "tonnage": 50, "bv2": 1041, "tech_base": "Inner Sphere", "cbill_cost": 3460000.0, "intro_year": 2572, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Atlas", "model": "AS7-D", "unit_type": "Mech", "tonnage": 100, "bv2": 1897, "tech_base": "Inner Sphere", "cbill_cost": 9620000.0, "intro_year": 2755, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Catapult", "model": "CPLT-A1", "unit_type": "Mech", "tonnage": 65, "bv2": 1285, "tech_base": "Inner Sphere", "cbill_cost": 5740000.0, "intro_year": 2561, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Timber Wolf", "model": "Prime", "unit_type": "Mech", "tonnage": 75, "bv2": 2737, "tech_base": "Clan", "cbill_cost": 24800000.0, "intro_year": 2945, "supported_eras": "3050,3062,3067,3135,3151"},
        {"chassis": "UrbanMech", "model": "UM-R60", "unit_type": "Mech", "tonnage": 30, "bv2": 504, "tech_base": "Inner Sphere", "cbill_cost": 1480000.0, "intro_year": 2675, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},

        # Combat Vehicles
        {"chassis": "Demolisher Heavy Tank", "model": "Standard", "unit_type": "Vehicle", "tonnage": 100, "bv2": 1086, "tech_base": "Inner Sphere", "cbill_cost": 3200000.0, "intro_year": 2830, "supported_eras": "3025,3050,3062,3067,3135,3151"},
        {"chassis": "LRM Carrier", "model": "Standard", "unit_type": "Vehicle", "tonnage": 60, "bv2": 833, "tech_base": "Inner Sphere", "cbill_cost": 2100000.0, "intro_year": 2780, "supported_eras": "3025,3050,3062,3067,3135,3151"},
        {"chassis": "SRM Carrier", "model": "Standard", "unit_type": "Vehicle", "tonnage": 60, "bv2": 816, "tech_base": "Inner Sphere", "cbill_cost": 2050000.0, "intro_year": 2785, "supported_eras": "3025,3050,3062,3067,3135,3151"},
        {"chassis": "Vedette Medium Tank", "model": "Standard", "unit_type": "Vehicle", "tonnage": 50, "bv2": 476, "tech_base": "Inner Sphere", "cbill_cost": 1150000.0, "intro_year": 2942, "supported_eras": "3025,3050,3062,3067,3135,3151"},
        {"chassis": "Saladin Hover Tank", "model": "Standard", "unit_type": "Vehicle", "tonnage": 35, "bv2": 597, "tech_base": "Inner Sphere", "cbill_cost": 1420000.0, "intro_year": 2975, "supported_eras": "3025,3050,3062,3067,3135,3151"},
        {"chassis": "Manticore Heavy Tank", "model": "Standard", "unit_type": "Vehicle", "tonnage": 60, "bv2": 993, "tech_base": "Inner Sphere", "cbill_cost": 2680000.0, "intro_year": 2668, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Yellow Jacket Gunship", "model": "Gauss", "unit_type": "Vehicle", "tonnage": 30, "bv2": 932, "tech_base": "Inner Sphere", "cbill_cost": 1850000.0, "intro_year": 3058, "supported_eras": "3062,3067,3135,3151"},

        # Aerospace Fighters
        {"chassis": "Shilone", "model": "SL-17", "unit_type": "Aerospace", "tonnage": 65, "bv2": 1420, "tech_base": "Inner Sphere", "cbill_cost": 4850000.0, "intro_year": 2680, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Transgressor", "model": "TR-13", "unit_type": "Aerospace", "tonnage": 75, "bv2": 1650, "tech_base": "Inner Sphere", "cbill_cost": 5920000.0, "intro_year": 2705, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"},
        {"chassis": "Seydlitz", "model": "SYD-Z1", "unit_type": "Aerospace", "tonnage": 20, "bv2": 490, "tech_base": "Inner Sphere", "cbill_cost": 1250000.0, "intro_year": 2740, "supported_eras": "2750,3025,3050,3062,3067,3135,3151"}
    ]

    for u in unit_data:
        if not db.query(RefUnit).filter(RefUnit.chassis == u["chassis"], RefUnit.model == u["model"]).first():
            db.add(RefUnit(**u))

    # 3. SEED SPECIAL PILOT ABILITIES (SPAs)
    spa_data = [
        {"name": "Tactical Genius", "xp_cost": 50, "category": "Command", "description": "Reroll Initiative once per combat turn.", "effect": "Option to reroll initiative roll if lost.", "prerequisites": "Gunnery 3+, Command", "rulebook_reference": "A Time of War v4.0"},
        {"name": "Sharpshooter", "xp_cost": 40, "category": "Gunnery", "description": "+1 Accuracy modifier to Called Shots.", "effect": "Reduces Called Shot target number penalty.", "prerequisites": "Gunnery 3+", "rulebook_reference": "Campaign Operations"},
        {"name": "Sniper", "xp_cost": 35, "category": "Gunnery", "description": "Halves target penalty at Long Range.", "effect": "Long range modifier reduced from +4 to +2.", "prerequisites": "Gunnery 3+", "rulebook_reference": "Campaign Operations"},
        {"name": "Jumping Jack", "xp_cost": 25, "category": "Piloting", "description": "-1 Target penalty when firing after jumping.", "effect": "Jump attacker penalty reduced from +3 to +2.", "prerequisites": "Piloting 4+", "rulebook_reference": "A Time of War v4.0"},
        {"name": "Dodge", "xp_cost": 30, "category": "Piloting", "description": "Evade incoming physical punch or kick attacks.", "effect": "Grants physical attack evasion roll.", "prerequisites": "Piloting 4+", "rulebook_reference": "A Time of War v4.0"},
        {"name": "Marksman", "xp_cost": 30, "category": "Gunnery", "description": "Energy weapon range extension by +2 hexes.", "effect": "Increases short/medium/long ranges.", "prerequisites": "Gunnery 4+", "rulebook_reference": "Campaign Operations"},
        {"name": "Multi-Tasker", "xp_cost": 20, "category": "Tactical", "description": "Eliminates target penalty for multi-target attacks.", "effect": "Secondary target penalty (+1) negated.", "prerequisites": "Gunnery 4+", "rulebook_reference": "A Time of War v4.0"},
        {"name": "Weapon Specialist", "xp_cost": 35, "category": "Gunnery", "description": "+1 To-Hit bonus with primary weapon chassis.", "effect": "+1 accuracy with designated weapon type.", "prerequisites": "Gunnery 3+", "rulebook_reference": "Campaign Operations"},
        {"name": "Iron Will", "xp_cost": 20, "category": "Morale", "description": "Immune to morale panic checks.", "effect": "Pilot never ejects automatically from shock.", "prerequisites": "None", "rulebook_reference": "A Time of War v4.0"},
        {"name": "Cluster Specialist", "xp_cost": 30, "category": "Gunnery", "description": "+2 Modifier on Cluster Hits Table rolls.", "effect": "Increases missile & LB-X cluster hit counts.", "prerequisites": "Gunnery 4+", "rulebook_reference": "Campaign Operations"}
    ]

    for s in spa_data:
        if not db.query(RefSPA).filter(RefSPA.name == s["name"]).first():
            db.add(RefSPA(**s))

    # 4. SEED STARMAP JUMPNET SYSTEMS
    starmap_data = [
        {"name": "Outreach", "x_coord": 0.0, "y_coord": 0.0, "spectral_class": "G2V", "controlling_faction": "Wolf's Dragoons", "region": "Coreward"},
        {"name": "Terra", "x_coord": 0.0, "y_coord": 0.0, "spectral_class": "G2V", "controlling_faction": "ComStar", "region": "Sol Sector"},
        {"name": "Solaris VII", "x_coord": -20.0, "y_coord": -20.0, "spectral_class": "F5V", "controlling_faction": "Independent", "region": "Lyran Reach"},
        {"name": "Luthien", "x_coord": 120.5, "y_coord": 180.2, "spectral_class": "K1III", "controlling_faction": "House Draconis Combine", "region": "Draconis Reach"},
        {"name": "Tharkad", "x_coord": -150.4, "y_coord": 110.8, "spectral_class": "G0V", "controlling_faction": "House Steiner (Lyran Commonwealth)", "region": "Lyran Reach"},
        {"name": "New Avalon", "x_coord": 140.2, "y_coord": -90.5, "spectral_class": "F8V", "controlling_faction": "House Davion (Federated Suns)", "region": "Suns Reach"},
        {"name": "Sian", "x_coord": 60.1, "y_coord": -180.4, "spectral_class": "M0VI", "controlling_faction": "House Liao (Capellan Confederation)", "region": "Capellan Reach"},
        {"name": "Atreus", "x_coord": -110.8, "y_coord": -120.3, "spectral_class": "G5V", "controlling_faction": "House Marik (Free Worlds League)", "region": "League Reach"},
        {"name": "Rasalhague", "x_coord": -30.4, "y_coord": 210.6, "spectral_class": "K5V", "controlling_faction": "Free Rasalhague Republic", "region": "Rasalhague Reach"},
        {"name": "Tukayyid", "x_coord": -85.2, "y_coord": 95.4, "spectral_class": "G2V", "controlling_faction": "ComStar", "region": "Rasalhague Reach"}
    ]

    for st in starmap_data:
        if not db.query(RefStarmap).filter(RefStarmap.name == st["name"]).first():
            db.add(RefStarmap(**st))

    db.commit()
    print("[INFO] Reference Data Tables (RefEquipment, RefUnit, RefSPA, RefStarmap) successfully seeded!")
