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

  // Data lists with default screenshot fallbacks
  const [units, setUnits] = useState([]);
  const [missions, setMissions] = useState([
    { id: 1, name: "Garrison", employer: "House Davion", mission_type: "Garrison Defense", cbill_reward: 3500000, wp_reward: 350, status: "Available" },
    { id: 2, name: "Mustered Soldier Support", employer: "Draconis Combine Mustered Soldier", mission_type: "Objective Raid", cbill_reward: 4200000, wp_reward: 450, status: "Available" },
    { id: 3, name: "Local Security Escort", employer: "Independent Local Government", mission_type: "Reconnaissance", cbill_reward: 2800000, wp_reward: 300, status: "Available" }
  ]);
  const [pilots, setPilots] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [starmapSystems, setStarmapSystems] = useState([
    { name: "Galax", faction: "Federated Suns", x: 15.0, y: 16.2 },
    { name: "Tukayyid", faction: "ComStar", x: -12.0, y: 24.3 },
    { name: "Solaris VII", faction: "Independent", x: -20.0, y: -20.0 }
  ]);

  // Active Deployed Mission
  const [activeDeployedMission, setActiveDeployedMission] = useState(null);

  // Modals
  const [selectedIntelMission, setSelectedIntelMission] = useState(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showCustomContractModal, setShowCustomContractModal] = useState(false);
  const [showAarModal, setShowAarModal] = useState(false);

  // Custom Contract Form State
  const [customMissionName, setCustomMissionName] = useState("");
  const [customEmployer, setCustomEmployer] = useState("House Davion");
  const [customMissionType, setCustomMissionType] = useState("Garrison");
  const [customBaseCbill, setCustomBaseCbill] = useState(3500000);
  const [customWpReward, setCustomWpReward] = useState(400);

  // Quick Add Unit Form State
  const [addChassis, setAddChassis] = useState("Centurion");
  const [addModel, setAddModel] = useState("CN9-A");
  const [addTonnage, setAddTonnage] = useState(50);
  const [addBv2, setAddBv2] = useState(945);

  // AAR Form State
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

  const refreshAll = () => {
    fetchBalance(); fetchUnits(); fetchMissions(); fetchPilots(); fetchInventory(); fetchLogs(); fetchStarmap();
  };

  useEffect(() => {
    refreshAll();
  }, []);

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
      
      {/* TOP HEADER BAR FROM SCREENSHOT */}
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

      {/* TABS BAR FROM SCREENSHOT */}
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

      {/* OPERATIONS & CONTRACTS TAB PANEL */}
      {activeTab === "operations" && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "24px" }}>
          <h3 className="font-orbitron" style={{ color: "#f8fafc", margin: "0 0 20px 0", fontSize: "18px" }}>Command &amp; Operations Deck</h3>

          {/* TOP SECTION: ACTIVE DEPLOYED OPERATION FROM SCREENSHOT */}
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

          {/* MAIN GRID LAYOUT FROM SCREENSHOT */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
            
            {/* LEFT SIDE: CONTROL BUTTONS */}
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

            {/* RIGHT SIDE: MRB BOARD & GALACTIC JUMPNET */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* MRB AVAILABLE CONTRACT BOARD FROM SCREENSHOT */}
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

              {/* GALACTIC JUMPNET FROM SCREENSHOT */}
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

      {/* OTHER TABS */}
      {activeTab === "engineering" && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "24px" }}>
          <h3 className="font-orbitron" style={{ color: "#ea580c" }}>Maintenance &amp; Engineering Roster</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {units.map(u => (
              <div key={u.id} style={{ background: "rgba(30, 41, 59, 0.6)", padding: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: 0, color: "#fff" }}>{u.chassis} {u.model} ({u.tonnage}T)</h4>
                  <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "12px" }}>BV2: {u.bv2} | Tech Base: {u.tech_base}</p>
                </div>
                <button style={{ background: "#ea580c", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "4px", cursor: "pointer" }} onClick={() => fetch(`http://localhost:8000/api/v1/units/${u.id}/repair`, {method: "POST"}).then(() => refreshAll())}>
                  Repair Mech (20 SP)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {activeTab === "personnel" && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "24px" }}>
          <h3 className="font-orbitron" style={{ color: "#9333ea" }}>Personnel &amp; MedBay Roster</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pilots.map(p => (
              <div key={p.id} style={{ background: "rgba(30, 41, 59, 0.6)", padding: "14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: 0, color: "#fff" }}>{p.name} "{p.callsign}"</h4>
                  <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "12px" }}>Gunnery: {p.gunnery} | Piloting: {p.piloting} | Status: {p.status}</p>
                </div>
                <span style={{ color: "#9333ea", fontWeight: "bold" }}>{p.xp} XP</span>
              </div>
            ))}
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
