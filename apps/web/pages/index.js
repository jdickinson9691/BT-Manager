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

  // Custom Loadout Configurator State (PowerShell Engine)
  const [builderChassis, setBuilderChassis] = useState("Marauder");
  const [builderModel, setBuilderModel] = useState("MAD-3Custom");
  const [builderTonnage, setBuilderTonnage] = useState(75);
  const [targetUnitId, setTargetUnitId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("RA");
  const [selectedComponent, setSelectedComponent] = useState("PPC");
  const [locationLoadout, setLocationLoadout] = useState({
    HD: [],
    CT: [],
    LT: [],
    RT: [],
    LA: ["PPC", "Medium Laser"],
    RA: ["PPC", "Medium Laser"],
    LL: [],
    RL: [],
  });
  const [validationResult, setValidationResult] = useState(null);

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

  const handleAddComponentToLocation = () => {
    if (!selectedLocation || !selectedComponent) return;
    setLocationLoadout((prev) => ({
      ...prev,
      [selectedLocation]: [...(prev[selectedLocation] || []), selectedComponent],
    }));
  };

  const handleClearLocation = (loc) => {
    setLocationLoadout((prev) => ({
      ...prev,
      [loc]: [],
    }));
  };

  const handleValidatePowerShellLoadout = async () => {
    try {
      const res = await fetch("http://localhost:8085/builder/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaxTonnage: Number(builderTonnage),
          LocationEquipment: locationLoadout,
        }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (err) {
      console.error("Failed to connect to PowerShell API Server", err);
      alert("PowerShell API Server not responding on port 8085!");
    }
  };

  const handleCommitLoadoutToRoster = async () => {
    if (!validationResult || !validationResult.Valid) {
      alert("Please validate a valid loadout first!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/v1/builder/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_id: targetUnitId ? Number(targetUnitId) : null,
          chassis: builderChassis,
          model: builderModel,
          tonnage: Number(builderTonnage),
          bv2: Number(validationResult.EstimatedBV2 || 1000),
          sp_cost: Number(validationResult.SPCost || 0),
          cbill_cost: Number(validationResult.CBillEquipmentCost || 0),
        }),
      });

      if (res.ok) {
        fetchBalance();
        fetchUnits();
        alert("Custom loadout successfully committed to Active Roster!");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to commit loadout.");
      }
    } catch (err) {
      console.error("Failed to commit loadout", err);
    }
  };

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
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ border: "1px solid #238636", backgroundColor: "#0e2a1f", padding: "6px 14px", borderRadius: "20px", color: "#3fb950", fontSize: "12px", fontWeight: "bold" }}>
            ● FASTAPI ONLINE (8000)
          </div>
          <div style={{ border: "1px solid #3b82f6", backgroundColor: "#1e293b", padding: "6px 14px", borderRadius: "20px", color: "#60a5fa", fontSize: "12px", fontWeight: "bold" }}>
            ● POWERSHELL API ONLINE (8085)
          </div>
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
        {/* Left Column: Roster & Loadout Configurator */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* PowerShell Custom Loadout Configurator */}
          <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #30363d", paddingBottom: "10px", marginBottom: "14px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#f0f6fc" }}>Location Loadout Configurator</h2>
              <span style={{ fontSize: "11px", backgroundColor: "#1e293b", color: "#60a5fa", padding: "4px 8px", borderRadius: "4px", border: "1px solid #3b82f6" }}>PowerShell Engine</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>CHASSIS NAME</label>
                <input type="text" value={builderChassis} onChange={(e) => setBuilderChassis(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>VARIANT MODEL</label>
                <input type="text" value={builderModel} onChange={(e) => setBuilderModel(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>MAX TONNAGE</label>
                <input type="number" value={builderTonnage} onChange={(e) => setBuilderTonnage(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>OVERWRITE EXISTING ROSTER MECH (OPTIONAL)</label>
              <select value={targetUnitId} onChange={(e) => setTargetUnitId(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                <option value="">Create Brand New Unit in Roster</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.chassis} ({u.model}) - {u.tonnage}T</option>
                ))}
              </select>
            </div>

            {/* Component Picker Controls */}
            <div style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "12px", borderRadius: "6px", marginBottom: "14px" }}>
              <strong style={{ fontSize: "12px", color: "#fbbf24", display: "block", marginBottom: "8px" }}>Mount Component</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <div>
                  <label style={{ fontSize: "10px", color: "#8b949e", display: "block" }}>LOCATION</label>
                  <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} style={{ width: "100%", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}>
                    <option value="HD">Head (HD)</option>
                    <option value="CT">Center Torso (CT)</option>
                    <option value="LT">Left Torso (LT)</option>
                    <option value="RT">Right Torso (RT)</option>
                    <option value="LA">Left Arm (LA)</option>
                    <option value="RA">Right Arm (RA)</option>
                    <option value="LL">Left Leg (LL)</option>
                    <option value="RL">Right Leg (RL)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "10px", color: "#8b949e", display: "block" }}>COMPONENT</label>
                  <select value={selectedComponent} onChange={(e) => setSelectedComponent(e.target.value)} style={{ width: "100%", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}>
                    <option value="PPC">PPC (7T / 3 S)</option>
                    <option value="Medium Laser">Medium Laser (1T / 1 S)</option>
                    <option value="Small Laser">Small Laser (0.5T / 1 S)</option>
                    <option value="AC10">AC/10 (12T / 7 S)</option>
                    <option value="AC20">AC/20 (14T / 10 S)</option>
                    <option value="LRM15">LRM 15 (7T / 3 S)</option>
                    <option value="SRM6">SRM 6 (3T / 2 S)</option>
                    <option value="Heatsink">Heatsink (1T / 1 S)</option>
                    <option value="Ammo (AC10)">Ammo AC/10 (1T / 1 S)</option>
                    <option value="Ammo (LRM15)">Ammo LRM 15 (1T / 1 S)</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button onClick={handleAddComponentToLocation} style={{ width: "100%", backgroundColor: "#059669", color: "#fff", border: "none", padding: "7px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                    + Mount
                  </button>
                </div>
              </div>
            </div>

            {/* Location Slots Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {["HD", "CT", "LT", "RT", "LA", "RA", "LL", "RL"].map((loc) => {
                const items = locationLoadout[loc] || [];
                return (
                  <div key={loc} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "8px 10px", borderRadius: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "12px", color: "#60a5fa" }}>{loc}</strong>
                      <button onClick={() => handleClearLocation(loc)} style={{ border: "none", background: "none", color: "#f87171", cursor: "pointer", fontSize: "10px" }}>Clear</button>
                    </div>
                    <div style={{ fontSize: "11px", color: items.length > 0 ? "#fff" : "#8b949e" }}>
                      {items.length > 0 ? items.join(", ") : <span style={{ fontStyle: "italic" }}>Empty</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={handleValidatePowerShellLoadout} style={{ width: "100%", backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", marginTop: "12px" }}>
              Validate Loadout
            </button>

            {/* PowerShell Validation & Commit Panel */}
            {validationResult && (
              <div style={{ marginTop: "14px", backgroundColor: "#0d1117", border: validationResult.Valid ? "1px solid #238636" : "1px solid #ef4444", padding: "12px", borderRadius: "6px", fontFamily: "monospace" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <strong style={{ color: validationResult.Valid ? "#3fb950" : "#f87171" }}>
                    {validationResult.Valid ? "✔ VALID LOADOUT" : "✖ INVALID LOADOUT"}
                  </strong>
                  <span style={{ color: "#fbbf24" }}>{validationResult.RefitClass}</span>
                </div>
                <div style={{ fontSize: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ color: "#c9d1d9" }}>Tonnage: <strong>{validationResult.FinalTonnage} / {validationResult.MaxTonnage} T</strong></span>
                  <span style={{ color: "#c9d1d9" }}>Slots Used: <strong>{validationResult.TotalSlotsUsed}</strong></span>
                  <span style={{ color: "#60a5fa" }}>SP Cost: <strong>{validationResult.SPCost} SP</strong></span>
                  <span style={{ color: "#34d399" }}>Cost: <strong>${(validationResult.CBillEquipmentCost || 0).toLocaleString()}</strong></span>
                  <span style={{ color: "#a78bfa" }}>Labor Time: <strong>{validationResult.LaborHours} Hrs</strong></span>
                  <span style={{ color: "#fbbf24" }}>Est. BV2: <strong>{validationResult.EstimatedBV2}</strong></span>
                </div>

                {validationResult.Valid && (
                  <button onClick={handleCommitLoadoutToRoster} style={{ width: "100%", backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                    Commit Loadout to Active Roster &amp; Bill Treasury
                  </button>
                )}

                {validationResult.ValidationErrors && validationResult.ValidationErrors.length > 0 && (
                  <div style={{ marginTop: "8px", borderTop: "1px solid #30363d", paddingTop: "6px", color: "#f87171", fontSize: "11px" }}>
                    {validationResult.ValidationErrors.map((err, idx) => (
                      <div key={idx}>⚠ {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Force Roster */}
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

        </div>

        {/* Right Column: Marketplace, Refit Workshop & Personnel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
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

        </div>
      </div>
    </div>
  );
}
