class BV2Calculator:
    """Adjusts base Battle Value 2 (BV2) based on MechWarrior skills."""

    # Standard Catalyst BV2 Skill Multiplier Table Matrix [Gunnery 0-8][Piloting 0-8]
    SKILL_MULTIPLIERS = {
        (4, 5): 1.00,
        (4, 4): 1.05,
        (3, 5): 1.10,
        (3, 4): 1.15,
        (2, 4): 1.28,
        (2, 3): 1.38,
        (1, 3): 1.54,
        (0, 0): 2.42,
    }

    @classmethod
    def get_adjusted_bv(cls, base_bv: int, gunnery: int = 4, piloting: int = 5) -> int:
        multiplier = cls.SKILL_MULTIPLIERS.get((gunnery, piloting))
        if not multiplier:
            # Linear fallback approximation if exact matrix coordinate isn't keyed
            gunnery_diff = 4 - gunnery
            piloting_diff = 5 - piloting
            multiplier = max(0.5, 1.0 + (gunnery_diff * 0.10) + (piloting_diff * 0.05))
            
        return round(base_bv * multiplier)
