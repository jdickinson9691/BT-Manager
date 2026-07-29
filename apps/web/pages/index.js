import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState({ WP: 1000, SP: 500, CBills: 15000000 });
  const [units, setUnits] = useState([]);
  const [missions, setMissions] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Form States
  const [newItemName, setNewItemName] = useState("PPC");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemCategory, setNewItemCategory] = useState("Weapon");

  // Custom Loadout Configurator State (PowerShell Engine)
  const [builderChassis, setBuilderChassis] = useState("Marauder");
  const [builderModel, setBuilderModel] = useState("MAD-3Custom");
  const [builderTonnage, setBuilderTonnage] = useState(75);
  const [targetUnitId, setTargetUnitId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("RA");
  const [selectedComponent, setSelectedComponent] = useState("PPC");
  const [locationLoadout, setLocationLoadout] = useState({
    HD: [], CT: [], LT: [], RT: [],
    LA: ["PPC", "Medium Laser"],
    RA: ["PPC", "Medium Laser"],
    LL: [], RL: [],
  });
  const [validationResult, setValidationResult] = useState(null);

  // After-Action Report (AAR) State
  const [aarMissionId, setAarMissionId] = useState("");
  const [aarSalvage, setAarSalvage] = useState(500000);
  const [aarSalvageItems, setAarSalvageItems] = useState(["PPC", "Medium Laser"]);
  const [aarLogs, setAarLogs] = useState({});

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

  useEffect(() => {
    fetchBalance();
    fetchUnits();
    fetchMissions();
    fetchPilots();
    fetchInventory();
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
    const formattedLogs = units.map((u) => {
      const log = aarLogs[u.id] || {};
      return {
        unit_id: u.id,
        armor_loss: Number(log.armor_loss || 0),
        structure_loss: Number(log.structure_loss || 0),
        is_destroyed: Boolean(log.is_destroyed || false),
      };
    });

    try {
      const res = await fetch("http://localhost:8000/api/v1/aar/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission_id: aarMissionId ? Number(aarMissionId) : null,
          unit_logs: formattedLogs,
          salvage_cbill_value: Number(aarSalvage),
          salvage_items: aarSalvageItems,
        }),
      });

      if (res.ok) {
        fetchBalance();
        fetchUnits();
        fetchMissions();
        fetchInventory();
        setAarLogs({});
        alert("After-Action Report submitted! Treasury & Warehouse Inventory updated.");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to submit AAR");
      }
    } catch (err) {
      console.error("Failed to submit AAR", err);
    }
  };

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

    // Collect list of all mounted components across locations
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

        let msg = "Custom loadout successfully committed to Active Roster!";
        if (data.used_from_warehouse && data.used_from_warehouse.length > 0) {
          msg += `\n\nConsumed spare parts from Warehouse: ${data.used_from_warehouse.join(", ")}`;
        }
        alert(msg);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to commit loadout.");
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

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", backgroundColor: "#0d1117", color: "#c9d1d9", minHeight: "100vh" }}>
      
      <style>{`
        @media print {
          body { background-color: #fff !important; color: #000 !important; font-family: monospace !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .printable-document { border: 2px solid #000; padding: 20px; color: #000; background: #fff; margin: 0; }
        }
        .print-only { display: none; }
      `}</style>

      {/* PRINT VIEW 1: Tech Work Order */}
      {printMode === "work-order" && selectedWorkOrderUnit && (
        <div className="print-only printable-document">
          <h1 style={{ borderBottom: "3px solid #000", paddingBottom: "5px", margin: "0 0 10px 0" }}>TECHNICAL WORK ORDER - MAINTENANCE BAY</h1>
          <p style={{ margin: "0 0 15px 0", fontSize: "12px" }}>BATTLETECH MERCENARY LOGISTICS COMMAND | BAY A-12</p>
          <hr style={{ borderTop: "1px solid #000", marginBottom: "15px" }} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
            <div>
              <p style={{ margin: "4px 0" }}><strong>TARGET UNIT:</strong> {selectedWorkOrderUnit.chassis} ({selectedWorkOrderUnit.model})</p>
              <p style={{ margin: "4px 0" }}><strong>TONNAGE:</strong> {selectedWorkOrderUnit.tonnage} Tons</p>
            </div>
            <div>
              <p style={{ margin: "4px 0" }}><strong>TECH BASE:</strong> {selectedWorkOrderUnit.tech_base}</p>
              <p style={{ margin: "4px 0" }}><strong>BATTLE VALUE:</strong> {selectedWorkOrderUnit.bv2} BV2</p>
            </div>
          </div>

          <h3 style={{ borderBottom: "1px solid #000", paddingBottom: "4px" }}>DISPATCH DAMAGE BREAKDOWN</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginTop: "10px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000", backgroundColor: "#f0f0f0" }}>
                <th style={{ padding: "8px", borderRight: "1px solid #000" }}>Component / Subsystem</th>
                <th style={{ padding: "8px", borderRight: "1px solid #000" }}>Damage Recorded</th>
                <th style={{ padding: "8px", borderRight: "1px solid #000" }}>Est. Labor Hours</th>
                <th style={{ padding: "8px" }}>Tech Target Roll</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <td style={{ padding: "8px", borderRight: "1px solid #000" }}>Armor Plating Repairs</td>
                <td style={{ padding: "8px", borderRight: "1px solid #000" }}>{selectedWorkOrderUnit.armor_damage} points lost</td>
                <td style={{ padding: "8px", borderRight: "1px solid #000" }}>{Math.ceil(selectedWorkOrderUnit.armor_damage * 0.2)} Hours</td>
                <td style={{ padding: "8px" }}>4+ (Regular Tech)</td>
              </tr>
              <tr>
                <td style={{ padding: "8px", borderRight: "1px solid #000" }}>Internal Structure Repairs</td>
                <td style={{ padding: "8px", borderRight: "1px solid #000" }}>{selectedWorkOrderUnit.structure_damage} points lost</td>
                <td style={{ padding: "8px", borderRight: "1px solid #000" }}>{selectedWorkOrderUnit.structure_damage * 2} Hours</td>
                <td style={{ padding: "8px" }}>6+ (Veteran Tech)</td>
              </tr>
            </tbody>
          </table>

          <br /><br />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
            <div>
              <p style={{ margin: "0 0 8px 0" }}><strong>CHIEF TECH SIGN-OFF:</strong></p>
              <p>Signature: ___________________________</p>
              <p>Date: ________________________________</p>
            </div>
            <div>
              <p style={{ margin: "0 0 8px 0" }}><strong>WORK DISPATCH STATUS:</strong></p>
              <p>[  ] APPROVED FOR WORK</p>
              <p>[  ] WORK COMPLETED</p>
            </div>
          </div>
        </div>
      )}

      {/* PRINT VIEW 2: Full Campaign Summary */}
      {printMode === "summary" && (
        <div className="print-only printable-document">
          <h1 style={{ borderBottom: "3px solid #000", paddingBottom: "5px", margin: "0 0 10px 0" }}>MERCENARY COMMAND - CAMPAIGN STATUS REPORT</h1>
          <p style={{ margin: "0 0 15px 0", fontSize: "12px" }}>TACTICAL LOGISTICS LEDGER &amp; FORCE ROSTER</p>
          <hr style={{ borderTop: "1px solid #000", marginBottom: "15px" }} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            <p><strong>WARCHEST:</strong> {balance.WP} WP</p>
            <p><strong>SUPPORT POINTS:</strong> {balance.SP} SP</p>
            <p><strong>TREASURY:</strong> ${balance.CBills ? balance.CBills.toLocaleString() : 0}</p>
          </div>

          <h3 style={{ borderBottom: "1px solid #000", paddingBottom: "4px" }}>ACTIVE FORCE ROSTER</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginTop: "10px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000", backgroundColor: "#f0f0f0" }}>
                <th style={{ padding: "6px", borderRight: "1px solid #000" }}>Chassis / Variant</th>
                <th style={{ padding: "6px", borderRight: "1px solid #000" }}>Tonnage</th>
                <th style={{ padding: "6px", borderRight: "1px solid #000" }}>BV2</th>
                <th style={{ padding: "6px", borderRight: "1px solid #000" }}>Damage State</th>
                <th style={{ padding: "6px" }}>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => {
                const isDamaged = u.armor_damage > 0 || u.structure_damage > 0;
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #000" }}>
                    <td style={{ padding: "6px", borderRight: "1px solid #000" }}>{u.chassis} ({u.model})</td>
                    <td style={{ padding: "6px", borderRight: "1px solid #000" }}>{u.tonnage}T</td>
                    <td style={{ padding: "6px", borderRight: "1px solid #000" }}>{u.bv2}</td>
                    <td style={{ padding: "6px", borderRight: "1px solid #000" }}>
                      {isDamaged ? `Armor: -${u.armor_damage} | Struct: -${u.structure_damage}` : "None"}
                    </td>
                    <td style={{ padding: "6px" }}>{isDamaged ? "DAMAGED" : "READY"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MAIN DASHBOARD */}
      <header className="no-print" style={{ borderBottom: "1px solid #30363d", paddingBottom: "12px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "#f59e0b", margin: 0, fontSize: "28px" }}>BT-MANAGER</h1>
          <p style={{ color: "#8b949e", margin: "4px 0 0 0", fontSize: "14px" }}>Tactical Campaign Command &amp; Logistics</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handlePrintSummary} style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
            🖨 Print Campaign Summary
          </button>
          <div style={{ border: "1px solid #238636", backgroundColor: "#0e2a1f", padding: "6px 14px", borderRadius: "20px", color: "#3fb950", fontSize: "12px", fontWeight: "bold" }}>
            ● FASTAPI ONLINE
          </div>
          <div style={{ border: "1px solid #3b82f6", backgroundColor: "#1e293b", padding: "6px 14px", borderRadius: "20px", color: "#60a5fa", fontSize: "12px", fontWeight: "bold" }}>
            ● POWERSHELL API ONLINE
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="no-print">
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
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Component Inventory & Salvage Warehouse Panel */}
            <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #30363d", paddingBottom: "10px", marginBottom: "14px" }}>
                <h2 style={{ margin: 0, fontSize: "18px", color: "#f0f6fc" }}>Salvage &amp; Spare Parts Warehouse</h2>
                <span style={{ fontSize: "11px", backgroundColor: "#0e2a1f", color: "#3fb950", padding: "4px 8px", borderRadius: "4px", border: "1px solid #238636" }}>Warehouse Stock</span>
              </div>

              {inventory.length === 0 ? (
                <p style={{ color: "#8b949e", fontSize: "13px", fontStyle: "italic" }}>Warehouse stock empty. Log salvage from After-Action Reports to stock spare parts.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                  {inventory.map((inv) => (
                    <div key={inv.id} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "8px 12px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ color: "#fff", fontSize: "13px" }}>{inv.component_name}</strong>
                        <br />
                        <small style={{ color: "#8b949e" }}>{inv.category}</small>
                      </div>
                      <span style={{ backgroundColor: "#1e293b", color: "#60a5fa", border: "1px solid #3b82f6", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold", fontSize: "12px" }}>
                        x{inv.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Manual Inventory Add Form */}
              <form onSubmit={handleAddInventory} style={{ borderTop: "1px solid #30363d", paddingTop: "12px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px" }}>
                <input type="text" placeholder="Component (e.g. PPC)" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                <input type="number" min="1" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }}>
                  <option value="Weapon">Weapon</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Ammo">Ammo</option>
                  <option value="Salvage">Salvage</option>
                </select>
                <button type="submit" style={{ backgroundColor: "#059669", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  + Add Stock
                </button>
              </form>
            </div>

            {/* AAR Card */}
            <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
              <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Mission After-Action Report (AAR)</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>ATTACH COMPLETED CONTRACT</label>
                  <select value={aarMissionId} onChange={(e) => setAarMissionId(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px" }}>
                    <option value="">No Contract (Skirmish / Free Combat)</option>
                    {missions.filter((m) => m.status === "Active").map((m) => (
                      <option key={m.id} value={m.id}>{m.name} (+{m.wp_reward} WP / ${m.cbill_reward.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#8b949e", display: "block", marginBottom: "4px" }}>FIELD SALVAGE RECOVERY ($)</label>
                  <input type="number" value={aarSalvage} onChange={(e) => setAarSalvage(e.target.value)} style={{ width: "100%", backgroundColor: "#0d1117", border: "1px solid #30363d", color: "#fff", padding: "8px", borderRadius: "4px", boxSizing: "border-box" }} />
                </div>
              </div>

              <strong style={{ fontSize: "13px", color: "#fbbf24", display: "block", marginBottom: "8px" }}>Log Combat Damage Sustained</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                {units.map((u) => {
                  const log = aarLogs[u.id] || {};
                  return (
                    <div key={u.id} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: "10px 12px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ color: "#fff", fontSize: "14px" }}>{u.chassis}</strong> <span style={{ color: "#8b949e", fontSize: "12px" }}>({u.model})</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input type="number" placeholder="Armor Lost" value={log.armor_loss || ""} onChange={(e) => handleAarLogChange(u.id, "armor_loss", e.target.value)} style={{ width: "90px", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                        <input type="number" placeholder="Struct Lost" value={log.structure_loss || ""} onChange={(e) => handleAarLogChange(u.id, "structure_loss", e.target.value)} style={{ width: "90px", backgroundColor: "#161b22", border: "1px solid #30363d", color: "#fff", padding: "6px", borderRadius: "4px", fontSize: "12px" }} />
                        <label style={{ fontSize: "11px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                          <input type="checkbox" checked={log.is_destroyed || false} onChange={(e) => handleAarLogChange(u.id, "is_destroyed", e.target.checked)} /> Destroyed
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={handleSubmitAAR} style={{ width: "100%", backgroundColor: "#dc2626", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
                Submit After-Action Report &amp; Process Battlefield Payouts
              </button>
            </div>

            {/* Custom Loadout Configurator */}
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

              <button onClick={handleValidatePowerShellLoadout} style={{ width: "100%", backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                Validate Loadout
              </button>

              {validationResult && (
                <div style={{ marginTop: "14px", backgroundColor: "#0d1117", border: validationResult.Valid ? "1px solid #238636" : "1px solid #ef4444", padding: "12px", borderRadius: "6px", fontFamily: "monospace" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <strong style={{ color: validationResult.Valid ? "#3fb950" : "#f87171" }}>
                      {validationResult.Valid ? "✔ VALID LOADOUT" : "✖ INVALID LOADOUT"}
                    </strong>
                    <span style={{ color: "#fbbf24" }}>{validationResult.RefitClass}</span>
                  </div>
                  {validationResult.Valid && (
                    <button onClick={handleCommitLoadoutToRoster} style={{ width: "100%", backgroundColor: "#8b5cf6", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", marginTop: "8px" }}>
                      Commit Loadout (Use Warehouse Stock First)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Active Force Roster */}
            <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
              <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Active Force Roster</h2>
              {units.map((unit) => {
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
                        <button onClick={() => handlePrintWorkOrder(unit)} style={{ marginTop: "4px", backgroundColor: "#334155", color: "#94a3b8", border: "1px solid #475569", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", cursor: "pointer" }}>
                          📄 Print Work Order
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#161b22", padding: "8px 12px", borderRadius: "4px", fontSize: "12px", border: "1px solid #30363d" }}>
                      <div>
                        <span style={{ color: unit.armor_damage > 0 ? "#f87171" : "#8b949e" }}>Armor Dmg: <strong>{unit.armor_damage}</strong></span>
                        <button onClick={() => handleUpdateDamage(unit.id, unit.armor_damage, unit.structure_damage, 5, 0)} style={{ marginLeft: "6px", padding: "2px 6px", backgroundColor: "#30363d", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "10px" }}>+5</button>
                        <button onClick={() => handleUpdateDamage(unit.id, unit.armor_damage, unit.structure_damage, -5, 0)} style={{ marginLeft: "3px", padding: "2px 6px", backgroundColor: "#30363d", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "10px" }}>-5</button>
                      </div>

                      {isDamaged && (
                        <button onClick={() => handleRepairUnit(unit.id)} style={{ backgroundColor: "#d97706", color: "#000", border: "none", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
                          Repair &amp; Bill
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Salvage & Warchest Marketplace */}
            <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
              <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Salvage &amp; Warchest Market</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleBuyMarketSupplies(100, 250000, 25)} style={{ flex: 1, backgroundColor: "#1e3a8a", color: "#60a5fa", border: "1px solid #3b82f6", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  +100 SP Crate ($250k)
                </button>
                <button onClick={() => handleBuyMarketSupplies(500, 1000000, 100)} style={{ flex: 1, backgroundColor: "#1e3a8a", color: "#60a5fa", border: "1px solid #3b82f6", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                  +500 SP Depot Stock ($1M)
                </button>
              </div>
            </div>

            {/* Mission Board */}
            <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
              <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>Campaign Missions &amp; Contracts</h2>
              {missions.map((mission) => (
                <div key={mission.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0d1117", padding: "12px 16px", borderRadius: "6px", border: "1px solid #30363d", marginBottom: "10px" }}>
                  <div>
                    <strong style={{ color: "#ffffff", fontSize: "15px" }}>{mission.name}</strong>
                    <br />
                    <small style={{ color: "#8b949e" }}>Reward: <span style={{ color: "#fbbf24" }}>{mission.wp_reward} WP</span> + <span style={{ color: "#34d399" }}>${(mission.cbill_reward || 0).toLocaleString()}</span></small>
                  </div>
                  <div>
                    {mission.status === "Active" ? (
                      <button onClick={() => handleCompleteMission(mission.id)} style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
                        Complete
                      </button>
                    ) : (
                      <span style={{ color: "#4ade80", fontSize: "12px", fontWeight: "bold" }}>✔ COMPLETED</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Personnel */}
            <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", padding: "20px", borderRadius: "8px" }}>
              <h2 style={{ borderBottom: "1px solid #30363d", paddingBottom: "10px", marginTop: 0, fontSize: "18px", color: "#f0f6fc" }}>MechWarrior Personnel</h2>
              {pilots.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0d1117", padding: "10px 14px", borderRadius: "6px", border: "1px solid #30363d", marginBottom: "8px" }}>
                  <div>
                    <strong style={{ color: "#ffffff", fontSize: "15px" }}>{p.name}</strong> <span style={{ color: "#a78bfa" }}>"{p.callsign}"</span>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", color: "#fbbf24" }}>
                    G{p.gunnery} / P{p.piloting}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
