from typing import Dict, Any, List

class WarchestEngine:
    """Warchest Engine for Chaos Campaign & BattleTech Mercenaries (2026 Catalyst Rules Refit).
    Standard Exchange Rates:
      1 WP = 10 SP
      1 SP = 10,000 C-Bills
    """

    WP_TO_SP_RATE = 10
    SP_TO_CBILLS_RATE = 10000.0

    @classmethod
    def wp_to_sp(cls, wp: int) -> int:
        """Converts Warchest Points (WP) to Support Points (SP)."""
        return wp * cls.WP_TO_SP_RATE

    @classmethod
    def sp_to_wp(cls, sp: int) -> int:
        """Converts Support Points (SP) to Warchest Points (WP)."""
        return sp // cls.WP_TO_SP_RATE

    @classmethod
    def sp_to_cbills(cls, sp: int) -> float:
        """Converts Support Points (SP) to C-Bills equivalent (1 SP = 10,000 C-Bills)."""
        return float(sp * cls.SP_TO_CBILLS_RATE)

    @classmethod
    def calculate_track_net(
        cls,
        entry_fee_wp: int,
        objective_rewards: List[int],
        bonus_sp: int = 0
    ) -> int:
        """Calculates net WP earned from a Chaos Campaign Track."""
        total_obj_wp = sum(objective_rewards)
        return total_obj_wp - entry_fee_wp + bonus_sp

    @classmethod
    def calculate_track_settlement(
        cls,
        entry_fee_wp: int,
        objective_rewards_wp: int,
        bonus_sp: int = 0,
        bsp_allowance_points: int = 0
    ) -> Dict[str, Any]:
        """Calculates itemized financial breakdown for completing a Warchest Track per 2026 Mercenaries rules."""
        net_wp = objective_rewards_wp - entry_fee_wp
        sp_earned = cls.wp_to_sp(max(0, net_wp)) + bonus_sp

        return {
            "entry_fee_wp": entry_fee_wp,
            "objective_rewards_wp": objective_rewards_wp,
            "net_wp": net_wp,
            "bonus_sp": bonus_sp,
            "bsp_allowance_points": bsp_allowance_points,
            "total_sp_earned": sp_earned
        }

