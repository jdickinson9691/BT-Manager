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
  const [onlineSarnaMode, setOnlineSarnaMode] = useState(true);
  const [onlineMegamekMode, setOnlineMegamekMode] = useState(true);
  
  // STEP-BY-STEP CAMPAIGN WORKFLOW NAVIGATION
  const [activeStep, setActiveStep] = useState(1); // 1: Contract & Transit, 2: Deployment & Lances, 3: Combat AAR & Salvage, 4: Tech Bay & MechLab, 5: Personnel & MedBay, 6: Financial Ledger

  // Data lists with default fallbacks
  const [units, setUnits] = useState([
    { id: 1, chassis: "Marauder", model: "MAD-3R", tonnage: 75, bv2: 1363, status: "Operational", armor_damage: 0, structure_damage: 0, tech_base: "Inner Sphere", assigned_pilot: "Lt. Natasha Kerensky" },
    { id: 2, chassis: "Warhammer", model: "WHM-6R", tonnage: 70, bv2: 1299, status: "Operational", armor_damage: 15, structure_damage: 0, tech_base: "Inner Sphere", assigned_pilot: "Kaelen Cross" },
    { id: 3, chassis: "Centurion", model: "CN9-A", tonnage: 50, bv2: 945, status: "Operational", armor_damage: 0, structure_damage: 0, tech_base: "Inner Sphere", assigned_pilot: "Varian Vance" }
  ]);

  const [missions, setMissions] = useState([
    { id: 1, name: "Planetary Defense", employer: "House Davion", mission_type: "Garrison Defense", cbill_reward: 3500000, wp_reward: 350, status: "Available", enemy_faction: "Draconis Combine", difficulty: "Medium" },
    { id: 2, name: "Supply Depot Raid", employer: "Draconis Combine Mustered Soldier", mission_type: "Objective Raid", cbill_reward: 4200000, wp_reward: 450, status: "Available", enemy_faction: "Federated Suns", difficulty: "Hard" },
    { id: 3, name: "Perimeter Recon Patrol", employer: "Independent Local Government", mission_type: "Reconnaissance", cbill_reward: 2800000, wp_reward: 300, status: "Available", enemy_faction: "Pirates", difficulty: "Light" }
  ]);

  const [pilots, setPilots] = useState([
    { id: 1, name: "Lt. Natasha Kerensky", callsign: "Black Widow", gunnery: 2, piloting: 3, status: "Active", injuries: 0, days_remaining: 0, xp: 85, spa: "Sharpshooter (+1 Accuracy to Called Shots)", kills: 5, salary: 75000, assigned_unit: "Marauder MAD-3R" },
    { id: 2, name: "Kaelen Cross", callsign: "Bishop", gunnery: 3, piloting: 4, status: "Active", injuries: 0, days_remaining: 0, xp: 40, spa: "Tactical Genius (Reroll Initiative Once)", kills: 2, salary: 45000, assigned_unit: "Warhammer WHM-6R" },
    { id: 3, name: "Varian Vance", callsign: "Grim", gunnery: 4, piloting: 4, status: "Active", injuries: 0, days_remaining: 0, xp: 50, spa: "Marksman (Energy Weapon Range Boost)", kills: 3, salary: 40000, assigned_unit: "Centurion CN9-A" },
    { id: 4, name: "Robert Clay", callsign: "Dusty", gunnery: 4, piloting: 5, status: "Injured", injuries: 2, days_remaining: 12, xp: 20, spa: "None", kills: 1, salary: 35000, assigned_unit: "Unassigned" }
  ]);

  const [hiringCandidates, setHiringCandidates] = useState([
    { name: "Rana Hawkins", callsign: "Valkyrie", gunnery: 3, piloting: 3, signing_bonus: 450000 },
    { name: "Erik Sandstrom", callsign: "Viking", gunnery: 3, piloting: 4, signing_bonus: 350000 },
    { name: "Valerie Vance", callsign: "Siren", gunnery: 4, piloting: 4, signing_bonus: 250000 }
  ]);

  const [inventory, setInventory] = useState([
    { id: 1, part_name: "AC/20 Autocannon", category: "Weaponry", stock: 2, cost: 500000 },
    { id: 2, part_name: "Particle Projector Cannon (PPC)", category: "Weaponry", stock: 3, cost: 300000 },
    { id: 3, part_name: "Medium Laser", category: "Weaponry", stock: 6, cost: 80000 },
    { id: 4, part_name: "Heat Sink", category: "Internal", stock: 12, cost: 20000 },
    { id: 5, part_name: "Ferro-Fibrous Armor Plate (5T)", category: "Armor", stock: 4, cost: 150000 }
  ]);

  const [logs, setLogs] = useState([]);
  
  const [starmapSystems, setStarmapSystems] = useState([
    { name: "Galax", faction: "Federated Suns", x: 15.0, y: 16.2, jump_cost: 120000 },
    { name: "Tukayyid", faction: "ComStar", x: -12.0, y: 24.3, jump_cost: 100000 },
    { name: "Solaris VII", faction: "Independent", x: -20.0, y: -20.0, jump_cost: 150000 }
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

  const [showLauncherModal, setShowLauncherModal] = useState(false);
  const [existingCampaignsList, setExistingCampaignsList] = useState([
    { id: 1, name: "Succession Wars 3025 (Wolf's Irregulars)", current_date: "3025-01-15", cbill_balance: 15000000.0 }
  ]);
  const [selectedExistingCampId, setSelectedExistingCampId] = useState(1);

  const [newCampName, setNewCampName] = useState("Succession Wars 3025");
  const [newCompanyName, setNewCompanyName] = useState("Wolf's Irregulars");
  const [newCommanderName, setNewCommanderName] = useState("Major Jaime Wolf");
  const [newEra, setNewEra] = useState("3025");
  const [newFaction, setNewFaction] = useState("House Davion");

  const fetchCampaignsList = () => {
    fetch("http://localhost:8000/api/v1/campaigns")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setExistingCampaignsList(data); })
      .catch(() => {});
  };

  const handleCreateNewCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/campaigns/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: newCampName,
          company_name: newCompanyName,
          commander_name: newCommanderName,
          era: newEra,
          faction: newFaction,
          starting_funds: 15000000.0
        })
      });
      if (res.ok) {
        alert(`New Campaign '${newCampName}' initialized for ${newCompanyName} (${newFaction})! Cached MUL & Sarna unit data linked.`);
        setShowLauncherModal(false);
        refreshAll();
      }
    } catch (err) {}
  };

  // Modals & Form States
  const [selectedIntelMission, setSelectedIntelMission] = useState(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showCustomContractModal, setShowCustomContractModal] = useState(false);
  const [showAarModal, setShowAarModal] = useState(false);

  const [customMissionName, setCustomMissionName] = useState("");
  const [customEmployer, setCustomEmployer] = useState("House Davion");
  const [customMissionType, setCustomMissionType] = useState("Garrison");
  const [customBaseCbill, setCustomBaseCbill] = useState(3500000);
  const [customWpReward, setCustomWpReward] = useState(400);

  const [addChassis, setAddChassis] = useState("Centurion");
  const [addModel, setAddModel] = useState("CN9-A");
  const [addTonnage, setAddTonnage] = useState(50);
  const [addBv2, setAddBv2] = useState(945);

  const [aarSalvageCash, setAarSalvageCash] = useState(500000);
  const [salvagedComponentsClaimed, setSalvagedComponentsClaimed] = useState(["PPC", "Medium Laser"]);

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
  const addComponentToLoadout = (compName) => { setSelectedLoadout([...selectedLoadout, compName]); };
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
      if (mission.id) {
        await fetch(`http://localhost:8000/api/v1/missions/${mission.id}/accept`, { method: "POST" });
      }
    } catch (e) {}
    alert(`Contract Signed: '${mission.name}' (${mission.employer})! Proceeding to Step 2: Force Deployment.`);
    setActiveStep(2);
    refreshAll();
  };

  const handleJumpToSystem = async (system) => {
    const dx = system.x - currentSystem.x;
    const dy = system.y - currentSystem.y;
    const dist = Number((Math.sqrt(dx * dx + dy * dy) || 22.1).toFixed(1));
    const cost = Math.round(dist * 5000.0);

    try {
      const res = await fetch("http://localhost:8000/api/v1/starmap/jump", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_system: system.name, distance_ly: dist, jump_cost: cost })
      });
      if (res.ok) {
        setCurrentSystem(system);
        alert(`JumpShip arrived at system ${system.name}! Stardate advanced +7 days.`);
        refreshAll();
        return;
      }
    } catch (e) {}

    setCurrentSystem(system);
    alert(`JumpShip arrived at system ${system.name}!`);
    refreshAll();
  };

  const handleBuyMarketPart = async (partName, category, cost) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/inventory/buy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part_name: partName, category, cost })
      });
      if (res.ok) { fetchInventory(); fetchBalance(); fetchLogs(); }
    } catch (e) {}
  };

  const handleSellInventoryPart = async (partId, cost) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/inventory/${partId}/sell`, { method: "POST" });
      if (res.ok) { fetchInventory(); fetchBalance(); fetchLogs(); }
    } catch (e) {}
  };

  const handleCreateCustomContract = async (e) => {
    e.preventDefault();
    const newMission = {
      id: Date.now(),
      name: customMissionName || "Operation Iron Shield",
      employer: customEmployer || "House Davion",
      enemy_faction: "Draconis Combine",
      mission_type: customMissionType || "Garrison Defense",
      cbill_reward: Number(customBaseCbill) || 3500000,
      wp_reward: Number(customWpReward) || 350,
      salvage_rights: "Shared (50%)",
      difficulty: "Medium"
    };

    try {
      const res = await fetch("http://localhost:8000/api/v1/missions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMission.name,
          employer: newMission.employer,
          mission_type: newMission.mission_type,
          base_cbill: newMission.cbill_reward,
          wp_reward: newMission.wp_reward,
          salvage_rights: newMission.salvage_rights
        })
      });
      if (res.ok) {
        setCustomMissionName("");
        setShowCustomContractModal(false);
        alert(`Custom Contract '${newMission.name}' posted to MRB Contract Hall!`);
        fetchMissions(); fetchLogs();
        return;
      }
    } catch (err) {}

    // Immediate local state update fallback
    setMissions(prev => [newMission, ...prev]);
    setCustomMissionName("");
    setShowCustomContractModal(false);
    alert(`Custom Contract '${newMission.name}' posted to MRB Contract Hall!`);
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
        setActiveStep(4); // Advance to Step 4: Tech Bay & Repairs
      }
    } catch (err) {}
  };

  // Lance Stats
  const totalLanceTonnage = units.reduce((acc, u) => acc + (u.tonnage || 0), 0);
  const totalLanceBv2 = units.reduce((acc, u) => acc + (u.bv2 || 0), 0);

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

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-mono" style={{ color: "#10b981", fontSize: "15px", fontWeight: "bold" }}>
            C-BILLS: ${(balance.CBills || 15000000).toLocaleString()}
          </span>

          {/* INTEGRATION NETWORK STATUS TOGGLES */}
          <div style={{ display: "flex", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* MUL TOGGLE */}
            <button
              onClick={() => setOnlineMulMode(!onlineMulMode)}
              style={{
                background: onlineMulMode ? "#0284c7" : "rgba(255,255,255,0.1)",
                color: onlineMulMode ? "#fff" : "#cbd5e1",
                border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer"
              }}
            >
              🌐 MUL: {onlineMulMode ? "Online" : "Cached"}
            </button>

            {/* SARNA TOGGLE */}
            <button
              onClick={() => setOnlineSarnaMode(!onlineSarnaMode)}
              style={{
                background: onlineSarnaMode ? "#38bdf8" : "rgba(255,255,255,0.1)",
                color: onlineSarnaMode ? "#0f172a" : "#cbd5e1",
                border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer"
              }}
            >
              📖 Sarna: {onlineSarnaMode ? "Online" : "Cached"}
            </button>

            {/* MEGAMEK TOGGLE */}
            <button
              onClick={() => setOnlineMegamekMode(!onlineMegamekMode)}
              style={{
                background: onlineMegamekMode ? "#f59e0b" : "rgba(255,255,255,0.1)",
                color: onlineMegamekMode ? "#0f172a" : "#cbd5e1",
                border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer"
              }}
            >
              ⚙️ MegaMek: {onlineMegamekMode ? "Online" : "Cached"}
            </button>
          </div>

          <button
            onClick={() => { fetchCampaignsList(); setShowLauncherModal(true); }}
            style={{ background: "#ea580c", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
          >
            ⚙️ Switch / Setup Campaign
          </button>
        </div>
      </header>

      {/* CHRONOLOGICAL CAMPAIGN WORKFLOW STEPPER BAR */}
      <div style={{ background: "rgba(15, 20, 30, 0.9)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "10px 16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { step: 1, title: "1. 📋 Contract & Transit", color: "#ea580c" },
            { step: 2, title: "2. ⚔️ Force Deployment", color: "#0284c7" },
            { step: 3, title: "3. 🏆 Combat AAR & Salvage", color: "#f59e0b" },
            { step: 4, title: "4. 🔧 Tech Bay & MechLab", color: "#10b981" },
            { step: 5, title: "5. 🏥 Personnel & MedBay", color: "#9333ea" },
            { step: 6, title: "6. 📊 Financial Ledger", color: "#64748b" }
          ].map(s => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              style={{
                background: activeStep === s.step ? s.color : "rgba(30, 41, 59, 0.7)",
                color: "#ffffff",
                border: activeStep === s.step ? `1px solid ${s.color}` : "1px solid rgba(255, 255, 255, 0.1)",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveStep(prev => (prev % 6) + 1)}
          style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
        >
          Proceed to Step {activeStep < 6 ? activeStep + 1 : 1} ➔
        </button>
      </div>

      {/* STEP 1: CONTRACT & TRANSIT (PRE-MISSION PHASE) */}
      {activeStep === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          
          {/* LEFT: MRB AVAILABLE CONTRACT BOARD */}
          <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(234, 88, 12, 0.3)", borderRadius: "10px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#ea580c", margin: 0, fontSize: "18px" }}>
                Step 1: Mercenary Review Board (MRB) Contract Hall
              </h3>
              <button
                onClick={() => setShowCustomContractModal(true)}
                style={{ background: "#9333ea", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
              >
                + Build Custom Contract
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {missions.map(m => (
                <div key={m.id || m.name} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ color: "#fff", margin: 0, fontSize: "16px" }}>{m.name}</h4>
                      <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>
                        Employer: <strong style={{ color: "#cbd5e1" }}>{m.employer}</strong> | Target: <span style={{ color: "#f43f5e" }}>{m.enemy_faction}</span>
                      </p>
                      <p className="font-mono" style={{ color: "#10b981", fontSize: "13px", margin: "4px 0 0 0" }}>
                        Payout: ${m.cbill_reward.toLocaleString()} C-Bills | +{m.wp_reward} Warchest WP
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setSelectedIntelMission(m)}
                        style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        View Intel
                      </button>
                      <button
                        onClick={() => handleAcceptContract(m)}
                        style={{ background: "#ea580c", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Sign &amp; Deploy ➔
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: GALACTIC STARMAP & JUMPNET TRANSIT */}
          <div style={{ background: "rgba(15, 20, 30, 0.9)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "10px", padding: "24px" }}>
            <h3 className="font-orbitron" style={{ color: "#38bdf8", margin: "0 0 14px 0", fontSize: "18px" }}>
              Galactic JumpNet &amp; System Navigation
            </h3>

            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "14px", borderRadius: "8px", marginBottom: "16px" }}>
              <p style={{ color: "#10b981", fontSize: "13px", fontWeight: "bold", margin: 0 }}>
                CURRENT SYSTEM: {currentSystem.name} ({currentSystem.faction})
              </p>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0 0" }}>
                Coordinates: ({currentSystem.x.toFixed(1)}, {currentSystem.y.toFixed(1)}) | Single Jump Limit: 30 Light Years
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {jumpNetDestinations.map((sys) => {
                const dx = sys.x - currentSystem.x;
                const dy = sys.y - currentSystem.y;
                const dist = (Math.sqrt(dx * dx + dy * dy) || 22.1).toFixed(1);

                return (
                  <div key={sys.name} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "12px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ color: "#fff", fontSize: "14px" }}>{sys.name}</strong>
                      <p style={{ color: "#94a3b8", fontSize: "12px", margin: "2px 0 0 0" }}>Faction: {sys.faction} | Dist: {dist} LY</p>
                    </div>
                    <button
                      onClick={() => handleJumpToSystem(sys)}
                      style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      Jump to System
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: FORCE DEPLOYMENT & LANCE ROSTER (DEPLOYMENT PHASE) */}
      {activeStep === 2 && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(2, 132, 199, 0.3)", borderRadius: "10px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 className="font-orbitron" style={{ color: "#0284c7", margin: 0, fontSize: "18px" }}>
                Step 2: Force Deployment &amp; Command Lance Roster
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>
                Assigned Operation: <strong style={{ color: "#fff" }}>{activeDeployedMission ? activeDeployedMission.name : "Independent Engagement Patrol"}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ background: "rgba(30, 41, 59, 0.8)", padding: "8px 14px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>TOTAL LANCE TONNAGE</span>
                <p style={{ color: "#10b981", fontWeight: "bold", margin: "2px 0 0 0", fontSize: "14px" }}>{totalLanceTonnage} Tons</p>
              </div>

              <div style={{ background: "rgba(30, 41, 59, 0.8)", padding: "8px 14px", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>LANCE BATTLE VALUE</span>
                <p style={{ color: "#f59e0b", fontWeight: "bold", margin: "2px 0 0 0", fontSize: "14px" }}>{totalLanceBv2} BV2</p>
              </div>

              <button
                onClick={() => setShowAddUnitModal(true)}
                style={{ background: "#0284c7", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
              >
                + Add Mech to Lance
              </button>
            </div>
          </div>

          {/* LANCE GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {units.map(u => (
              <div key={u.id} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "18px", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <h4 style={{ color: "#fff", margin: 0, fontSize: "16px" }}>{u.chassis} {u.model}</h4>
                  <span style={{ background: "rgba(2, 132, 199, 0.2)", color: "#38bdf8", border: "1px solid #0284c7", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                    {u.tonnage} Tons
                  </span>
                </div>

                <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 6px 0" }}>
                  Assigned MechWarrior: <strong style={{ color: "#c084fc" }}>{u.assigned_pilot}</strong>
                </p>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 12px 0" }}>
                  Battle Value: <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{u.bv2} BV2</span> | Status: <span style={{ color: "#10b981" }}>{u.status}</span>
                </p>

                <button
                  onClick={() => { setActiveDeployedMission(missions[0]); setActiveStep(3); }}
                  style={{ width: "100%", background: "#ea580c", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
                >
                  🚀 Drop Lance into Combat Zone
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: COMBAT AAR & BATTLEFIELD SALVAGE (POST-BATTLE PHASE) */}
      {activeStep === 3 && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px", padding: "24px" }}>
          <h3 className="font-orbitron" style={{ color: "#f59e0b", margin: "0 0 16px 0", fontSize: "18px" }}>
            Step 3: Combat After-Action Report (AAR) &amp; Battlefield Salvage
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            
            {/* AAR SUMMARY */}
            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "20px", borderRadius: "8px" }}>
              <h4 style={{ color: "#fff", margin: "0 0 12px 0" }}>Operation Engagement Summary</h4>
              <p style={{ color: "#cbd5e1", fontSize: "13px" }}>
                Deployed Force: <strong>Wolf's Irregulars Command Lance</strong> (3 Mechs, {totalLanceTonnage}T, {totalLanceBv2} BV2)
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
                {pilots.map(p => (
                  <div key={p.id} style={{ background: "rgba(15, 23, 42, 0.8)", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ color: "#fff", fontSize: "13px" }}>{p.name} ({p.callsign})</strong>
                      <p style={{ color: "#94a3b8", fontSize: "11px", margin: "2px 0 0 0" }}>Assigned: {p.assigned_unit}</p>
                    </div>
                    <button
                      onClick={() => handleAwardXp(p.id)}
                      style={{ background: "#9333ea", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      Award +25 XP &amp; Kill
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowAarModal(true)}
                style={{ width: "100%", background: "#ea580c", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
              >
                🏆 Submit AAR &amp; Process Contract Completion
              </button>
            </div>

            {/* BATTLEFIELD SALVAGE RECOVERY */}
            <div style={{ background: "rgba(7, 10, 18, 0.9)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", padding: "20px" }}>
              <h4 style={{ color: "#f59e0b", margin: "0 0 12px 0" }}>Battlefield Salvage Recovery</h4>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 14px 0" }}>
                Select component scrap recovered from defeated enemy Mechs:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {["PPC (100% Intact)", "AC/20 Autocannon", "Medium Laser", "Ferro-Fibrous Armor Plate (5T)"].map(salv => (
                  <div key={salv} style={{ background: "rgba(30, 41, 59, 0.6)", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#fff", fontSize: "12px" }}>{salv}</span>
                    <button
                      onClick={() => alert(`Claimed ${salv} into warehouse storage!`)}
                      style={{ background: "#10b981", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      Claim Salvage
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 4: TECH BAY & MECHLAB ENGINEERING (MAINTENANCE PHASE) */}
      {activeStep === 4 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          
          {/* LEFT: ROSTER & REPAIR QUEUE */}
          <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", padding: "24px" }}>
            <h3 className="font-orbitron" style={{ color: "#10b981", margin: "0 0 18px 0", fontSize: "18px" }}>
              Step 4: Tech Bay Maintenance &amp; Parts Warehouse
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {units.map(u => (
                <div key={u.id} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#fff", fontSize: "16px" }}>{u.chassis} {u.model} ({u.tonnage}T)</h4>
                    <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: "12px" }}>
                      Armor Loss: <span style={{ color: u.armor_damage > 0 ? "#f43f5e" : "#10b981", fontWeight: "bold" }}>{u.armor_damage} pt</span>
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
                      style={{ background: "#10b981", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                    >
                      Repair (20 SP)
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* WAREHOUSE MARKET DEPOT */}
            <h4 style={{ color: "#10b981", margin: "0 0 12px 0", fontSize: "15px" }}>🛒 Market Component Depot (Buy Stock)</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {inventory.map(i => (
                <div key={i.id} style={{ background: "rgba(30, 41, 59, 0.4)", padding: "10px 14px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "13px" }}>{i.part_name}</strong>
                    <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "10px" }}>Stock: x{i.stock}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => handleBuyMarketPart(i.part_name, i.category, i.cost)} style={{ background: "#10b981", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                      Buy (${i.cost.toLocaleString()})
                    </button>
                    <button onClick={() => handleSellInventoryPart(i.id, i.cost)} style={{ background: "#ea580c", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                      Sell (+75%)
                    </button>
                  </div>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto", marginBottom: "20px" }}>
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

      {/* STEP 5: PERSONNEL & MEDBAY TRIAGE (MEDICAL & TRAINING PHASE) */}
      {activeStep === 5 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px" }}>
          
          {/* LEFT: MECHWARRIOR ROSTER & XP PROGRESSION */}
          <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(147, 51, 234, 0.3)", borderRadius: "10px", padding: "24px" }}>
            <h3 className="font-orbitron" style={{ color: "#9333ea", margin: "0 0 18px 0", fontSize: "18px" }}>
              Step 5: Personnel MedBay Triage &amp; Skill Progression
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pilots.map(p => (
                <div key={p.id} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "16px" }}>{p.name} "{p.callsign}"</h4>
                      <p style={{ color: "#94a3b8", fontSize: "12px", margin: "2px 0 0 0" }}>
                        Status: <span style={{ color: p.status === "Injured" ? "#f43f5e" : "#10b981", fontWeight: "bold" }}>{p.status} {p.days_remaining > 0 ? `(${p.days_remaining}d left in MedBay)` : ""}</span>
                      </p>
                    </div>

                    <span className="font-mono" style={{ background: "rgba(147, 51, 234, 0.2)", border: "1px solid #9333ea", color: "#9333ea", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                      {p.xp || 0} XP
                    </span>
                  </div>

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

                    {p.status === "Injured" && (
                      <button onClick={() => handleTreatMedbay(p.id)} style={{ background: "#ea580c", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                        Treat in MedBay (50 SP)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

      {/* STEP 6: FINANCIAL LEDGER & TIMELINE (LOGISTICS PHASE) */}
      {activeStep === 6 && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(100, 116, 139, 0.3)", borderRadius: "10px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 className="font-orbitron" style={{ color: "#cbd5e1", margin: 0, fontSize: "18px" }}>
              Step 6: Campaign Financial Ledger &amp; Timeline Settlement
            </h3>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleAdvanceDay} style={{ background: "#10b981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                +1 Day (Process Logistics)
              </button>
              <button onClick={handleProcessPayroll} style={{ background: "#ea580c", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                Process Monthly Payroll ($150,000)
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* MONTHLY EXPENSES BREAKDOWN */}
            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "20px", borderRadius: "8px" }}>
              <h4 style={{ color: "#ea580c", margin: "0 0 12px 0" }}>Monthly Expenditure Rates</h4>
              <p style={{ color: "#cbd5e1", fontSize: "13px" }}>Daily Base Overhead: <strong>$5,000 C-Bills / day</strong></p>
              <p style={{ color: "#cbd5e1", fontSize: "13px" }}>Pilot &amp; Tech Staff Salaries: <strong>$150,000 C-Bills / month</strong></p>
              <p style={{ color: "#10b981", fontSize: "15px", fontWeight: "bold", marginTop: "16px" }}>
                Current Treasury Balance: ${(balance.CBills || 15000000).toLocaleString()} C-Bills
              </p>
            </div>

            {/* CAMPAIGN JOURNAL LOG */}
            <div style={{ background: "rgba(7, 10, 18, 0.8)", padding: "16px", borderRadius: "8px", maxHeight: "300px", overflowY: "auto" }}>
              <h4 style={{ color: "#38bdf8", margin: "0 0 10px 0", fontSize: "14px" }}>Timeline Campaign Journal</h4>
              {logs.map(l => (
                <div key={l.id} style={{ background: "rgba(30, 41, 59, 0.5)", padding: "8px 12px", borderRadius: "4px", marginBottom: "6px" }}>
                  <span style={{ color: "#10b981", fontSize: "11px", fontWeight: "bold" }}>[{l.log_date}] {l.event_type}</span>
                  <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "2px 0 0 0" }}>{l.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RICH TACTICAL INTEL BRIEFING MODAL */}
      {selectedIntelMission && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setSelectedIntelMission(null)}>
          <div style={{ background: "#0f141e", border: "1px solid #38bdf8", borderRadius: "12px", padding: "28px", width: "580px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#38bdf8", margin: 0, fontSize: "18px" }}>
                📋 CONTRACT TACTICAL INTEL BRIEFING
              </h3>
              <button onClick={() => setSelectedIntelMission(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <h4 style={{ color: "#fff", margin: "0 0 8px 0", fontSize: "16px" }}>{selectedIntelMission.name}</h4>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 4px 0" }}>
                Employer: <strong style={{ color: "#cbd5e1" }}>{selectedIntelMission.employer}</strong> | Target: <span style={{ color: "#f43f5e" }}>{selectedIntelMission.enemy_faction || "OpFor Force"}</span>
              </p>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
                Mission Type: <strong style={{ color: "#38bdf8" }}>{selectedIntelMission.mission_type}</strong> | Difficulty: <span style={{ color: "#f59e0b" }}>{selectedIntelMission.difficulty || "Medium"}</span>
              </p>
            </div>

            {/* OPFOR INTEL & CLIMATE */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(244, 63, 94, 0.3)", padding: "12px", borderRadius: "6px" }}>
                <span style={{ fontSize: "11px", color: "#f43f5e", fontWeight: "bold" }}>🎯 ESTIMATED OPFOR THREAT</span>
                <p style={{ color: "#fff", fontSize: "13px", margin: "4px 0 0 0" }}>3x Enemy Mechs (Heavy Lance)</p>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: "2px 0 0 0" }}>Est. Tonnage: 195T | Est. BV2: ~3,800</p>
              </div>

              <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "12px", borderRadius: "6px" }}>
                <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "bold" }}>🌡️ PLANETARY CLIMATE</span>
                <p style={{ color: "#fff", fontSize: "13px", margin: "4px 0 0 0" }}>Arid / Extreme Heat (+20%)</p>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: "2px 0 0 0" }}>Heat Sink Dissipation: -15% Penalty</p>
              </div>
            </div>

            {/* FINANCIAL & SALVAGE CLAUSES */}
            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "16px", borderRadius: "8px", marginBottom: "18px" }}>
              <h4 style={{ color: "#10b981", margin: "0 0 10px 0", fontSize: "14px" }}>Contract Terms &amp; Compensation</h4>
              <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "0 0 4px 0" }}>
                Base C-Bill Payout: <strong style={{ color: "#10b981" }}>${(selectedIntelMission.cbill_reward || 3500000).toLocaleString()} C-Bills</strong>
              </p>
              <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "0 0 4px 0" }}>
                Warchest WP Bonus: <strong style={{ color: "#f59e0b" }}>+{(selectedIntelMission.wp_reward || 350)} WP</strong>
              </p>
              <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "0 0 4px 0" }}>
                Salvage Recovery Clause: <strong style={{ color: "#cbd5e1" }}>{selectedIntelMission.salvage_rights || "Shared (50%)"}</strong>
              </p>
              <p style={{ color: "#cbd5e1", fontSize: "13px", margin: 0 }}>
                Battle Loss Compensation (BLC): <strong style={{ color: "#cbd5e1" }}>50% Armor/Structure Coverage</strong>
              </p>
            </div>

            {/* FORCE READINESS COMPARISON */}
            <div style={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>ACTIVE COMMAND LANCE READINESS</span>
                <p style={{ color: "#10b981", fontSize: "14px", fontWeight: "bold", margin: "2px 0 0 0" }}>
                  {totalLanceTonnage} Tons ({units.length} Mechs) | {totalLanceBv2} BV2
                </p>
              </div>
              <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                Suitability: High Match
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button style={{ background: "#475569", border: "none", color: "#fff", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }} onClick={() => setSelectedIntelMission(null)}>Close Briefing</button>
              <button style={{ background: "#ea580c", border: "none", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }} onClick={() => { handleAcceptContract(selectedIntelMission); setSelectedIntelMission(null); }}>Sign &amp; Deploy Contract ➔</button>
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }} onClick={() => setShowCustomContractModal(false)}>
          <div style={{ background: "#0f141e", border: "1px solid #9333ea", borderRadius: "12px", padding: "28px", width: "620px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#9333ea", margin: 0, fontSize: "18px" }}>
                🛠️ BUILD CUSTOM MERCENARY CONTRACT
              </h3>
              <button onClick={() => setShowCustomContractModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleCreateCustomContract} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>OPERATION / CONTRACT NAME</label>
                <input type="text" placeholder="e.g. Operation Iron Shield" value={customMissionName} onChange={e => setCustomMissionName(e.target.value)} required style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>EMPLOYER FACTION</label>
                  <select value={customEmployer} onChange={e => setCustomEmployer(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    <option value="House Davion">House Davion (Federated Suns)</option>
                    <option value="Draconis Combine Mustered Soldier">Draconis Combine (Kurita)</option>
                    <option value="House Steiner">House Steiner (Lyran Commonwealth)</option>
                    <option value="House Marik">House Marik (Free Worlds League)</option>
                    <option value="House Liao">House Liao (Capellan Confederation)</option>
                    <option value="ComStar">ComStar</option>
                    <option value="Independent Local Government">Independent Local Government</option>
                    <option value="Solaris VII Arena">Solaris VII Syndicate</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>TARGET ENEMY OPFOR</label>
                  <select defaultValue="Draconis Combine" style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    <option value="Draconis Combine">Draconis Combine (Kurita)</option>
                    <option value="Federated Suns">Federated Suns (House Davion)</option>
                    <option value="Capellan Confederation">Capellan Confederation (Liao)</option>
                    <option value="Free Worlds League">Free Worlds League (Marik)</option>
                    <option value="Lyran Commonwealth">Lyran Commonwealth (Steiner)</option>
                    <option value="Pirate Outlaws">Pirate Outlaws &amp; Banditti</option>
                    <option value="Clan Wolf">Clan Wolf (Clans)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>MISSION TYPE / OBJECTIVE</label>
                  <select value={customMissionType} onChange={e => setCustomMissionType(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    <option value="Garrison Defense">Garrison Defense &amp; Patrol</option>
                    <option value="Objective Raid">Objective Raid &amp; Extraction</option>
                    <option value="Reconnaissance Patrol">Deep Reconnaissance Patrol</option>
                    <option value="Base Assault">Base Siege &amp; Destruction</option>
                    <option value="VIP Convoy Escort">VIP Convoy Escort</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>PLANETARY CLIMATE</label>
                  <select defaultValue="Arid / Extreme Heat (+20%)" style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    <option value="Standard Moderate">Standard Moderate (+0 Heat)</option>
                    <option value="Arid / Extreme Heat (+20%)">Arid / Extreme Heat (+20% Heat)</option>
                    <option value="Sub-Zero Ice World">Sub-Zero Ice World (-10% Heat)</option>
                    <option value="Vacuum / Airless Moon">Vacuum / Airless Moon (+1 Energy Heat)</option>
                    <option value="Low Gravity (0.5g)">Low Gravity (0.5g) (+1 Jump MP)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>BASE C-BILL PAYOUT ($)</label>
                  <input type="number" value={customBaseCbill} onChange={e => setCustomBaseCbill(e.target.value)} required style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }} />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>WARCHEST WP REWARD</label>
                  <input type="number" value={customWpReward} onChange={e => setCustomWpReward(e.target.value)} required style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>SALVAGE RIGHTS CLAUSE</label>
                  <select defaultValue="Shared (50%)" style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    <option value="Shared (50%)">Shared Salvage (50%)</option>
                    <option value="Full Salvage (100%)">Full Salvage Rights (100%)</option>
                    <option value="Exchange Value (25%)">Exchange Value Only (25%)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>BATTLE LOSS COMP (BLC)</label>
                  <select defaultValue="50% Coverage" style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    <option value="50% Coverage">50% Armor/Structure Coverage</option>
                    <option value="75% Heavy Coverage">75% Heavy BLC Coverage</option>
                    <option value="100% Full Compensation">100% Full BLC Coverage</option>
                    <option value="0% None">0% None</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" style={{ background: "#475569", border: "none", color: "#fff", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }} onClick={() => setShowCustomContractModal(false)}>Cancel</button>
                <button type="submit" style={{ background: "#9333ea", border: "none", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>🚀 Post Contract to MRB Board</button>
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

      {/* CAMPAIGN SETUP & LAUNCHER MODAL */}
      {showLauncherModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }} onClick={() => setShowLauncherModal(false)}>
          <div style={{ background: "#0f141e", border: "1px solid #ea580c", borderRadius: "12px", padding: "28px", width: "620px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#ea580c", margin: 0, fontSize: "20px" }}>
                BT-MANAGER CAMPAIGN LAUNCHER
              </h3>
              <button onClick={() => setShowLauncherModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            {/* INTEGRATION BADGES */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <span style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#10b981", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                🌐 MUL Cache Linked
              </span>
              <span style={{ background: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", color: "#38bdf8", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                📖 Sarna Wiki Sync
              </span>
              <span style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid #f59e0b", color: "#f59e0b", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                ⚙️ MegaMek Specs Ready
              </span>
            </div>

            {/* SECTION 1: LOAD EXISTING CAMPAIGN */}
            {existingCampaignsList.length > 0 && (
              <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ color: "#38bdf8", margin: "0 0 10px 0", fontSize: "14px" }}>Load Saved Campaign</h4>
                <select
                  value={selectedExistingCampId}
                  onChange={e => setSelectedExistingCampId(Number(e.target.value))}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "12px" }}
                >
                  {existingCampaignsList.map(c => (
                    <option key={c.id} value={c.id}>
                      ID {c.id}: {c.name} — Date: {c.current_date} — Balance: ${(c.cbill_balance || 15000000).toLocaleString()}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => { setShowLauncherModal(false); refreshAll(); }}
                  style={{ width: "100%", background: "#10b981", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
                >
                  Load Selected Campaign
                </button>
              </div>
            )}

            {/* SECTION 2: CREATE NEW CAMPAIGN */}
            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "18px", borderRadius: "8px" }}>
              <h4 style={{ color: "#ea580c", margin: "0 0 14px 0", fontSize: "14px" }}>Create New Campaign</h4>
              <form onSubmit={handleCreateNewCampaignSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>CAMPAIGN NAME</label>
                  <input type="text" value={newCampName} onChange={e => setNewCampName(e.target.value)} required style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>SELECT BATTLETECH ERA</label>
                    <select value={newEra} onChange={e => setNewEra(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                      <option value="3025">Late Succession War (3020–3049)</option>
                      <option value="3050">Clan Invasion (3050–3061)</option>
                      <option value="2750">Star League (2571–2780)</option>
                      <option value="3062">Civil War &amp; Jihad (3062–3085)</option>
                      <option value="3151">ilClan Era (3151+)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>SELECT PLAYER FACTION</label>
                    <select value={newFaction} onChange={e => setNewFaction(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                      <option value="House Davion">House Davion (Federated Suns)</option>
                      <option value="House Draconis Combine">House Draconis Combine (Kurita)</option>
                      <option value="House Steiner">House Steiner (Lyran Commonwealth)</option>
                      <option value="House Marik">House Marik (Free Worlds League)</option>
                      <option value="House Liao">House Liao (Capellan Confederation)</option>
                      <option value="ComStar">ComStar / Word of Blake</option>
                      <option value="Wolf's Dragoons">Wolf's Dragoons / Independent Mercenary</option>
                      <option value="Clan Wolf">Clan Wolf / Clan Jade Falcon</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>MERCENARY COMPANY NAME</label>
                    <input type="text" value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} required style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }} />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>COMMANDER NAME</label>
                    <input type="text" value={newCommanderName} onChange={e => setNewCommanderName(e.target.value)} required style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }} />
                  </div>
                </div>

                <button type="submit" style={{ width: "100%", background: "#ea580c", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", marginTop: "8px" }}>
                  🚀 Create &amp; Launch New Campaign
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
