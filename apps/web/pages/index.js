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
    { id: 1, name: "Succession Wars 3025 (Wolf's Irregulars)", current_date: "3025-01-15", cbill_balance: 15000000.0, era: "3025" }
  ]);
  const [selectedExistingCampId, setSelectedExistingCampId] = useState(1);

  const [launcherWizardStep, setLauncherWizardStep] = useState(1); // 1 = Logistics, 2 = Custom Mechs & Pilots
  const [newCampName, setNewCampName] = useState("Succession Wars 3025");
  const [newCompanyName, setNewCompanyName] = useState("Wolf's Irregulars");
  const [newCommanderName, setNewCommanderName] = useState("Major Jaime Wolf");
  const [newEra, setNewEra] = useState("3025");
  const [newFaction, setNewFaction] = useState("House Davion");

  const [wizardUnits, setWizardUnits] = useState([]);
  const [wizardPilots, setWizardPilots] = useState([]);

  const ERA_PRESETS = {
    "2750": {
      units: [
        { chassis: "Royal Marauder", model: "MAD-1R", tonnage: 75, bv2: 1720, tech_base: "Inner Sphere SLDF" },
        { chassis: "Black Knight", model: "BL-6-KNT", tonnage: 75, bv2: 1640, tech_base: "Inner Sphere SLDF" },
        { chassis: "Orion", model: "ON1-K", tonnage: 75, bv2: 1429, tech_base: "Inner Sphere SLDF" },
        { chassis: "Crab", model: "CRB-27", tonnage: 50, bv2: 1198, tech_base: "Inner Sphere SLDF" }
      ],
      pilots: [
        { name: "Major Amanda Cameron", callsign: "Regina", gunnery: 2, piloting: 3, spa: "Royal Marksmanship (+1 Energy Accuracy)", xp: 85 },
        { name: "Captain Arthur Pendelton", callsign: "Lancelot", gunnery: 3, piloting: 3, spa: "Commanding Presence (+1 Initiative)", xp: 60 }
      ]
    },
    "2821": {
      units: [
        { chassis: "BattleMaster", model: "BLR-1D", tonnage: 85, bv2: 1505, tech_base: "Inner Sphere" },
        { chassis: "Thunderbolt", model: "TDB-5S", tonnage: 65, bv2: 1335, tech_base: "Inner Sphere" },
        { chassis: "Archer", model: "ARC-2K", tonnage: 70, bv2: 1356, tech_base: "Inner Sphere" },
        { chassis: "Wolverine", model: "WVR-6R", tonnage: 55, bv2: 1101, tech_base: "Inner Sphere" }
      ],
      pilots: [
        { name: "Commander Charles Marik", callsign: "Eagle", gunnery: 3, piloting: 4, spa: "Iron Will (Panic Resistance)", xp: 65 },
        { name: "Lt. Greta Von Doom", callsign: "Valkyrie", gunnery: 3, piloting: 4, spa: "Pain Resistance", xp: 50 }
      ]
    },
    "3025": {
      units: [
        { chassis: "Marauder", model: "MAD-3R", tonnage: 75, bv2: 1363, tech_base: "Inner Sphere" },
        { chassis: "Warhammer", model: "WHM-6R", tonnage: 70, bv2: 1299, tech_base: "Inner Sphere" },
        { chassis: "Shadow Hawk", model: "SHD-2H", tonnage: 55, bv2: 1064, tech_base: "Inner Sphere" },
        { chassis: "Centurion", model: "CN9-A", tonnage: 50, bv2: 945, tech_base: "Inner Sphere" }
      ],
      pilots: [
        { name: "Jaime Wolf", callsign: "Wolf-1", gunnery: 2, piloting: 3, spa: "Tactical Genius (Reroll Initiative Once)", xp: 90 },
        { name: "Lt. Natasha Kerensky", callsign: "Black Widow", gunnery: 2, piloting: 3, spa: "Sharpshooter (+1 Accuracy to Called Shots)", xp: 85 }
      ]
    },
    "3050": {
      units: [
        { chassis: "Timber Wolf", model: "Prime", tonnage: 75, bv2: 2737, tech_base: "Clan" },
        { chassis: "Mad Dog", model: "Prime", tonnage: 60, bv2: 2210, tech_base: "Clan" },
        { chassis: "Bushwacker", model: "BSW-S2", tonnage: 55, bv2: 1410, tech_base: "Inner Sphere" },
        { chassis: "Axman", model: "AXM-1N", tonnage: 65, bv2: 1380, tech_base: "Inner Sphere" }
      ],
      pilots: [
        { name: "Star Commander Vlad Ward", callsign: "Wolf-Alpha", gunnery: 2, piloting: 2, spa: "Trueborn Reflexes (+1 Piloting)", xp: 100 },
        { name: "Phelan Kell", callsign: "Wolf-Beta", gunnery: 3, piloting: 3, spa: "Cluster Targeting (+1 Missile Accuracy)", xp: 75 }
      ]
    },
    "3062": {
      units: [
        { chassis: "Thanatos", model: "THS-4S", tonnage: 75, bv2: 1850, tech_base: "Inner Sphere" },
        { chassis: "Uziel", model: "UZL-2S", tonnage: 50, bv2: 1420, tech_base: "Inner Sphere" },
        { chassis: "Hauptmann", model: "HA1-O", tonnage: 95, bv2: 2150, tech_base: "Inner Sphere" },
        { chassis: "Mad Cat Mk II", model: "Standard", tonnage: 90, bv2: 2950, tech_base: "Clan" }
      ],
      pilots: [
        { name: "Colonel George Hasek", callsign: "Duke", gunnery: 2, piloting: 3, spa: "Gunslinger (+1 Dual Fire)", xp: 95 },
        { name: "Major Daniel Davion", callsign: "Fox-1", gunnery: 3, piloting: 3, spa: "Sniper (Range Accuracy)", xp: 80 }
      ]
    },
    "3068": {
      units: [
        { chassis: "Archangel", model: "C-ANG-O Dominus", tonnage: 100, bv2: 2350, tech_base: "Word of Blake" },
        { chassis: "Seraph", model: "C-SRP-O Dominus", tonnage: 85, bv2: 2120, tech_base: "Word of Blake" },
        { chassis: "Legacy", model: "LGC-01", tonnage: 80, bv2: 1890, tech_base: "Inner Sphere" },
        { chassis: "Devastator", model: "DVS-2", tonnage: 100, bv2: 2420, tech_base: "Inner Sphere" }
      ],
      pilots: [
        { name: "Preceptor Apollyon", callsign: "Dominus", gunnery: 2, piloting: 2, spa: "Cybernetic Uplink (+1 C3 Network)", xp: 110 },
        { name: "Adept Trent", callsign: "Adept-1", gunnery: 3, piloting: 3, spa: "Pain Suppression", xp: 70 }
      ]
    },
    "3151": {
      units: [
        { chassis: "Savage Wolf", model: "Prime", tonnage: 75, bv2: 2890, tech_base: "Mixed Tech" },
        { chassis: "Regent", model: "RGT-1A", tonnage: 90, bv2: 2750, tech_base: "Mixed Tech" },
        { chassis: "Hammerhead", model: "HMR-HD", tonnage: 45, bv2: 1580, tech_base: "Inner Sphere" },
        { chassis: "Dominator", model: "Standard", tonnage: 65, bv2: 2190, tech_base: "Mixed Tech" }
      ],
      pilots: [
        { name: "Alaric Ward", callsign: "ilKhan", gunnery: 1, piloting: 2, spa: "Master Tactician", xp: 150 },
        { name: "Chance Vickers", callsign: "Vanguard", gunnery: 2, piloting: 3, spa: "Alpha Strike Master", xp: 90 }
      ]
    }
  };

  const handleAdvanceToWizardStep2 = (e) => {
    e.preventDefault();
    const preset = ERA_PRESETS[newEra] || ERA_PRESETS["3025"];
    setWizardUnits(JSON.parse(JSON.stringify(preset.units)));
    setWizardPilots(JSON.parse(JSON.stringify(preset.pilots)));
    setLauncherWizardStep(2);
  };

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
          starting_funds: 15000000.0,
          custom_units: wizardUnits,
          custom_pilots: wizardPilots
        })
      });
      if (res.ok) {
        alert(`New Campaign '${newCampName}' initialized for ${newCompanyName} (${newFaction}) with customized starting roster!`);
        setShowLauncherModal(false);
        setLauncherWizardStep(1);
        refreshAll();
      }
    } catch (err) {}
  };

  // Modals & Form States
  const [selectedIntelMission, setSelectedIntelMission] = useState(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showCustomContractModal, setShowCustomContractModal] = useState(false);
  const [showAarModal, setShowAarModal] = useState(false);
  const [showOpForSetupModal, setShowOpForSetupModal] = useState(false);

  const [activeOpForUnits, setActiveOpForUnits] = useState([
    { chassis: "Catapult", model: "CPLT-A1", tonnage: 65, bv2: 1285, tech_base: "Inner Sphere" },
    { chassis: "Warhammer", model: "WHM-6R", tonnage: 70, bv2: 1299, tech_base: "Inner Sphere" },
    { chassis: "Marauder", model: "MAD-3R", tonnage: 75, bv2: 1363, tech_base: "Inner Sphere" },
    { chassis: "Hunchback", model: "HBK-4G", tonnage: 50, bv2: 1041, tech_base: "Inner Sphere" }
  ]);
  const [activeOpForPilots, setActiveOpForPilots] = useState([
    { name: "MechWarrior Marcus Trent", callsign: "Reaper", gunnery: 3, piloting: 4, spa: "Sharpshooter (+1 Accuracy)", unit_chassis: "Catapult" },
    { name: "MechWarrior Elena Vance", callsign: "Valkyrie", gunnery: 4, piloting: 5, spa: "None", unit_chassis: "Warhammer" }
  ]);
  const [availableFactionUnits, setAvailableFactionUnits] = useState([]);
  const [pendingMissionContract, setPendingMissionContract] = useState(null);
  const [opforTargetBv, setOpForTargetBv] = useState(5463);
  const [opforConfirmed, setOpForConfirmed] = useState(false);

  const [customAlertConfig, setCustomAlertConfig] = useState({ show: false, title: "TACTICAL ALERT", message: "", onConfirm: null });

  const showAlert = (message, title = "TACTICAL ALERT", onConfirm = null) => {
    setCustomAlertConfig({ show: true, title, message, onConfirm });
  };

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

  const [aarPilotKills, setAarPilotKills] = useState({
    1: { kills: 1, enemyMech: "Catapult CPLT-A1", tonnage: 65, isBondsman: true, bondsmanName: "MechWarrior Marcus Trent" },
    2: { kills: 1, enemyMech: "Hunchback HBK-4G", tonnage: 50, isBondsman: false, bondsmanName: "" },
    3: { kills: 0, enemyMech: "None", tonnage: 0, isBondsman: false, bondsmanName: "" },
    4: { kills: 0, enemyMech: "None", tonnage: 0, isBondsman: false, bondsmanName: "" }
  });

  const [selectedDropZone, setSelectedDropZone] = useState("Alpha DZ (Flat Plains)");
  const [showReadinessAlertModal, setShowReadinessAlertModal] = useState(false);
  const [readinessIssues, setReadinessIssues] = useState([]);

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpActiveTab, setHelpActiveTab] = useState("tutorial");
  const [expandedHelpSection, setExpandedHelpSection] = useState(null);

  const [aarUnitDamage, setAarUnitDamage] = useState({});

  const [negPayoutMult, setNegPayoutMult] = useState(1.0);
  const [negSalvagePct, setNegSalvagePct] = useState(50);
  const [negBlcPct, setNegBlcPct] = useState(50);

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
    setPendingMissionContract(mission);
    const targetBv = mission.negotiated_opfor_bv || totalLanceBv2 || 5463;
    setOpForTargetBv(targetBv);
    setOpForConfirmed(false);

    // Fetch era & faction specific units for OpFor review
    try {
      const res = await fetch("http://localhost:8000/api/v1/contracts/opfor/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_bv: targetBv, era: balance.era || "3025", enemy_faction: mission.enemy_faction || "OpFor Force" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.opfor_units) {
          setActiveOpForUnits(data.opfor_units);
          setActiveOpForPilots(data.opfor_pilots);
          if (data.available_faction_units) {
            setAvailableFactionUnits(data.available_faction_units);
          }
        }
      }
    } catch (e) {}

    setShowOpForSetupModal(true);
  };

  const handleConfirmOpForAndSignContract = async () => {
    const rosterBv = activeOpForUnits.reduce((acc, u) => acc + (u.bv2 || 1200), 0);
    const targetBv = opforTargetBv || totalLanceBv2 || 5463;
    const bvRatio = targetBv > 0 ? (rosterBv / targetBv) : 1.0;
    
    let basePayout = pendingMissionContract ? (pendingMissionContract.cbill_reward || 3500000) : 3500000;
    let adjustedPayout = Math.round(basePayout * bvRatio);

    const signedMission = pendingMissionContract ? {
      ...pendingMissionContract,
      cbill_reward: adjustedPayout
    } : { name: "Planetary Defense", employer: "House Davion", cbill_reward: adjustedPayout, salvage_rights: "50% Negotiated Salvage" };

    setActiveDeployedMission(signedMission);

    try {
      if (pendingMissionContract && pendingMissionContract.id) {
        await fetch(`http://localhost:8000/api/v1/missions/${pendingMissionContract.id}/accept`, { method: "POST" });
      }
    } catch (e) {}

    setOpForConfirmed(true);
    setShowOpForSetupModal(false);
    setActiveStep(2);
    refreshAll();

    showAlert(
      `Contract Signed & Locked: '${signedMission.name}' (${signedMission.employer})!\n\nOpFor Battle Value: ${rosterBv.toLocaleString()} BV2 (${(bvRatio * 100).toFixed(1)}% of Target)\nFinal Adjusted Payout: $${adjustedPayout.toLocaleString()} C-Bills\n\nProceeding to Step 2: Force Deployment & Command Lance Setup.`,
      "📋 CONTRACT OFFICIALLY SIGNED & LOCKED"
    );
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
    const pilot_logs = pilots.map(p => {
      const kData = aarPilotKills[p.id] || { kills: 0, enemyMech: "None", tonnage: 0, isBondsman: false };
      const mechParts = (kData.enemyMech || "").split(' ');
      return {
        pilot_id: p.id,
        injuries_sustained: 0,
        kills_count: Number(kData.kills) || 0,
        kills_details: kData.kills > 0 ? [{
          enemy_mech_chassis: mechParts[0] || "Enemy Mech",
          enemy_mech_model: mechParts[1] || "",
          enemy_mech_tonnage: Number(kData.tonnage) || 50,
          is_bondsman_captured: kData.isBondsman || false,
          bondsman_name: kData.bondsmanName || "Captured MechWarrior"
        }] : [],
        bondsmen_captured_count: kData.isBondsman ? 1 : 0,
        bondsmen_names: kData.isBondsman ? [kData.bondsmanName || "Captured MechWarrior"] : []
      };
    });

    const unit_logs = units.map(u => {
      const uDam = aarUnitDamage[u.id] || { armor_loss: 0, structure_loss: 0, destroyed_crit: "None" };
      const crits = uDam.destroyed_crit && uDam.destroyed_crit !== "None" ? [{ location: "CT", component_name: uDam.destroyed_crit }] : [];
      return {
        unit_id: u.id,
        armor_loss: Number(uDam.armor_loss || 0),
        structure_loss: Number(uDam.structure_loss || 0),
        critical_hits: crits
      };
    });

    try {
      const res = await fetch("http://localhost:8000/api/v1/aar/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission_id: activeDeployedMission ? activeDeployedMission.id : null,
          unit_logs,
          pilot_logs,
          salvage_cbill_value: Number(aarSalvageCash),
          salvage_items: salvagedComponentsClaimed
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`AAR Processed successfully!\n${data.narrative || ""}`);
        setShowAarModal(false);
        setActiveDeployedMission(null);
        fetchBalance(); fetchUnits(); fetchPilots(); fetchMissions(); fetchLogs();
        setActiveStep(4);
        return;
      }
    } catch (err) {}

    // Fallback: local state update
    setPilots(prev => prev.map(p => {
      const kData = aarPilotKills[p.id];
      if (kData && kData.kills > 0) {
        const gainedXp = 15 + (kData.tonnage >= 65 ? 15 : 10) + (kData.isBondsman ? 15 : 0);
        return { ...p, kills: (p.kills || 0) + Number(kData.kills), xp: (p.xp || 0) + gainedXp, bondsmen: (p.bondsmen || 0) + (kData.isBondsman ? 1 : 0) };
      }
      return { ...p, xp: (p.xp || 0) + 15 };
    }));
    setShowAarModal(false);
    setActiveDeployedMission(null);
    alert(`AAR Processed successfully! XP and Kills recorded to Personnel roster.`);
    setActiveStep(4);
  };

  const handleLaunchCombatDrop = async (ignoreWarnings = false) => {
    const issues = [];
    units.forEach(u => {
      if ((u.armor_damage || 0) > 0 || (u.structure_damage || 0) > 0) {
        issues.push(`Mech '${u.chassis} ${u.model}' has un-repaired damage (${u.armor_damage || 0} Armor / ${u.structure_damage || 0} Struct).`);
      }
    });
    pilots.forEach(p => {
      if (p.status === "Injured" || (p.injuries || 0) > 0) {
        issues.push(`Pilot '${p.name} (${p.callsign})' is injured (${p.injuries || 0} wound point(s)).`);
      }
    });

    if (issues.length > 0 && !ignoreWarnings) {
      setReadinessIssues(issues);
      setShowReadinessAlertModal(true);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/v1/missions/${activeDeployedMission ? activeDeployedMission.id : 1}/deploy`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dropzone: selectedDropZone, deployed_unit_ids: units.map(u => u.id) })
      });
      if (res.ok) {
        setShowReadinessAlertModal(false);
        alert(`🚀 COMBAT DROP LAUNCHED!\nDropShip insertion successful to ${selectedDropZone}. Entering combat theater...`);
        fetchLogs();
        setActiveStep(3);
        return;
      }
    } catch (err) {}

    setShowReadinessAlertModal(false);
    alert(`🚀 COMBAT DROP LAUNCHED!\nDropShip insertion successful to ${selectedDropZone}. Entering combat theater...`);
    setActiveStep(3);
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

  const handleToggleNetworkConfig = async (service, currentVal) => {
    const newVal = !currentVal;
    let mul = onlineMulMode;
    let sarna = onlineSarnaMode;
    let megamek = onlineMegamekMode;

    if (service === "mul") { mul = newVal; setOnlineMulMode(newVal); }
    if (service === "sarna") { sarna = newVal; setOnlineSarnaMode(newVal); }
    if (service === "megamek") { megamek = newVal; setOnlineMegamekMode(newVal); }

    try {
      const res = await fetch("http://localhost:8000/api/v1/network/config", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mul_online: mul, sarna_online: sarna, megamek_online: megamek })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || `${service.toUpperCase()} mode updated!`);
        return;
      }
    } catch (err) {}

    alert(`${service.toUpperCase()} network mode toggled to ${newVal ? "ONLINE" : "OFFLINE CACHE"}.`);
  };

  return (
    <div style={{ background: "#0b0d13", minHeight: "100vh", color: "#e2e8f0", fontFamily: "Inter, sans-serif", padding: "16px" }}>
      
      {/* TOP HEADER BAR MATCHING SCREENSHOT 2 */}
      <header style={{ background: "rgba(15, 20, 30, 0.95)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h2 className="font-orbitron" style={{ color: "#ea580c", margin: 0, fontSize: "16px", letterSpacing: "1px" }}>
            {balance.campaign_name ? balance.campaign_name.toUpperCase() : "SUCCESSION WARS 3025 | WOLF'S IRREGULARS"}
          </h2>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>ERA: <strong style={{ color: "#fbbf24" }}>{balance.era || "3025"}</strong></span>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>DATE: <strong style={{ color: "#f8fafc" }}>{balance.current_date}</strong></span>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>
            SYSTEM: <strong style={{ color: "#38bdf8" }}>{currentSystem.name}</strong> <span style={{ color: "#10b981", fontSize: "11px", fontWeight: "bold" }}>[{onlineMulMode ? "ONLINE - MUL CONNECTED" : "OFFLINE CACHE"}]</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-mono" style={{ color: "#38bdf8", fontSize: "15px", fontWeight: "bold" }}>
            WARCHEST: {(balance.WP || 1500).toLocaleString()} WP
          </span>
          <span className="font-mono" style={{ color: "#10b981", fontSize: "15px", fontWeight: "bold" }}>
            SUPPORT: {(balance.SP || 800).toLocaleString()} SP
          </span>

          {/* INTEGRATION NETWORK STATUS TOGGLES */}
          <div style={{ display: "flex", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* MUL TOGGLE */}
            <button
              onClick={() => handleToggleNetworkConfig("mul", onlineMulMode)}
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
              onClick={() => handleToggleNetworkConfig("sarna", onlineSarnaMode)}
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
              onClick={() => handleToggleNetworkConfig("megamek", onlineMegamekMode)}
              style={{
                background: onlineMegamekMode ? "#f59e0b" : "rgba(255,255,255,0.1)",
                color: onlineMegamekMode ? "#0f172a" : "#cbd5e1",
                border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer"
              }}
            >
              ⚙️ MegaMek: {onlineMegamekMode ? "Online" : "Cached"}
            </button>
          </div>

          {/* HELP & MANUAL BUTTON SURFACED NEXT TO API TOGGLES */}
          <button
            onClick={() => setShowHelpModal(true)}
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              border: "1px solid #10b981",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            ❓ Help &amp; Manual
          </button>

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
                      <p className="font-mono" style={{ color: "#38bdf8", fontSize: "13px", margin: "4px 0 0 0" }}>
                        Payout: {(m.wp_reward || 400).toLocaleString()} Warchest WP | +{m.sp_reward || 200} Support SP
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

      {/* STEP 2: FORCE DEPLOYMENT & COMMAND LANCE (DEPLOYMENT PHASE) */}
      {activeStep === 2 && (
        <div style={{ background: "rgba(15, 20, 30, 0.8)", border: "1px solid rgba(2, 132, 199, 0.3)", borderRadius: "10px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 className="font-orbitron" style={{ color: "#0284c7", margin: 0, fontSize: "18px" }}>
                Step 2: Force Deployment &amp; Command Lance Roster
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>
                Assigned Operation: <strong style={{ color: "#fff" }}>{activeDeployedMission ? activeDeployedMission.name : "Planetary Defense Skirmish"}</strong>
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

          {/* FORCE READINESS GAUGE */}
          {(() => {
            const damagedMechs = units.filter(u => (u.armor_damage || 0) > 0 || (u.structure_damage || 0) > 0);
            const injuredPilots = pilots.filter(p => p.status === "Injured" || (p.injuries || 0) > 0);
            const is100Ready = damagedMechs.length === 0 && injuredPilots.length === 0;

            return (
              <div style={{ background: is100Ready ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", border: `1px solid ${is100Ready ? "#10b981" : "#f59e0b"}`, borderRadius: "8px", padding: "12px 18px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: is100Ready ? "#10b981" : "#f59e0b", fontSize: "14px" }}>
                    {is100Ready ? "✅ FORCE READINESS: 100% OPERATIONAL & READY FOR DROP" : "⚠️ READINESS ALERT: UN-REPAIRED DAMAGE / INJURED PERSONNEL DETECTED"}
                  </strong>
                  <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "2px 0 0 0" }}>
                    {is100Ready ? "All deployed Mech chassis are at 100% armor/structure. All assigned pilots are fit for duty." : `${damagedMechs.length} Mech(s) have un-repaired damage. ${injuredPilots.length} Pilot(s) are injured.`}
                  </p>
                </div>
                {!is100Ready && (
                  <button onClick={() => setActiveStep(4)} style={{ background: "#f59e0b", color: "#0f172a", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                    🔧 Open Tech Bay Repairs ➔
                  </button>
                )}
              </div>
            );
          })()}

          {/* OPFOR TABLETOP ROSTER & BV PARITY CARD */}
          <div style={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(244, 63, 94, 0.4)", borderRadius: "8px", padding: "18px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ color: "#f43f5e", margin: 0, fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  ⚔️ OpFor Opponent Roster &amp; Tabletop Miniature Setup ({activeOpForUnits.length} Enemy Units)
                </h4>
                <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "2px 0 0 0" }}>
                  Target BV: <strong style={{ color: "#f59e0b" }}>{(opforTargetBv || totalLanceBv2 || 5463).toLocaleString()} BV2</strong> | Roster BV: <strong style={{ color: "#10b981" }}>{activeOpForUnits.reduce((acc, u) => acc + (u.bv2 || 1200), 0).toLocaleString()} BV2</strong> | Status: <strong style={{ color: opforConfirmed ? "#10b981" : "#f59e0b" }}>{opforConfirmed ? "✅ OpFor Confirmed &amp; Locked" : "⚠️ Pending Tabletop Roster Audit"}</strong>
                </p>
              </div>

              <button
                onClick={() => setShowOpForSetupModal(true)}
                style={{ background: opforConfirmed ? "#10b981" : "#f43f5e", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
              >
                {opforConfirmed ? "✅ Edit OpFor Roster" : "⚔️ Setup OpFor Tabletop Forces ➔"}
              </button>
            </div>
          </div>

          {/* DROPZONE (LZ) TERRAIN & VECTOR SELECTOR */}
          <div style={{ background: "rgba(7, 10, 18, 0.8)", border: "1px solid rgba(2, 132, 199, 0.3)", borderRadius: "8px", padding: "18px", marginBottom: "24px" }}>
            <h4 style={{ color: "#38bdf8", margin: "0 0 12px 0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
              🎯 DropZone (LZ) Terrain &amp; DropShip Insertion Vector
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "16px" }}>
              {[
                { name: "Alpha DZ (Flat Plains)", terrain: "Open Ground", bonus: "Standard Insertion (+0 Accuracy)", desc: "Balanced engagement zone." },
                { name: "Bravo DZ (Dense Forest)", terrain: "Heavy Cover", bonus: "Cover Bonus (-1 Enemy Accuracy, +1 MP Cost)", desc: "Defensive perimeter insertion." },
                { name: "Charlie DZ (Mountain Ridge)", terrain: "High Ground", bonus: "Height Advantage (+1 Range Accuracy)", desc: "Choke point tactical advantage." },
                { name: "Delta DZ (Hot Drop)", terrain: "Orbital Drop Zone", bonus: "Hot Drop (+10% Salvage Bonus, High Risk)", desc: "Direct combat insertion." }
              ].map(dz => {
                const isSelected = selectedDropZone === dz.name;
                return (
                  <div
                    key={dz.name}
                    onClick={() => setSelectedDropZone(dz.name)}
                    style={{
                      background: isSelected ? "rgba(2, 132, 199, 0.2)" : "rgba(30, 41, 59, 0.5)",
                      border: `1px solid ${isSelected ? "#0284c7" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: "6px", padding: "12px", cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ color: isSelected ? "#38bdf8" : "#fff", fontSize: "13px" }}>{dz.name}</strong>
                      {isSelected && <span style={{ color: "#38bdf8", fontSize: "11px", fontWeight: "bold" }}>[SELECTED]</span>}
                    </div>
                    <p style={{ color: "#10b981", fontSize: "11px", margin: "0 0 4px 0", fontWeight: "bold" }}>{dz.bonus}</p>
                    <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>{dz.desc}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => handleLaunchCombatDrop(false)}
                style={{ background: "#ea580c", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
              >
                🚀 Confirm DropZone &amp; Launch Combat Drop ➔
              </button>
            </div>
          </div>

          {/* LANCE GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
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
                  Battle Value: <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{u.bv2} BV2</span> | Status: <span style={{ color: (u.armor_damage || 0) > 0 ? "#f59e0b" : "#10b981" }}>{(u.armor_damage || 0) > 0 ? `Damaged (-${u.armor_damage} Armor)` : "Operational"}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* READINESS WARNING ALERT MODAL */}
      {showReadinessAlertModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }} onClick={() => setShowReadinessAlertModal(false)}>
          <div style={{ background: "#0f141e", border: "1px solid #f59e0b", borderRadius: "12px", padding: "28px", width: "540px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#f59e0b", margin: 0, fontSize: "18px" }}>
                ⚠️ PRE-DEPLOYMENT READINESS WARNING
              </h3>
              <button onClick={() => setShowReadinessAlertModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <p style={{ color: "#cbd5e1", fontSize: "13px", marginBottom: "14px" }}>
              The tactical computer has flagged un-repaired damage or injured personnel in your command lance:
            </p>

            <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "6px", padding: "12px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {readinessIssues.map((issue, idx) => (
                <span key={idx} style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "bold" }}>
                  • {issue}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => { setShowReadinessAlertModal(false); setActiveStep(4); }} style={{ background: "#334155", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                🔧 Open Tech Bay &amp; Repairs
              </button>
              <button onClick={() => handleLaunchCombatDrop(true)} style={{ background: "#ea580c", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                ⚠️ Deploy Damaged Force Anyway ➔
              </button>
            </div>
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
              {units.map(u => {
                const totalDam = (u.armor_damage || 0) + (u.structure_damage || 0);
                const estDays = totalDam > 0 ? Math.max(1, Math.floor(totalDam / 10)) : 0;
                return (
                  <div key={u.id} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: 0, color: "#fff", fontSize: "16px" }}>{u.chassis} {u.model} ({u.tonnage}T)</h4>
                      <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: "12px" }}>
                        Armor/Struct Loss: <span style={{ color: totalDam > 0 ? "#f43f5e" : "#10b981", fontWeight: "bold" }}>{u.armor_damage || 0} Armor / {u.structure_damage || 0} Struct</span>
                        {totalDam > 0 && <span style={{ color: "#38bdf8", fontSize: "11px", marginLeft: "10px", fontWeight: "bold" }}>⏱️ Est. Time: +{estDays} Day(s)</span>}
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
                        onClick={() => fetch(`http://localhost:8000/api/v1/units/${u.id}/repair`, {method: "POST"}).then(r => r.json()).then(d => { alert(d.message || "Repaired!"); refreshAll(); })}
                        style={{ background: "#10b981", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Repair ({totalDam > 0 ? `+${estDays} Days / 20 SP` : "100% OK"})
                      </button>
                    </div>
                  </div>
                );
              })}
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

            {/* CAPTURED BONDSMEN REHABILITATION & RANSOM SUITE */}
            <div style={{ background: "rgba(15, 20, 30, 0.9)", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "10px", padding: "20px", marginTop: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#f59e0b", margin: "0 0 12px 0", fontSize: "16px" }}>
                🎖️ Captured Bondsmen Rehabilitation &amp; Ransom Suite
              </h3>

              {(() => {
                const captorsWithBondsmen = pilots.filter(p => (p.bondsmen || 0) > 0);
                if (captorsWithBondsmen.length === 0) {
                  return (
                    <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
                      No enemy MechWarriors currently held in bondsman captivity. Capture bondsmen in Step 3 Combat AAR!
                    </p>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {captorsWithBondsmen.map(p => (
                      <div key={p.id} style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(245, 158, 11, 0.2)", padding: "12px", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div>
                            <strong style={{ color: "#fff", fontSize: "13px" }}>Captor: {p.name} ({p.callsign})</strong>
                            <p style={{ color: "#f59e0b", fontSize: "11px", margin: "2px 0 0 0", fontWeight: "bold" }}>
                              Captive Bondsmen Count: {p.bondsmen}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => {
                              fetch("http://localhost:8000/api/v1/personnel/bondsmen/ransom", {
                                method: "POST", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ pilot_id: p.id, ransom_amount: 250000.0 })
                              }).then(r => r.json()).then(d => { alert(d.message || "Ransomed!"); refreshAll(); });
                            }}
                            style={{ flex: 1, background: "#10b981", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                          >
                            💰 Ransom for $250,000 C-Bills
                          </button>
                          <button
                            onClick={() => {
                              fetch("http://localhost:8000/api/v1/personnel/bondsmen/integrate", {
                                method: "POST", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ pilot_id: p.id, bondsman_name: "MechWarrior Marcus Trent", callsign: "Bondsman" })
                              }).then(r => r.json()).then(d => { alert(d.message || "Rehabilitated!"); refreshAll(); });
                            }}
                            style={{ flex: 1, background: "#9333ea", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                          >
                            🎖️ Recruit as Active Pilot
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
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
              <h4 style={{ color: "#ea580c", margin: "0 0 12px 0" }}>Monthly Support &amp; Expenditure Rates</h4>
              <p style={{ color: "#cbd5e1", fontSize: "13px" }}>Daily Base Overhead: <strong>10 Support Points (SP) / day</strong></p>
              <p style={{ color: "#cbd5e1", fontSize: "13px" }}>Pilot &amp; Tech Staff Support: <strong>150 Support Points (SP) / month</strong></p>
              <p style={{ color: "#38bdf8", fontSize: "15px", fontWeight: "bold", marginTop: "16px" }}>
                Current Treasury: {(balance.WP || 1500).toLocaleString()} WP | {(balance.SP || 800).toLocaleString()} SP
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

          {/* COMSTAR / MRB BANK LOAN & FINANCING SUITE */}
          <div style={{ background: "rgba(15, 20, 30, 0.9)", border: "1px solid rgba(56, 189, 248, 0.4)", borderRadius: "10px", padding: "20px", marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 className="font-orbitron" style={{ color: "#38bdf8", margin: 0, fontSize: "16px" }}>
                🏦 ComStar &amp; MRB Warchest Credit &amp; Debt Financing Suite
              </h4>
              <span style={{ background: (balance.loan_balance || 0) > 0 ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.2)", color: (balance.loan_balance || 0) > 0 ? "#f43f5e" : "#10b981", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                {(balance.loan_balance || 0) > 0 ? `Outstanding Debt: ${Number(balance.loan_balance || 0).toLocaleString()} WP` : "Debt Free (Clean Credit)"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "14px", borderRadius: "8px" }}>
                <h5 style={{ color: "#fff", margin: "0 0 6px 0", fontSize: "14px" }}>Emergency Credit Line</h5>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 10px 0" }}>500 WP Credit (5% Mo. Interest)</p>
                <button
                  onClick={() => {
                    fetch("http://localhost:8000/api/v1/ledger/loan/take", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ principal: 500.0, interest_rate: 0.05 })
                    }).then(r => r.json()).then(d => { showAlert(d.message || "Financed!"); refreshAll(); });
                  }}
                  style={{ width: "100%", background: "#0284c7", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}
                >
                  🚀 Finance 500 WP Credit Line
                </button>
              </div>

              <div style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(147, 51, 234, 0.2)", padding: "14px", borderRadius: "8px" }}>
                <h5 style={{ color: "#fff", margin: "0 0 6px 0", fontSize: "14px" }}>Expansion Capital Loan</h5>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 10px 0" }}>2,000 WP Capital (7.5% Mo. Interest)</p>
                <button
                  onClick={() => {
                    fetch("http://localhost:8000/api/v1/ledger/loan/take", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ principal: 2000.0, interest_rate: 0.075 })
                    }).then(r => r.json()).then(d => { showAlert(d.message || "Financed!"); refreshAll(); });
                  }}
                  style={{ width: "100%", background: "#9333ea", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}
                >
                  🚀 Finance 2,000 WP Capital Loan
                </button>
              </div>

              <div style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(234, 88, 12, 0.2)", padding: "14px", borderRadius: "8px" }}>
                <h5 style={{ color: "#fff", margin: "0 0 6px 0", fontSize: "14px" }}>Debt Repayment Facility</h5>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 10px 0" }}>Pay Down 100 WP Debt Principal</p>
                <button
                  onClick={() => {
                    fetch("http://localhost:8000/api/v1/ledger/loan/repay", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ repayment_amount: 100.0 })
                    }).then(r => r.json()).then(d => { showAlert(d.message || "Repaid!"); refreshAll(); });
                  }}
                  disabled={(balance.loan_balance || 0) <= 0}
                  style={{ width: "100%", background: (balance.loan_balance || 0) > 0 ? "#10b981" : "#475569", color: "#fff", border: "none", padding: "8px", borderRadius: "4px", fontWeight: "bold", fontSize: "11px", cursor: (balance.loan_balance || 0) > 0 ? "pointer" : "not-allowed" }}
                >
                  💰 Repay 100 WP Debt Principal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RICH TACTICAL INTEL BRIEFING & CONTRACT NEGOTIATION MODAL */}
      {selectedIntelMission && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setSelectedIntelMission(null)}>
          <div style={{ background: "#0f141e", border: "1px solid #38bdf8", borderRadius: "12px", padding: "28px", width: "680px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#38bdf8", margin: 0, fontSize: "18px" }}>
                📋 CONTRACT NEGOTIATION &amp; TACTICAL INTEL BRIEFING
              </h3>
              <button onClick={() => setSelectedIntelMission(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            {(() => {
              const baseOpForBv = totalLanceBv2 || 5463;
              const payoutRatio = negPayoutMult;
              const salvageRatio = negSalvagePct / 50.0;
              const blcRatio = negBlcPct / 50.0;
              const threatMult = Math.max(0.75, Math.min(2.25, Number((1.0 + (payoutRatio - 1.0) * 0.25 + (salvageRatio - 1.0) * 0.20 + (blcRatio - 1.0) * 0.15).toFixed(2))));
              const negotiatedOpForBv = Math.round(baseOpForBv * threatMult);
              const baseWpReward = selectedIntelMission.wp_reward || 400;
              const negotiatedPayout = Math.round(baseWpReward * negPayoutMult);

              let threatRatingText = "🟢 Low Threat (Local Planetary Militia)";
              let opforCompositionText = "1x Locust (20T), 1x Stinger (20T), 2x Light Armor Tanks";
              if (threatMult > 1.45) {
                threatRatingText = "🔴 Extreme Threat (Elite House Guards & Clan Assault Star)";
                opforCompositionText = "1x Timber Wolf Prime (75T), 1x Dire Wolf Prime (100T), 2x Heavy Star Mechs";
              } else if (threatMult > 1.15) {
                threatRatingText = "🟠 High Threat (Veteran Regular Command Regulars)";
                opforCompositionText = "1x Marauder (75T), 1x Warhammer (70T), 1x Griffin (55T), 1x Awesome (80T)";
              } else if (threatMult >= 0.85) {
                threatRatingText = "🟡 Moderate Threat (Standard House Line Garrison)";
                opforCompositionText = "1x Hunchback (50T), 1x Catapult (65T), 1x Warhammer (70T), 1x Wasp (20T)";
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "16px", borderRadius: "8px" }}>
                    <h4 style={{ color: "#fff", margin: "0 0 8px 0", fontSize: "16px" }}>{selectedIntelMission.name}</h4>
                    <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 4px 0" }}>
                      Employer: <strong style={{ color: "#cbd5e1" }}>{selectedIntelMission.employer}</strong> | Target: <span style={{ color: "#f43f5e" }}>{selectedIntelMission.enemy_faction || "OpFor Force"}</span>
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
                      Mission Type: <strong style={{ color: "#38bdf8" }}>{selectedIntelMission.mission_type}</strong> | Base Warchest Payout: <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{baseWpReward.toLocaleString()} WP</span>
                    </p>
                  </div>

                  <div style={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(245, 158, 11, 0.4)", padding: "16px", borderRadius: "8px" }}>
                    <h4 className="font-orbitron" style={{ color: "#f59e0b", margin: "0 0 12px 0", fontSize: "14px", textTransform: "uppercase" }}>
                      ⚙️ Dynamic Contract Term Negotiation (Affects OpFor Threat)
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                          <span style={{ color: "#cbd5e1" }}>Base Payout Multiplier: <strong style={{ color: "#10b981" }}>{negPayoutMult.toFixed(2)}x ({negotiatedPayout.toLocaleString()} WP)</strong></span>
                          <span style={{ color: "#94a3b8" }}>Range: 0.50x to 2.00x</span>
                        </div>
                        <input
                          type="range" min="0.5" max="2.0" step="0.05"
                          value={negPayoutMult}
                          onChange={e => setNegPayoutMult(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#10b981", cursor: "pointer" }}
                        />
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                          <span style={{ color: "#cbd5e1" }}>Salvage Rights Recovery: <strong style={{ color: "#38bdf8" }}>{negSalvagePct}% Salvage</strong></span>
                          <span style={{ color: "#94a3b8" }}>25% Exchange to 100% Full</span>
                        </div>
                        <input
                          type="range" min="25" max="100" step="25"
                          value={negSalvagePct}
                          onChange={e => setNegSalvagePct(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#38bdf8", cursor: "pointer" }}
                        />
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                          <span style={{ color: "#cbd5e1" }}>Battle Loss Comp (BLC): <strong style={{ color: "#f59e0b" }}>{negBlcPct}% Armor/Structure Coverage</strong></span>
                          <span style={{ color: "#94a3b8" }}>0% None to 100% Full</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="25"
                          value={negBlcPct}
                          onChange={e => setNegBlcPct(Number(e.target.value))}
                          style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(244, 63, 94, 0.4)", padding: "16px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#f43f5e", fontWeight: "bold" }}>🎯 NEGOTIATED OPFOR THREAT &amp; ENEMY BV GAUGE</span>
                      <span style={{ background: threatMult > 1.15 ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.2)", color: threatMult > 1.15 ? "#f43f5e" : "#10b981", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                        Threat Multiplier: {threatMult.toFixed(2)}x
                      </span>
                    </div>

                    <p style={{ color: "#fff", fontSize: "14px", fontWeight: "bold", margin: "0 0 4px 0" }}>
                      {threatRatingText}
                    </p>
                    <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "0 0 6px 0" }}>
                      Calculated Enemy BV: <strong style={{ color: "#f59e0b" }}>{negotiatedOpForBv.toLocaleString()} BV2</strong> (vs Player Lance {baseOpForBv.toLocaleString()} BV2)
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>
                      OpFor Intelligence Projection: <em>{opforCompositionText}</em>
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button style={{ background: "#475569", border: "none", color: "#fff", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }} onClick={() => setSelectedIntelMission(null)}>Close Briefing</button>
                    <button
                      style={{ background: "#ea580c", border: "none", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => {
                        const updatedMission = { ...selectedIntelMission, wp_reward: negotiatedPayout, salvage_rights: `${negSalvagePct}% Negotiated Salvage` };
                        handleAcceptContract(updatedMission);
                        setSelectedIntelMission(null);
                      }}
                    >
                      Sign &amp; Deploy Negotiated Contract ({negotiatedPayout.toLocaleString()} WP) →
                    </button>
                  </div>
                </div>
              );
            })()}
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
                  <select defaultValue="House Kurita" style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    <option value="House Kurita">House Kurita (Draconis Combine)</option>
                    <option value="House Davion">House Davion (Federated Suns)</option>
                    <option value="House Liao">House Liao (Capellan Confederation)</option>
                    <option value="House Marik">House Marik (Free Worlds League)</option>
                    <option value="House Steiner">House Steiner (Lyran Commonwealth)</option>
                    <option value="ComStar">ComStar</option>
                    <option value="Word of Blake">Word of Blake</option>
                    <option value="Clan Wolf">Clan Wolf</option>
                    <option value="Clan Jade Falcon">Clan Jade Falcon</option>
                    <option value="Clan Ghost Bear">Clan Ghost Bear</option>
                    <option value="Clan Smoke Jaguar">Clan Smoke Jaguar</option>
                    <option value="Clan Nova Cat">Clan Nova Cat</option>
                    <option value="Clan Steel Viper">Clan Steel Viper</option>
                    <option value="Clan Diamond Shark">Clan Diamond Shark / Sea Fox</option>
                    <option value="Clan Wolf-in-Exile">Clan Wolf-in-Exile</option>
                    <option value="Pirate Outlaws">Pirate Outlaws &amp; Banditti</option>
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

      {/* OPFOR TACTICAL SETUP & TABLETOP ROSTER CONFIRMATION MODAL */}
      {showOpForSetupModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }} onClick={() => setShowOpForSetupModal(false)}>
          <div style={{ background: "#0f141e", border: "1px solid #f43f5e", borderRadius: "12px", padding: "28px", width: "750px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#f43f5e", margin: 0, fontSize: "18px" }}>
                ⚔️ TABLETOP OPFOR FORCE SETUP &amp; BV PARITY AUDIT
              </h3>
              <button onClick={() => setShowOpForSetupModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* BV PARITY METER */}
              {(() => {
                const rosterBv = activeOpForUnits.reduce((acc, u) => acc + (u.bv2 || 1200), 0);
                const targetBv = opforTargetBv || totalLanceBv2 || 5463;
                const matchPct = targetBv > 0 ? ((rosterBv / targetBv) * 100).toFixed(1) : 100;
                const isMatched = Math.abs(100 - matchPct) <= 10;

                return (
                  <div style={{ background: "rgba(30, 41, 59, 0.7)", border: `1px solid ${isMatched ? "#10b981" : "#f59e0b"}`, padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>BV PARITY AUDIT</span>
                      <p style={{ margin: "2px 0 0 0", color: "#fff", fontSize: "14px", fontWeight: "bold" }}>
                        Target: <span style={{ color: "#f59e0b" }}>{targetBv.toLocaleString()} BV2</span> | Actual OpFor: <span style={{ color: "#38bdf8" }}>{rosterBv.toLocaleString()} BV2</span>
                      </p>
                    </div>
                    <span style={{ background: isMatched ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)", color: isMatched ? "#10b981" : "#f59e0b", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                      {matchPct}% Parity ({isMatched ? "✅ Matched" : "⚠️ Variance"})
                    </span>
                  </div>
                );
              })()}

              {/* SECTION A: OPFOR MECH & VEHICLE ROSTER */}
              <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "12px", background: "rgba(15, 23, 42, 0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h5 style={{ color: "#38bdf8", margin: 0, fontSize: "13px" }}>🤖 OPFOR MECHS &amp; VEHICLES ({activeOpForUnits.length} UNITS)</h5>
                  <button
                    type="button"
                    onClick={() => setActiveOpForUnits([...activeOpForUnits, { chassis: "Heavy Mech", model: "Variant", tonnage: 65, bv2: 1400, tech_base: "Inner Sphere" }])}
                    style={{ background: "#0284c7", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    + Add Enemy Unit
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {activeOpForUnits.map((u, idx) => {
                    const pool = (availableFactionUnits.length > 0 ? availableFactionUnits : [
                      { chassis: "Marauder", model: "MAD-3R", tonnage: 75, bv2: 1363, tech_base: "Inner Sphere" },
                      { chassis: "Warhammer", model: "WHM-6R", tonnage: 70, bv2: 1299, tech_base: "Inner Sphere" },
                      { chassis: "Catapult", model: "CPLT-A1", tonnage: 65, bv2: 1285, tech_base: "Inner Sphere" },
                      { chassis: "Hunchback", model: "HBK-4G", tonnage: 50, bv2: 1041, tech_base: "Inner Sphere" },
                      { chassis: "Centurion", model: "CN9-A", tonnage: 50, bv2: 945, tech_base: "Inner Sphere" },
                      { chassis: "Awesome", model: "AWS-8Q", tonnage: 80, bv2: 1605, tech_base: "Inner Sphere" },
                      { chassis: "Locust", model: "LCT-1V", tonnage: 20, bv2: 556, tech_base: "Inner Sphere" },
                      { chassis: "Timber Wolf", model: "Prime", tonnage: 75, bv2: 2737, tech_base: "Clan" },
                      { chassis: "Dire Wolf", model: "Prime", tonnage: 100, bv2: 3020, tech_base: "Clan" },
                      { chassis: "Archangel", model: "C-ANG-O", tonnage: 100, bv2: 2350, tech_base: "Word of Blake" }
                    ]);

                    const currentTech = u.tech_base || "Inner Sphere";
                    const filteredUnits = currentTech === "Mixed Tech"
                      ? pool
                      : pool.filter(m => (m.tech_base || "Inner Sphere") === currentTech);
                    const displayUnits = filteredUnits.length > 0 ? filteredUnits : pool;

                    return (
                      <div key={idx} style={{ background: "#0f172a", padding: "10px", borderRadius: "6px", border: "1px solid #334155" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr auto", gap: "8px", alignItems: "center" }}>
                          
                          {/* 1. TECH BASE SELECTOR */}
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>TECH BASE</label>
                            <select
                              value={currentTech}
                              onChange={e => {
                                const newTech = e.target.value;
                                const copy = [...activeOpForUnits];
                                copy[idx].tech_base = newTech;
                                const matchedList = newTech === "Mixed Tech" ? pool : pool.filter(m => (m.tech_base || "Inner Sphere") === newTech);
                                if (matchedList.length > 0) {
                                  const first = matchedList[0];
                                  copy[idx].chassis = first.chassis;
                                  copy[idx].model = first.model;
                                  copy[idx].tonnage = first.tonnage;
                                  copy[idx].bv2 = first.bv2;
                                }
                                setActiveOpForUnits(copy);
                              }}
                              style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }}
                            >
                              <option value="Inner Sphere">Inner Sphere</option>
                              <option value="Clan">Clan</option>
                              <option value="Inner Sphere SLDF">Inner Sphere SLDF</option>
                              <option value="Word of Blake">Word of Blake</option>
                              <option value="Mixed Tech">Mixed Tech</option>
                            </select>
                          </div>

                          {/* 2. CHASSIS DROPDOWN SELECTOR (DETERMINED BY TECH BASE & OPPONENT FACTION) */}
                          <div>
                            <label style={{ fontSize: "9px", color: "#38bdf8", fontWeight: "bold" }}>SELECT CHASSIS (FACTION &amp; ERA)</label>
                            <select
                              value={`${u.chassis} (${u.model})`}
                              onChange={e => {
                                const selVal = e.target.value;
                                const matched = pool.find(m => `${m.chassis} (${m.model})` === selVal || `${m.chassis} ${m.model}` === selVal || m.chassis === selVal);
                                if (matched) {
                                  const copy = [...activeOpForUnits];
                                  copy[idx] = {
                                    ...copy[idx],
                                    chassis: matched.chassis,
                                    model: matched.model,
                                    tonnage: matched.tonnage,
                                    bv2: matched.bv2,
                                    tech_base: matched.tech_base || currentTech
                                  };
                                  setActiveOpForUnits(copy);
                                }
                              }}
                              style={{ width: "100%", background: "#1e293b", border: "1px solid #38bdf8", color: "#38bdf8", padding: "4px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}
                            >
                              {displayUnits.map((m, mIdx) => (
                                <option key={mIdx} value={`${m.chassis} (${m.model})`}>
                                  {m.chassis} {m.model} ({m.tonnage}T — {m.bv2} BV2)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 3. MODEL */}
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>MODEL</label>
                            <input type="text" value={u.model} onChange={e => { const copy = [...activeOpForUnits]; copy[idx].model = e.target.value; setActiveOpForUnits(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                          </div>

                          {/* 4. TONNAGE (AUTO-UPDATES) */}
                          <div>
                            <label style={{ fontSize: "9px", color: "#10b981", fontWeight: "bold" }}>TONNAGE</label>
                            <input type="number" value={u.tonnage} onChange={e => { const copy = [...activeOpForUnits]; copy[idx].tonnage = Number(e.target.value); setActiveOpForUnits(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #10b981", color: "#10b981", padding: "4px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }} />
                          </div>

                          {/* 5. BV2 (AUTO-UPDATES) */}
                          <div>
                            <label style={{ fontSize: "9px", color: "#f59e0b", fontWeight: "bold" }}>BV2</label>
                            <input type="number" value={u.bv2} onChange={e => { const copy = [...activeOpForUnits]; copy[idx].bv2 = Number(e.target.value); setActiveOpForUnits(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #f59e0b", color: "#f59e0b", padding: "4px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }} />
                          </div>

                          {/* REMOVE BUTTON */}
                          <button
                            type="button"
                            onClick={() => setActiveOpForUnits(activeOpForUnits.filter((_, i) => i !== idx))}
                            style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", marginTop: "12px" }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION B: OPFOR PILOTS & SKILLS */}
              <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "12px", background: "rgba(15, 23, 42, 0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h5 style={{ color: "#f59e0b", margin: 0, fontSize: "13px" }}>👨‍✈️ OPFOR PILOTS &amp; SKILLS ({activeOpForPilots.length} ENEMY PILOTS)</h5>
                  <button
                    type="button"
                    onClick={() => setActiveOpForPilots([...activeOpForPilots, { name: "Enemy MechWarrior", callsign: "Vanguard", gunnery: 4, piloting: 5, spa: "None", unit_chassis: activeOpForUnits[0]?.chassis || "Marauder" }])}
                    style={{ background: "#d97706", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    + Add Enemy Pilot
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {activeOpForPilots.map((p, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 2fr auto", gap: "8px", alignItems: "center", background: "#0f172a", padding: "8px", borderRadius: "6px", border: "1px solid #334155" }}>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>PILOT NAME</label>
                        <input type="text" value={p.name} onChange={e => { const copy = [...activeOpForPilots]; copy[idx].name = e.target.value; setActiveOpForPilots(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>CALLSIGN</label>
                        <input type="text" value={p.callsign} onChange={e => { const copy = [...activeOpForPilots]; copy[idx].callsign = e.target.value; setActiveOpForPilots(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>GUNNERY</label>
                        <select value={p.gunnery} onChange={e => { const copy = [...activeOpForPilots]; copy[idx].gunnery = Number(e.target.value); setActiveOpForPilots(copy); }} style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }}>
                          {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>PILOTING</label>
                        <select value={p.piloting} onChange={e => { const copy = [...activeOpForPilots]; copy[idx].piloting = Number(e.target.value); setActiveOpForPilots(copy); }} style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }}>
                          {[1, 2, 3, 4, 5, 6].map(pl => <option key={pl} value={pl}>{pl}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "9px", color: "#64748b" }}>SPECIAL PILOT ABILITY (SPA)</label>
                        <select value={p.spa} onChange={e => { const copy = [...activeOpForPilots]; copy[idx].spa = e.target.value; setActiveOpForPilots(copy); }} style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }}>
                          <option value="None">None</option>
                          <option value="Sharpshooter (+1 Accuracy to Called Shots)">Sharpshooter (+1 Accuracy)</option>
                          <option value="Tactical Genius (Reroll Initiative Once)">Tactical Genius (Reroll Init)</option>
                          <option value="Royal Marksmanship (+1 Energy Accuracy)">Royal Marksmanship (+1 Energy)</option>
                          <option value="Trueborn Reflexes (+1 Piloting)">Trueborn Reflexes (+1 Piloting)</option>
                          <option value="Gunslinger (+1 Dual Fire)">Gunslinger (+1 Dual Fire)</option>
                          <option value="Marksman (Energy Weapon Range Boost)">Marksman (Range Boost)</option>
                          <option value="Dodge (Physical Evasion)">Dodge (Evasion)</option>
                          <option value="Iron Will (Panic Resistance)">Iron Will (Panic Resist)</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveOpForPilots(activeOpForPilots.filter((_, i) => i !== idx))}
                        style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", marginTop: "12px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowOpForSetupModal(false)}
                  style={{ background: "#475569", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel &amp; Abort Signing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOpForAndSignContract}
                  style={{ background: "#10b981", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
                >
                  ⚔️ Confirm OpFor &amp; Launch Contract ➔
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* AAR & KILL TRACKER & SALVAGE SUITE MODAL */}
      {showAarModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }} onClick={() => setShowAarModal(false)}>
          <div style={{ background: "#0f141e", border: "1px solid #ea580c", borderRadius: "12px", padding: "28px", width: "680px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-orbitron" style={{ color: "#ea580c", margin: 0, fontSize: "18px" }}>
                🏆 COMBAT AAR, KILL TRACKER &amp; SALVAGE SETTLEMENT
              </h3>
              <button onClick={() => setShowAarModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSubmitAAR} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(234, 88, 12, 0.3)" }}>
                <p style={{ color: "#cbd5e1", fontSize: "13px", margin: 0 }}>
                  Operation: <strong style={{ color: "#ea580c" }}>{activeDeployedMission ? activeDeployedMission.name : "Planetary Defense Skirmish"}</strong>
                  <span style={{ color: "#94a3b8", marginLeft: "16px", fontSize: "12px" }}>
                    Salvage Rights: <strong style={{ color: "#38bdf8" }}>{activeDeployedMission ? activeDeployedMission.salvage_rights : "Shared (50%)"}</strong>
                  </span>
                </p>
              </div>

              {/* PILOT KILL TRACKER & BONDSMEN CAPTURE SECTION */}
              <div>
                <h4 style={{ color: "#38bdf8", margin: "0 0 10px 0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  ⚔️ Pilot Kill Tracker &amp; Bondsmen Capture
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pilots.map(p => {
                    const kData = aarPilotKills[p.id] || { kills: 0, enemyMech: "Catapult CPLT-A1", tonnage: 65, isBondsman: false, bondsmanName: "" };
                    const calculatedXp = 15 + (Number(kData.kills) > 0 ? (kData.tonnage >= 65 ? 15 : 10) : 0) + (kData.isBondsman ? 15 : 0);

                    return (
                      <div key={p.id} style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "8px", padding: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div>
                            <strong style={{ color: "#fff", fontSize: "13px" }}>{p.name} ({p.callsign})</strong>
                            <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "10px" }}>Assigned: {p.assigned_unit}</span>
                          </div>
                          <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                            +{calculatedXp} XP Earned
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: "10px", alignItems: "center" }}>
                          <div>
                            <label style={{ fontSize: "10px", color: "#94a3b8" }}>KILLS COUNT</label>
                            <input
                              type="number" min="0" max="10"
                              value={kData.kills}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setAarPilotKills(prev => ({ ...prev, [p.id]: { ...prev[p.id], kills: val } }));
                              }}
                              style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "10px", color: "#94a3b8" }}>ENEMY MECH DESTROYED</label>
                            <select
                              value={kData.enemyMech}
                              onChange={e => {
                                const selected = e.target.value;
                                const matched = activeOpForUnits.find(u => `${u.chassis} ${u.model}` === selected);
                                const tonnage = matched ? matched.tonnage : 65;
                                setAarPilotKills(prev => ({ ...prev, [p.id]: { ...prev[p.id], enemyMech: selected, tonnage } }));
                              }}
                              style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}
                            >
                              {activeOpForUnits.length > 0 ? (
                                activeOpForUnits.map((u, uIdx) => (
                                  <option key={uIdx} value={`${u.chassis} ${u.model}`}>
                                    {u.chassis} {u.model} ({u.tonnage}T {u.tech_base}) - {u.bv2} BV2
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="Catapult CPLT-A1">Catapult CPLT-A1 (65T Heavy)</option>
                                  <option value="Warhammer WHM-6R">Warhammer WHM-6R (70T Heavy)</option>
                                  <option value="Marauder MAD-3R">Marauder MAD-3R (75T Heavy)</option>
                                  <option value="Hunchback HBK-4G">Hunchback HBK-4G (50T Medium)</option>
                                </>
                              )}
                            </select>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "10px", color: "#94a3b8" }}>BONDSMAN CAPTURED</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <input
                                type="checkbox"
                                checked={kData.isBondsman}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  const defaultName = activeOpForPilots.length > 0 ? activeOpForPilots[0].name : "MechWarrior Marcus Trent";
                                  setAarPilotKills(prev => ({ ...prev, [p.id]: { ...prev[p.id], isBondsman: checked, bondsmanName: checked ? (kData.bondsmanName || defaultName) : "" } }));
                                }}
                              />
                              {activeOpForPilots.length > 0 ? (
                                <select
                                  value={kData.bondsmanName}
                                  onChange={e => {
                                    const name = e.target.value;
                                    setAarPilotKills(prev => ({ ...prev, [p.id]: { ...prev[p.id], bondsmanName: name } }));
                                  }}
                                  disabled={!kData.isBondsman}
                                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: kData.isBondsman ? "#fff" : "#475569", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}
                                >
                                  {activeOpForPilots.map((opP, pIdx) => (
                                    <option key={pIdx} value={opP.name}>
                                      {opP.name} ({opP.callsign}) [G{opP.gunnery}/P{opP.piloting}]
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Bondsman Name"
                                  value={kData.bondsmanName}
                                  onChange={e => {
                                    const name = e.target.value;
                                    setAarPilotKills(prev => ({ ...prev, [p.id]: { ...prev[p.id], bondsmanName: name } }));
                                  }}
                                  disabled={!kData.isBondsman}
                                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: kData.isBondsman ? "#fff" : "#475569", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AUTOMATED MECH COMBAT DAMAGE TRANSFER SECTION */}
              <div>
                <h4 style={{ color: "#10b981", margin: "14px 0 10px 0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  🔧 Mech Combat Damage &amp; Critical Hits (Transfer to Tech Bay)
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {units.map(u => {
                    const uDam = aarUnitDamage[u.id] || { armor_loss: 0, structure_loss: 0, destroyed_crit: "None" };
                    return (
                      <div key={u.id} style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "8px", padding: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <strong style={{ color: "#fff", fontSize: "13px" }}>{u.chassis} {u.model} ({u.tonnage}T)</strong>
                          <span style={{ color: uDam.armor_loss > 0 ? "#f43f5e" : "#10b981", fontSize: "11px", fontWeight: "bold" }}>
                            {uDam.armor_loss > 0 ? `-${uDam.armor_loss} Armor / -${uDam.structure_loss} Struct` : "No Damage"}
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "10px", color: "#94a3b8" }}>ARMOR DAMAGE SUSTAINED</label>
                            <input
                              type="number" min="0" max="100"
                              value={uDam.armor_loss || 0}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setAarUnitDamage(prev => ({ ...prev, [u.id]: { ...prev[u.id], armor_loss: val } }));
                              }}
                              style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "10px", color: "#94a3b8" }}>STRUCTURE LOSS</label>
                            <input
                              type="number" min="0" max="50"
                              value={uDam.structure_loss || 0}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setAarUnitDamage(prev => ({ ...prev, [u.id]: { ...prev[u.id], structure_loss: val } }));
                              }}
                              style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "10px", color: "#94a3b8" }}>CRITICAL HIT COMPONENT</label>
                            <select
                              value={uDam.destroyed_crit || "None"}
                              onChange={e => {
                                const val = e.target.value;
                                setAarUnitDamage(prev => ({ ...prev, [u.id]: { ...prev[u.id], destroyed_crit: val } }));
                              }}
                              style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}
                            >
                              <option value="None">None (No Critical Damage)</option>
                              <option value="PPC">PPC (Center Torso)</option>
                              <option value="AC/20">AC/20 Autocannon (Right Torso)</option>
                              <option value="Engine Core">Engine Core (Center Torso)</option>
                              <option value="Gyro">Gyroscope (Center Torso)</option>
                              <option value="Left Arm Actuator">Left Arm Actuator</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC SALVAGE POOL CLAIMING */}
              <div>
                <h4 style={{ color: "#f59e0b", margin: "0 0 8px 0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  📦 Battlefield Salvage Pool &amp; Cash Payout
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#94a3b8" }}>ESTIMATED SCRAP CASH PAYOUT ($ C-BILLS)</label>
                    <input
                      type="number"
                      value={aarSalvageCash}
                      onChange={e => setAarSalvageCash(e.target.value)}
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "8px", borderRadius: "6px", marginTop: "4px" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "11px", color: "#94a3b8" }}>CLAIM SALVAGE COMPONENTS TO INVENTORY</label>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      {["PPC", "AC/20", "Medium Laser", "Heat Sink", "Ferro-Fibrous Armor Plate (5T)", "Catapult CPLT-A1 Salvage Hull"].map(item => {
                        const isClaimed = salvagedComponentsClaimed.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              if (isClaimed) {
                                setSalvagedComponentsClaimed(prev => prev.filter(i => i !== item));
                              } else {
                                setSalvagedComponentsClaimed(prev => [...prev, item]);
                              }
                            }}
                            style={{
                              background: isClaimed ? "#f59e0b" : "rgba(255,255,255,0.06)",
                              color: isClaimed ? "#0f172a" : "#cbd5e1",
                              border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer"
                            }}
                          >
                            {isClaimed ? "✓ " : "+ "}{item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" style={{ background: "#475569", border: "none", color: "#fff", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }} onClick={() => setShowAarModal(false)}>Cancel</button>
                <button type="submit" style={{ background: "#ea580c", border: "none", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>🏆 Submit AAR, Award XP &amp; Claim Salvage ➔</button>
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

            {/* SECTION 1: LOAD EXISTING CAMPAIGN (Step 1 Only) */}
            {launcherWizardStep === 1 && existingCampaignsList.length > 0 && (
              <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <h4 style={{ color: "#38bdf8", margin: "0 0 10px 0", fontSize: "14px" }}>Load Saved Campaign</h4>
                <select
                  value={selectedExistingCampId}
                  onChange={e => setSelectedExistingCampId(Number(e.target.value))}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "12px" }}
                >
                  {existingCampaignsList.map(c => (
                    <option key={c.id} value={c.id}>
                      ID {c.id}: {c.name} — Era: {c.era || "3025"} — Date: {c.current_date} — Balance: ${(c.cbill_balance || 15000000).toLocaleString()}
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

            {/* SECTION 2: CREATE NEW CAMPAIGN (2-STEP WIZARD) */}
            {launcherWizardStep === 1 ? (
              <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "18px", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h4 style={{ color: "#ea580c", margin: 0, fontSize: "14px" }}>Step 1 of 2: Campaign Logistics &amp; Era</h4>
                  <span style={{ fontSize: "11px", background: "rgba(234, 88, 12, 0.2)", color: "#ea580c", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>LOGISTICS SETUP</span>
                </div>

                <form onSubmit={handleAdvanceToWizardStep2} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>CAMPAIGN NAME</label>
                    <input type="text" value={newCampName} onChange={e => setNewCampName(e.target.value)} required style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "#94a3b8" }}>SELECT BATTLETECH ERA</label>
                      <select value={newEra} onChange={e => setNewEra(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                        <option value="2750">Star League Era (2571–2780)</option>
                        <option value="2821">Early Succession Wars (2781–2900)</option>
                        <option value="3025">Late Succession Wars / Renaissance (2901–3049)</option>
                        <option value="3050">Clan Invasion (3050–3061)</option>
                        <option value="3062">Civil War (3062–3067)</option>
                        <option value="3068">Word of Blake Jihad (3068–3085)</option>
                        <option value="3151">ilClan &amp; Dark Age (3085–3151+)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", color: "#94a3b8" }}>SELECT PLAYER FACTION</label>
                      <select value={newFaction} onChange={e => setNewFaction(e.target.value)} style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                        <option value="House Davion">House Davion (Federated Suns)</option>
                        <option value="House Kurita">House Kurita (Draconis Combine)</option>
                        <option value="House Steiner">House Steiner (Lyran Commonwealth)</option>
                        <option value="House Marik">House Marik (Free Worlds League)</option>
                        <option value="House Liao">House Liao (Capellan Confederation)</option>
                        <option value="ComStar">ComStar</option>
                        <option value="Word of Blake">Word of Blake</option>
                        <option value="Clan Wolf">Clan Wolf</option>
                        <option value="Clan Jade Falcon">Clan Jade Falcon</option>
                        <option value="Clan Ghost Bear">Clan Ghost Bear</option>
                        <option value="Clan Smoke Jaguar">Clan Smoke Jaguar</option>
                        <option value="Clan Nova Cat">Clan Nova Cat</option>
                        <option value="Clan Steel Viper">Clan Steel Viper</option>
                        <option value="Clan Diamond Shark">Clan Diamond Shark / Sea Fox</option>
                        <option value="Clan Wolf-in-Exile">Clan Wolf-in-Exile</option>
                        <option value="Wolf's Dragoons">Wolf's Dragoons / Independent Mercenaries</option>
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

                  <button type="submit" style={{ width: "100%", background: "#38bdf8", color: "#0f172a", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", marginTop: "8px" }}>
                    Next: Configure Roster &amp; Pilots ➔
                  </button>
                </form>
              </div>
            ) : (
              /* STEP 2: CUSTOM MECH ROSTER & PILOT SETUP */
              <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: "18px", borderRadius: "8px", maxHeight: "65vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h4 style={{ color: "#10b981", margin: 0, fontSize: "14px" }}>Step 2 of 2: Configure Company Mechs &amp; Pilots</h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Era {newEra} pre-populated defaults. Edit specs, add, or remove units &amp; MechWarriors before launching.</p>
                  </div>
                  <span style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>ROSTER SETUP</span>
                </div>

                <form onSubmit={handleCreateNewCampaignSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  
                  {/* SECTION A: STARTING MECH ROSTER */}
                  <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "12px", background: "rgba(15, 23, 42, 0.5)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h5 style={{ color: "#38bdf8", margin: 0, fontSize: "13px" }}>🤖 STARTING MECH ROSTER ({wizardUnits.length} UNITS)</h5>
                      <button
                        type="button"
                        onClick={() => setWizardUnits([...wizardUnits, { chassis: "Medium Mech", model: "Variant", tonnage: 55, bv2: 1200, tech_base: "Inner Sphere" }])}
                        style={{ background: "#0284c7", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        + Add Mech
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {wizardUnits.map((u, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr auto", gap: "8px", alignItems: "center", background: "#0f172a", padding: "8px", borderRadius: "6px", border: "1px solid #334155" }}>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>CHASSIS</label>
                            <input type="text" value={u.chassis} onChange={e => { const copy = [...wizardUnits]; copy[idx].chassis = e.target.value; setWizardUnits(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>MODEL</label>
                            <input type="text" value={u.model} onChange={e => { const copy = [...wizardUnits]; copy[idx].model = e.target.value; setWizardUnits(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>TONNAGE</label>
                            <input type="number" value={u.tonnage} onChange={e => { const copy = [...wizardUnits]; copy[idx].tonnage = Number(e.target.value); setWizardUnits(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>BV2</label>
                            <input type="number" value={u.bv2} onChange={e => { const copy = [...wizardUnits]; copy[idx].bv2 = Number(e.target.value); setWizardUnits(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>TECH BASE</label>
                            <select value={u.tech_base} onChange={e => { const copy = [...wizardUnits]; copy[idx].tech_base = e.target.value; setWizardUnits(copy); }} style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }}>
                              <option value="Inner Sphere">Inner Sphere</option>
                              <option value="Clan">Clan</option>
                              <option value="Inner Sphere SLDF">Inner Sphere SLDF</option>
                              <option value="Word of Blake">Word of Blake</option>
                              <option value="Mixed Tech">Mixed Tech</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWizardUnits(wizardUnits.filter((_, i) => i !== idx))}
                            style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", marginTop: "12px" }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION B: STARTING PILOT ROSTER */}
                  <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "12px", background: "rgba(15, 23, 42, 0.5)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h5 style={{ color: "#f59e0b", margin: 0, fontSize: "13px" }}>👨‍✈️ STARTING PILOT ROSTER ({wizardPilots.length} MECHWARRIORS)</h5>
                      <button
                        type="button"
                        onClick={() => setWizardPilots([...wizardPilots, { name: "MechWarrior", callsign: "Rookie", gunnery: 4, piloting: 5, spa: "None", xp: 50 }])}
                        style={{ background: "#d97706", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        + Add Pilot
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {wizardPilots.map((p, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr 0.8fr 2fr auto", gap: "8px", alignItems: "center", background: "#0f172a", padding: "8px", borderRadius: "6px", border: "1px solid #334155" }}>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>PILOT NAME</label>
                            <input type="text" value={p.name} onChange={e => { const copy = [...wizardPilots]; copy[idx].name = e.target.value; setWizardPilots(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>CALLSIGN</label>
                            <input type="text" value={p.callsign} onChange={e => { const copy = [...wizardPilots]; copy[idx].callsign = e.target.value; setWizardPilots(copy); }} required style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>GUNNERY</label>
                            <select value={p.gunnery} onChange={e => { const copy = [...wizardPilots]; copy[idx].gunnery = Number(e.target.value); setWizardPilots(copy); }} style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }}>
                              {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>PILOTING</label>
                            <select value={p.piloting} onChange={e => { const copy = [...wizardPilots]; copy[idx].piloting = Number(e.target.value); setWizardPilots(copy); }} style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }}>
                              {[1, 2, 3, 4, 5, 6].map(pl => <option key={pl} value={pl}>{pl}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "9px", color: "#64748b" }}>SPECIAL PILOT ABILITY (SPA)</label>
                            <select value={p.spa} onChange={e => { const copy = [...wizardPilots]; copy[idx].spa = e.target.value; setWizardPilots(copy); }} style={{ width: "100%", background: "#1e293b", border: "1px solid #475569", color: "#fff", padding: "4px 6px", borderRadius: "4px", fontSize: "11px" }}>
                              <option value="None">None</option>
                              <option value="Sharpshooter (+1 Accuracy to Called Shots)">Sharpshooter (+1 Accuracy)</option>
                              <option value="Tactical Genius (Reroll Initiative Once)">Tactical Genius (Reroll Init)</option>
                              <option value="Royal Marksmanship (+1 Energy Accuracy)">Royal Marksmanship (+1 Energy)</option>
                              <option value="Trueborn Reflexes (+1 Piloting)">Trueborn Reflexes (+1 Piloting)</option>
                              <option value="Gunslinger (+1 Dual Fire)">Gunslinger (+1 Dual Fire)</option>
                              <option value="Marksman (Energy Weapon Range Boost)">Marksman (Range Boost)</option>
                              <option value="Dodge (Physical Evasion)">Dodge (Evasion)</option>
                              <option value="Iron Will (Panic Resistance)">Iron Will (Panic Resist)</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWizardPilots(wizardPilots.filter((_, i) => i !== idx))}
                            style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", marginTop: "12px" }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setLauncherWizardStep(1)}
                      style={{ background: "#475569", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
                    >
                      ⬅ Back to Logistics
                    </button>
                    <button
                      type="submit"
                      style={{ background: "#ea580c", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
                    >
                      🚀 Finish &amp; Launch Custom Campaign
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* BT-MANAGER HELP & OPERATIONS MANUAL MODAL */}
      {showHelpModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }} onClick={() => setShowHelpModal(false)}>
          <div style={{ background: "#0b0f19", border: "1px solid #10b981", borderRadius: "12px", padding: "28px", width: "920px", maxHeight: "88vh", overflowY: "auto", color: "#e2e8f0" }} onClick={e => e.stopPropagation()}>
            
            {/* MODAL HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h3 className="font-orbitron" style={{ color: "#10b981", margin: 0, fontSize: "20px", letterSpacing: "1px" }}>
                  📖 BT-MANAGER OPERATIONS MANUAL &amp; TUTORIAL
                </h3>
                <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid #10b981", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                  v2.1 Official Rules
                </span>
              </div>
              <button onClick={() => setShowHelpModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {/* COMPACT DROPDOWN & PILL BAR NAVIGATION (NO HORIZONTAL SCROLL) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px", background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "10px 14px", borderRadius: "8px" }}>
              {/* DROPDOWN SELECT MENU */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                <label style={{ fontSize: "12px", color: "#34d399", fontWeight: "bold", whiteSpace: "nowrap" }}>SELECT SECTION:</label>
                <select
                  value={helpActiveTab}
                  onChange={e => setHelpActiveTab(e.target.value)}
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #10b981", color: "#fff", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", cursor: "pointer" }}
                >
                  <option value="tutorial">🗺️ Campaign Walkthrough Tutorial</option>
                  <option value="overview">📖 Rulebooks Overview &amp; Integration</option>
                  <option value="step1">📋 Step 1: Contract &amp; Jump Transit</option>
                  <option value="step2">⚔️ Step 2: Force Deployment &amp; LZ Vectors</option>
                  <option value="step3">🏆 Step 3: Combat AAR, Damage &amp; Salvage</option>
                  <option value="step4">🔧 Step 4: Tech Bay, Duration Clock &amp; MechLab</option>
                  <option value="step5">🏥 Step 5: Personnel, MedBay &amp; Bondsmen Suite</option>
                  <option value="step6">📊 Step 6: Financial Ledger &amp; ComStar Bank Loans</option>
                </select>
              </div>

              {/* QUICK-JUMP STEP PILLS */}
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                {[
                  { id: "tutorial", label: "Tutorial" },
                  { id: "overview", label: "Rules" },
                  { id: "step1", label: "Step 1" },
                  { id: "step2", label: "Step 2" },
                  { id: "step3", label: "Step 3" },
                  { id: "step4", label: "Step 4" },
                  { id: "step5", label: "Step 5" },
                  { id: "step6", label: "Step 6" }
                ].map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setHelpActiveTab(pill.id)}
                    style={{
                      background: helpActiveTab === pill.id ? "#10b981" : "rgba(30, 41, 59, 0.6)",
                      color: helpActiveTab === pill.id ? "#0f172a" : "#cbd5e1",
                      border: "none", padding: "6px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer"
                    }}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: CAMPAIGN WALKTHROUGH */}
            {helpActiveTab === "tutorial" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px", lineHeight: "1.6" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "16px" }}>
                  <h4 style={{ color: "#34d399", margin: "0 0 8px 0", fontSize: "15px" }}>🎯 How to Play: The 6-Step Mercenary Lifecycle</h4>
                  <p style={{ color: "#94a3b8", margin: 0 }}>
                    BT-Manager models official Catalyst Game Labs mercenary operations. Follow the numbered 6-step workflow bar at the top of the screen to guide your mercenary company through every contract deployment cycle.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "14px" }}>
                    <strong style={{ color: "#ea580c", fontSize: "14px" }}>Step 1: Contract &amp; Transit 📋</strong>
                    <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "6px 0 0 0" }}>
                      Browse contracts in the MRB Hall or click <strong>+ Build Custom Contract</strong>. Negotiate base payout, salvage rights, and Warchest WP. Select your destination system on the JumpNet map and click <strong>🚀 Initiate Jump Transit</strong> ($120k / +7 Days).
                    </p>
                  </div>

                  <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "14px" }}>
                    <strong style={{ color: "#0284c7", fontSize: "14px" }}>Step 2: Force Deployment ⚔️</strong>
                    <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "6px 0 0 0" }}>
                      Assign Mechs and MechWarriors to your Command Lance. Review the <strong>Force Readiness Gauge</strong> for damaged units or wounded pilots. Select your DropZone insertion vector (e.g. <em>Bravo DZ Dense Forest</em>) and click <strong>🚀 Launch Combat Drop</strong>.
                    </p>
                  </div>

                  <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "14px" }}>
                    <strong style={{ color: "#f59e0b", fontSize: "14px" }}>Step 3: Combat AAR &amp; Salvage 🏆</strong>
                    <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "6px 0 0 0" }}>
                      Click <strong>🏆 Process Combat AAR</strong> to record battle results. Log kills (Chassis, Model, Tonnage) and captured Bondsmen per pilot. The <em>A Time of War</em> XP engine awards XP automatically. Claim weapons and cash from the Salvage Pool.
                    </p>
                  </div>

                  <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "14px" }}>
                    <strong style={{ color: "#10b981", fontSize: "14px" }}>Step 4: Tech Bay &amp; MechLab 🔧</strong>
                    <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "6px 0 0 0" }}>
                      Click <strong>🔧 Repair All Damage</strong> to restore armor and structure. Replace destroyed engine or gyro critical hit components. Access the MechLab engine to fit custom weapon loadouts, check heat curves, and procure new Mechs from the market.
                    </p>
                  </div>

                  <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "14px" }}>
                    <strong style={{ color: "#c084fc", fontSize: "14px" }}>Step 5: Personnel &amp; MedBay 🏥</strong>
                    <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "6px 0 0 0" }}>
                      Administer medical treatment in MedBay to heal wounded pilots. Spend earned combat XP to upgrade <strong>Gunnery rating (-1 for 30 XP)</strong> or <strong>Piloting rating (-1 for 20 XP)</strong>. Assign Special Pilot Abilities (SPAs) and recruit new pilots.
                    </p>
                  </div>

                  <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "14px" }}>
                    <strong style={{ color: "#ec4899", fontSize: "14px" }}>Step 6: Financial Ledger 📊</strong>
                    <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "6px 0 0 0" }}>
                      Audit financial balances (C-Bills, Warchest WP, Support Points, MRB Rating). Advance the calendar with <strong>📅 +1 Day</strong> or <strong>⏩ +7 Days</strong> buttons. Daily base overhead ($5,000/day) and monthly payroll ($150,000/mo) are debited automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RULES & DESCRIPTION */}
            {helpActiveTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px", lineHeight: "1.6" }}>
                <h4 style={{ color: "#10b981", margin: 0, fontSize: "16px" }}>BattleTech Official Rulebooks Integrated</h4>
                <div style={{ background: "rgba(30, 41, 59, 0.5)", borderRadius: "8px", padding: "14px" }}>
                  <strong style={{ color: "#38bdf8" }}>📘 Campaign Operations (v5.0)</strong>
                  <p style={{ color: "#94a3b8", margin: "4px 0 0 0" }}>
                    Governs procedural contract generation, contract negotiations, Warchest Support Points (SP), Battle Value 2.0 (BV2) force calculations, and Monthly Base Operational Overhead.
                  </p>
                </div>
                <div style={{ background: "rgba(30, 41, 59, 0.5)", borderRadius: "8px", padding: "14px" }}>
                  <strong style={{ color: "#38bdf8" }}>📕 A Time of War (v4.0)</strong>
                  <p style={{ color: "#94a3b8", margin: "4px 0 0 0" }}>
                    Governs character combat experience points (XP formula: <code>15 Base + 10-15 Kill + 15 Bondsman</code>), skill progression costs (Gunnery -1 for 30 XP, Piloting -1 for 20 XP), and Special Pilot Ability (SPA) perks.
                  </p>
                </div>
                <div style={{ background: "rgba(30, 41, 59, 0.5)", borderRadius: "8px", padding: "14px" }}>
                  <strong style={{ color: "#38bdf8" }}>📗 Tactical Operations (v7.0)</strong>
                  <p style={{ color: "#94a3b8", margin: "4px 0 0 0" }}>
                    Governs DropZone (LZ) atmospheric insertion vector terrain modifiers (Plains, Heavy Cover, High Ground, Hot Drop) and planetary climate heat dissipation penalties.
                  </p>
                </div>
                <div style={{ background: "rgba(30, 41, 59, 0.5)", borderRadius: "8px", padding: "14px" }}>
                  <strong style={{ color: "#38bdf8" }}>📙 TechManual (v3.0)</strong>
                  <p style={{ color: "#94a3b8", margin: "4px 0 0 0" }}>
                    Governs MechLab loadout fitting metrics, engine weight ratios, double heat sink dissipation curves, and equipment specifications.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: STEP 1 */}
            {helpActiveTab === "step1" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <h4 style={{ color: "#ea580c", margin: "0 0 4px 0", fontSize: "15px" }}>Step 1: Contract &amp; Transit Functions (Click titles for deep-dive details)</h4>
                
                {[
                  {
                    id: "step1_mrb",
                    title: "📋 MRB Procedural Contract Hall Cards",
                    summary: "Browse procedurally generated mercenary contracts from Great Houses with employer, payout, Warchest WP, and salvage clauses.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Official Rulebook Mechanics (Campaign Operations v5.0)</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Contract generation evaluates your mercenary unit's MRB Rating (F through A*). Higher MRB ratings unlock higher base C-Bill payouts (up to 1.25x multiplier), full salvage rights clauses, and higher Warchest WP rewards.
                        </p>
                        <strong style={{ color: "#38bdf8" }}>User Instructions</strong>
                        <p style={{ margin: "4px 0 0 0" }}>
                          Click <strong>Formally Accept Contract</strong> on any available card to sign the contract and set it to Active status. Click <strong>View Tactical Intel</strong> to inspect planetary climate conditions and OpFor threat ratings before signing.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step1_custom",
                    title: "⚙️ + Build Custom Contract & Negotiation Suite",
                    summary: "Opens an 11-field negotiation dialog allowing custom creation and posting of operations to the MRB board.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Official Rulebook Mechanics (Campaign Operations v5.0)</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Contract negotiation balances base cash payout against Battle Loss Compensation (BLC) coverage (50% to 100%) and Salvage Rights (Exchange 25%, Shared 50%, Full 100%). Negotiating 100% salvage or BLC reduces cash payout by 15-25%.
                        </p>
                        <strong style={{ color: "#38bdf8" }}>User Instructions</strong>
                        <p style={{ margin: "4px 0 0 0" }}>
                          Fill in Operation Name, Employer (Davion, Kurita, Steiner, Liao, Marik, Pirates), OpFor, Mission Type, Planetary Climate, Base Payout, and WP Reward. Click <strong>🚀 Post Contract to MRB Board</strong> to generate the custom mission.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step1_intel",
                    title: "📖 Tactical Intel Briefings & Environmental Climate Modifiers",
                    summary: "Displays planetary climate heat dissipation penalties, environmental hazards, and OpFor threat assessment.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Official Rulebook Mechanics (Tactical Operations v7.0)</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Planetary climates apply environmental heat dissipation modifiers during combat:
                          <ul style={{ paddingLeft: "18px", margin: "4px 0" }}>
                            <li><em>Arid / Extreme Heat</em>: +20% heat generated by all weapon fire.</li>
                            <li><em>Sub-Zero Ice World</em>: -10% heat generation bonus (rapid cooling).</li>
                            <li><em>Vacuum / Airless Moon</em>: +1 heat per energy weapon fired.</li>
                            <li><em>Low Gravity (0.5g)</em>: +1 Jump MP bonus, but increases piloting hazard rolls.</li>
                          </ul>
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step1_transit",
                    title: "🚀 Initiate Jump Transit ($120,000 / +7 Days)",
                    summary: "Routes JumpShip transit to destination solar system on the Starmap, deducting charter fees and advancing time.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Operational JumpShip Logistics</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Deducts $120,000 C-Bills for JumpShip K-M drive recharge charter and advances campaign stardate by +7 days. Automatically debits 7 days of base daily operational overhead ($35,000).
                        </p>
                      </div>
                    )
                  }
                ].map(item => {
                  const isExp = expandedHelpSection === item.id;
                  return (
                    <div key={item.id} style={{ background: isExp ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.5)", border: isExp ? "1px solid #ea580c" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", transition: "all 0.2s ease" }}>
                      <div onClick={() => setExpandedHelpSection(isExp ? null : item.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                        <strong style={{ color: isExp ? "#f97316" : "#38bdf8", fontSize: "14px" }}>{item.title}</strong>
                        <span style={{ background: isExp ? "#ea580c" : "rgba(51, 65, 85, 0.8)", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                          {isExp ? "▲ Hide Details" : "▼ Click for Expanded Help"}
                        </span>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "4px 0 0 0" }}>{item.summary}</p>
                      {isExp && <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: "12px", lineHeight: "1.6" }}>{item.details}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: STEP 2 */}
            {helpActiveTab === "step2" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <h4 style={{ color: "#0284c7", margin: "0 0 4px 0", fontSize: "15px" }}>Step 2: Force Deployment Functions (Click titles for deep-dive details)</h4>
                
                {[
                  {
                    id: "step2_lance",
                    title: "⚔️ Command Lance Roster & BV2 Force Balancing",
                    summary: "Assigns active Mechs and MechWarriors to the operational Command Lance, calculating total tonnage and BV2.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Battle Value 2.0 (BV2) Math Engine</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Calculates combined Battle Value 2.0 (BV2) for your deployed force based on Mech chassis specifications, weapon loadouts, and assigned MechWarrior Gunnery/Piloting skill rating multipliers (per Campaign Operations v5.0).
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step2_readiness",
                    title: "⚠️ Force Readiness Gauge & Pre-Deployment Alerts",
                    summary: "Live status bar indicating operational readiness and flagging damage or injury warnings before drop.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Operational Readiness Algorithm</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Evaluates units with armor/structure damage or injured pilots. If damage or injuries exist, displays a prominent <strong>Readiness Alert Modal</strong> offering choice to proceed (<em>⚠️ Deploy Damaged Force</em>) or repair (<em>🔧 Tech Bay Repairs</em>).
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step2_dropzone",
                    title: "🛩️ DropZone (LZ) Insertion Vector Cards & Selection",
                    summary: "Selects atmospheric entry vector and terrain deployment zone with tactical accuracy/movement modifiers.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Tactical Operations v7.0 LZ Insertion Vectors</strong>
                        <ul style={{ paddingLeft: "18px", margin: "4px 0" }}>
                          <li><em>Alpha DZ (Flat Plains)</em>: Standard insertion (+0 accuracy modifier).</li>
                          <li><em>Bravo DZ (Dense Forest)</em>: Heavy cover provides +1 defensive accuracy bonus against enemy fire, but adds +1 MP terrain movement cost.</li>
                          <li><em>Charlie DZ (Mountain Ridge)</em>: Tactical high ground elevation grants +1 To-Hit range accuracy bonus for indirect support weapons.</li>
                          <li><em>Delta DZ (Hot Drop)</em>: Direct orbital combat drop into hostile lines (+10% salvage bonus, but high structural strain risk).</li>
                        </ul>
                      </div>
                    )
                  }
                ].map(item => {
                  const isExp = expandedHelpSection === item.id;
                  return (
                    <div key={item.id} style={{ background: isExp ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.5)", border: isExp ? "1px solid #0284c7" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", transition: "all 0.2s ease" }}>
                      <div onClick={() => setExpandedHelpSection(isExp ? null : item.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                        <strong style={{ color: isExp ? "#38bdf8" : "#38bdf8", fontSize: "14px" }}>{item.title}</strong>
                        <span style={{ background: isExp ? "#0284c7" : "rgba(51, 65, 85, 0.8)", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                          {isExp ? "▲ Hide Details" : "▼ Click for Expanded Help"}
                        </span>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "4px 0 0 0" }}>{item.summary}</p>
                      {isExp && <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: "12px", lineHeight: "1.6" }}>{item.details}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: STEP 3 */}
            {helpActiveTab === "step3" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <h4 style={{ color: "#f59e0b", margin: "0 0 4px 0", fontSize: "15px" }}>Step 3: Combat AAR &amp; Salvage Functions (Click titles for deep-dive details)</h4>
                
                {[
                  {
                    id: "step3_aar",
                    title: "🏆 Process Combat AAR Dialog",
                    summary: "Opens After-Action Report modal to record battle metrics, pilot kills, captured bondsmen, and unit damage.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>After-Action Settlement Protocol</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Processes battle outcomes, updates mission status to `Completed`, awards contract C-Bills and Warchest WP, and logs combat story narrative to the campaign journal.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step3_damage",
                    title: "🔧 Mech Combat Damage & Critical Hits Transfer (Feature 3.1)",
                    summary: "Inputs armor loss, structure loss, and destroyed critical hits per Mech, transferring them to Tech Bay.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Automated Damage Queue Integration</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          For every Mech in the deployed lance, enter sustained **Armor Loss** (points), **Structure Loss** (points), and **Destroyed Critical Hit Components** (PPC, AC/20, Engine Core, Gyro). Automatically updates SQLite `units` table and populates Step 4 Tech Bay repair cards!
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step3_xp",
                    title: "⚔️ Pilot Kill Tracker & A Time of War XP Engine",
                    summary: "Logs enemy Mechs destroyed and captured bondsmen, calculating combat experience (XP) automatically.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>A Time of War v4.0 XP Formula</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Earned XP = `15 Base Participation XP + (10 XP for Medium / 15 XP for Heavy/Assault Mech kill) + 15 XP for Captured Bondsman`. Kills and XP are recorded directly to pilot records.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step3_salvage",
                    title: "📦 Itemized Salvage Pool & Cash Scrap Recovery",
                    summary: "Claims component scrap (PPCs, Autocannons, Lasers) and cash payouts from battlefield recovery.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Salvage Rights Clause Enforcement</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Enforces accepted contract salvage clause (Full 100%, Shared 50%, Exchange 25%). Claimed component scrap is placed into warehouse storage inventory for Tech Bay repairs or market resale.
                        </p>
                      </div>
                    )
                  }
                ].map(item => {
                  const isExp = expandedHelpSection === item.id;
                  return (
                    <div key={item.id} style={{ background: isExp ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.5)", border: isExp ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", transition: "all 0.2s ease" }}>
                      <div onClick={() => setExpandedHelpSection(isExp ? null : item.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                        <strong style={{ color: isExp ? "#fbbf24" : "#38bdf8", fontSize: "14px" }}>{item.title}</strong>
                        <span style={{ background: isExp ? "#f59e0b" : "rgba(51, 65, 85, 0.8)", color: isExp ? "#0f172a" : "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                          {isExp ? "▲ Hide Details" : "▼ Click for Expanded Help"}
                        </span>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "4px 0 0 0" }}>{item.summary}</p>
                      {isExp && <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: "12px", lineHeight: "1.6" }}>{item.details}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: STEP 4 */}
            {helpActiveTab === "step4" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <h4 style={{ color: "#10b981", margin: "0 0 4px 0", fontSize: "15px" }}>Step 4: Tech Bay &amp; MechLab Functions (Click titles for deep-dive details)</h4>
                
                {[
                  {
                    id: "step4_repair",
                    title: "🔧 Repair All Armor & Structure Damage",
                    summary: "Spends Support Points (20 SP) and C-Bills ($150,000) to repair armor and structure damage to 100%.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Armor &amp; Structure Maintenance Protocol</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Consumes 20 Warchest Support Points (SP) and $150,000 C-Bills to replace damaged armor plates and repair internal structural framework across all body locations.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step4_clock",
                    title: "⏱️ Tech Repair & Refit Duration Clock (Feature 4.1)",
                    summary: "Displays estimated repair duration badges (`⏱️ Est. Time: +2 Days`) and advances campaign date clock.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>TechManual v3.0 Engineering Work Formulas</strong>
                        <ul style={{ paddingLeft: "18px", margin: "4px 0" }}>
                          <li><em>Armor / Structure Repair</em>: `max(1, (armor_damage + structure_damage) // 10)` Days.</li>
                          <li><em>Standard Weapon Component Replacement</em>: +3 Days.</li>
                          <li><em>Engine Core / Gyroscope Component Replacement</em>: +7 Days.</li>
                          <li><em>Custom MechLab Loadout Refit</em>: +5 Days.</li>
                        </ul>
                        <p style={{ margin: "4px 0 0 0" }}>
                          Executing a repair automatically advances `Campaign.current_date` on the timeline clock and debits $5,000/day base daily operational overhead.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step4_crits",
                    title: "⚙️ Critical Hit Component Replacement Table",
                    summary: "Identifies destroyed engine, gyro, actuator, or weapon criticals and replaces them using stock or market purchase.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Warehouse Stock &amp; Market Procurement</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Replaces destroyed critical components. If matching component stock exists in warehouse inventory, it is consumed for free. Otherwise, purchases replacement component from the market depot for $100,000 C-Bills.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step4_mechlab",
                    title: "🛠️ Interactive MechLab Loadout Fitting Engine",
                    summary: "Fits custom weapon loadouts, checks heat dissipation curves, and validates tonnage headroom.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>MechLab Engineering Validation</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Calculates free tonnage headroom, weapon alpha strike heat output vs double heat sink dissipation curves, and equipment slot allocation. Committing a custom loadout costs 50 SP and $100,000 C-Bills (+5 Days).
                        </p>
                      </div>
                    )
                  }
                ].map(item => {
                  const isExp = expandedHelpSection === item.id;
                  return (
                    <div key={item.id} style={{ background: isExp ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.5)", border: isExp ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", transition: "all 0.2s ease" }}>
                      <div onClick={() => setExpandedHelpSection(isExp ? null : item.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                        <strong style={{ color: isExp ? "#34d399" : "#38bdf8", fontSize: "14px" }}>{item.title}</strong>
                        <span style={{ background: isExp ? "#10b981" : "rgba(51, 65, 85, 0.8)", color: isExp ? "#0f172a" : "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                          {isExp ? "▲ Hide Details" : "▼ Click for Expanded Help"}
                        </span>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "4px 0 0 0" }}>{item.summary}</p>
                      {isExp && <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: "12px", lineHeight: "1.6" }}>{item.details}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: STEP 5 */}
            {helpActiveTab === "step5" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <h4 style={{ color: "#c084fc", margin: "0 0 4px 0", fontSize: "15px" }}>Step 5: Personnel &amp; MedBay Functions (Click titles for deep-dive details)</h4>
                
                {[
                  {
                    id: "step5_medbay",
                    title: "🏥 MedBay Triage & Pilot Medical Treatment",
                    summary: "Administers medical treatment to heal wounded MechWarriors and accelerate recovery.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>MedBay Medical Treatment Rules</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Expends Support Points (50 SP) to treat injured pilots in MedBay, reducing recovery duration by -15 days per treatment session until fully healed.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step5_bondsmen",
                    title: "🎖️ Captured Bondsmen Rehabilitation & Ransom Suite (Feature 5.1)",
                    summary: "Ransoms captured enemy MechWarriors for $250k C-Bills or recruits them as active pilots.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Bondsmen Handling Operations</strong>
                        <ul style={{ paddingLeft: "18px", margin: "4px 0" }}>
                          <li><em>💰 Ransom Bondsman ($250,000 C-Bills)</em>: Returns captive MechWarrior to their House employer for an immediate **$250,000 C-Bill cash payout**.</li>
                          <li><em>🎖️ Recruit as Active Pilot</em>: Rehabilitates captive into an active MechWarrior (`Gunnery 4 / Piloting 5`) on your mercenary roster.</li>
                        </ul>
                      </div>
                    )
                  },
                  {
                    id: "step5_xp",
                    title: "🎯 Skill Target Rating Upgrade Engine (Gunnery & Piloting)",
                    summary: "Upgrades Gunnery (-1 for 30 XP) and Piloting (-1 for 20 XP) target numbers using earned combat XP.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>A Time of War v4.0 Skill Advancement Table</strong>
                        <ul style={{ paddingLeft: "18px", margin: "4px 0" }}>
                          <li><em>Gunnery Target Rating (-1 Upgrade)</em>: Costs 30 XP (e.g. upgrades Gunnery 4+ to 3+).</li>
                          <li><em>Piloting Target Rating (-1 Upgrade)</em>: Costs 20 XP (e.g. upgrades Piloting 5+ to 4+).</li>
                        </ul>
                      </div>
                    )
                  },
                  {
                    id: "step5_spa",
                    title: "🌟 Special Pilot Abilities (SPAs) & Hiring Hall Candidates",
                    summary: "Assigns SPA perks (Sharpshooter, Tactical Genius, Marksman) and recruits candidate pilots.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>SPA Perks &amp; Personnel Recruitment</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Assigns Special Pilot Ability (SPA) perks to veteran pilots (`Sharpshooter`: +1 accuracy to called shots, `Tactical Genius`: reroll initiative once per engagement). Hire new pilots from the candidate pool.
                        </p>
                      </div>
                    )
                  }
                ].map(item => {
                  const isExp = expandedHelpSection === item.id;
                  return (
                    <div key={item.id} style={{ background: isExp ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.5)", border: isExp ? "1px solid #c084fc" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", transition: "all 0.2s ease" }}>
                      <div onClick={() => setExpandedHelpSection(isExp ? null : item.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                        <strong style={{ color: isExp ? "#e9d5ff" : "#38bdf8", fontSize: "14px" }}>{item.title}</strong>
                        <span style={{ background: isExp ? "#c084fc" : "rgba(51, 65, 85, 0.8)", color: isExp ? "#0f172a" : "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                          {isExp ? "▲ Hide Details" : "▼ Click for Expanded Help"}
                        </span>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "4px 0 0 0" }}>{item.summary}</p>
                      {isExp && <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: "12px", lineHeight: "1.6" }}>{item.details}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: STEP 6 */}
            {helpActiveTab === "step6" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <h4 style={{ color: "#ec4899", margin: "0 0 4px 0", fontSize: "15px" }}>Step 6: Financial Ledger Functions (Click titles for deep-dive details)</h4>
                
                {[
                  {
                    id: "step6_audit",
                    title: "📊 Treasury Ledger Audit & Financial Metrics",
                    summary: "Audits liquid C-Bill treasury, Warchest WP, Support Points (SP), and MRB Rating standing.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Financial Audit Suite</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Displays real-time financial balances: C-Bill cash balance, Warchest WP balance, Support Points (SP) balance, base daily overhead ($5,000/day), and MRB Rating standing.
                        </p>
                      </div>
                    )
                  },
                  {
                    id: "step6_bank",
                    title: "🏦 ComStar & MRB Financial Credit & Debt Financing Suite (Feature 6.1)",
                    summary: "Secures capital credit lines ($1M to $5M) and repays principal debt.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>ComStar Financial Credit Facilities</strong>
                        <ul style={{ paddingLeft: "18px", margin: "4px 0" }}>
                          <li><em>🚀 Emergency Credit Line</em>: Secures $1,000,000 C-Bills @ 5.0% monthly interest ($50,000/mo interest).</li>
                          <li><em>🚀 Capital Expansion Loan</em>: Secures $5,000,000 C-Bills @ 7.5% monthly interest ($375,000/mo interest).</li>
                          <li><em>💰 Debt Repayment Facility</em>: Pays down $500,000 principal debt from treasury funds.</li>
                        </ul>
                      </div>
                    )
                  },
                  {
                    id: "step6_timeline",
                    title: "📅 Timeline Stardate Advance & Monthly Payroll",
                    summary: "Advances campaign calendar (+1 Day / +7 Days) with automated overhead and monthly payroll.",
                    details: (
                      <div>
                        <strong style={{ color: "#34d399" }}>Calendar &amp; Overhead Accounting</strong>
                        <p style={{ margin: "4px 0 8px 0" }}>
                          Advancing days debits daily base overhead ($5,000/day). Reaching the 1st of the month automatically debits $150,000 monthly staff payroll plus accrued loan interest from the campaign treasury.
                        </p>
                      </div>
                    )
                  }
                ].map(item => {
                  const isExp = expandedHelpSection === item.id;
                  return (
                    <div key={item.id} style={{ background: isExp ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.5)", border: isExp ? "1px solid #ec4899" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "12px", transition: "all 0.2s ease" }}>
                      <div onClick={() => setExpandedHelpSection(isExp ? null : item.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                        <strong style={{ color: isExp ? "#f472b6" : "#38bdf8", fontSize: "14px" }}>{item.title}</strong>
                        <span style={{ background: isExp ? "#ec4899" : "rgba(51, 65, 85, 0.8)", color: isExp ? "#fff" : "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                          {isExp ? "▲ Hide Details" : "▼ Click for Expanded Help"}
                        </span>
                      </div>
                      <p style={{ color: "#cbd5e1", fontSize: "12px", margin: "4px 0 0 0" }}>{item.summary}</p>
                      {isExp && <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: "12px", lineHeight: "1.6" }}>{item.details}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODAL FOOTER */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{ background: "#10b981", color: "#0f172a", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
              >
                ✓ Close Manual
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM IN-APP CYBERPUNK ALERT & CONFIRMATION MODAL OVERLAY */}
      {customAlertConfig.show && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999999 }}>
          <div style={{ background: "#0f172a", border: "2px solid #38bdf8", borderRadius: "12px", padding: "28px", width: "520px", boxShadow: "0 0 30px rgba(56, 189, 248, 0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ background: "rgba(56, 189, 248, 0.2)", padding: "10px", borderRadius: "8px", color: "#38bdf8", fontSize: "22px" }}>📋</div>
              <div>
                <h4 className="font-orbitron" style={{ color: "#38bdf8", margin: 0, fontSize: "16px", letterSpacing: "1px" }}>
                  {customAlertConfig.title}
                </h4>
                <span style={{ color: "#94a3b8", fontSize: "11px" }}>Command Tactical Communications System</span>
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
              <p style={{ color: "#cbd5e1", fontSize: "13px", margin: 0, whiteSpace: "pre-line", lineHeight: "1.6" }}>
                {customAlertConfig.message}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  if (customAlertConfig.onConfirm) customAlertConfig.onConfirm();
                  setCustomAlertConfig({ show: false, title: "TACTICAL ALERT", message: "", onConfirm: null });
                }}
                style={{ background: "#ea580c", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", letterSpacing: "0.5px" }}
              >
                [ ACKNOWLEDGE &amp; PROCEED ]
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
