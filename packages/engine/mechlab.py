from typing import Dict, Any, List

class MechLabEngine:
    """Calculates tonnage, weapon stats, heat generation, dissipation, and BV2 adjustments for custom Mech builds."""

    WEAPON_STATS = {
        "PPC": {"tonnage": 7.0, "heat": 10, "bv2": 176, "category": "Energy"},
        "ER PPC": {"tonnage": 7.0, "heat": 15, "bv2": 228, "category": "Energy"},
        "Large Laser": {"tonnage": 5.0, "heat": 8, "bv2": 123, "category": "Energy"},
        "Medium Laser": {"tonnage": 1.0, "heat": 3, "bv2": 46, "category": "Energy"},
        "Small Laser": {"tonnage": 0.5, "heat": 1, "bv2": 9, "category": "Energy"},
        "AC/20": {"tonnage": 14.0, "heat": 7, "bv2": 178, "category": "Ballistic"},
        "AC/10": {"tonnage": 12.0, "heat": 3, "bv2": 123, "category": "Ballistic"},
        "AC/5": {"tonnage": 8.0, "heat": 1, "bv2": 70, "category": "Ballistic"},
        "Gauss Rifle": {"tonnage": 15.0, "heat": 1, "bv2": 320, "category": "Ballistic"},
        "LRM-20": {"tonnage": 10.0, "heat": 6, "bv2": 181, "category": "Missile"},
        "LRM-15": {"tonnage": 7.0, "heat": 5, "bv2": 136, "category": "Missile"},
        "SRM-6": {"tonnage": 3.0, "heat": 4, "bv2": 59, "category": "Missile"},
        "SRM-4": {"tonnage": 2.0, "heat": 3, "bv2": 39, "category": "Missile"},
        "Heat Sink": {"tonnage": 1.0, "heat": 0, "bv2": 0, "category": "Equipment"}
    }

    @classmethod
    def calculate_build_metrics(
        cls,
        max_tonnage: int,
        components: List[str],
        double_heat_sinks: bool = False,
        base_sinks: int = 10
    ) -> Dict[str, Any]:
        """Calculates total equipment tonnage, alpha strike heat, heat dissipation, and validation warnings."""
        total_equipment_tonnage = 0.0
        alpha_strike_heat = 0
        total_bv = 0
        weapon_count = 0
        sink_count = base_sinks

        for comp in components:
            stats = cls.WEAPON_STATS.get(comp, {"tonnage": 1.0, "heat": 1, "bv2": 25})
            total_equipment_tonnage += stats["tonnage"]
            alpha_strike_heat += stats["heat"]
            total_bv += stats["bv2"]
            if comp == "Heat Sink":
                sink_count += 1
            else:
                weapon_count += 1

        dissipation_per_sink = 2 if double_heat_sinks else 1
        total_dissipation = sink_count * dissipation_per_sink
        net_heat = alpha_strike_heat - total_dissipation

        max_allowed_equipment_tonnage = max_tonnage * 0.45  # Standard engine/structure weight allowance
        is_valid = total_equipment_tonnage <= max_allowed_equipment_tonnage

        return {
            "max_tonnage": max_tonnage,
            "equipment_tonnage": round(total_equipment_tonnage, 1),
            "max_allowed_equipment_tonnage": round(max_allowed_equipment_tonnage, 1),
            "is_valid": is_valid,
            "alpha_strike_heat": alpha_strike_heat,
            "heat_dissipation": total_dissipation,
            "net_heat_delta": net_heat,
            "total_bv2": total_bv,
            "weapon_count": weapon_count,
            "sink_count": sink_count
        }
