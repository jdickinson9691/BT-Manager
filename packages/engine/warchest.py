class WarchestEngine:
    """Handles Warchest Points (WP), Support Points (SP), and C-Bill conversions."""
    
    DEFAULT_SP_PER_WP = 10
    DEFAULT_CBILLS_PER_SP = 10000.0

    @classmethod
    def wp_to_sp(cls, wp_amount: int, sp_per_wp: int = DEFAULT_SP_PER_WP) -> int:
        return wp_amount * sp_per_wp

    @classmethod
    def sp_to_wp(cls, sp_amount: int, sp_per_wp: int = DEFAULT_SP_PER_WP) -> int:
        return sp_amount // sp_per_wp

    @classmethod
    def sp_to_cbills(cls, sp_amount: float, cbills_per_sp: float = DEFAULT_CBILLS_PER_SP) -> float:
        return sp_amount * cbills_per_sp

    @classmethod
    def cbills_to_sp(cls, cbills_amount: float, cbills_per_sp: float = DEFAULT_CBILLS_PER_SP) -> float:
        return cbills_amount / cbills_per_sp

    @classmethod
    def calculate_track_net(cls, entry_fee: int, objectives_completed: list[int], bonus_wps: int = 0) -> int:
        """Calculates net WP change from a completed Track."""
        payout = sum(objectives_completed) + bonus_wps
        return payout - entry_fee
