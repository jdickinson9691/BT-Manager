import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState({ WP: 1000, SP: 500, CBills: 15000000, current_date: "3025-01-01", daily_overhead: 5000 });
  const [units, setUnits] = useState([]);
  const [missions, setMissions] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);

  // Active Tab Control
  const [activeTab, setActiveTab] = useState("operations"); // "operations", "engineering", "personnel"

  // Help Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Timeline State
  const [customJournalNote, setCustomJournalNote] = useState("");

  // Direct Unit Form State
  const [chassis, setChassis] = useState("");
  const [model, setModel] = useState("");
  const [tonnage, setTonnage] = useState(55);
  const [unitTechBase, setUnitTechBase] = useState("Inner Sphere");
  const [bv2, setBv2] = useState(1200);

  // Mission Draft & Negotiation State
  const [missionName, setMissionName] = useState("");
  const [missionType, setMissionType] = useState("Raid");
  const [employer, setEmployer] = useState("House Davion");
  const [baseCbill, setBaseCbill] = useState(3000000);
  const [wpReward, setWpReward] = useState(350);
  const [salvageRights, setSalvageRights] = useState("Shared (50%)");
  const [blcCoverage, setBlcCoverage] = useState(0.5);
  const [transportAllowance, setTransportAllowance] = useState(0.5);
  const [commandRights, setCommandRights] = useState("Integrated");

  // Pilot Recruit Form State
  const [pilotName, setPilotName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [gunnery, setGunnery] = useState(4);
  const [piloting, setPiloting] = useState(5);
  const [assignedUnitId, setAssignedUnitId] = useState("");

  // Warehouse Manual Add State
  const [newItemName, setNewItemName] = useState("PPC");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemCategory, setNewItemCategory] = useState("Weapon");

  // Custom Loadout Configurator State
  const [builderChassis, setBuilderChassis] = useState("Marauder");
  const [builderModel, setBuilderModel] = useState("MAD-3Custom");
  const [builderTonnage, setBuilderTonnage] = useState(75);
  const [targetUnitId, setTargetUnitId] = useState("");
  const [locationLoadout, setLocationLoadout] = useState({
    HD: [], CT: [], LT: [], RT: [],
    LA: ["PPC", "Medium Laser"],
    RA: ["PPC", "Medium Laser"],
    LL: [], RL: [],
  });
  const [validationResult, setValidationResult] = useState(null);

  // AAR State
  const [aarMissionId, setAarMissionId] = useState("");
  const [aarSalvage, setAarSalvage] = useState(500000);
  const [aarSalvageItems, setAarSalvageItems] = useState(["PPC", "Medium Laser"]);
  const [aarLogs, setAarLogs] = useState({});
  const [aarCritComp, setAarCritComp] = useState({});
  const [aarCritLoc, setAarCritLoc] = useState({});
  const [aarPilotInjuries, setAarPilotInjuries] = useState({});

  // Printable View Control
  const [printMode, setPrintMode] = useState(null);
  const [selectedWorkOrderUnit, setSelectedWorkOrderUnit] = useState(null);

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

  const fetchPilots = () => {
    fetch("http://localhost:8000/api/v1/pilots")
      .then((res) => res.json())
      .then((data) => setPilots(data))
      .catch(() => {});
  };

  const fetchInventory = () => {
    fetch("http://localhost:8000/api/v1/inventory")
      .then((res) => res.json())
      .then((data) => setInventory(data))
      .catch(() => {});
  };

  const fetchLogs = () => {
    fetch("http://localhost:8000/api/v1/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchBalance();
    fetchUnits();
    fetchMissions();
    fetchPilots();
    fetchInventory();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (printMode) {
      const timer = setTimeout(() => {
        window.print();
        setPrintMode(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [printMode, selectedWorkOrderUnit]);

  const handlePrintSummary = () => {
    setSelectedWorkOrderUnit(null);
    setPrintMode("summary");
  };

  const handlePrintWorkOrder = (unit) => {
    setSelectedWorkOrderUnit(unit);
    setPrintMode("work-order");
  };

  const handleAdvanceTime = async (daysToAdvance) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/timeline/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: Number(daysToAdvance) }),
      });
      if (res.ok) {
        fetchBalance();
        fetchPilots();
        fetchLogs();
      }
    } catch (err) {
      console.error("Failed to advance time", err);
    }
  };

  const handleAddJournalEntry = async (e) => {
    e.preventDefault();
    if (!customJournalNote) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "Journal", description: customJournalNote }),
      });
      if (res.ok) {
        setCustomJournalNote("");
        fetchLogs();
      }
    } catch (err) {
      console.error("Failed to add journal entry", err);
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
          base_cbill: Number(baseCbill),
          wp_reward: Number(wpReward),
          salvage_rights: salvageRights,
          blc_coverage: Number(blcCoverage),
          transport_allowance: Number(transportAllowance),
          command_rights: commandRights,
        }),
      });

      if (res.ok) {
        setMissionName("");
        fetchMissions();
        fetchLogs();
      }
    } catch (err) {
      console.error("Failed to create mission", err);
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

  const handleTreatPilot = async (pilotId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pilots/${pilotId}/treat`, {
        method: "POST",
      });

      if (res.ok) {
        fetchBalance();
        fetchPilots();
        fetchLogs();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Medical treatment failed!");
      }
    } catch (err) {
      console.error("Failed to treat pilot", err);
    }
  };

  const handleBuyMarketUnit = async (unitData) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitData),
      });

      if (res.ok) {
        fetchBalance();
        fetchUnits();
        alert(`Successfully procured ${unitData.chassis} (${unitData.model})!`);
      }
    } catch (err) {
      console.error("Failed to buy unit", err);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!newItemName) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          component_name: newItemName,
          quantity: Number(newItemQty),
          category: newItemCategory,
        }),
      });
      if (res.ok) fetchInventory();
    } catch (err) {
      console.error("Failed to add inventory", err);
    }
  };

  const handleAarLogChange = (unitId, field, value) => {
    setAarLogs((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        [field]: value,
      },
    }));
  };

  const handleSubmitAAR = async () => {
    const formattedUnitLogs = units.map((u) => {
      const log = aarLogs[u.id] || {};
      const critComp = aarCritComp[u.id];
      const critLoc = aarCritLoc[u.id] || "RA";

      const crits = critComp ? [{ location: critLoc, component_name: critComp }] : [];

      return {
        unit_id: u.id,
        armor_loss: Number(log.armor_loss || 0),
        structure_loss: Number(log.structure_loss || 0),
        is_destroyed: Boolean(log.is_destroyed || false),
        critical_hits: crits,
      };
    });

    const formattedPilotLogs = pilots.map((p) => ({
      pilot_id: p.id,
      injuries_sustained: Number(aarPilotInjuries[p.id] || 0),
    }));

    try {
      const res = await fetch("http://localhost:8000/api/v1/aar/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission_id: aarMissionId ? Number(aarMissionId) : null,
          unit_logs: formattedUnitLogs,
          pilot_logs: formattedPilotLogs,
          salvage_cbill_value: Number(aarSalvage),
          salvage_items: aarSalvageItems,
        }),
      });

      if (res.ok) {
        fetchBalance();
        fetchUnits();
        fetchMissions();
        fetchPilots();
        fetchInventory();
        fetchLogs();
        setAarLogs({});
        setAarCritComp({});
        setAarPilotInjuries({});
        alert("After-Action Report submitted! Contract payout & Battle Loss Compensation applied.");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to submit AAR");
      }
    } catch (err) {
      console.error("Failed to submit AAR", err);
    }
  };

  const handleReplaceCriticalComponent = async (critId) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/units/repair-critical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ critical_hit_id: Number(critId) }),
      });

      if (res.ok) {
        const data = await res.json();
        fetchBalance();
        fetchUnits();
        fetchInventory();
        fetchLogs();
        alert(data.message);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Critical replacement failed!");
      }
    } catch (err) {
      console.error("Failed to replace critical component", err);
    }
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

    const allComponents = Object.values(locationLoadout).flat();

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
          components_used: allComponents,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        fetchBalance();
        fetchUnits();
        fetchInventory();
        fetchLogs();

        let msg = "Custom loadout successfully committed to Active Roster!";
        if (data.used_from_warehouse && data.used_from_warehouse.length > 0) {
          msg += `\n\nConsumed spare parts from Warehouse: ${data.used_from_warehouse.join(", ")}`;
        }
        alert(msg);
      }
    } catch (err) {
      console.error("Failed to commit loadout", err);
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
        fetchLogs();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Repair failed!");
      }
    } catch (err) {
      console.error("Failed to execute unit repair", err);
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

  // Negotiation Dynamic Rates
  const salvageMult = salvageRights === "Full (100%)" ? 0.7 : salvageRights === "Shared (50%)" ? 0.85 : 1.15;
  const blcMult = Number(blcCoverage) === 1.0 ? 0.85 : Number(blcCoverage) === 0.5 ? 0.92 : 1.05;
  const transMult = Number(transportAllowance) === 1.0 ? 1.10 : Number(transportAllowance) === 0.5 ? 1.05 : 1.0;
  const estFinalCbills = Number(baseCbill) * salvageMult * blcMult * transMult;
  const estFinalWP = Math.round(Number(wpReward) * (commandRights === "Independent" ? 1.2 : 1.0));

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", backgroundColor: "#0d1117", color: "#c9d1d9", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <header className="no-print" style={{ borderBottom: "1px solid #30363d", paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "#f59e0b", margin: 0, fontSize: "28px" }}>BT-MANAGER</h1>
          <p style={{ color: "#8b949e", margin: "4px 0 0 0", fontSize: "14px" }}>Tactical Campaign Command Deck</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={handlePrintSummary} style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
            🖨 Print Campaign Summary
          </button>
          <button onClick={() => setShowHelpModal(true)} style={{ backgroundColor: "#d97706", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
            ❓ Help &amp; Reference Manual
          </button>
          <div style={{ border: "1px solid #238636", backgroundColor: "#0e2a1f", padding: "6px 14px", borderRadius: "20px", color: "#3fb950", fontSize: "12px", fontWeight: "bold" }}>● FASTAPI ONLINE</div>
          <div style={{ border: "1px solid #3b82f6", backgroundColor: "#1e293b", padding: "6px 14px", borderRadius: "20px", color: "#60a5fa", fontSize: "12px", fontWeight: "bold" }}>● POWERSHELL ONLINE</div>
        </div>
      </header>

      {/* TOP STAT BAR */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ backgroundColor: "#161b22", border: "1px solid #3b82f6", padding: "14px", borderRadius: "8px" }}>
          <p style={{ fontSize: "11px", color: "#60a5fa", margin: 0, textTransform: "uppercase" }}>Campaign Date</p>
          <p style={{ fontSize: "22px", color: "#fff", margin: "4px 0 0 0", fontFamily: "monospace", fontWeight: "bold" }}>{balance.current_date || "3025-01-01"}</p>
        </div>
        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "14px", borderRadius: "8px" }}>
          <p style={{ fontSize: "11px", color: "#8b949e", margin: 0, textTransform: "uppercase" }}>Warchest Balance</p>
          <p style={{ fontSize: "22px", color: "#fbbf24", margin: "4px 0 0 0", fontFamily: "monospace", fontWeight: "bold" }}>{balance.WP || 0} WP</p>
        </div>
        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "14px", borderRadius: "8px" }}>
          <p style={{ fontSize: "11px", color: "#8b949e", margin: 0, textTransform: "uppercase" }}>Support Points</p>
          <p style={{ fontSize: "22px", color: "#60a5fa", margin: "4px 0 0 0", fontFamily: "monospace", fontWeight: "bold" }}>{balance.SP || 0} SP</p>
        </div>
        <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "14px", borderRadius: "8px" }}>
          <p style={{ fontSize: "11px", color: "#8b949e", margin: 0, textTransform: "uppercase" }}>C-Bill Treasury</p>
          <p style={{ fontSize: "22px", color: "#34d399", margin: "4px 0 0 0", fontFamily: "monospace", fontWeight: "bold" }}>${(balance.CBills || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* COMMAND DECK NAVIGATION TABS */}
      <div className="no-print" style={{ display: "flex", gap: "12px", borderBottom: "2px solid #30363d", paddingBottom: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("operations")}
          style={{
            flex: 1, padding: "12px",
            backgroundColor: activeTab === "operations" ? "#1e293b" : "#161b22",
            color: activeTab === "operations" ? "#60a5fa" : "#8b949e",
            border: activeTab === "operations" ? "1px solid #3b82f6" : "1px solid #30363d",
            borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer",
          }}
        >
          ⚔ Operations &amp; Contracts
        </button>

        <button
          onClick={() => setActiveTab("engineering")}
          style={{
            flex: 1, padding: "12px",
            backgroundColor: activeTab === "engineering" ? "#1e293b" : "#161b22",
            color: activeTab === "engineering" ? "#fbbf24" : "#8b949e",
            border: activeTab === "engineering" ? "1px solid #fbbf24" : "1px solid #30363d",
            borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer",
          }}
        >
          🛠 Maintenance Bay &amp; Engineering
        </button>

        <button
          onClick={() => setActiveTab("personnel")}
          style={{
            flex: 1, padding: "12px",
            backgroundColor: activeTab === "personnel" ? "#1e293b" : "#161b22",
            color: activeTab === "personnel" ? "#a78bfa" : "#8b949e",
            border: activeTab === "personnel" ? "1px solid #a78bfa" : "1px solid #30363d",
            borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer",
          }}
        >
          👥 Personnel &amp; Marketplace
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="no-print">
        
        {/* TAB 1: OPERATIONS & CONTRACTS */}
        {activeTab === "operations" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            {/* Left Operations Column: Contract Negotiation Engine */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
                <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Mercenary Contract Negotiation Engine</h2>
                
                {missions.map((mission) => (
                  <div key={mission.id} style={{ backgroundColor: "#0d1117", padding: "10px 14px", borderRadius: "6px", border: "1px solid #30363d", marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <div>
                        <strong style={{ color: "#ffffff", fontSize: "15px" }}>{mission.name}</strong> <small style={{ color: "#a78bfa" }}>({mission.employer})</small>
                      </div>
                      {mission.status === "Active" ? (
                        <button onClick={() => handleCompleteMission(mission.id)} style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>
                          Complete Contract
                        </button>
                      ) : (
                        <span style={{ color: "#4ade80", fontSize: "11px", fontWeight: "bold" }}>✔ COMPLETED</span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8b949e", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                      <span>Payout: <strong style={{ color: "#34d399" }}>${(mission.cbill_reward || 0).toLocaleString()}</strong></span>
                      <span>Warchest: <strong style={{ color: "#fbbf24" }}>+{mission.wp_reward} WP</strong></span>
                      <span>Salvage: <strong style={{ color: "#60a5fa" }}>{mission.salvage_rights || "Shared"}</strong></span>
                      <span>BLC: <strong style={{ color: "#f87171" }}>{mission.blc_coverage ? mission.blc_coverage*100 : 50}% Coverage</strong></span>
                    </div>
                  </div>
                ))}

                <form onSubmit={handleCreateMission} style={{ marginTop: "14px", borderTop: "1px solid #30363d", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <strong style={{ fontSize: "13px", color: "#fbbf24" }}>Draft &amp; Negotiate New Mercenary Contract</strong>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <input type="text" placeholder="Operation Title" value={missionName} onChange={(e) => setMissionName(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                    <input type="text" placeholder="Employer Faction" value={employer} onChange={(e) => setEmployer(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <select value={missionType} onChange={(e) => setMissionType(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}>
                      <option value="Raid">Raid</option>
                      <option value="Garrison Duty">Garrison Duty</option>
                      <option value="Assault">Assault</option>
                    </select>
                    <input type="number" value={baseCbill} onChange={(e) => setBaseCbill(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                    <input type="number" value={wpReward} onChange={(e) => setWpReward(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  </div>

                  <div style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "10px", borderRadius: "6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ fontSize: "10px", color: "#60a5fa", display: "block", fontWeight: "bold" }}>SALVAGE RIGHTS</label>
                      <select value={salvageRights} onChange={(e) => setSalvageRights(e.target.value)} style={{ width: "100%", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "4px", borderRadius: "4px", fontSize: "11px" }}>
                        <option value="Exchange">Exchange Rights (Pay x1.15)</option>
                        <option value="Shared (50%)">Shared 50% Rights (Pay x0.85)</option>
                        <option value="Full (100%)">Full 100% Rights (Pay x0.70)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "10px", color: "#f87171", display: "block", fontWeight: "bold" }}>BATTLE LOSS COMP (BLC)</label>
                      <select value={blcCoverage} onChange={(e) => setBlcCoverage(e.target.value)} style={{ width: "100%", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "4px", borderRadius: "4px", fontSize: "11px" }}>
                        <option value="0.0">None (0% BLC - Pay x1.05)</option>
                        <option value="0.5">Partial (50% BLC - Pay x0.92)</option>
                        <option value="1.0">Full (100% BLC - Pay x0.85)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "10px", color: "#34d399", display: "block", fontWeight: "bold" }}>TRANSPORT ALLOWANCE</label>
                      <select value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} style={{ width: "100%", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "4px", borderRadius: "4px", fontSize: "11px" }}>
                        <option value="0.0">None (0% - Pay x1.00)</option>
                        <option value="0.5">50% Transport (Pay x1.05)</option>
                        <option value="1.0">Full JumpShip Charter (Pay x1.10)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "10px", color: "#fbbf24", display: "block", fontWeight: "bold" }}>COMMAND RIGHTS</label>
                      <select value={commandRights} onChange={(e) => setCommandRights(e.target.value)} style={{ width: "100%", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "4px", borderRadius: "4px", fontSize: "11px" }}>
                        <option value="Integrated">Integrated Faction Command</option>
                        <option value="House Command">House Liaison Command</option>
                        <option value="Independent">Independent Command (+20% WP)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#161b22", border: "1px solid #238636", padding: "8px 12px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", fontFamily: "monospace" }}>
                    <span>NEGOTIATED PAYOUT: <strong style={{ color: "#34d399" }}>${estFinalCbills.toLocaleString(undefined, {maximumFractionDigits: 0})}</strong></span>
                    <span>WARCHEST: <strong style={{ color: "#fbbf24" }}>+{estFinalWP} WP</strong></span>
                  </div>

                  <button type="submit" style={{ backgroundColor: "#059669", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                    + Sign Negotiated Contract
                  </button>
                </form>
              </div>
            </div>

            {/* Right Operations Column: AAR, Timeline & Journal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
                <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Mission After-Action Report (AAR)</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ fontSize: "10px", color: "#8b949e", display: "block" }}>CONTRACT</label>
                    <select value={aarMissionId} onChange={(e) => setAarMissionId(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                      <option value="">No Contract (Free Combat)</option>
                      {missions.filter((m) => m.status === "Active").map((m) => (
                        <option key={m.id} value={m.id}>{m.name} (+{m.wp_reward} WP / ${m.cbill_reward.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "#8b949e", display: "block" }}>SALVAGE CASH ($)</label>
                    <input type="number" value={aarSalvage} onChange={(e) => setAarSalvage(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
                  </div>
                </div>

                <strong style={{ fontSize: "12px", color: "#fbbf24", display: "block", marginBottom: "6px" }}>Log Unit Combat Damage &amp; Critical Hits</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                  {units.map((u) => {
                    const log = aarLogs[u.id] || {};
                    return (
                      <div key={u.id} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "8px 10px", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <strong style={{ color: "#fff", fontSize: "13px" }}>{u.chassis}</strong>
                          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                            <input type="number" placeholder="Armor" value={log.armor_loss || ""} onChange={(e) => handleAarLogChange(u.id, "armor_loss", e.target.value)} style={{ width: "60px", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "4px", borderRadius: "4px", fontSize: "11px" }} />
                            <input type="number" placeholder="Struct" value={log.structure_loss || ""} onChange={(e) => handleAarLogChange(u.id, "structure_loss", e.target.value)} style={{ width: "60px", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "4px", borderRadius: "4px", fontSize: "11px" }} />
                          </div>
                        </div>
                        <div style={{ borderTop: "1px dashed #30363d", paddingTop: "4px", display: "flex", gap: "4px", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", color: "#ef4444" }}>⚡ CRIT:</span>
                          <select value={aarCritLoc[u.id] || "RA"} onChange={(e) => setAarCritLoc({ ...aarCritLoc, [u.id]: e.target.value })} style={{ backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "2px", borderRadius: "3px", fontSize: "10px" }}>
                            <option value="RA">RA</option><option value="LA">LA</option><option value="RT">RT</option><option value="LT">LT</option><option value="CT">CT</option><option value="HD">HD</option>
                          </select>
                          <input type="text" placeholder="Component" value={aarCritComp[u.id] || ""} onChange={(e) => setAarCritComp({ ...aarCritComp, [u.id]: e.target.value })} style={{ flex: 1, backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "2px 6px", borderRadius: "3px", fontSize: "10px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <strong style={{ fontSize: "12px", color: "#ef4444", display: "block", marginBottom: "6px" }}>Log MechWarrior Pilot Injuries Sustained</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
                  {pilots.map((p) => (
                    <div key={p.id} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "6px 10px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#fff" }}>{p.name} "{p.callsign}"</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "10px", color: "#8b949e" }}>Hits:</span>
                        <input type="number" min="0" max="6" value={aarPilotInjuries[p.id] || 0} onChange={(e) => setAarPilotInjuries({ ...aarPilotInjuries, [p.id]: e.target.value })} style={{ width: "40px", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "2px", borderRadius: "3px", fontSize: "11px", textAlign: "center" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleSubmitAAR} style={{ width: "100%", backgroundColor: "#dc2626", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                  Submit After-Action Report &amp; Process Battlefield Payouts
                </button>
              </div>

              {/* Timeline & Command Journal */}
              <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
                <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Timeline Controls &amp; Command Journal</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  <button onClick={() => handleAdvanceTime(1)} style={{ backgroundColor: "#1e293b", color: "#60a5fa", border: "1px solid #3b82f6", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>+1 Day</button>
                  <button onClick={() => handleAdvanceTime(7)} style={{ backgroundColor: "#1e293b", color: "#60a5fa", border: "1px solid #3b82f6", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>+7 Days</button>
                  <button onClick={() => handleAdvanceTime(30)} style={{ backgroundColor: "#1e293b", color: "#60a5fa", border: "1px solid #3b82f6", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>+30 Days</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                  {logs.map((log) => (
                    <div key={log.id} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "6px 10px", borderRadius: "4px", fontSize: "11px" }}>
                      <strong style={{ color: "#60a5fa" }}>[{log.log_date}]</strong> {log.description}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MAINTENANCE BAY & ENGINEERING */}
        {activeTab === "engineering" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            {/* Left Column: Active Force Roster & Critical Repairs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
                <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Active Force Roster</h2>
                {units.map((unit) => {
                  const isDamaged = unit.armor_damage > 0 || unit.structure_damage > 0 || (unit.critical_hits && unit.critical_hits.length > 0);
                  return (
                    <div key={unit.id} style={{ backgroundColor: "#0d1117", padding: "12px 14px", borderRadius: "6px", border: isDamaged ? "1px solid #ef4444" : "1px solid #30363d", marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div>
                          <strong style={{ color: "#ffffff", fontSize: "15px" }}>{unit.chassis}</strong> <span style={{ color: "#8b949e" }}>({unit.model})</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ color: "#fbbf24", fontFamily: "monospace", fontWeight: "bold" }}>{unit.bv2} BV2</span>
                          <br />
                          <button onClick={() => handlePrintWorkOrder(unit)} style={{ marginTop: "2px", backgroundColor: "#334155", color: "#94a3b8", border: "1px solid #475569", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}>📄 Work Order</button>
                        </div>
                      </div>

                      {unit.critical_hits && unit.critical_hits.length > 0 && (
                        <div style={{ marginBottom: "8px" }}>
                          {unit.critical_hits.map((crit) => (
                            <div key={crit.id} style={{ backgroundColor: "#1e1e2e", border: "1px solid #ef4444", padding: "4px 8px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginBottom: "4px" }}>
                              <span>⚡ <strong>[{crit.location}]</strong> {crit.component_name}</span>
                              <button onClick={() => handleReplaceCriticalComponent(crit.id)} style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "2px 6px", borderRadius: "3px", cursor: "pointer", fontWeight: "bold", fontSize: "10px" }}>Replace</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#161b22", padding: "6px 10px", borderRadius: "4px", fontSize: "11px" }}>
                        <div>
                          <span>Armor Dmg: <strong>{unit.armor_damage}</strong></span>
                          <button onClick={() => handleUpdateDamage(unit.id, unit.armor_damage, unit.structure_damage, 5, 0)} style={{ marginLeft: "6px", padding: "1px 5px", backgroundColor: "#30363d", color: "#fff", border: "none", borderRadius: "3px" }}>+5</button>
                          <button onClick={() => handleUpdateDamage(unit.id, unit.armor_damage, unit.structure_damage, -5, 0)} style={{ marginLeft: "2px", padding: "1px 5px", backgroundColor: "#30363d", color: "#fff", border: "none", borderRadius: "3px" }}>-5</button>
                        </div>
                        {(unit.armor_damage > 0 || unit.structure_damage > 0) && (
                          <button onClick={() => handleRepairUnit(unit.id)} style={{ backgroundColor: "#d97706", color: "#000", border: "none", padding: "3px 6px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Repair &amp; Bill</button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Direct Add Mech Form */}
                <form onSubmit={handleAddUnit} style={{ marginTop: "12px", borderTop: "1px solid #30363d", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <strong style={{ fontSize: "12px", color: "#f0f6fc" }}>Direct Add Mech to Roster</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <input type="text" placeholder="Chassis" value={chassis} onChange={(e) => setChassis(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                    <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <input type="number" placeholder="Tonnage" value={tonnage} onChange={(e) => setTonnage(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                    <select value={unitTechBase} onChange={(e) => setUnitTechBase(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}>
                      <option value="Inner Sphere">Inner Sphere</option>
                      <option value="Clan">Clan</option>
                    </select>
                    <input type="number" placeholder="BV2" value={bv2} onChange={(e) => setBv2(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  </div>
                  <button type="submit" style={{ backgroundColor: "#059669", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>+ Add Mech</button>
                </form>
              </div>
            </div>

            {/* Right Column: Location Builder & Spare Parts Warehouse */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
                <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Location Loadout Configurator</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <input type="text" value={builderChassis} onChange={(e) => setBuilderChassis(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }} />
                  <input type="text" value={builderModel} onChange={(e) => setBuilderModel(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }} />
                  <input type="number" value={builderTonnage} onChange={(e) => setBuilderTonnage(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }} />
                </div>

                {/* Location Slots Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
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

                <button onClick={handleValidatePowerShellLoadout} style={{ width: "100%", backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                  Validate Loadout
                </button>

                {validationResult && (
                  <div style={{ marginTop: "14px", backgroundColor: "#0d1117", border: validationResult.Valid ? "1px solid #238636" : "1px solid #ef4444", padding: "12px", borderRadius: "6px", fontFamily: "monospace" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong style={{ color: validationResult.Valid ? "#3fb950" : "#f87171" }}>{validationResult.Valid ? "✔ VALID LOADOUT" : "✖ INVALID LOADOUT"}</strong>
                      <span style={{ color: "#fbbf24" }}>{validationResult.RefitClass}</span>
                    </div>
                    {validationResult.Valid && (
                      <button onClick={handleCommitLoadoutToRoster} style={{ width: "100%", backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", marginTop: "6px" }}>
                        Commit Loadout (Use Warehouse Stock First)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Warehouse Inventory */}
              <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
                <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Salvage &amp; Spare Parts Warehouse</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                  {inventory.map((inv) => (
                    <div key={inv.id} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "8px 12px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#fff", fontSize: "13px" }}>{inv.component_name}</strong>
                      <span style={{ backgroundColor: "#1e293b", color: "#60a5fa", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>x{inv.quantity}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddInventory} style={{ borderTop: "1px solid #30363d", paddingTop: "12px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px" }}>
                  <input type="text" placeholder="Component" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  <input type="number" min="1" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}>
                    <option value="Weapon">Weapon</option><option value="Equipment">Equipment</option><option value="Ammo">Ammo</option><option value="Salvage">Salvage</option>
                  </select>
                  <button type="submit" style={{ backgroundColor: "#059669", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>+ Add</button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PERSONNEL & MARKETPLACE */}
        {activeTab === "personnel" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            {/* Left Column: Personnel & MedBay */}
            <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
              <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>MechWarrior Personnel &amp; Medical Bay</h2>
              {pilots.map((p) => {
                const isInjured = p.status === "Injured";
                const isDeceased = p.status === "Deceased";
                return (
                  <div key={p.id} style={{ backgroundColor: "#0d1117", padding: "10px 14px", borderRadius: "6px", border: isDeceased ? "1px solid #ef4444" : isInjured ? "1px solid #f59e0b" : "1px solid #30363d", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ color: "#ffffff", fontSize: "14px" }}>{p.name}</strong> <span style={{ color: "#a78bfa", fontSize: "12px" }}>"{p.callsign}"</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontFamily: "monospace", color: "#fbbf24", fontSize: "12px" }}>G{p.gunnery} / P{p.piloting}</span>
                        <br />
                        <span style={{ fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", backgroundColor: isDeceased ? "#7f1d1d" : isInjured ? "#78350f" : "#064e3b", color: isDeceased ? "#f87171" : isInjured ? "#fbbf24" : "#34d399" }}>
                          {p.status} {isInjured && `(${p.injuries} Hits / ${p.days_remaining}d)`}
                        </span>
                      </div>
                    </div>
                    {isInjured && (
                      <div style={{ marginTop: "8px", borderTop: "1px dashed #30363d", paddingTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <small style={{ color: "#fbbf24" }}>🏥 MedBay: {p.days_remaining} days rest required</small>
                        <button onClick={() => handleTreatPilot(p.id)} style={{ backgroundColor: "#0284c7", color: "#fff", border: "none", padding: "3px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "10px" }}>
                          Treat (-50 SP / -15 Days)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Recruit Pilot Form */}
              <form onSubmit={handleRecruitPilot} style={{ marginTop: "12px", borderTop: "1px solid #30363d", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ fontSize: "12px", color: "#f0f6fc" }}>Recruit MechWarrior</strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input type="text" placeholder="Pilot Name" value={pilotName} onChange={(e) => setPilotName(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  <input type="text" placeholder="Callsign" value={callsign} onChange={(e) => setCallsign(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "8px" }}>
                  <input type="number" min="0" max="8" placeholder="Gunnery" value={gunnery} onChange={(e) => setGunnery(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  <input type="number" min="0" max="8" placeholder="Piloting" value={piloting} onChange={(e) => setPiloting(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                  <select value={assignedUnitId} onChange={(e) => setAssignedUnitId(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}>
                    <option value="">Unassigned</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.chassis} ({u.model})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  + Recruit MechWarrior
                </button>
              </form>
            </div>

            {/* Right Column: Marketplace Procurement */}
            <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
              <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Warchest Marketplace &amp; Depot</h2>
              
              <strong style={{ fontSize: "12px", color: "#fbbf24", display: "block", marginBottom: "8px" }}>Procure BattleMechs</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0d1117", padding: "8px 10px", borderRadius: "6px", border: "1px solid #30363d" }}>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "13px" }}>Timber Wolf (Mad Cat)</strong> <small style={{ color: "#8b949e" }}>Prime (75T Clan)</small>
                    <br />
                    <small style={{ color: "#34d399" }}>$12.5M C-Bills</small> | <small style={{ color: "#fbbf24" }}>200 WP</small>
                  </div>
                  <button onClick={() => handleBuyMarketUnit({ chassis: "Timber Wolf", model: "Prime", tonnage: 75, tech_base: "Clan", bv2: 2737, cbill_cost: 12500000, wp_cost: 200 })} style={{ backgroundColor: "#059669", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
                    Buy Mech
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0d1117", padding: "8px 10px", borderRadius: "6px", border: "1px solid #30363d" }}>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "13px" }}>Atlas</strong> <small style={{ color: "#8b949e" }}>AS7-D (100T IS)</small>
                    <br />
                    <small style={{ color: "#34d399" }}>$9.6M C-Bills</small> | <small style={{ color: "#fbbf24" }}>150 WP</small>
                  </div>
                  <button onClick={() => handleBuyMarketUnit({ chassis: "Atlas", model: "AS7-D", tonnage: 100, tech_base: "Inner Sphere", bv2: 1897, cbill_cost: 9600000, wp_cost: 150 })} style={{ backgroundColor: "#059669", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
                    Buy Mech
                  </button>
                </div>
              </div>

              <strong style={{ fontSize: "12px", color: "#60a5fa", display: "block", marginBottom: "8px" }}>Supply Depot Stock</strong>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleBuyMarketSupplies(100, 250000, 25)} style={{ flex: 1, backgroundColor: "#1e3a8a", color: "#60a5fa", border: "1px solid #3b82f6", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  +100 SP Supply Crate ($250k)
                </button>
                <button onClick={() => handleBuyMarketSupplies(500, 1000000, 100)} style={{ flex: 1, backgroundColor: "#1e3a8a", color: "#60a5fa", border: "1px solid #3b82f6", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  +500 SP Depot Stock ($1M)
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
