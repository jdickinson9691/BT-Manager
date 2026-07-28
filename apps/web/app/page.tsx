'use client'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [balance, setBalance] = useState({ WP: 0, SP: 0, CBills: 0 })
  const [units, setUnits] = useState([])
  const [armorMissing, setArmorMissing] = useState(10)
  const [repairCalc, setRepairCalc] = useState<{ sp_cost?: number; cbill_cost?: number } | null>(null)

  const API_BASE = "http://localhost:8000/api/v1"

  useEffect(() => {
    // Fetch initial balance and unit roster
    fetch(\\/ledger/balance\)
      .then(res => res.json())
      .then(data => setBalance(data))
      .catch(err => console.log('API Offline or local dev mode'))

    fetch(\\/units\)
      .then(res => res.json())
      .then(data => setUnits(data))
      .catch(err => console.log('API Offline or local dev mode'))
  }, [])

  const calculateRepair = async () => {
    try {
      const res = await fetch(\\/engine/repair-cost?points_missing=\&tech_base=Inner%20Sphere\, {
        method: 'POST'
      })
      const data = await res.json()
      setRepairCalc(data)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="border-b border-btBorder pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-btAccent tracking-wide">BT-MANAGER</h1>
          <p className="text-sm text-gray-400">Tactical Campaign Command & Logistics</p>
        </div>
        <div className="bg-btCard border border-btBorder px-4 py-2 rounded text-xs text-green-400">
          ? System Online
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-btCard border border-btBorder p-4 rounded-lg">
          <p className="text-xs uppercase text-gray-400">Warchest Balance</p>
          <p className="text-2xl font-mono text-amber-400 mt-1">{balance.WP} WP</p>
        </div>
        <div className="bg-btCard border border-btBorder p-4 rounded-lg">
          <p className="text-xs uppercase text-gray-400">Support Points</p>
          <p className="text-2xl font-mono text-blue-400 mt-1">{balance.SP} SP</p>
        </div>
        <div className="bg-btCard border border-btBorder p-4 rounded-lg">
          <p className="text-xs uppercase text-gray-400">C-Bill Treasury</p>
          <p className="text-2xl font-mono text-emerald-400 mt-1"></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Force Roster */}
        <div className="lg:col-span-2 bg-btCard border border-btBorder p-5 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold border-b border-btBorder pb-2">Active Force Roster</h2>
          {units.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No active BattleMechs registered in SQLite DB. Add units via FastAPI endpoints.</p>
          ) : (
            <div className="space-y-2">
              {units.map((unit: any) => (
                <div key={unit.id} className="flex justify-between items-center bg-btDark p-3 rounded border border-btBorder">
                  <div>
                    <p className="font-bold text-white">{unit.chassis} <span className="text-gray-400">{unit.model}</span></p>
                    <p className="text-xs text-gray-400">{unit.tonnage} Tons | Tech: {unit.tech_base}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-amber-400">{unit.bv2} BV2</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-green-900 text-green-300">{unit.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Calculation Engine Tool */}
        <div className="bg-btCard border border-btBorder p-5 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold border-b border-btBorder pb-2">Repair Calculator</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Missing Armor Points</label>
              <input 
                type="number" 
                value={armorMissing} 
                onChange={(e) => setArmorMissing(Number(e.target.value))}
                className="w-full bg-btDark border border-btBorder rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <button 
              onClick={calculateRepair}
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 rounded text-sm transition"
            >
              Calculate SP & C-Bill Cost
            </button>

            {repairCalc && (
              <div className="bg-btDark border border-btBorder p-3 rounded text-sm space-y-1 font-mono">
                <p className="text-blue-400">Required: {repairCalc.sp_cost} SP</p>
                <p className="text-emerald-400">Cost:  C-Bills</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
