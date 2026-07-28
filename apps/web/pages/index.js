import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState({ WP: 1000, SP: 500, CBills: 15000000 });
  const [units, setUnits] = useState([]);
  const [missions, setMissions] = useState([]);

  // New Unit Form State
  const [chassis, setChassis] = useState("");
  const [model, setModel] = useState("");
  const [tonnage, setTonnage] = useState(55);
  const [unitTechBase, setUnitTechBase] = useState("Inner Sphere");
  const [bv2, setBv2] = useState(1200);

  // New Mission Form State
  const [missionName, setMissionName] = useState("");
  const [missionType, setMissionType] = useState("Raid");
  const [employer, setEmployer] = useState("House Davion");
  const [wpReward, setWpReward] = useState(350);
  const [cbillReward, setCbillReward] = useState(3000000);

  // Advanced Repair Form State
  const [componentType, setComponentType] = useState("Armor");
  const [amountDamaged, setAmountDamaged] = useState(10);
  const [techBase, setTechBase] = useState("Inner Sphere");
  const [techRating, setTechRating] = useState("Regular");
  const [hasSalvage, setHasSalvage] = useState(false);
  const [repairCalc, setRepairCalc] = useState(null);

  const fetchBalance = () => {
    fetch("http://localhost:8000/api/v1/ledger/balance")
      .then((res) => res.json())
      .then((data) => setBalance(data))
      .catch(() => {});
  };

  const fetchUnits = () => {
    fetch("http://localhost:8000/api/v1/units")
      .then((res) => res.json())
      .then((data) => setUnits(data))
      .catch(() => {});
  };

  const fetchMissions = () => {
    fetch("http://localhost:8000/api/v1/missions")
      .then((res) => res.json())
      .then((data) => setMissions(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchBalance();
    fetchUnits();
    fetchMissions();
  }, []);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!chassis || !model) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chassis,
          model,
          tonnage: Number(tonnage),
          tech_base: unitTechBase,
          bv2: Number(bv2),
        }),
      });

      if (res.ok) {
        setChassis("");
        setModel("");
        fetchUnits();
      }
    } catch (err) {
      console.error("Failed to add unit", err);
    }
  };

  const handleCreateMission = async (e) => {
    e.preventDefault();
    if (!missionName) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: missionName,
          mission_type: missionType,
          employer,
          wp_reward: Number(wpReward),
          cbill_reward: Number(cbillReward),
        }),
      });

      if (res.ok) {
        setMissionName("");
        fetchMissions();
      }
    } catch (err) {
      console.error("Failed to create mission", err);
    }
  };

  const handleCompleteMission = async (id) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/missions/" + id + "/complete", {
        method: "POST",
      });
      if (res.ok) {
        fetchBalance();
        fetchMissions();
      }
    } catch (err) {
      console.error("Failed to complete mission", err);
    }
  };

  const calculateRepair = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/engine/repair-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          component_type: componentType,
          amount_damaged: Number(amountDamaged),
          tech_base: techBase,
          tech_rating: techRating,
          has_salvage_part: hasSalvage,
        }),
      });
      const data = await res.json();
      setRepairCalc(data);
    } catch (e) {
      console.error("Failed to connect to API", e);
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

      {/* Stat Cards */}
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
          <p style={{ fontSize: "26px", color: "#34d399", margin: "6px 0 0 0", fontFamily: "monospace", fontWeight: "bold" }}>${(balance.CBills || 0).toLocaleString()}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left Column: Force Roster & Missions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Active Roster */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Active Force Roster</h2>
            {units.length === 0 ? (
              <p style={{ color: "#8b949e", fontSize: "14px", fontStyle: "italic", padding: "12px 0" }}>No active BattleMechs loaded.</p>
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

          {/* Mission & Contract Board */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Campaign Missions &amp; Contracts</h2>
            {missions.length === 0 ? (
              <p style={{ color: "#8b949e", fontSize: "14px", fontStyle: "italic", padding: "12px 0" }}>No active mission contracts available.</p>
            ) : (
              missions.map((mission) => (
                <div key={mission.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0d1117", padding: "12px 16px", borderRadius: "6px", border: "1px solid #30363d", marginBottom: "10px" }}>
                  <div>
                    <strong style={{ color: "#ffffff", fontSize: "15px" }}>{mission.name}</strong> <span style={{ color: "#8b949e", fontSize: "12px" }}>({mission.mission_type})</span>
                    <br />
                    <small style={{ color: "#8b949e" }}>Employer: {mission.employer} | Reward: <span style={{ color: "#fbbf24" }}>{mission.wp_reward} WP</span> + <span style={{ color: "#34d399" }}>${(mission.cbill_reward || 0).toLocaleString()}</span></small>
                  </div>
                  <div>
                    {mission.status === "Active" ? (
                      <button onClick={() => handleCompleteMission(mission.id)} style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
                        Complete Contract
                      </button>
                    ) : (
                      <span style={{ backgroundColor: "#166534", color: "#4ade80", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                        ✔ COMPLETED
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Create Contract Sub-form */}
            <form onSubmit={handleCreateMission} style={{ marginTop: "16px", borderTop: "1px solid #30363d", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <strong style={{ fontSize: "13px", color: "#f0f6fc" }}>Draft New Contract Offer</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input type="text" placeholder="Operation / Mission Title" value={missionName} onChange={(e) => setMissionName(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", fontSize: "13px" }} />
                <input type="text" placeholder="Employer (e.g. House Davion)" value={employer} onChange={(e) => setEmployer(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", fontSize: "13px" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <select value={missionType} onChange={(e) => setMissionType(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", fontSize: "13px" }}>
                  <option value="Raid">Raid</option>
                  <option value="Garrison Duty">Garrison Duty</option>
                  <option value="Objective Raid">Objective Raid</option>
                  <option value="Assault">Assault</option>
                </select>
                <input type="number" placeholder="WP Reward" value={wpReward} onChange={(e) => setWpReward(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", fontSize: "13px" }} />
                <input type="number" placeholder="C-Bill Reward" value={cbillReward} onChange={(e) => setCbillReward(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", fontSize: "13px" }} />
              </div>
              <button type="submit" style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                + Issue Contract Offer
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Add Unit Form & Repair Engine */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Add New Unit Form */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Commission New Unit</h2>
            <form onSubmit={handleAddUnit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>CHASSIS</label>
                  <input type="text" placeholder="e.g. Marauder" value={chassis} onChange={(e) => setChassis(e.target.value)} required style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>MODEL</label>
                  <input type="text" placeholder="e.g. MAD-3R" value={model} onChange={(e) => setModel(e.target.value)} required style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>TONNAGE</label>
                  <input type="number" value={tonnage} onChange={(e) => setTonnage(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>TECH BASE</label>
                  <select value={unitTechBase} onChange={(e) => setUnitTechBase(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                    <option value="Inner Sphere">Inner Sphere</option>
                    <option value="Clan">Clan</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>BV2</label>
                  <input type="number" value={bv2} onChange={(e) => setBv2(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
              </div>

              <button type="submit" style={{ backgroundColor: "#238636", border: "none", color: "#fff", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "14px", marginTop: "4px" }}>
                + Add Unit to Roster
              </button>
            </form>
          </div>

          {/* Repair & Refit Engine Panel */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px", height: "fit-content" }}>
            <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Repair &amp; Refit Engine</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Component Type</label>
                <select value={componentType} onChange={(e) => setComponentType(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                  <option value="Armor">Armor</option>
                  <option value="Structure">Structure</option>
                  <option value="Engine">Engine Critical</option>
                  <option value="Gyro">Gyro Critical</option>
                  <option value="Actuator">Actuator</option>
                  <option value="Weapon">Weapon Replacement</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Tech Base</label>
                  <select value={techBase} onChange={(e) => setTechBase(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                    <option value="Inner Sphere">Inner Sphere</option>
                    <option value="Clan">Clan</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Tech Skill</label>
                  <select value={techRating} onChange={(e) => setTechRating(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                    <option value="Green">Green (TN 6+)</option>
                    <option value="Regular">Regular (TN 5+)</option>
                    <option value="Veteran">Veteran (TN 4+)</option>
                    <option value="Elite">Elite (TN 3+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Amount / Critical Hits</label>
                <input type="number" value={amountDamaged} onChange={(e) => setAmountDamaged(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                <input type="checkbox" id="salvage" checked={hasSalvage} onChange={(e) => setHasSalvage(e.target.checked)} />
                <label htmlFor="salvage" style={{ fontSize: "13px", color: "#c9d1d9", cursor: "pointer" }}>Use Salvaged Parts (75% C-Bill Discount)</label>
              </div>

              <button onClick={calculateRepair} style={{ backgroundColor: "#d97706", border: "none", color: "#000", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
                Calculate Logistics
              </button>

              {repairCalc && (
                <div style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "12px", borderRadius: "4px", fontFamily: "monospace", marginTop: "4px" }}>
                  <p style={{ color: "#60a5fa", margin: "0 0 4px 0" }}>SP Cost: {repairCalc.sp_cost} SP</p>
                  <p style={{ color: "#34d399", margin: "0 0 4px 0" }}>C-Bill Cost: ${(repairCalc.cbill_cost || 0).toLocaleString()}</p>
                  <p style={{ color: "#fbbf24", margin: "0 0 4px 0" }}>Est. Time: {repairCalc.time_hours} Hours</p>
                  <p style={{ color: "#a78bfa", margin: 0 }}>Target Roll: {repairCalc.base_target_number}+</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
