from typing import Dict, Any, List

class WarchestEngine:
    """Warchest & Financial Conversion Engine for Chaos Campaign rules.
    Standard Exchange Rates:
      1 WP = 10 SP
      1 SP = 10,000 C-Bills
    """

    WP_TO_SP_RATE = 10
    SP_TO_CBILL_RATE = 10000.0

    @classmethod
    def wp_to_sp(cls, wp: int) -> int:
        """Converts Warchest Points (WP) to Support Points (SP)."""
        return wp * cls.WP_TO_SP_RATE

    @classmethod
    def sp_to_wp(cls, sp: int) -> int:
        """Converts Support Points (SP) to Warchest Points (WP)."""
        return sp // cls.WP_TO_SP_RATE

    @classmethod
    def sp_to_cbills(cls, sp: float) -> float:
        """Converts Support Points (SP) to C-Bills."""
        return float(sp) * cls.SP_TO_CBILL_RATE

    @classmethod
    def cbills_to_sp(cls, cbills: float) -> float:
        """Converts C-Bills to Support Points (SP)."""
        return float(cbills) / cls.SP_TO_CBILL_RATE

    @classmethod
    def calculate_track_settlement(
        cls,
        entry_fee_wp: int,
        objective_rewards_wp: int,
        bonus_sp: int = 0,
        blc_payout_cbills: float = 0.0
    ) -> Dict[str, Any]:
        """Calculates itemized financial breakdown for completing a Warchest Track."""
        net_wp = objective_rewards_wp - entry_fee_wp
        sp_earned = cls.wp_to_sp(max(0, net_wp)) + bonus_sp
        cbills_earned = cls.sp_to_cbills(sp_earned) + blc_payout_cbills

        return {
            "entry_fee_wp": entry_fee_wp,
            "objective_rewards_wp": objective_rewards_wp,
            "net_wp": net_wp,
            "bonus_sp": bonus_sp,
            "total_sp_earned": sp_earned,
            "total_cbills_earned": cbills_earned
        }
