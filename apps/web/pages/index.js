import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState({ WP: 1000, SP: 500, CBills: 15000000 });
  const [units, setUnits] = useState([]);
  const [armorMissing, setArmorMissing] = useState(10);
  const [repairCalc, setRepairCalc] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/ledger/balance")
      .then((res) => res.json())
      .then((data) => setBalance(data))
      .catch(() => {});

    fetch("http://localhost:8000/api/v1/units")
      .then((res) => res.json())
      .then((data) => setUnits(data))
      .catch(() => {});
  }, []);

  const calculateRepair = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/engine/repair-cost?points_missing=" + armorMissing + "&tech_base=Inner%20Sphere",
        { method: "POST" }
      );
      const data = await res.json();
      setRepairCalc(data);
    } catch (e) {
      setRepairCalc({ sp_cost: armorMissing * 0.1, cbill_cost: armorMissing * 1000 });
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", backgroundColor: "#0d1117", color: "#c9d1d9", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid #30363d", paddingBottom: "12px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "#f59e0b", margin: 0, fontSize: "28px" }}>BT-MANAGER</h1>
          <p style={{ color: "#8b949e", margin: "4px 0 0 0", fontSize: "14px" }}>Tactical Campaign Command &amp; Logistics</p>
        </div>
        <div style={{ border: "1px solid #238636", backgroundColor: "#0e2a1f", padding: "6px 14px", borderRadius: "20px", color: "#3fb950", fontSize: "13px", fontWeight: "bold" }}>
          ● API CONNECTED
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "16px", borderRadius: "8px" }}>
          <p style={{ fontSize: "11px", color: "#8b949e", margin: 0, textTransform: "uppercase" }}>Warchest Balance</p>
          <p style={{ fontSize: "26px", color: "#fbbf24", margin: "6px 0 0 0", fontFamily: "monospace", fontWeight: "bold" }}>{balance.WP || 0} WP</p>
        </div>
        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "16px", borderRadius: "8px" }}>
          <p style={{ fontSize: "11px", color: "#8b949e", margin: 0, textTransform: "uppercase" }}>Support Points</p>
          <p style={{ fontSize: "26px", color: "#60a5fa", margin: "6px 0 0 0", fontFamily: "monospace", fontWeight: "bold" }}>{balance.SP || 0} SP</p>
        </div>
        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "16px", borderRadius: "8px" }}>
          <p style={{ fontSize: "11px", color: "#8b949e", margin: 0, textTransform: "uppercase" }}>C-Bill Treasury</p>
          <p style={{ fontSize: "26px", color: "#34d399", margin: "6px 0 0 0", fontFamily: "monospace", fontWeight: "bold" }}></p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
          <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Active Force Roster</h2>
          {units.length === 0 ? (
            <p style={{ color: "#8b949e", fontSize: "14px", fontStyle: "italic", padding: "12px 0" }}>
              No active BattleMechs loaded yet. Use Swagger API docs or FastAPI endpoints to add units!
            </p>
          ) : (
            units.map((unit) => (
              <div key={unit.id} style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#0d1117", padding: "12px 16px", borderRadius: "6px", border: "1px solid #30363d", marginBottom: "10px" }}>
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "16px" }}>{unit.chassis}</strong> <span style={{ color: "#8b949e" }}>{unit.model}</span>
                  <br />
                  <small style={{ color: "#8b949e" }}>{unit.tonnage} Tons | {unit.tech_base}</small>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "#fbbf24", fontFamily: "monospace", fontWeight: "bold" }}>{unit.bv2} BV2</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
          <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Repair Calculator</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Missing Armor Points</label>
              <input 
                type="number" 
                value={armorMissing} 
                onChange={(e) => setArmorMissing(Number(e.target.value))}
                style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "10px", borderRadius: "4px", boxSizing: "border-box" }}
              />
            </div>
            <button 
              onClick={calculateRepair}
              style={{ backgroundColor: "#d97706", border: "none", color: "#000", padding: "12px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
            >
              Calculate Repair Costs
            </button>

            {repairCalc && (
              <div style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "14px", borderRadius: "4px", fontFamily: "monospace", marginTop: "8px" }}>
                <p style={{ color: "#60a5fa", margin: "0 0 6px 0" }}>Required: {repairCalc.sp_cost} SP</p>
                <p style={{ color: "#34d399", margin: 0 }}>Cost:  C-Bills</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}