import React, { useState, useEffect } from "react";

export default function Dashboard() {
  // Campaign & Balance State
  const [balance, setBalance] = useState({
    campaign_name: "Wolf's Irregulars",
    WP: 1250,
    SP: 750,
    CBills: 15000000.0,
    current_date: "3025-01-15",
    daily_overhead: 5000,
    mrb_rating: "B",
    reputation_score: 72
  });

  const [currentSystem, setCurrentSystem] = useState({
    name: "Outreach",
    faction: "Wolf's Dragoons",
    x: 0.0,
    y: 0.0
  });

  const [onlineMulMode, setOnlineMulMode] = useState(true);
  const [activeTab, setActiveTab] = useState("operations");

  // Data lists with default fallbacks
  const [units, setUnits] = useState([]);
  const [missions, setMissions] = useState([
    { id: 1, name: "Garrison", employer: "House Davion", mission_type: "Garrison Defense", cbill_reward: 3500000, wp_reward: 350, status: "Available" },
    { id: 2, name: "Mustered Soldier Support", employer: "Draconis Combine Mustered Soldier", mission_type: "Objective Raid", cbill_reward: 4200000, wp_reward: 450, status: "Available" },
    { id: 3, name: "Local Security Escort", employer: "Independent Local Government", mission_type: "Reconnaissance", cbill_reward: 2800000, wp_reward: 300, status: "Available" }
  ]);
  const [pilots, setPilots] = useState([
    { id: 1, name: "Varian Vance", callsign: "Grim", gunnery: 3, piloting: 4, status: "Active", injuries: 0, days_remaining: 0, xp: 75, spa: "Sharpshooter (+1 Accuracy to Called Shots)", kills: 4 },
    { id: 2, name: "Kaelen Cross", callsign: "Bishop", gunnery: 4, piloting: 4, status: "Active", injuries: 0, days_remaining: 0, xp: 40, spa: "Tactical Genius (Reroll Initiative Once)", kills: 2 },
    { id: 3, name: "Robert Clay", callsign: "Dusty", gunnery: 4, piloting: 5, status: "Injured", injuries: 2, days_remaining: 12, xp: 20, spa: "None", kills: 1 }
  ]);
  const [hiringCandidates, setHiringCandidates] = useState([
    { name: "Rana Hawkins", callsign: "Valkyrie", gunnery: 3, piloting: 3, signing_bonus: 450000 },
    { name: "Erik Sandstrom", callsign: "Viking", gunnery: 3, piloting: 4, signing_bonus: 350000 },
    { name: "Valerie Vance", callsign: "Siren", gunnery: 4, piloting: 4, signing_bonus: 250000 }
  ]);
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [starmapSystems, setStarmapSystems] = useState([
    { name: "Galax", faction: "Federated Suns", x: 15.0, y: 16.2 },
    { name: "Tukayyid", faction: "ComStar", x: -12.0, y: 24.3 },
    { name: "Solaris VII", faction: "Independent", x: -20.0, y: -20.0 }
  ]);
  const [procurementMechs, setProcurementMechs] = useState([
    { chassis: "Marauder", model: "MAD-3R", tonnage: 75, bv2: 1363, cbill_cost: 6500000, wp_cost: 650, tech_base: "Inner Sphere" },
    { chassis: "Warhammer", model: "WHM-6R", tonnage: 70, bv2: 1299, cbill_cost: 6000000, wp_cost: 600, tech_base: "Inner Sphere" },
    { chassis: "Centurion", model: "CN9-A", tonnage: 50, bv2: 945, cbill_cost: 4500000, wp_cost: 450, tech_base: "Inner Sphere" },
    { chassis: "Hunchback", model: "HBK-4G", tonnage: 50, bv2: 1041, cbill_cost: 3800000, wp_cost: 380, tech_base: "Inner Sphere" }
  ]);
  const [availableSpas, setAvailableSpas] = useState([
    "None",
    "Sharpshooter (+1 Accuracy to Called Shots)",
    "Tactical Genius (Reroll Initiative Once)",
    "Jumping Jack (-1 Target Penalty when Jumping)",
    "Dodge (Physical Attack Evasion Bonus)",
    "Marksman (Energy Weapon Range Boost)",
    "Multi-Tasker (No Multi-Target Penalty)",
    "Weapon Specialist (+1 To-Hit with Primary Weapon)"
  ]);

  // Active Deployed Mission
  const [activeDeployedMission, setActiveDeployedMission] = useState(null);

  // MechLab Interactive Refit State
  const [refitChassis, setRefitChassis] = useState("Marauder MAD-3R");
  const [refitTonnage, setRefitTonnage] = useState(75);
  const [selectedLoadout, setSelectedLoadout] = useState(["PPC", "PPC", "Medium Laser", "Medium Laser", "Heat Sink"]);
  const [useDoubleHeatSinks, setUseDoubleHeatSinks] = useState(false);
  const [buildMetrics, setBuildMetrics] = useState(null);

  // Modals
  const [selectedIntelMission, setSelectedIntelMission] = useState(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showCustomContractModal, setShowCustomContractModal] = useState(false);
  const [showAarModal, setShowAarModal] = useState(false);

  // Form States
  const [customMissionName, setCustomMissionName] = useState("");
  const [customEmployer, setCustomEmployer] = useState("House Davion");
  const [customMissionType, setCustomMissionType] = useState("Garrison");
  const [customBaseCbill, setCustomBaseCbill] = useState(3500000);
  const [customWpReward, setCustomWpReward] = useState(400);

  const [addChassis, setAddChassis] = useState("Centurion");
  const [addModel, setAddModel] = useState("CN9-A");
  const [addTonnage, setAddTonnage] = useState(50);
  const [addBv2, setAddBv2] = useState(945);

  const [newPilotName, setNewPilotName] = useState("");
  const [newPilotCallsign, setNewPilotCallsign] = useState("");

  const [aarSalvageCash, setAarSalvageCash] = useState(500000);

  // Data Fetching
  const fetchBalance = () => {
    fetch("http://localhost:8000/api/v1/ledger/balance")
      .then(r => r.json())
      .then(data => { if (data && data.CBills) setBalance(data); })
      .catch(() => {});
  };

  const fetchUnits = () => {
    fetch("http://localhost:8000/api/v1/units")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setUnits(data); })
      .catch(() => {});
  };
  
  const fetchMissions = () => {
    fetch("http://localhost:8000/api/v1/missions")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMissions(data);
          const deployed = data.find(m => m.status === "Active" || m.status === "Deployed");
          if (deployed) setActiveDeployedMission(deployed);
        }
      })
      .catch(() => {});
  };

  const fetchPilots = () => { fetch("http://localhost:8000/api/v1/pilots").then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setPilots(data); }).catch(() => {}); };
  const fetchInventory = () => { fetch("http://localhost:8000/api/v1/inventory").then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setInventory(data); }).catch(() => {}); };
  const fetchLogs = () => { fetch("http://localhost:8000/api/v1/logs").then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setLogs(data); }).catch(() => {}); };
  const fetchStarmap = () => { fetch("http://localhost:8000/api/v1/starmap").then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setStarmapSystems(data); }).catch(() => {}); };
  const fetchSpas = () => { fetch("http://localhost:8000/api/v1/pilots/spas").then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setAvailableSpas(data); }).catch(() => {}); };
  const fetchProcurement = () => { fetch("http://localhost:8000/api/v1/market/mechs").then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setProcurementMechs(data); }).catch(() => {}); };

  const refreshAll = () => {
    fetchBalance(); fetchUnits(); fetchMissions(); fetchPilots(); fetchInventory(); fetchLogs(); fetchStarmap(); fetchSpas(); fetchProcurement();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Calculate MechLab Build Metrics
  const validateBuild = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/builder/validate-build", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tonnage: Number(refitTonnage),
          components: selectedLoadout,
          double_heat_sinks: useDoubleHeatSinks
        })
      });
      const data = await res.json();
      setBuildMetrics(data);
    } catch (err) {}
  };

  useEffect(() => {
    validateBuild();
  }, [refitTonnage, selectedLoadout, useDoubleHeatSinks]);

  // MechLab Item Handlers
  const addComponentToLoadout = (compName) => {
    setSelectedLoadout([...selectedLoadout, compName]);
  };

  const removeComponentFromLoadout = (idx) => {
    const updated = [...selectedLoadout];
    updated.splice(idx, 1);
    setSelectedLoadout(updated);
  };

  const handleCommitRefit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/builder/commit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chassis: refitChassis.split(" ")[0],
          model: refitChassis.split(" ")[1] || "Custom",
          tonnage: Number(refitTonnage),
          bv2: buildMetrics ? buildMetrics.total_bv2 : 1200,
          sp_cost: 50,
          cbill_cost: 100000,
          components_used: selectedLoadout
        })
      });
      if (res.ok) {
        alert(`Successfully committed custom MechLab refit for ${refitChassis}!`);
        fetchBalance(); fetchUnits(); fetchLogs();
      }
    } catch (err) {}
  };

  // Pilot Skill Upgrade & SPA Handlers
  const handleUpgradePilotSkill = async (pilotId, skillType) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pilots/${pilotId}/upgrade-skill`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_type: skillType })
      });
      if (res.ok) fetchPilots();
      else {
        const err = await res.json();
        alert(err.detail || "Upgrade failed");
      }
    } catch (err) {}
  };

  const handleAssignSpa = async (pilotId, spaName) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pilots/${pilotId}/assign-spa`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spa_name: spaName })
      });
      if (res.ok) fetchPilots();
    } catch (err) {}
  };

  const handleAwardXp = async (pilotId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pilots/${pilotId}/award-xp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xp_amount: 25, kills_added: 1 })
      });
      if (res.ok) fetchPilots();
    } catch (err) {}
  };

  const handleTreatMedbay = async (pilotId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pilots/${pilotId}/treat`, { method: "POST" });
      if (res.ok) { fetchPilots(); fetchBalance(); }
    } catch (err) {}
  };

  const handleRecruitCandidate = async (candidate) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/pilots", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: candidate.name,
          callsign: candidate.callsign,
          gunnery: candidate.gunnery,
          piloting: candidate.piloting
        })
      });
      if (res.ok) {
        alert(`Recruited MechWarrior ${candidate.name} (${candidate.callsign})!`);
        fetchPilots(); fetchBalance(); fetchLogs();
      }
    } catch (err) {}
  };

  const handleRecruitNewPilot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/pilots", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPilotName, callsign: newPilotCallsign, gunnery: 4, piloting: 5 })
      });
      if (res.ok) {
        setNewPilotName(""); setNewPilotCallsign("");
        fetchPilots(); fetchBalance(); fetchLogs();
      }
    } catch (err) {}
  };

  // Action Handlers
  const handleAdvanceDay = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/timeline/advance", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days: 1 })
      });
      if (res.ok) { fetchBalance(); fetchPilots(); fetchLogs(); }
    } catch (e) {}
  };

  const handleProcessPayroll = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/timeline/advance", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days: 30 })
      });
      if (res.ok) { fetchBalance(); fetchPilots(); fetchLogs(); alert("Processed 30-Day Monthly Payroll & Unit Maintenance!"); }
    } catch (e) {}
  };

  const handleAcceptContract = async (mission) => {
    setActiveDeployedMission(mission);
    try {
      await fetch("http://localhost:8000/api/v1/logs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "Contract Deployed", description: `Deployed forces for operation: '${mission.name}' (${mission.employer}).` })
      });
      fetchLogs();
    } catch (e) {}
  };

  const handleJumpToSystem = async (system) => {
    setCurrentSystem(system);
    const dx = system.x - currentSystem.x;
    const dy = system.y - currentSystem.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const cost = Math.round(dist * 2000.0);

    try {
      await fetch("http://localhost:8000/api/v1/logs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "JumpNet Transit", description: `JumpShip completed jump vector to system ${system.name} (${system.faction}). Jump Fee: $${cost.toLocaleString()} C-Bills.` })
      });
      fetchLogs(); alert(`JumpShip arrived at system ${system.name}!`);
    } catch (e) {}
  };

  const handleBuyProcurementMech = async (mech) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/market/buy-mech", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chassis: mech.chassis,
          model: mech.model,
          tonnage: mech.tonnage,
          bv2: mech.bv2,
          cbill_cost: mech.cbill_cost,
          wp_cost: mech.wp_cost,
          tech_base: mech.tech_base
        })
      });
      if (res.ok) {
        alert(`Successfully procured ${mech.chassis} ${mech.model}!`);
        fetchUnits(); fetchBalance(); fetchLogs();
      }
    } catch (err) {}
  };

  const handleCreateCustomContract = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customMissionName,
          employer: customEmployer,
          mission_type: customMissionType,
          base_cbill: Number(customBaseCbill),
          wp_reward: Number(customWpReward)
        })
      });
      if (res.ok) {
        setCustomMissionName("");
        setShowCustomContractModal(false);
        fetchMissions(); fetchLogs();
      }
    } catch (err) {}
  };

  const handleAddFactionUnit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/units", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chassis: addChassis,
          model: addModel,
          tonnage: Number(addTonnage),
          bv2: Number(addBv2),
          tech_base: "Inner Sphere"
        })
      });
      if (res.ok) {
        setShowAddUnitModal(false);
        fetchUnits(); fetchLogs();
      }
    } catch (err) {}
  };

  const handleSubmitAAR = async (e) => {
    e.preventDefault();
    try {
      const unit_logs = units.map(u => ({ unit_id: u.id, armor_loss: 10, structure_loss: 0 }));
      const pilot_logs = pilots.map(p => ({ pilot_id: p.id, injuries_sustained: 0 }));

      const res = await fetch("http://localhost:8000/api/v1/aar/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission_id: activeDeployedMission ? activeDeployedMission.id : null,
          unit_logs,
          pilot_logs,
          salvage_cbill_value: Number(aarSalvageCash)
        })
      });
      if (res.ok) {
        setShowAarModal(false);
        setActiveDeployedMission(null);
        fetchBalance(); fetchUnits(); fetchMissions(); fetchLogs();
      }
    } catch (err) {}
  };

  // JumpNet Filter
  const filteredDestinations = starmapSystems.filter(sys => sys.name !== currentSystem.name);
  const jumpNetDestinations = filteredDestinations.length > 0 ? filteredDestinations : [
    { name: "Galax", faction: "Federated Suns", x: 15.0, y: 16.2 },
    { name: "Tukayyid", faction: "ComStar", x: -12.0, y: 24.3 },
    { name: "Solaris VII", faction: "Independent", x: -20.0, y: -20.0 }
  ];

  return (
    <div style={{ background: "#0b0d13", minHeight: "100vh", color: "#e2e8f0", fontFamily: "Inter, sans-serif", padding: "16px" }}>
      
      {/* TOP HEADER BAR MATCHING SCREENSHOT 2 */}
      <header style={{ background: "rgba(15, 20, 30, 0.95)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h2 className="font-orbitron" style={{ color: "#ea580c", margin: 0, fontSize: "16px", letterSpacing: "1px" }}>
            SUCCESSION WARS 3025 | WOLF'S IRREGULARS
          </h2>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>DATE: <strong style={{ color: "#f8fafc" }}>{balance.current_date}</strong></span>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>
            SYSTEM: <strong style={{ color: "#38bdf8" }}>{currentSystem.name}</strong> <span style={{ color: "#10b981", fontSize: "11px", fontWeight: "bold" }}>[{onlineMulMode ? "ONLINE - MUL CONNECTED" : "OFFLINE CACHE"}]</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="font-mono" style={{ color: "#10b981", fontSize: "15px", fontWeight: "bold" }}>
            C-BILLS: ${(balance.CBills || 15000000).toLocaleString()}
          </span>
          <div style={{ background: "rgba(255, 255, 255, 0.05)", borderRadius: "6px", display: "flex", padding: "2px" }}>
            <button
              onClick={() => setOnlineMulMode(false)}
              style={{ background: !onlineMulMode ? "rgba(255,255,255,0.2)" : "transparent", border: "none", color: "#cbd5e1", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
            >
              Offline
            </button>
            <button
              onClick={() => setOnlineMulMode(true)}
              style={{ background: onlineMulMode ? "#0284c7" : "transparent", border: "none", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
            >
              Online (MUL API)
            </button>
          </div>
        </div>
      </header>

      {/* TABS BAR MATCHING SCREENSHOT 2 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("operations")}
          style={{
            background: activeTab === "operations" ? "#ea580c" : "rgba(30, 41, 59, 0.7)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Operations &amp; Contracts
        </button>
        <button
          onClick={() => setActiveTab("engineering")}
          style={{
            background: activeTab === "engineering" ? "#ea580c" : "rgba(30, 41, 59, 0.7)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Maintenance &amp; Engineering
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          style={{
            background: activeTab === "inventory" ? "#ea580c" : "rgba(30, 41, 59, 0.7)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Storage &amp; Parts Inventory
        </button>
        <button
          onClick={() => setActiveTab("personnel")}
          style={{
            background: activeTab === "personnel" ? "#ea580c" : "rgba(30, 41, 59, 0.7)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Personnel &amp; MedBay
        </button>
      </div>

      {/* TAB 1: OPERATIONS & CONTRACTS */}
      {activeTab === "operations" && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "24px" }}>
          <h3 className="font-orbitron" style={{ color: "#f8fafc", margin: "0 0 20px 0", fontSize: "18px" }}>Command &amp; Operations Deck</h3>

          {/* TOP DEPLOYED OPERATION BANNER */}
          <div style={{ background: "rgba(7, 10, 18, 0.9)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "8px", padding: "18px", marginBottom: "24px", textAlign: "center" }}>
            <p style={{ color: "#38bdf8", fontWeight: "bold", fontSize: "13px", margin: "0 0 8px 0" }}>-- Active Deployed Operation --</p>
            {activeDeployedMission ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
                <div>
                  <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "16px" }}>{activeDeployedMission.name}</h4>
                  <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>
                    Employer: <strong style={{ color: "#cbd5e1" }}>{activeDeployedMission.employer}</strong> | Type: {activeDeployedMission.mission_type}
                  </p>
                  <p className="font-mono" style={{ color: "#10b981", fontSize: "13px", margin: "4px 0 0 0" }}>
                    Payout: ${activeDeployedMission.cbill_reward.toLocaleString()} C-Bills | +{activeDeployedMission.wp_reward} WP
                  </p>
                </div>
                <button
                  onClick={() => setShowAarModal(true)}
                  style={{ background: "#ea580c", border: "none", color: "#fff", padding: "10px 18px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Process Combat AAR Report
                </button>
              </div>
            ) : (
              <p style={{ color: "#64748b", fontStyle: "italic", fontSize: "13px", margin: 0 }}>
                No contract currently deployed. Accept one from the MRB Board below.
              </p>
            )}
          </div>

          {/* MAIN GRID LAYOUT MATCHING SCREENSHOT 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
            
            {/* LEFT COLUMN: CONTROL BUTTONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleAdvanceDay}
                  style={{ background: "#10b981", color: "#ffffff", border: "none", padding: "12px 18px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", flex: 1 }}
                >
                  +1 Day (Process Logistics)
                </button>
                <button
                  onClick={handleProcessPayroll}
                  style={{ background: "#ea580c", color: "#ffffff", border: "none", padding: "12px 18px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", flex: 1 }}
                >
                  Process Monthly Payroll
                </button>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setShowAddUnitModal(true)}
                  style={{ background: "#0284c7", color: "#ffffff", border: "none", padding: "12px 18px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", flex: 1 }}
                >
                  + Add Faction Unit
                </button>
                <button
                  onClick={() => setShowCustomContractModal(true)}
                  style={{ background: "#9333ea", color: "#ffffff", border: "none", padding: "12px 18px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", flex: 1 }}
                >
                  + Build Custom Contract
                </button>
              </div>

              {/* TIMELINE CAMPAIGN LOG */}
              <div style={{ background: "rgba(7, 10, 18, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "16px", maxHeight: "280px", overflowY: "auto" }}>
                <h4 style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>Operations Journal</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {logs.length > 0 ? logs.map(l => (
                    <div key={l.id} style={{ background: "rgba(30, 41, 59, 0.5)", padding: "10px", borderRadius: "6px" }}>
                      <span style={{ color: "#38bdf8", fontSize: "11px", fontWeight: "bold" }}>[{l.log_date}] {l.event_type}</span>
                      <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "2px 0 0 0" }}>{l.description}</p>
                    </div>
                  )) : (
                    <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>Log journal ready.</p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MRB BOARD & GALACTIC JUMPNET */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* MRB AVAILABLE CONTRACT BOARD */}
              <div style={{ background: "rgba(7, 10, 18, 0.9)", border: "1px solid rgba(234, 88, 12, 0.3)", borderRadius: "8px", padding: "18px" }}>
                <p style={{ color: "#ea580c", fontWeight: "bold", fontSize: "13px", margin: "0 0 14px 0", textAlign: "center" }}>
                  -- MRB Available Contract Board --
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "240px", overflowY: "auto" }}>
                  {missions.map((m) => (
                    <div key={m.id || m.name} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "12px 16px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#f8fafc" }}>
                        Employer: <strong style={{ color: "#e2e8f0" }}>{m.employer}</strong> | Mission: {m.name}
                      </span>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setSelectedIntelMission(m)}
                          style={{ background: "#0284c7", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                        >
                          View Intel
                        </button>
                        <button
                          onClick={() => handleAcceptContract(m)}
                          style={{ background: "#ea580c", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                        >
                          Accept Contract
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GALACTIC JUMPNET */}
              <div style={{ background: "rgba(7, 10, 18, 0.9)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px", padding: "18px" }}>
                <h4 style={{ color: "#38bdf8", fontSize: "14px", margin: "0 0 10px 0" }}>
                  Galactic JumpNet (Max 30 LY Single Jump Range Filtered)
                </h4>

                <p style={{ color: "#10b981", fontSize: "12px", fontWeight: "bold", margin: "0 0 14px 0" }}>
                  CURRENT LOCATION: {currentSystem.name} | Faction: {currentSystem.faction} | Coordinates: ({currentSystem.x.toFixed(1)}, {currentSystem.y.toFixed(1)})
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "240px", overflowY: "auto" }}>
                  {jumpNetDestinations.map((sys) => {
                    const dx = sys.x - currentSystem.x;
                    const dy = sys.y - currentSystem.y;
                    const dist = (Math.sqrt(dx * dx + dy * dy) || 22.1).toFixed(1);

                    return (
                      <div key={sys.name} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#cbd5e1" }}>
                          Destination: <strong style={{ color: "#fff" }}>{sys.name}</strong> | Faction: {sys.faction} | Distance: {dist} LY
                        </span>
                        <button
                          onClick={() => handleJumpToSystem(sys)}
                          style={{ background: "#0284c7", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                        >
                          Jump to System
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 2: MAINTENANCE & ENGINEERING */}
      {activeTab === "engineering" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          
          {/* LEFT: ROSTER & REPAIR QUEUE */}
          <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 className="font-orbitron" style={{ color: "#ea580c", margin: 0, fontSize: "18px" }}>Maintenance Roster &amp; Repairs</h3>
              <span style={{ background: "rgba(234, 88, 12, 0.2)", border: "1px solid #ea580c", color: "#ea580c", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                Tech Bay Operational
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {units.map(u => (
                <div key={u.id} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#fff", fontSize: "16px" }}>{u.chassis} {u.model} ({u.tonnage}T)</h4>
                    <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: "12px" }}>
                      Tech Base: {u.tech_base} | BV2: <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{u.bv2}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: u.armor_damage > 0 ? "#f43f5e" : "#10b981" }}>
                      Armor Loss: {u.armor_damage} pt | Structure Loss: {u.structure_damage} pt
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => { setRefitChassis(`${u.chassis} ${u.model}`); setRefitTonnage(u.tonnage); }}
                      style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      Refit in MechLab
                    </button>
                    <button
                      onClick={() => fetch(`http://localhost:8000/api/v1/units/${u.id}/repair`, {method: "POST"}).then(() => refreshAll())}
                      style={{ background: "#ea580c", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      Repair (20 SP)
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* UNIT PROCUREMENT MARKET */}
            <h4 style={{ color: "#10b981", margin: "0 0 12px 0", fontSize: "15px" }}>🛒 Unit Procurement Market</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {procurementMechs.map(m => (
                <div key={m.chassis + m.model} style={{ background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "13px" }}>{m.chassis} {m.model} ({m.tonnage}T)</strong>
                    <p style={{ margin: "2px 0 0 0", color: "#10b981", fontSize: "12px", fontFamily: "monospace" }}>${m.cbill_cost.toLocaleString()} C-Bills</p>
                  </div>
                  <button
                    onClick={() => handleBuyProcurementMech(m)}
                    style={{ background: "#10b981", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Procure Unit
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: INTERACTIVE MECHLAB ENGINE */}
          <div style={{ background: "rgba(15, 20, 30, 0.9)", border: "1px solid rgba(2, 132, 199, 0.3)", borderRadius: "10px", padding: "24px" }}>
            <h3 className="font-orbitron" style={{ color: "#38bdf8", margin: "0 0 16px 0", fontSize: "18px" }}>Interactive MechLab Refit Deck</h3>

            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "14px", borderRadius: "8px", marginBottom: "18px" }}>
              <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "0 0 8px 0" }}>
                Target Chassis: <strong style={{ color: "#fff" }}>{refitChassis} ({refitTonnage} Tons)</strong>
              </p>
              
              {buildMetrics && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                  <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "10px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>EQUIPMENT TONNAGE</span>
                    <p style={{ margin: "4px 0 0 0", color: buildMetrics.is_valid ? "#10b981" : "#f43f5e", fontWeight: "bold", fontSize: "14px" }}>
                      {buildMetrics.equipment_tonnage}T / {buildMetrics.max_allowed_equipment_tonnage}T max
                    </p>
                  </div>

                  <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: "10px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>HEAT DISSIPATION</span>
                    <p style={{ margin: "4px 0 0 0", color: buildMetrics.net_heat_delta > 0 ? "#f59e0b" : "#38bdf8", fontWeight: "bold", fontSize: "14px" }}>
                      {buildMetrics.alpha_strike_heat} Heat vs {buildMetrics.heat_dissipation} Diss
                    </p>
                  </div>
                </div>
              )}
            </div>

            <h4 style={{ color: "#cbd5e1", fontSize: "13px", margin: "0 0 10px 0" }}>Add Weapons &amp; Equipment:</h4>
            <div style={{ display: "flex", wrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {["PPC", "ER PPC", "Large Laser", "Medium Laser", "AC/20", "Gauss Rifle", "LRM-20", "SRM-6", "Heat Sink"].map(item => (
                <button
                  key={item}
                  onClick={() => addComponentToLoadout(item)}
                  style={{ background: "#1e293b", border: "1px solid #3b82f6", color: "#38bdf8", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                >
                  + {item}
                </button>
              ))}
            </div>

            <h4 style={{ color: "#cbd5e1", fontSize: "13px", margin: "0 0 10px 0" }}>Fitted Equipment ({selectedLoadout.length} items):</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto", marginBottom: "20px" }}>
              {selectedLoadout.map((comp, idx) => (
                <div key={idx} style={{ background: "rgba(30, 41, 59, 0.6)", padding: "8px 12px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#fff", fontSize: "12px" }}>{comp}</span>
                  <button
                    onClick={() => removeComponentFromLoadout(idx)}
                    style={{ background: "#f43f5e", border: "none", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleCommitRefit}
              style={{ width: "100%", background: "#0284c7", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
            >
              🛠 Commit MechLab Refit (50 SP / $100,000 C-Bills)
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: STORAGE & PARTS INVENTORY */}
      {activeTab === "inventory" && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "24px" }}>
          <h3 className="font-orbitron" style={{ color: "#0284c7" }}>Storage &amp; Parts Inventory</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {inventory.map(i => (
              <div key={i.id} style={{ background: "rgba(30, 41, 59, 0.6)", padding: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
                <span>{i.component_name}</span>
                <strong style={{ color: "#38bdf8" }}>x{i.quantity}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PERSONNEL & MEDBAY (EXPANDED PILOT XP & HIRING HALL ENGINE) */}
      {activeTab === "personnel" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px" }}>
          
          {/* LEFT: MECHWARRIOR ROSTER & XP PROGRESSION */}
          <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "24px" }}>
            <h3 className="font-orbitron" style={{ color: "#9333ea", margin: "0 0 18px 0", fontSize: "18px" }}>
              MechWarrior Roster &amp; Skill Progression
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              {pilots.map(p => (
                <div key={p.id} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "16px" }}>{p.name} "{p.callsign}"</h4>
                      <p style={{ color: "#94a3b8", fontSize: "12px", margin: "2px 0 0 0" }}>
                        Status: <span style={{ color: p.status === "Injured" ? "#f43f5e" : "#10b981", fontWeight: "bold" }}>{p.status} {p.days_remaining > 0 ? `(${p.days_remaining}d left in MedBay)` : ""}</span> | Kills: <strong style={{ color: "#f59e0b" }}>{p.kills || 0}</strong>
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span className="font-mono" style={{ background: "rgba(147, 51, 234, 0.2)", border: "1px solid #9333ea", color: "#9333ea", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                        {p.xp || 0} XP
                      </span>
                      <button onClick={() => handleAwardXp(p.id)} style={{ background: "#334155", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}>
                        +25 XP
                      </button>
                    </div>
                  </div>

                  {/* SKILL UPGRADE & SPA CONTROLS */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "12px", flexWrap: "wrap" }}>
                    <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>Gunnery: <strong style={{ color: "#f59e0b" }}>{p.gunnery}</strong></span>
                      <button onClick={() => handleUpgradePilotSkill(p.id, "gunnery")} style={{ background: "#ea580c", color: "#fff", border: "none", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", cursor: "pointer" }}>
                        Upgrade (-30 XP)
                      </button>
                    </div>

                    <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>Piloting: <strong style={{ color: "#38bdf8" }}>{p.piloting}</strong></span>
                      <button onClick={() => handleUpgradePilotSkill(p.id, "piloting")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", cursor: "pointer" }}>
                        Upgrade (-20 XP)
                      </button>
                    </div>

                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <select value={p.spa || "None"} onChange={e => handleAssignSpa(p.id, e.target.value)} style={{ width: "100%", background: "rgba(15, 23, 42, 0.9)", border: "1px solid #9333ea", color: "#c084fc", padding: "6px", borderRadius: "6px", fontSize: "11px" }}>
                        {availableSpas.map(spa => <option key={spa} value={spa}>{spa}</option>)}
                      </select>
                    </div>

                    {p.status === "Injured" && (
                      <button onClick={() => handleTreatMedbay(p.id)} style={{ background: "#ea580c", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                        Treat in MedBay (50 SP)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* MANUAL RECRUITMENT FORM */}
            <form onSubmit={handleRecruitNewPilot} style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4 style={{ color: "#c084fc", margin: 0, fontSize: "14px" }}>+ Recruit MechWarrior to Roster</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input type="text" placeholder="Pilot Name" value={newPilotName} onChange={e => setNewPilotName(e.target.value)} required style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", color: "#fff", padding: "8px", borderRadius: "4px" }} />
                <input type="text" placeholder="Callsign" value={newPilotCallsign} onChange={e => setNewPilotCallsign(e.target.value)} required style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", color: "#fff", padding: "8px", borderRadius: "4px" }} />
              </div>
              <button type="submit" style={{ background: "#9333ea", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                + Recruit MechWarrior
              </button>
            </form>
          </div>

          {/* RIGHT: HIRING HALL CANDIDATE POOL */}
          <div style={{ background: "rgba(15, 20, 30, 0.9)", border: "1px solid rgba(147, 51, 234, 0.3)", borderRadius: "10px", padding: "24px" }}>
            <h3 className="font-orbitron" style={{ color: "#c084fc", margin: "0 0 16px 0", fontSize: "18px" }}>
              Hiring Hall Candidate Pool
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {hiringCandidates.map(c => (
                <div key={c.name} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#fff", fontSize: "15px" }}>{c.name} "{c.callsign}"</h4>
                    <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "12px" }}>
                      Gunnery: <strong style={{ color: "#f59e0b" }}>{c.gunnery}</strong> | Piloting: <strong style={{ color: "#38bdf8" }}>{c.piloting}</strong>
                    </p>
                    <p style={{ margin: "2px 0 0 0", color: "#10b981", fontSize: "12px", fontFamily: "monospace" }}>
                      Bonus: ${c.signing_bonus.toLocaleString()} C-Bills
                    </p>
                  </div>

                  <button
                    onClick={() => handleRecruitCandidate(c)}
                    style={{ background: "#9333ea", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
                  >
                    Recruit Pilot
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* INTEL MODAL */}
      {selectedIntelMission && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setSelectedIntelMission(null)}>
          <div style={{ background: "#1e293b", border: "1px solid #0284c7", borderRadius: "8px", padding: "24px", width: "500px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "#38bdf8", marginTop: 0 }}>Contract Intel Briefing</h3>
            <p><strong>Operation:</strong> {selectedIntelMission.name}</p>
            <p><strong>Employer:</strong> {selectedIntelMission.employer}</p>
            <p><strong>Mission Type:</strong> {selectedIntelMission.mission_type}</p>
            <p><strong>Base C-Bill Payout:</strong> ${selectedIntelMission.cbill_reward.toLocaleString()}</p>
            <p><strong>Warchest Reward:</strong> +{selectedIntelMission.wp_reward} WP</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <button style={{ background: "#475569", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer" }} onClick={() => setSelectedIntelMission(null)}>Close</button>
              <button style={{ background: "#ea580c", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }} onClick={() => { handleAcceptContract(selectedIntelMission); setSelectedIntelMission(null); }}>Accept Contract</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD FACTION UNIT MODAL */}
      {showAddUnitModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowAddUnitModal(false)}>
          <div style={{ background: "#1e293b", border: "1px solid #0284c7", borderRadius: "8px", padding: "24px", width: "450px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "#0284c7", marginTop: 0 }}>+ Add Faction Unit to Roster</h3>
            <form onSubmit={handleAddFactionUnit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" placeholder="Chassis (e.g. Marauder)" value={addChassis} onChange={e => setAddChassis(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <input type="text" placeholder="Model (e.g. MAD-3R)" value={addModel} onChange={e => setAddModel(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <input type="number" placeholder="Tonnage" value={addTonnage} onChange={e => setAddTonnage(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <input type="number" placeholder="Battle Value (BV2)" value={addBv2} onChange={e => setAddBv2(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" style={{ background: "#475569", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer" }} onClick={() => setShowAddUnitModal(false)}>Cancel</button>
                <button type="submit" style={{ background: "#0284c7", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Add Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUILD CUSTOM CONTRACT MODAL */}
      {showCustomContractModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowCustomContractModal(false)}>
          <div style={{ background: "#1e293b", border: "1px solid #9333ea", borderRadius: "8px", padding: "24px", width: "450px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "#9333ea", marginTop: 0 }}>+ Build Custom Contract</h3>
            <form onSubmit={handleCreateCustomContract} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" placeholder="Operation Name" value={customMissionName} onChange={e => setCustomMissionName(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <input type="text" placeholder="Employer (e.g. House Davion)" value={customEmployer} onChange={e => setCustomEmployer(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <input type="text" placeholder="Mission Type (e.g. Raid / Garrison)" value={customMissionType} onChange={e => setCustomMissionType(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <input type="number" placeholder="Base C-Bill Payout" value={customBaseCbill} onChange={e => setCustomBaseCbill(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <input type="number" placeholder="Warchest WP Reward" value={customWpReward} onChange={e => setCustomWpReward(e.target.value)} required style={{ background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" style={{ background: "#475569", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer" }} onClick={() => setShowCustomContractModal(false)}>Cancel</button>
                <button type="submit" style={{ background: "#9333ea", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Create Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AAR MODAL */}
      {showAarModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowAarModal(false)}>
          <div style={{ background: "#1e293b", border: "1px solid #ea580c", borderRadius: "8px", padding: "24px", width: "500px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "#ea580c", marginTop: 0 }}>Process Combat After-Action Report (AAR)</h3>
            <form onSubmit={handleSubmitAAR} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ color: "#cbd5e1", fontSize: "13px", margin: 0 }}>
                Operation: <strong style={{ color: "#fff" }}>{activeDeployedMission ? activeDeployedMission.name : "Independent Engagement"}</strong>
              </p>
              <div>
                <label style={{ fontSize: "12px", color: "#94a3b8" }}>ESTIMATED SALVAGE VALUE ($ C-BILLS)</label>
                <input type="number" value={aarSalvageCash} onChange={e => setAarSalvageCash(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "4px", marginTop: "4px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" style={{ background: "#475569", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer" }} onClick={() => setShowAarModal(false)}>Cancel</button>
                <button type="submit" style={{ background: "#ea580c", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Process AAR &amp; Complete Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
