import React, { useState, useEffect, useRef } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState({
    WP: 1250,
    SP: 750,
    CBills: 18500000.0,
    current_date: "3025-01-15",
    daily_overhead: 5000,
    mrb_rating: "B",
    reputation_score: 72
  });
  const [units, setUnits] = useState([]);
  const [missions, setMissions] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [starmapSystems, setStarmapSystems] = useState([]);
  const [availableSpas, setAvailableSpas] = useState([]);
  const [procurementMechs, setProcurementMechs] = useState([]);

  const [activeTab, setActiveTab] = useState("operations");
  
  // Star Map state
  const [originSystem, setOriginSystem] = useState("Outreach");
  const [destinationSystem, setDestinationSystem] = useState("Tukayyid");
  const [jumpMetrics, setJumpMetrics] = useState(null);

  // Form states
  const [missionName, setMissionName] = useState("");
  const [employer, setEmployer] = useState("House Davion");
  const [baseCbill, setBaseCbill] = useState(3500000);
  const [wpReward, setWpReward] = useState(400);

  const [pilotName, setPilotName] = useState("");
  const [callsign, setCallsign] = useState("");

  // MechLab Fitting state
  const [builderTonnage, setBuilderTonnage] = useState(75);
  const [selectedWeapons, setSelectedWeapons] = useState(["PPC", "Medium Laser", "Medium Laser"]);
  const [useDoubleSinks, setUseDoubleSinks] = useState(false);
  const [mechMetrics, setMechMetrics] = useState(null);

  // Modal states
  const [showMtfModal, setShowMtfModal] = useState(false);
  const [mtfContent, setMtfContent] = useState("");
  const [importStatus, setImportStatus] = useState("");

  const [showAarModal, setShowAarModal] = useState(false);
  const [aarMissionId, setAarMissionId] = useState("");
  const [aarSalvageCash, setAarSalvageCash] = useState(500000);

  const canvasRef = useRef(null);

  const fetchBalance = () => { fetch("http://localhost:8000/api/v1/ledger/balance").then(r => r.json()).then(setBalance).catch(() => {}); };
  const fetchUnits = () => { fetch("http://localhost:8000/api/v1/units").then(r => r.json()).then(setUnits).catch(() => {}); };
  const fetchMissions = () => { fetch("http://localhost:8000/api/v1/missions").then(r => r.json()).then(setMissions).catch(() => {}); };
  const fetchPilots = () => { fetch("http://localhost:8000/api/v1/pilots").then(r => r.json()).then(setPilots).catch(() => {}); };
  const fetchInventory = () => { fetch("http://localhost:8000/api/v1/inventory").then(r => r.json()).then(setInventory).catch(() => {}); };
  const fetchLogs = () => { fetch("http://localhost:8000/api/v1/logs").then(r => r.json()).then(setLogs).catch(() => {}); };
  const fetchStarmap = () => { fetch("http://localhost:8000/api/v1/starmap").then(r => r.json()).then(setStarmapSystems).catch(() => {}); };
  const fetchSpas = () => { fetch("http://localhost:8000/api/v1/pilots/spas").then(r => r.json()).then(setAvailableSpas).catch(() => {}); };
  const fetchProcurementMechs = () => { fetch("http://localhost:8000/api/v1/market/mechs").then(r => r.json()).then(setProcurementMechs).catch(() => {}); };

  const refreshAll = () => {
    fetchBalance(); fetchUnits(); fetchMissions(); fetchPilots(); fetchInventory(); fetchLogs(); fetchStarmap(); fetchSpas(); fetchProcurementMechs();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleExportCampaignSave = async () => {
    const res = await fetch("http://localhost:8000/api/v1/campaign/export");
    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bt_campaign_save_${data.campaign.current_date}.json`;
      a.click();
    }
  };

  const handleImportCampaignSave = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonPayload = JSON.parse(event.target.result);
        const res = await fetch("http://localhost:8000/api/v1/campaign/import", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonPayload)
        });
        if (res.ok) {
          alert("Campaign Save Restored Successfully!");
          refreshAll();
        }
      } catch (err) {
        alert("Failed to parse campaign save JSON file");
      }
    };
    reader.readAsText(file);
  };

  const validateMechBuild = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/builder/validate-build", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tonnage: Number(builderTonnage),
          components: selectedWeapons,
          double_heat_sinks: useDoubleSinks
        })
      });
      const data = await res.json();
      setMechMetrics(data);
    } catch (e) {}
  };

  useEffect(() => {
    validateMechBuild();
  }, [builderTonnage, selectedWeapons, useDoubleSinks]);

  // HTML5 Canvas Render for Starmap
  useEffect(() => {
    if (activeTab !== "starmap" || !canvasRef.current || starmapSystems.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = "#070a13";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

    const sysOrigin = starmapSystems.find(s => s.name === originSystem);
    const sysDest = starmapSystems.find(s => s.name === destinationSystem);

    if (sysOrigin && sysDest && sysOrigin !== sysDest) {
      const px1 = cx + (sysOrigin.x * 6.5);
      const py1 = cy - (sysOrigin.y * 6.5);
      const px2 = cx + (sysDest.x * 6.5);
      const py2 = cy - (sysDest.y * 6.5);

      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px2, py2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    starmapSystems.forEach((s) => {
      const px = cx + (s.x * 6.5);
      const py = cy - (s.y * 6.5);
      const isSel = s.name === originSystem || s.name === destinationSystem;

      if (isSel) {
        ctx.fillStyle = "rgba(6, 182, 212, 0.35)";
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = s.color || "#06b6d4";
      ctx.beginPath();
      ctx.arc(px, py, isSel ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isSel ? "#ffffff" : "#94a3b8";
      ctx.font = isSel ? "bold 12px Inter, sans-serif" : "11px Inter, sans-serif";
      ctx.fillText(`${s.name} (${s.faction})`, px + 10, py + 4);
    });

  }, [activeTab, starmapSystems, originSystem, destinationSystem]);

  const calculateJumpRoute = () => {
    const sysO = starmapSystems.find(s => s.name === originSystem);
    const sysD = starmapSystems.find(s => s.name === destinationSystem);
    if (!sysO || !sysD) return;

    const dx = sysD.x - sysO.x;
    const dy = sysD.y - sysO.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const jumps = Math.ceil(dist / 30.0) || 1;
    const cost = dist * 2000.0;

    setJumpMetrics({
      light_years: dist.toFixed(2),
      jumps_required: jumps,
      estimated_cbills: cost.toLocaleString(undefined, { maximumFractionDigits: 2 })
    });
  };

  const handleGenerateProceduralContract = async () => {
    const res = await fetch("http://localhost:8000/api/v1/missions/generate-procedural", {
      method: "POST"
    });
    if (res.ok) {
      fetchMissions();
      fetchLogs();
    }
  };

  const handleAdvanceTime = async (days) => {
    const res = await fetch("http://localhost:8000/api/v1/timeline/advance", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days })
    });
    if (res.ok) { fetchBalance(); fetchPilots(); fetchLogs(); }
  };

  const handleCreateMission = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/v1/missions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: missionName, employer, base_cbill: Number(baseCbill), wp_reward: Number(wpReward) })
    });
    if (res.ok) { setMissionName(""); fetchMissions(); fetchLogs(); }
  };

  const handleBuyProcurementMech = async (m) => {
    const res = await fetch("http://localhost:8000/api/v1/market/buy-mech", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chassis: m.chassis,
        model: m.model,
        tonnage: m.tonnage,
        bv2: m.bv2,
        cbill_cost: m.cbill_cost,
        wp_cost: m.wp_cost,
        tech_base: m.tech_base
      })
    });
    if (res.ok) {
      fetchUnits(); fetchBalance(); fetchLogs();
    } else {
      const err = await res.json();
      alert(err.detail || "Procurement failed");
    }
  };

  const handleSellMech = async (unitId) => {
    const res = await fetch(`http://localhost:8000/api/v1/units/${unitId}/sell`, {
      method: "POST"
    });
    if (res.ok) {
      fetchUnits(); fetchBalance(); fetchLogs();
    }
  };

  const handleImportMTF = async (e) => {
    e.preventDefault();
    if (!mtfContent.trim()) return;
    setImportStatus("Importing chassis payload...");
    try {
      const res = await fetch("http://localhost:8000/api/v1/units/import-mtf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mtf_content: mtfContent })
      });
      const data = await res.json();
      if (res.ok) {
        setImportStatus(data.message);
        setMtfContent("");
        fetchUnits();
        setTimeout(() => setShowMtfModal(false), 1200);
      } else {
        setImportStatus(`Error: ${data.detail}`);
      }
    } catch (err) {
      setImportStatus("API server connection failed");
    }
  };

  const handleSubmitAAR = async (e) => {
    e.preventDefault();
    const unit_logs = units.map(u => ({ unit_id: u.id, armor_loss: 10, structure_loss: 0 }));
    const pilot_logs = pilots.map(p => ({ pilot_id: p.id, injuries_sustained: 0 }));

    const res = await fetch("http://localhost:8000/api/v1/aar/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mission_id: aarMissionId ? Number(aarMissionId) : null,
        unit_logs,
        pilot_logs,
        salvage_cbill_value: Number(aarSalvageCash)
      })
    });
    if (res.ok) {
      setShowAarModal(false);
      fetchBalance(); fetchUnits(); fetchMissions(); fetchLogs();
    }
  };

  const handleUpgradePilotSkill = async (pilotId, skillType) => {
    const res = await fetch(`http://localhost:8000/api/v1/pilots/${pilotId}/upgrade-skill`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill_type: skillType })
    });
    if (res.ok) fetchPilots();
    else {
      const data = await res.json();
      alert(data.detail || "Skill upgrade failed");
    }
  };

  const handleAssignSpa = async (pilotId, spaName) => {
    const res = await fetch(`http://localhost:8000/api/v1/pilots/${pilotId}/assign-spa`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spa_name: spaName })
    });
    if (res.ok) fetchPilots();
  };

  const handleAwardXp = async (pilotId) => {
    const res = await fetch(`http://localhost:8000/api/v1/pilots/${pilotId}/award-xp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xp_amount: 25, kills_added: 1 })
    });
    if (res.ok) fetchPilots();
  };

  const handleBuyMarketSupplies = async (sp, cost, wp) => {
    const res = await fetch("http://localhost:8000/api/v1/market/buy-supplies", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sp_amount: sp, cbill_cost: cost, wp_cost: wp })
    });
    if (res.ok) { fetchBalance(); alert("Supply crate acquired!"); }
  };

  const handleRecruitPilot = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/v1/pilots", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pilotName, callsign, gunnery: 4, piloting: 5 })
    });
    if (res.ok) { setPilotName(""); setCallsign(""); fetchPilots(); }
  };

  const addWeaponToBuilder = (weaponName) => {
    setSelectedWeapons([...selectedWeapons, weaponName]);
  };

  const removeWeaponFromBuilder = (index) => {
    const newWeapons = [...selectedWeapons];
    newWeapons.splice(index, 1);
    setSelectedWeapons(newWeapons);
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* COMMAND HEADER */}
      <header style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 className="font-orbitron" style={{ color: "#f59e0b", fontSize: "32px", letterSpacing: "1px" }}>BT-MANAGER</h1>
            <span style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", border: "1px solid #10b981", color: "#10b981", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
              v2.1 STANDALONE WINDOWS
            </span>
          </div>
          <p style={{ color: "#94a3b8", marginTop: "4px", fontSize: "14px" }}>BattleTech Mercenary Campaign Operations Deck</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-secondary" onClick={handleExportCampaignSave} style={{ fontSize: "12px" }}>💾 Export Save JSON</button>
            <label className="btn-secondary" style={{ fontSize: "12px", cursor: "pointer" }}>
              📥 Import Save JSON
              <input type="file" accept=".json" onChange={handleImportCampaignSave} style={{ display: "none" }} />
            </label>
          </div>

          <div className="glass-card" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#f59e0b", fontWeight: "bold", fontSize: "13px" }}>⭐ MRB RATING: {balance.mrb_rating}</span>
            <span style={{ color: "#64748b" }}>|</span>
            <span style={{ color: "#cbd5e1", fontSize: "12px" }}>Score: {balance.reputation_score}</span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-amber" onClick={() => handleAdvanceTime(1)}>+1 Day</button>
            <button className="btn-secondary" onClick={() => handleAdvanceTime(7)}>+7 Days</button>
          </div>
        </div>
      </header>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <div className="glass-card" style={{ padding: "18px" }}>
          <p style={{ fontSize: "11px", color: "#06b6d4", fontWeight: "700", letterSpacing: "1px" }}>CAMPAIGN DATE</p>
          <p className="font-mono" style={{ fontSize: "24px", color: "#f8fafc", fontWeight: "700", marginTop: "6px" }}>{balance.current_date}</p>
        </div>

        <div className="glass-card" style={{ padding: "18px" }}>
          <p style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "700", letterSpacing: "1px" }}>WARCHEST BALANCE</p>
          <p className="font-mono" style={{ fontSize: "24px", color: "#f59e0b", fontWeight: "700", marginTop: "6px" }}>{balance.WP} WP</p>
        </div>

        <div className="glass-card" style={{ padding: "18px" }}>
          <p style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "700", letterSpacing: "1px" }}>SUPPORT POINTS</p>
          <p className="font-mono" style={{ fontSize: "24px", color: "#38bdf8", fontWeight: "700", marginTop: "6px" }}>{balance.SP} SP</p>
        </div>

        <div className="glass-card" style={{ padding: "18px" }}>
          <p style={{ fontSize: "11px", color: "#10b981", fontWeight: "700", letterSpacing: "1px" }}>C-BILL TREASURY</p>
          <p className="font-mono" style={{ fontSize: "24px", color: "#10b981", fontWeight: "700", marginTop: "6px" }}>
            ${(balance.CBills || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
        <button
          onClick={() => setActiveTab("operations")}
          className={activeTab === "operations" ? "btn-primary" : "btn-secondary"}
          style={{ flex: 1, padding: "14px", fontSize: "14px" }}
        >
          ⚔ Operations &amp; Contracts
        </button>
        <button
          onClick={() => setActiveTab("starmap")}
          className={activeTab === "starmap" ? "btn-primary" : "btn-secondary"}
          style={{ flex: 1, padding: "14px", fontSize: "14px" }}
        >
          🌌 Galactic Star Map
        </button>
        <button
          onClick={() => setActiveTab("engineering")}
          className={activeTab === "engineering" ? "btn-amber" : "btn-secondary"}
          style={{ flex: 1, padding: "14px", fontSize: "14px" }}
        >
          🛠 Roster &amp; MechLab
        </button>
        <button
          onClick={() => setActiveTab("personnel")}
          className={activeTab === "personnel" ? "btn-primary" : "btn-secondary"}
          style={{ flex: 1, padding: "14px", fontSize: "14px" }}
        >
          👥 Personnel &amp; MedBay
        </button>
      </div>

      {/* MAIN TAB PANELS */}
      <div>
        {/* TAB 1: OPERATIONS */}
        {activeTab === "operations" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h2 className="font-orbitron" style={{ fontSize: "18px", color: "#f8fafc" }}>MRB Contract Board</h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-primary" onClick={handleGenerateProceduralContract}>✨ AI Generate Contract Brief</button>
                  <button className="btn-amber" onClick={() => setShowAarModal(true)}>+ Process AAR Report</button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {missions.map((m) => (
                  <div key={m.id} style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--border-color)", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "15px" }}>{m.name}</h4>
                      <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0 0" }}>
                        Employer: <strong style={{ color: "#cbd5e1" }}>{m.employer}</strong> | Salvage: {m.salvage_rights}
                      </p>
                      <p className="font-mono" style={{ color: "#10b981", fontSize: "13px", margin: "4px 0 0 0" }}>
                        Payout: ${m.cbill_reward.toLocaleString()} | +{m.wp_reward} WP
                      </p>
                    </div>

                    {m.status === "Active" ? (
                      <button className="btn-primary" onClick={() => fetch(`http://localhost:8000/api/v1/missions/${m.id}/complete`, {method: "POST"}).then(() => fetchMissions())}>
                        Complete Contract
                      </button>
                    ) : (
                      <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "13px" }}>✔ COMPLETED</span>
                    )}
                  </div>
                ))}
              </div>

              {/* DRAFT CONTRACT FORM */}
              <form onSubmit={handleCreateMission} style={{ borderTop: "1px solid var(--border-color)", paddingTop: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ color: "#f59e0b", margin: 0 }}>Negotiate Manual Contract</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input type="text" placeholder="Mission Name" value={missionName} onChange={e => setMissionName(e.target.value)} required style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-color)", color: "#fff", padding: "10px", borderRadius: "6px" }} />
                  <input type="text" placeholder="Employer (e.g. House Davion)" value={employer} onChange={e => setEmployer(e.target.value)} style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-color)", color: "#fff", padding: "10px", borderRadius: "6px" }} />
                </div>
                <button type="submit" className="btn-amber">+ Sign &amp; Commit Contract</button>
              </form>
            </div>

            {/* TIMELINE LOGS */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-orbitron" style={{ fontSize: "18px", color: "#f8fafc", marginBottom: "18px" }}>Campaign Journal &amp; AI Log</h2>
              <div style={{ maxHeight: "480px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                {logs.map(l => (
                  <div key={l.id} style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px", borderRadius: "6px", borderLeft: l.event_type.includes("Intel") ? "3px solid #f59e0b" : l.event_type.includes("Narrative") ? "3px solid #8b5cf6" : "3px solid #06b6d4" }}>
                    <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>[{l.log_date}] {l.event_type.toUpperCase()}</p>
                    <p style={{ color: "#e2e8f0", fontSize: "13px", margin: "4px 0 0 0" }}>{l.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GALACTIC STAR MAP */}
        {activeTab === "starmap" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            <div className="glass-card" style={{ padding: "20px" }}>
              <h2 className="font-orbitron" style={{ color: "#06b6d4", fontSize: "18px", marginBottom: "14px" }}>Inner Sphere Planetary Canvas</h2>
              <canvas ref={canvasRef} width={750} height={460} style={{ width: "100%", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
            </div>

            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-orbitron" style={{ color: "#f8fafc", fontSize: "18px", marginBottom: "16px" }}>Jump Route Calculator</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>ORIGIN SYSTEM</label>
                  <select value={originSystem} onChange={e => setOriginSystem(e.target.value)} style={{ width: "100%", background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-color)", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    {starmapSystems.map(s => <option key={s.name} value={s.name}>{s.name} ({s.faction})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>DESTINATION SYSTEM</label>
                  <select value={destinationSystem} onChange={e => setDestinationSystem(e.target.value)} style={{ width: "100%", background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-color)", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                    {starmapSystems.map(s => <option key={s.name} value={s.name}>{s.name} ({s.faction})</option>)}
                  </select>
                </div>
                <button className="btn-primary" onClick={calculateJumpRoute}>🚀 Plot Jump Route</button>
              </div>

              {jumpMetrics && (
                <div style={{ background: "rgba(6, 182, 212, 0.1)", border: "1px solid #06b6d4", padding: "16px", borderRadius: "8px" }}>
                  <h4 style={{ color: "#06b6d4", margin: "0 0 10px 0" }}>Transit Estimation</h4>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}>Distance: <strong style={{ color: "#fff" }}>{jumpMetrics.light_years} LY</strong></p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}>Jumps Required: <strong style={{ color: "#fff" }}>{jumpMetrics.jumps_required} Jump(s)</strong></p>
                  <p className="font-mono" style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#10b981" }}>Fee: ${jumpMetrics.estimated_cbills} C-Bills</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ROSTER & MECHLAB */}
        {activeTab === "engineering" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h2 className="font-orbitron" style={{ fontSize: "18px", color: "#f8fafc" }}>Active Mech Roster</h2>
                <button className="btn-primary" onClick={() => setShowMtfModal(true)}>📥 Import MegaMek .mtf</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {units.map(u => (
                  <div key={u.id} style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--border-color)", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "16px" }}>{u.chassis} {u.model}</h4>
                      <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0" }}>
                        Tonnage: <strong style={{ color: "#cbd5e1" }}>{u.tonnage}T</strong> | Tech Base: {u.tech_base} | BV2: <span style={{ color: "#f59e0b" }}>{u.bv2}</span>
                      </p>
                      <p style={{ fontSize: "12px", margin: "2px 0", color: u.armor_damage > 0 ? "#f43f5e" : "#10b981" }}>
                        Armor Loss: {u.armor_damage} pt | Structure Loss: {u.structure_damage} pt
                      </p>
                      {u.sarna_url && (
                        <a href={u.sarna_url} target="_blank" rel="noreferrer" style={{ color: "#06b6d4", fontSize: "11px", textDecoration: "none" }}>📖 Sarna.net Article ↗</a>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn-amber" onClick={() => fetch(`http://localhost:8000/api/v1/units/${u.id}/repair`, {method: "POST"}).then(() => { fetchUnits(); fetchBalance(); })}>
                        Repair (20 SP)
                      </button>
                      <button className="btn-secondary" onClick={() => handleSellMech(u.id)} style={{ color: "#f43f5e", borderColor: "#f43f5e" }}>
                        Sell Mech
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROCUREMENT MARKET */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-orbitron" style={{ color: "#10b981", fontSize: "18px", marginBottom: "16px" }}>🛒 Unit Procurement Market</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {procurementMechs.map(m => (
                  <div key={m.chassis + m.model} style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-color)", padding: "14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "15px" }}>{m.chassis} {m.model} ({m.tonnage}T)</h4>
                      <p style={{ color: "#94a3b8", fontSize: "12px", margin: "4px 0 0 0" }}>
                        Tech Base: {m.tech_base} | BV2: <span style={{ color: "#f59e0b" }}>{m.bv2}</span>
                      </p>
                      <p className="font-mono" style={{ color: "#10b981", fontSize: "13px", margin: "2px 0 0 0" }}>
                        ${m.cbill_cost.toLocaleString()} C-Bills
                      </p>
                    </div>

                    <button className="btn-primary" onClick={() => handleBuyProcurementMech(m)}>
                      Procure Mech
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PERSONNEL & MEDBAY */}
        {activeTab === "personnel" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-orbitron" style={{ fontSize: "18px", color: "#f8fafc", marginBottom: "18px" }}>MechWarrior Roster &amp; Progression</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                {pilots.map(p => (
                  <div key={p.id} style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <h4 style={{ color: "#f8fafc", margin: 0, fontSize: "16px" }}>{p.name} "{p.callsign}"</h4>
                        <p style={{ color: "#94a3b8", fontSize: "12px", margin: "2px 0 0 0" }}>
                          Status: <span style={{ color: p.status === "Injured" ? "#f43f5e" : "#10b981", fontWeight: "bold" }}>{p.status} {p.days_remaining > 0 ? `(${p.days_remaining}d left)` : ""}</span> | Kills: <strong style={{ color: "#f59e0b" }}>{p.kills || 0}</strong>
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span className="font-mono" style={{ background: "rgba(139, 92, 246, 0.2)", border: "1px solid #8b5cf6", color: "#8b5cf6", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                          {p.xp || 0} XP
                        </span>
                        <button className="btn-secondary" onClick={() => handleAwardXp(p.id)} style={{ padding: "4px 8px", fontSize: "11px" }}>+25 XP</button>
                      </div>
                    </div>

                    {/* SKILLS & SPA PERK */}
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" }}>
                      <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Gunnery: <strong style={{ color: "#f59e0b" }}>{p.gunnery}</strong></span>
                        <button className="btn-primary" onClick={() => handleUpgradePilotSkill(p.id, "gunnery")} style={{ padding: "2px 6px", fontSize: "10px" }}>Upgrade (-30 XP)</button>
                      </div>

                      <div style={{ background: "rgba(15, 23, 42, 0.9)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Piloting: <strong style={{ color: "#38bdf8" }}>{p.piloting}</strong></span>
                        <button className="btn-primary" onClick={() => handleUpgradePilotSkill(p.id, "piloting")} style={{ padding: "2px 6px", fontSize: "10px" }}>Upgrade (-20 XP)</button>
                      </div>

                      <div style={{ flex: 1, minWidth: "180px" }}>
                        <select value={p.spa || "None"} onChange={e => handleAssignSpa(p.id, e.target.value)} style={{ width: "100%", background: "rgba(15, 23, 42, 0.9)", border: "1px solid #8b5cf6", color: "#8b5cf6", padding: "6px", borderRadius: "6px", fontSize: "12px" }}>
                          {availableSpas.map(spa => <option key={spa} value={spa}>{spa}</option>)}
                        </select>
                      </div>

                      {p.status === "Injured" && (
                        <button className="btn-amber" onClick={() => fetch(`http://localhost:8000/api/v1/pilots/${p.id}/treat`, {method: "POST"}).then(() => { fetchPilots(); fetchBalance(); })} style={{ padding: "6px 10px", fontSize: "12px" }}>
                          MedBay (50 SP)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* RECRUITMENT FORM */}
              <form onSubmit={handleRecruitPilot} style={{ borderTop: "1px solid var(--border-color)", paddingTop: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ color: "#8b5cf6", margin: 0 }}>Hiring Hall Recruitment</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input type="text" placeholder="Pilot Name" value={pilotName} onChange={e => setPilotName(e.target.value)} required style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-color)", color: "#fff", padding: "10px", borderRadius: "6px" }} />
                  <input type="text" placeholder="Callsign" value={callsign} onChange={e => setCallsign(e.target.value)} required style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid var(--border-color)", color: "#fff", padding: "10px", borderRadius: "6px" }} />
                </div>
                <button type="submit" className="btn-primary">+ Recruit MechWarrior</button>
              </form>
            </div>

            {/* WARCHEST MARKETPLACE */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-orbitron" style={{ fontSize: "18px", color: "#f8fafc", marginBottom: "18px" }}>Supply Depot Market</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button className="btn-secondary" onClick={() => handleBuyMarketSupplies(100, 250000, 25)} style={{ width: "100%", textAlign: "left", padding: "14px" }}>
                  📦 +100 SP Supply Crate ($250,000 C-Bills / 25 WP)
                </button>
                <button className="btn-secondary" onClick={() => handleBuyMarketSupplies(500, 1000000, 100)} style={{ width: "100%", textAlign: "left", padding: "14px" }}>
                  📦 +500 SP Battalion Supply Depot ($1,000,000 C-Bills / 100 WP)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MTF IMPORTER MODAL */}
      {showMtfModal && (
        <div className="modal-overlay" onClick={() => setShowMtfModal(false)}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: "600px", padding: "28px" }}>
            <h2 className="font-orbitron" style={{ color: "#06b6d4", marginTop: 0 }}>📥 Import MegaMek .mtf Chassis Payload</h2>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>Paste standard MegaMek MTF text below to add Mech payload directly to roster:</p>
            <form onSubmit={handleImportMTF} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <textarea
                rows={8}
                value={mtfContent}
                onChange={e => setMtfContent(e.target.value)}
                placeholder={`Chassis: Mad Cat\nModel: Prime\nMass: 75\nBV: 2737\nTechBase: Clan`}
                style={{ background: "rgba(15, 23, 42, 0.9)", border: "1px solid var(--border-color)", color: "#fff", padding: "12px", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#10b981" }}>{importStatus}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowMtfModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Process Import</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AAR MODAL */}
      {showAarModal && (
        <div className="modal-overlay" onClick={() => setShowAarModal(false)}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: "550px", padding: "28px" }}>
            <h2 className="font-orbitron" style={{ color: "#f59e0b", marginTop: 0 }}>⚔ Submit After-Action Report (AAR)</h2>
            <form onSubmit={handleSubmitAAR} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#94a3b8" }}>SELECT CONTRACT</label>
                <select value={aarMissionId} onChange={e => setAarMissionId(e.target.value)} style={{ width: "100%", background: "rgba(15, 23, 42, 0.9)", border: "1px solid var(--border-color)", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }}>
                  <option value="">-- Independent Engagement --</option>
                  {missions.filter(m => m.status === "Active").map(m => <option key={m.id} value={m.id}>{m.name} ({m.employer})</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#94a3b8" }}>ESTIMATED SALVAGE VALUE ($ C-BILLS)</label>
                <input type="number" value={aarSalvageCash} onChange={e => setAarSalvageCash(e.target.value)} style={{ width: "100%", background: "rgba(15, 23, 42, 0.9)", border: "1px solid var(--border-color)", color: "#fff", padding: "10px", borderRadius: "6px", marginTop: "4px" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAarModal(false)}>Cancel</button>
                <button type="submit" className="btn-amber">Process Combat AAR &amp; Generate Narrative</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
