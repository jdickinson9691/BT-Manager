from packages.engine.warchest import WarchestEngine
from packages.engine.repairs import RepairEngine
from packages.engine.bv_calculator import BV2Calculator

def test_warchest_conversions():
    assert WarchestEngine.wp_to_sp(100) == 1000
    assert WarchestEngine.sp_to_wp(1000) == 100
    assert WarchestEngine.sp_to_cbills(50) == 500000.0
    assert WarchestEngine.calculate_track_net(200, [100, 150], 50) == 100
    print("Warchest Engine Tests Passed!")

def test_repair_calculations():
    # 20 IS armor points missing -> 2 SP -> 20,000 C-Bills
    armor_res = RepairEngine.calculate_armor_repair_cost(20, "Inner Sphere")
    assert armor_res["sp_cost"] == 2.0
    assert armor_res["cbill_cost"] == 20000.0

    # Engine component repair -> 20 * 3.0 = 60 SP
    engine_res = RepairEngine.calculate_component_repair("engine", 20)
    assert engine_res["sp_cost"] == 60.0
    print("Repair Engine Tests Passed!")

def test_bv2_adjustments():
    # Base BV 2000 for standard 4/5 pilot = 2000
    assert BV2Calculator.get_adjusted_bv(2000, 4, 5) == 2000
    # Veteran 3/4 pilot = 2000 * 1.15 = 2300
    assert BV2Calculator.get_adjusted_bv(2000, 3, 4) == 2300
    print("BV2 Calculator Tests Passed!")

if __name__ == "__main__":
    test_warchest_conversions()
    test_repair_calculations()
    test_bv2_adjustments()
