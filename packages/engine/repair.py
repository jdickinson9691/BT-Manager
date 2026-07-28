from enum import Enum
from typing import Optional
from pydantic import BaseModel

class TechBase(str, Enum):
    INNER_SPHERE = "Inner Sphere"
    CLAN = "Clan"

class ComponentType(str, Enum):
    ARMOR = "Armor"
    STRUCTURE = "Structure"
    ENGINE = "Engine"
    GYRO = "Gyro"
    ACTUATOR = "Actuator"
    WEAPON = "Weapon"

class TechRating(str, Enum):
    GREEN = "Green"
    REGULAR = "Regular"
    VETERAN = "Veteran"
    ELITE = "Elite"

class RefitClass(str, Enum):
    CLASS_A = "Class A (Field Weapon Swap - Same Type)"
    CLASS_B = "Class B (Field Weapon Swap - Diff Type)"
    CLASS_C = "Class C (Maintenance - Armor/Heatsink Upgrade)"
    CLASS_D = "Class D (Maintenance - Engine Rating/Location)"
    CLASS_E = "Class E (Factory - Structure/Gyro Replacement)"
    CLASS_F = "Class F (Factory - Tech Base / Major Overhaul)"

REFIT_MULTIPLIERS = {
    RefitClass.CLASS_A: 1.0,
    RefitClass.CLASS_B: 1.2,
    RefitClass.CLASS_C: 1.5,
    RefitClass.CLASS_D: 2.0,
    RefitClass.CLASS_E: 3.0,
    RefitClass.CLASS_F: 5.0,
}

TECH_MULTIPLIERS = {
    TechBase.INNER_SPHERE: 1.0,
    TechBase.CLAN: 1.5,
}

BASE_SP_COSTS = {
    ComponentType.ARMOR: 0.1,
    ComponentType.STRUCTURE: 0.5,
    ComponentType.ACTUATOR: 10.0,
    ComponentType.GYRO: 50.0,
    ComponentType.ENGINE: 100.0,
    ComponentType.WEAPON: 20.0,
}

BASE_CBILL_COSTS = {
    ComponentType.ARMOR: 1000.0,
    ComponentType.STRUCTURE: 5000.0,
    ComponentType.ACTUATOR: 50000.0,
    ComponentType.GYRO: 250000.0,
    ComponentType.ENGINE: 500000.0,
    ComponentType.WEAPON: 100000.0,
}

class RepairRequest(BaseModel):
    component_type: ComponentType = ComponentType.ARMOR
    amount_damaged: int = 1
    tech_base: TechBase = TechBase.INNER_SPHERE
    tech_rating: TechRating = TechRating.REGULAR
    has_salvage_part: bool = False

class RefitRequest(BaseModel):
    refit_class: RefitClass = RefitClass.CLASS_A
    tech_base: TechBase = TechBase.INNER_SPHERE
    tech_rating: TechRating = TechRating.REGULAR
    tonnage: int = 55

class RepairEstimate(BaseModel):
    sp_cost: float
    cbill_cost: float
    time_hours: float
    base_target_number: int

def calculate_repair_task(request: RepairRequest) -> RepairEstimate:
    multiplier = TECH_MULTIPLIERS.get(request.tech_base, 1.0)
    
    base_sp = BASE_SP_COSTS.get(request.component_type, 1.0) * request.amount_damaged
    base_cbill = BASE_CBILL_COSTS.get(request.component_type, 1000.0) * request.amount_damaged
    
    if request.has_salvage_part:
        base_cbill *= 0.25

    final_sp = round(base_sp * multiplier, 2)
    final_cbill = round(base_cbill * multiplier, 2)
    
    tn_map = {TechRating.GREEN: 6, TechRating.REGULAR: 5, TechRating.VETERAN: 4, TechRating.ELITE: 3}
    base_tn = tn_map.get(request.tech_rating, 5)
    time_hours = round(request.amount_damaged * (1.5 if request.tech_base == TechBase.CLAN else 1.0), 1)

    return RepairEstimate(
        sp_cost=final_sp,
        cbill_cost=final_cbill,
        time_hours=time_hours,
        base_target_number=base_tn
    )

def calculate_refit_task(request: RefitRequest) -> RepairEstimate:
    tech_mult = TECH_MULTIPLIERS.get(request.tech_base, 1.0)
    refit_mult = REFIT_MULTIPLIERS.get(request.refit_class, 1.0)

    base_sp = round(request.tonnage * 0.5 * refit_mult * tech_mult, 2)
    base_cbill = round(request.tonnage * 15000.0 * refit_mult * tech_mult, 2)
    
    # Base refit time in hours based on class multiplier and chassis tonnage
    time_hours = round((request.tonnage / 10.0) * 4.0 * refit_mult, 1)

    tn_map = {TechRating.GREEN: 7, TechRating.REGULAR: 6, TechRating.VETERAN: 5, TechRating.ELITE: 4}
    base_tn = tn_map.get(request.tech_rating, 6)

    return RepairEstimate(
        sp_cost=base_sp,
        cbill_cost=base_cbill,
        time_hours=time_hours,
        base_target_number=base_tn
    )