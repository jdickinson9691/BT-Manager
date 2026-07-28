# Agent Contract: Python Logic & Calculation Engines

## Objective
Implement pure Python calculation engines for BattleTech campaign logistics, financial ledger conversions, BV2 skill adjustments, and Campaign Operations repair/salvage costs.

## Output Specifications
1. \packages/engine/warchest.py\:
   - Support Point (SP) to Warchest Point (WP) conversion engine.
   - Default exchange rates: 1 WP = 10 SP, 1 SP = 10,000 C-Bills (configurable).
   - Track/Contract entry cost and objective payout ledger math.

2. \packages/engine/repairs.py\:
   - Calculate repair costs in SP and C-Bills based on damage locations.
   - Armor point repair costs (1 SP per 10 points IS / 5 points Clan).
   - Internal Structure repair multipliers based on Mech tonnage.
   - Critical component repair/replacement multipliers (Gyro, Engine, Actuators, Weapons).

3. \packages/engine/bv_calculator.py\:
   - Adjust base Mech BV2 according to MechWarrior Gunnery and Piloting skill combinations using standard BattleTech multiplier matrices.

4. \packages/engine/tests/test_engines.py\:
   - Comprehensive unit tests verifying all mathematical formulas.

## Definition of Done
- All calculation engines are stateless, deterministic, and independently testable.
- Unit test suite passes with 100% assertions on standard BattleTech examples.
