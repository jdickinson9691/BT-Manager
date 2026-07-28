class RepairEngine:
    """Calculates Support Point (SP) and C-Bill repair costs for BattleMechs."""

    # SP costs per point of armor repaired
    ARMOR_SP_COST_IS = 0.1     # 10 points = 1 SP
    ARMOR_SP_COST_CLAN = 0.2   # 5 points = 1 SP

    @classmethod
    def calculate_armor_repair_cost(cls, points_missing: int, tech_base: str = "Inner Sphere") -> dict:
        rate = cls.ARMOR_SP_COST_CLAN if "Clan" in tech_base else cls.ARMOR_SP_COST_IS
        sp_cost = round(points_missing * rate, 2)
        return {
            "sp_cost": sp_cost,
            "cbill_cost": sp_cost * 10000.0
        }

    @classmethod
    def calculate_structure_repair_cost(cls, points_missing: int, tonnage: int) -> dict:
        """Structure repair scales with tonnage tier."""
        tier_multiplier = 1.0
        if tonnage >= 80:
            tier_multiplier = 2.0
        elif tonnage >= 60:
            tier_multiplier = 1.5
        elif tonnage >= 40:
            tier_multiplier = 1.25

        sp_cost = round(points_missing * 0.5 * tier_multiplier, 2)
        return {
            "sp_cost": sp_cost,
            "cbill_cost": sp_cost * 10000.0
        }

    @classmethod
    def calculate_component_repair(cls, component_type: str, base_sp_cost: int = 20) -> dict:
        """Standard critical component repair cost estimation."""
        multipliers = {
            "engine": 3.0,
            "gyro": 2.5,
            "cockpit": 2.0,
            "weapon": 1.0,
            "actuator": 0.5
        }
        mult = multipliers.get(component_type.lower(), 1.0)
        sp_cost = base_sp_cost * mult
        return {
            "component": component_type,
            "sp_cost": sp_cost,
            "cbill_cost": sp_cost * 10000.0
        }
