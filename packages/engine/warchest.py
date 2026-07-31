from typing import Dict, Any, List

class WarchestEngine:
    """Warchest Engine for Chaos Campaign & Mercenaries rules.
    Standard Exchange Rates:
      1 WP = 2 SP
    """

    WP_TO_SP_RATE = 2

    @classmethod
    def wp_to_sp(cls, wp: int) -> int:
        """Converts Warchest Points (WP) to Support Points (SP)."""
        return wp * cls.WP_TO_SP_RATE

    @classmethod
    def sp_to_wp(cls, sp: int) -> int:
        """Converts Support Points (SP) to Warchest Points (WP)."""
        return sp // cls.WP_TO_SP_RATE

    @classmethod
    def calculate_track_settlement(
        cls,
        entry_fee_wp: int,
        objective_rewards_wp: int,
        bonus_sp: int = 0
    ) -> Dict[str, Any]:
        """Calculates itemized financial breakdown for completing a Warchest Track."""
        net_wp = objective_rewards_wp - entry_fee_wp
        sp_earned = cls.wp_to_sp(max(0, net_wp)) + bonus_sp

        return {
            "entry_fee_wp": entry_fee_wp,
            "objective_rewards_wp": objective_rewards_wp,
            "net_wp": net_wp,
            "bonus_sp": bonus_sp,
            "total_sp_earned": sp_earned
        }
