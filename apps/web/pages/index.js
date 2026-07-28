import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState({ WP: 1000, SP: 500, CBills: 15000000 });
  const [units, setUnits] = useState([]);
  const [missions, setMissions] = useState([]);
  const [pilots, setPilots] = useState([]);

  // Form States
  const [chassis, setChassis] = useState("");
  const [model, setModel] = useState("");
  const [tonnage, setTonnage] = useState(55);
  const [unitTechBase, setUnitTechBase] = useState("Inner Sphere");
  const [bv2, setBv2] = useState(1200);

  const [missionName, setMissionName] = useState("");
  const [missionType, setMissionType] = useState("Raid");
  const [employer, setEmployer] = useState("House Davion");
  const [wpReward, setWpReward] = useState(350);
  const [cbillReward, setCbillReward] = useState(3000000);

  const [pilotName, setPilotName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [gunnery, setGunnery] = useState(4);
  const [piloting, setPiloting] = useState(5);
  const [assignedUnitId, setAssignedUnitId] = useState("");

  const [refitUnitId, setRefitUnitId] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newBv2, setNewBv2] = useState(1500);
  const [refitClass, setRefitClass] = useState("Class A (Field Weapon Swap - Same Type)");
  const [refitTechRating, setRefitTechRating] = useState("Regular");
  const [refitCalc, setRefitCalc] = useState(null);

  const fetchBalance = () => {
    fetch("http://localhost:8000/api/v1/ledger/balance")
      .then((res) => res.json())
      .then((data) => setBalance(data))
      .catch(() => {});
  };

  const fetchUnits = () => {
    fetch("http://localhost:8000/api/v1/units")
      .then((res) => res.json())
      .then((data) => {
        setUnits(data);
        if (data.length > 0 && !refitUnitId) {
          setRefitUnitId(data[0].id);
        }
      })
      .catch(() => {});
  };

  const fetchMissions = () => {
    fetch("http://localhost:8000/api/v1/missions")
      .then((res) => res.json())
      .then((data) => setMissions(data))
      .catch(() => {});
  };

  const fetchPilots = () => {
    fetch("http://localhost:8000/api/v1/pilots")
      .then((res) => res.json())
      .then((data) => setPilots(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchBalance();
    fetchUnits();
    fetchMissions();
    fetchPilots();
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

  const handleUpdateDamage = async (unitId, currentArmor, currentStruct, armorDelta, structDelta) => {
    const newArmor = Math.max(0, currentArmor + armorDelta);
    const newStruct = Math.max(0, currentStruct + structDelta);

    try {
      const res = await fetch("http://localhost:8000/api/v1/units/" + unitId + "/damage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          armor_damage: newArmor,
          structure_damage: newStruct,
        }),
      });
      if (res.ok) fetchUnits();
    } catch (err) {
      console.error("Failed to update damage", err);
    }
  };

  const handleRepairUnit = async (unitId) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/units/" + unitId + "/repair", {
        method: "POST",
      });
      if (res.ok) {
        fetchBalance();
        fetchUnits();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Repair failed!");
      }
    } catch (err) {
      console.error("Failed to execute unit repair", err);
    }
  };

  const handleBuyMarketUnit = async (unitData) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/market/buy-unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitData),
      });

      if (res.ok) {
        fetchBalance();
        fetchUnits();
        alert(`Successfully procured ${unitData.chassis} (${unitData.model})!`);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Market procurement failed!");
      }
    } catch (err) {
      console.error("Failed to buy unit", err);
    }
  };

  const handleBuyMarketSupplies = async (spAmount, cbillCost, wpCost) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/market/buy-supplies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sp_amount: spAmount,
          cbill_cost: cbillCost,
          wp_cost: wpCost,
        }),
      });

      if (res.ok) {
        fetchBalance();
        alert(`Purchased +${spAmount} Support Points!`);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Supply purchase failed!");
      }
    } catch (err) {
      console.error("Failed to buy supplies", err);
    }
  };

  const calculateRefit = async () => {
    const targetUnit = units.find((u) => u.id === Number(refitUnitId));
    if (!targetUnit) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/engine/refit-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refit_class: refitClass,
          tech_base: targetUnit.tech_base,
          tech_rating: refitTechRating,
          tonnage: targetUnit.tonnage,
        }),
      });
      const data = await res.json();
      setRefitCalc(data);
    } catch (e) {
      console.error("Failed to estimate refit", e);
    }
  };

  const handleApplyRefit = async () => {
    if (!refitUnitId || !newModel) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/units/" + refitUnitId + "/refit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_model: newModel,
          new_bv2: Number(newBv2),
          refit_class: refitClass,
          tech_rating: refitTechRating,
        }),
      });

      if (res.ok) {
        setNewModel("");
        fetchBalance();
        fetchUnits();
        alert("Refit successfully applied and billed!");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Refit failed!");
      }
    } catch (err) {
      console.error("Failed to apply refit", err);
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

  const handleRecruitPilot = async (e) => {
    e.preventDefault();
    if (!pilotName || !callsign) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/pilots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pilotName,
          callsign,
          gunnery: Number(gunnery),
          piloting: Number(piloting),
          unit_id: assignedUnitId ? Number(assignedUnitId) : null,
        }),
      });

      if (res.ok) {
        setPilotName("");
        setCallsign("");
        fetchPilots();
      }
    } catch (err) {
      console.error("Failed to recruit pilot", err);
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
        {/* Left Column: Force Roster, Missions & Marketplace */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Active Roster */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Active Force Roster</h2>
            {units.length === 0 ? (
              <p style={{ color: "#8b949e", fontSize: "14px", fontStyle: "italic", padding: "12px 0" }}>No active BattleMechs loaded.</p>
            ) : (
              units.map((unit) => {
                const isDamaged = (unit.armor_damage > 0) || (unit.structure_damage > 0);
                return (
                  <div key={unit.id} style={{ backgroundColor: "#0d1117", padding: "14px 16px", borderRadius: "6px", border: isDamaged ? "1px solid #ef4444" : "1px solid #30363d", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div>
                        <strong style={{ color: "#ffffff", fontSize: "16px" }}>{unit.chassis}</strong> <span style={{ color: "#8b949e" }}>{unit.model}</span>
                        <br />
                        <small style={{ color: "#8b949e" }}>{unit.tonnage} Tons | {unit.tech_base}</small>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: "#fbbf24", fontFamily: "monospace", fontWeight: "bold" }}>{unit.bv2} BV2</span>
                        <br />
                        {isDamaged ? (
                          <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: "bold" }}>⚠ DAMAGED</span>
                        ) : (
                          <span style={{ color: "#3fb950", fontSize: "12px", fontWeight: "bold" }}>✔ READY</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#161b22", padding: "8px 12px", borderRadius: "4px", fontSize: "12px", border: "1px solid #30363d" }}>
                      <div>
                        <span style={{ color: unit.armor_damage > 0 ? "#f87171" : "#8b949e" }}>Armor Dmg: <strong>{unit.armor_damage}</strong></span>
                        <button onClick={() => handleUpdateDamage(unit.id, unit.armor_damage, unit.structure_damage, 5, 0)} style={{ marginLeft: "6px", padding: "2px 6px", backgroundColor: "#30363d", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "10px" }}>+5</button>
                        <button onClick={() => handleUpdateDamage(unit.id, unit.armor_damage, unit.structure_damage, -5, 0)} style={{ marginLeft: "3px", padding: "2px 6px", backgroundColor: "#30363d", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "10px" }}>-5</button>
                      </div>

                      <div>
                        <span style={{ color: unit.structure_damage > 0 ? "#f87171" : "#8b949e" }}>Struct Dmg: <strong>{unit.structure_damage}</strong></span>
                        <button onClick={() => handleUpdateDamage(unit.id, unit.armor_damage, unit.structure_damage, 0, 1)} style={{ marginLeft: "6px", padding: "2px 6px", backgroundColor: "#30363d", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "10px" }}>+1</button>
                        <button onClick={() => handleUpdateDamage(unit.id, unit.armor_damage, unit.structure_damage, 0, -1)} style={{ marginLeft: "3px", padding: "2px 6px", backgroundColor: "#30363d", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "10px" }}>-1</button>
                      </div>

                      {isDamaged && (
                        <button onClick={() => handleRepairUnit(unit.id)} style={{ backgroundColor: "#d97706", color: "#000", border: "none", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
                          Repair &amp; Bill
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Salvage & Warchest Marketplace */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Salvage &amp; Warchest Market</h2>
            
            <strong style={{ fontSize: "13px", color: "#fbbf24", display: "block", marginBottom: "8px" }}>BattleMech Procurement List</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0d1117", padding: "10px 12px", borderRadius: "6px", border: "1px solid #30363d" }}>
                <div>
                  <strong style={{ color: "#fff", fontSize: "14px" }}>Mad Cat (Timber Wolf)</strong> <span style={{ color: "#8b949e", fontSize: "12px" }}>Prime (75T Clan)</span>
                  <br />
                  <small style={{ color: "#34d399" }}>$12,500,000 C-Bills</small> | <small style={{ color: "#fbbf24" }}>200 WP</small>
                </div>
                <button onClick={() => handleBuyMarketUnit({ chassis: "Timber Wolf", model: "Prime", tonnage: 75, tech_base: "Clan", bv2: 2737, cbill_cost: 12500000, wp_cost: 200 })} style={{ backgroundColor: "#059669", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  Buy Mech
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0d1117", padding: "10px 12px", borderRadius: "6px", border: "1px solid #30363d" }}>
                <div>
                  <strong style={{ color: "#fff", fontSize: "14px" }}>Atlas</strong> <span style={{ color: "#8b949e", fontSize: "12px" }}>AS7-D (100T IS)</span>
                  <br />
                  <small style={{ color: "#34d399" }}>$9,600,000 C-Bills</small> | <small style={{ color: "#fbbf24" }}>150 WP</small>
                </div>
                <button onClick={() => handleBuyMarketUnit({ chassis: "Atlas", model: "AS7-D", tonnage: 100, tech_base: "Inner Sphere", bv2: 1897, cbill_cost: 9600000, wp_cost: 150 })} style={{ backgroundColor: "#059669", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  Buy Mech
                </button>
              </div>
            </div>

            <strong style={{ fontSize: "13px", color: "#60a5fa", display: "block", marginBottom: "8px" }}>Supply Packages &amp; Technical Support</strong>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleBuyMarketSupplies(100, 250000, 25)} style={{ flex: 1, backgroundColor: "#1e3a8a", color: "#60a5fa", border: "1px solid #3b82f6", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                +100 SP Crate
                <br />
                <small style={{ color: "#93c5fd" }}>$250k | 25 WP</small>
              </button>
              <button onClick={() => handleBuyMarketSupplies(500, 1000000, 100)} style={{ flex: 1, backgroundColor: "#1e3a8a", color: "#60a5fa", border: "1px solid #3b82f6", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                +500 SP Depot Stock
                <br />
                <small style={{ color: "#93c5fd" }}>$1M | 100 WP</small>
              </button>
            </div>
          </div>

          {/* Mission Board */}
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

            <form onSubmit={handleCreateMission} style={{ marginTop: "16px", borderTop: "1px solid #30363d", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <strong style={{ fontSize: "13px", color: "#f0f6fc" }}>Draft New Contract Offer</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input type="text" placeholder="Operation Title" value={missionName} onChange={(e) => setMissionName(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", fontSize: "13px" }} />
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

        {/* Right Column: Refit Workshop & Personnel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Chassis Refit Workshop */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Chassis Refit Workshop (Class A–F)</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              <div>
                <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>TARGET MECH</label>
                <select value={refitUnitId} onChange={(e) => setRefitUnitId(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.chassis} ({u.model}) - {u.tonnage} T</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>NEW VARIANT MODEL</label>
                  <input type="text" placeholder="e.g. WHM-6D" value={newModel} onChange={(e) => setNewModel(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>NEW BV2</label>
                  <input type="number" value={newBv2} onChange={(e) => setNewBv2(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>REFIT CLASS</label>
                <select value={refitClass} onChange={(e) => setRefitClass(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                  <option value="Class A (Field Weapon Swap - Same Type)">Class A (Field Weapon Swap - Same Type)</option>
                  <option value="Class B (Field Weapon Swap - Diff Type)">Class B (Field Weapon Swap - Diff Type)</option>
                  <option value="Class C (Maintenance - Armor/Heatsink Upgrade)">Class C (Maintenance - Armor/Heatsink)</option>
                  <option value="Class D (Maintenance - Engine Rating/Location)">Class D (Maintenance - Engine/Location)</option>
                  <option value="Class E (Factory - Structure/Gyro Replacement)">Class E (Factory - Structure/Gyro)</option>
                  <option value="Class F (Factory - Tech Base / Major Overhaul)">Class F (Factory - Tech Base Overhaul)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>TECH RATING</label>
                <select value={refitTechRating} onChange={(e) => setRefitTechRating(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                  <option value="Green">Green (TN 7+)</option>
                  <option value="Regular">Regular (TN 6+)</option>
                  <option value="Veteran">Veteran (TN 5+)</option>
                  <option value="Elite">Elite (TN 4+)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                <button onClick={calculateRefit} style={{ backgroundColor: "#30363d", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                  Estimate Refit
                </button>
                <button onClick={handleApplyRefit} style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                  Execute Refit &amp; Bill
                </button>
              </div>

              {refitCalc && (
                <div style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "12px", borderRadius: "4px", fontFamily: "monospace", marginTop: "4px" }}>
                  <p style={{ color: "#60a5fa", margin: "0 0 4px 0" }}>SP Cost: {refitCalc.sp_cost} SP</p>
                  <p style={{ color: "#34d399", margin: "0 0 4px 0" }}>C-Bill Cost: ${(refitCalc.cbill_cost || 0).toLocaleString()}</p>
                  <p style={{ color: "#fbbf24", margin: "0 0 4px 0" }}>Est. Time: {refitCalc.time_hours} Hours</p>
                  <p style={{ color: "#a78bfa", margin: 0 }}>Target Roll: {refitCalc.base_target_number}+</p>
                </div>
              )}

            </div>
          </div>

          {/* MechWarrior Personnel Roster */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>MechWarrior Personnel</h2>
            {pilots.length === 0 ? (
              <p style={{ color: "#8b949e", fontSize: "14px", fontStyle: "italic", padding: "12px 0" }}>No MechWarriors recruited.</p>
            ) : (
              pilots.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0d1117", padding: "10px 14px", borderRadius: "6px", border: "1px solid #30363d", marginBottom: "8px" }}>
                  <div>
                    <strong style={{ color: "#ffffff", fontSize: "15px" }}>{p.name}</strong> <span style={{ color: "#a78bfa", fontWeight: "bold" }}>"{p.callsign}"</span>
                    <br />
                    <small style={{ color: "#8b949e" }}>
                      Assigned: <span style={{ color: p.assigned_unit ? "#60a5fa" : "#8b949e" }}>{p.assigned_unit || "Unassigned"}</span>
                    </small>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "monospace" }}>
                    <div style={{ fontSize: "13px", color: "#fbbf24" }}>G{p.gunnery} / P{p.piloting}</div>
                    <small style={{ color: "#3fb950" }}>● {p.status}</small>
                  </div>
                </div>
              ))
            )}

            <form onSubmit={handleRecruitPilot} style={{ marginTop: "14px", borderTop: "1px solid #30363d", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <strong style={{ fontSize: "13px", color: "#f0f6fc" }}>Recruit MechWarrior</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input type="text" placeholder="Pilot Name" value={pilotName} onChange={(e) => setPilotName(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", fontSize: "13px" }} />
                <input type="text" placeholder='Callsign' value={callsign} onChange={(e) => setCallsign(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", fontSize: "13px" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "10px", color: "#8b949e", display: "block" }}>GUNNERY</label>
                  <input type="number" min="0" max="8" value={gunnery} onChange={(e) => setGunnery(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "10px", color: "#8b949e", display: "block" }}>PILOTING</label>
                  <input type="number" min="0" max="8" value={piloting} onChange={(e) => setPiloting(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "10px", color: "#8b949e", display: "block" }}>ASSIGN MECH</label>
                  <select value={assignedUnitId} onChange={(e) => setAssignedUnitId(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px" }}>
                    <option value="">Unassigned</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.chassis} ({u.model})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                + Recruit MechWarrior
              </button>
            </form>
          </div>

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

        </div>
      </div>
    </div>
  );
}
