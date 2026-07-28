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

# SP & C-Bill Cost Multipliers
TECH_MULTIPLIERS = {
    TechBase.INNER_SPHERE: 1.0,
    TechBase.CLAN: 1.5,
}

BASE_SP_COSTS = {
    ComponentType.ARMOR: 0.1,        # Per point missing
    ComponentType.STRUCTURE: 0.5,    # Per point missing
    ComponentType.ACTUATOR: 10.0,    # Per actuator
    ComponentType.GYRO: 50.0,        # Per crit line
    ComponentType.ENGINE: 100.0,     # Per crit line
    ComponentType.WEAPON: 20.0,      # Base cost multiplier
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
    amount_damaged: int = 1  # Points missing, critical hits, or item count
    tech_base: TechBase = TechBase.INNER_SPHERE
    tech_rating: TechRating = TechRating.REGULAR
    has_salvage_part: bool = False

class RepairEstimate(BaseModel):
    sp_cost: float
    cbill_cost: float
    time_hours: float
    base_target_number: int

def calculate_repair_task(request: RepairRequest) -> RepairEstimate:
    multiplier = TECH_MULTIPLIERS.get(request.tech_base, 1.0)
    
    # Calculate base SP and C-Bill cost
    base_sp = BASE_SP_COSTS.get(request.component_type, 1.0) * request.amount_damaged
    base_cbill = BASE_CBILL_COSTS.get(request.component_type, 1000.0) * request.amount_damaged
    
    # If using existing field salvage, C-Bill parts cost drops by 75%
    if request.has_salvage_part:
        base_cbill *= 0.25

    final_sp = round(base_sp * multiplier, 2)
    final_cbill = round(base_cbill * multiplier, 2)
    
    # Base Skill Target Numbers & Time Estimates
    tn_map = {TechRating.GREEN: 6, TechRating.REGULAR: 5, TechRating.VETERAN: 4, TechRating.ELITE: 3}
    base_tn = tn_map.get(request.tech_rating, 5)
    
    # Simple repair time estimation (in hours)
    time_hours = round(request.amount_damaged * (1.5 if request.tech_base == TechBase.CLAN else 1.0), 1)

    return RepairEstimate(
        sp_cost=final_sp,
        cbill_cost=final_cbill,
        time_hours=time_hours,
        base_target_number=base_tn
    )