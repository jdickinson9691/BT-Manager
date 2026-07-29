from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from packages.database.db import init_db, get_db
from packages.database.models import Campaign, Unit, Mission, Pilot, Inventory, CampaignLog, CriticalHit
from packages.engine.repair import (
    RepairRequest, 
    RefitRequest, 
    RepairEstimate, 
    calculate_repair_task, 
    calculate_refit_task
)

app = FastAPI(title="BT-Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

class AdvanceTimeRequest(BaseModel):
    days: int = 1

class CustomLogCreate(BaseModel):
    event_type: str = "Journal"
    description: str

class UnitCreate(BaseModel):
    chassis: str
    model: str
    tonnage: int
    tech_base: Optional[str] = "Inner Sphere"
    bv2: Optional[int] = 1000

class CommitLoadoutRequest(BaseModel):
    unit_id: Optional[int] = None
    chassis: str
    model: str
    tonnage: int
    bv2: int
    sp_cost: float
    cbill_cost: float
    components_used: Optional[List[str]] = []

class UnitDamageUpdate(BaseModel):
    armor_damage: int
    structure_damage: int

class MissionCreate(BaseModel):
    name: str
    mission_type: str = "Raid"
    employer: str = "House Davion"
    base_cbill: float = 3000000.0
    wp_reward: int = 350
    salvage_rights: str = "Shared (50%)"
    blc_coverage: float = 0.5
    transport_allowance: float = 0.5
    command_rights: str = "Integrated"

class PilotCreate(BaseModel):
    name: str
    callsign: str
    gunnery: int = 4
    piloting: int = 5
    unit_id: Optional[int] = None

class MarketPurchaseSuppliesRequest(BaseModel):
    sp_amount: int = 0
    cbill_cost: float = 0.0
    wp_cost: int = 0

class InventoryAddRequest(BaseModel):
    component_name: str
    quantity: int = 1
    category: str = "Weapon"

class CriticalHitLog(BaseModel):
    location: str
    component_name: str

class UnitCombatLog(BaseModel):
    unit_id: int
    armor_loss: int = 0
    structure_loss: int = 0
    is_destroyed: bool = False
    critical_hits: Optional[List[CriticalHitLog]] = []

class PilotCombatLog(BaseModel):
    pilot_id: int
    injuries_sustained: int = 0

class AARSubmitRequest(BaseModel):
    mission_id: Optional[int] = None
    unit_logs: List[UnitCombatLog]
    pilot_logs: Optional[List[PilotCombatLog]] = []
    salvage_cbill_value: float = 0.0
    salvage_items: Optional[List[str]] = []

class ComponentRepairRequest(BaseModel):
    critical_hit_id: int

@app.get("/")
def read_root():
    return {"status": "online", "system": "BT-Manager Core Engine"}

@app.get("/api/v1/ledger/balance")
def get_balance(db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        return {"WP": 0, "SP": 0, "CBills": 0, "current_date": "3025-01-01", "daily_overhead": 5000.0}
    return {
        "WP": campaign.wp_balance, 
        "SP": campaign.sp_balance, 
        "CBills": campaign.cbill_balance,
        "current_date": campaign.current_date,
        "daily_overhead": campaign.daily_overhead
    }

@app.post("/api/v1/timeline/advance")
def advance_campaign_time(req: AdvanceTimeRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign state not found")

    current_dt = datetime.strptime(campaign.current_date, "%Y-%m-%d")
    new_dt = current_dt + timedelta(days=req.days)
    campaign.current_date = new_dt.strftime("%Y-%m-%d")

    overhead_cost = campaign.daily_overhead * req.days
    campaign.cbill_balance -= overhead_cost

    pilots = db.query(Pilot).filter(Pilot.status == "Injured").all()
    recovered_names = []
    for p in pilots:
        if p.days_remaining > 0:
            p.days_remaining = max(0, p.days_remaining - req.days)
            if p.days_remaining == 0:
                p.injuries = 0
                p.status = "Active"
                recovered_names.append(p.name)

    log_desc = f"Advanced campaign time by {req.days} days. Daily overhead incurred:  C-Bills."
    if recovered_names:
        log_desc += f" MedBay Release: {', '.join(recovered_names)} fully healed and returned to Active Duty!"

    db.add(CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type="Timeline",
        description=log_desc
    ))
    db.commit()

    return {
        "message": f"Advanced {req.days} days to {campaign.current_date}",
        "current_date": campaign.current_date,
        "overhead_deducted": overhead_cost,
        "cbill_balance": campaign.cbill_balance
    }

@app.get("/api/v1/logs")
def get_campaign_logs(db: Session = Depends(get_db)):
    return db.query(CampaignLog).order_by(CampaignLog.id.desc()).all()

@app.post("/api/v1/logs")
def add_custom_log(log_data: CustomLogCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign state not found")

    new_log = CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type=log_data.event_type,
        description=log_data.description
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@app.get("/api/v1/units")
def get_units(db: Session = Depends(get_db)):
    units = db.query(Unit).all()
    results = []
    for u in units:
        crits = [{"id": c.id, "location": c.location, "component_name": c.component_name} for c in u.critical_hits]
        results.append({
            "id": u.id,
            "campaign_id": u.campaign_id,
            "chassis": u.chassis,
            "model": u.model,
            "tonnage": u.tonnage,
            "tech_base": u.tech_base,
            "bv2": u.bv2,
            "armor_damage": u.armor_damage,
            "structure_damage": u.structure_damage,
            "critical_hits": crits
        })
    return results

@app.post("/api/v1/units")
def add_unit(unit_data: UnitCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    new_unit = Unit(
        campaign_id=campaign.id if campaign else 1,
        chassis=unit_data.chassis,
        model=unit_data.model,
        tonnage=unit_data.tonnage,
        tech_base=unit_data.tech_base,
        bv2=unit_data.bv2,
        armor_damage=0,
        structure_damage=0
    )
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    return new_unit

@app.get("/api/v1/inventory")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()

@app.post("/api/v1/inventory")
def add_inventory_item(item: InventoryAddRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    existing = db.query(Inventory).filter(Inventory.component_name == item.component_name).first()
    if existing:
        existing.quantity += item.quantity
    else:
        existing = Inventory(
            campaign_id=campaign.id if campaign else 1,
            component_name=item.component_name,
            quantity=item.quantity,
            category=item.category
        )
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing

@app.post("/api/v1/aar/submit")
def submit_after_action_report(aar: AARSubmitRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign state not found")

    total_est_repair_cost = 0.0

    for log in aar.unit_logs:
        unit = db.query(Unit).filter(Unit.id == log.unit_id).first()
        if unit:
            if log.is_destroyed:
                db.delete(unit)
            else:
                unit.armor_damage += log.armor_loss
                unit.structure_damage += log.structure_loss
                
                # Estimate repair cost for BLC calculations
                total_est_repair_cost += (log.armor_loss * 500.0) + (log.structure_loss * 2500.0)

                if log.critical_hits:
                    for crit in log.critical_hits:
                        db.add(CriticalHit(
                            unit_id=unit.id,
                            location=crit.location,
                            component_name=crit.component_name,
                            is_destroyed=True
                        ))
                        total_est_repair_cost += 100000.0

    if aar.pilot_logs:
        for plog in aar.pilot_logs:
            pilot = db.query(Pilot).filter(Pilot.id == plog.pilot_id).first()
            if pilot and plog.injuries_sustained > 0:
                pilot.injuries += plog.injuries_sustained
                if pilot.injuries >= 6:
                    pilot.status = "Deceased"
                    pilot.days_remaining = 0
                else:
                    pilot.status = "Injured"
                    pilot.days_remaining = pilot.injuries * 15

    blc_payout = 0.0
    salvage_modifier = 1.0

    if aar.mission_id:
        mission = db.query(Mission).filter(Mission.id == aar.mission_id).first()
        if mission and mission.status == "Active":
            campaign.wp_balance += mission.wp_reward
            campaign.cbill_balance += mission.cbill_reward
            mission.status = "Completed"

            # Apply Battle Loss Compensation
            blc_payout = total_est_repair_cost * mission.blc_coverage
            campaign.cbill_balance += blc_payout

            # Apply Negotiated Salvage Cap Modifier
            if mission.salvage_rights == "Exchange":
                salvage_modifier = 0.25
            elif mission.salvage_rights == "Shared (50%)":
                salvage_modifier = 0.50
            else:
                salvage_modifier = 1.00

    effective_salvage_cash = aar.salvage_cbill_value * salvage_modifier
    if effective_salvage_cash > 0:
        campaign.cbill_balance += effective_salvage_cash

    if aar.salvage_items:
        for comp in aar.salvage_items:
            inv = db.query(Inventory).filter(Inventory.component_name == comp).first()
            if inv:
                inv.quantity += 1
            else:
                db.add(Inventory(campaign_id=campaign.id, component_name=comp, quantity=1, category="Salvage"))

    log_msg = f"Submitted AAR. Field Salvage:  C-Bills."
    if blc_payout > 0:
        log_msg += f" Employer BLC Reimbursement Credited: + C-Bills."

    db.add(CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type="AAR",
        description=log_msg
    ))

    db.commit()
    return {"message": "After-Action Report processed! Treasury, Battle Loss Compensation, and Salvage updated."}

@app.post("/api/v1/units/repair-critical")
def repair_critical_component(req: ComponentRepairRequest, db: Session = Depends(get_db)):
    crit = db.query(CriticalHit).filter(CriticalHit.id == req.critical_hit_id).first()
    if not crit:
        raise HTTPException(status_code=404, detail="Critical hit record not found")

    unit = db.query(Unit).filter(Unit.id == crit.unit_id).first()
    campaign = db.query(Campaign).filter(Campaign.id == unit.campaign_id).first()

    inv = db.query(Inventory).filter(Inventory.component_name == crit.component_name, Inventory.quantity > 0).first()
    used_warehouse = False

    if inv:
        inv.quantity -= 1
        if inv.quantity <= 0:
            db.delete(inv)
        used_warehouse = True
    else:
        cost = 100000.0
        if campaign.cbill_balance < cost:
            raise HTTPException(status_code=400, detail=f"Insufficient C-Bills () or Warehouse stock to replace {crit.component_name}!")
        campaign.cbill_balance -= cost

    component_name = crit.component_name
    db.delete(crit)

    db.add(CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type="Repair",
        description=f"Replaced destroyed {component_name} on {unit.chassis} ({unit.model}) using {'Warehouse Stock' if used_warehouse else ',000 C-Bills'}."
    ))

    db.commit()
    return {"message": f"Successfully replaced {component_name}!", "used_warehouse": used_warehouse}

@app.post("/api/v1/builder/commit")
def commit_custom_loadout(req: CommitLoadoutRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign state not found")

    discounted_cbill_cost = req.cbill_cost
    used_from_warehouse = []

    if req.components_used:
        for comp in req.components_used:
            inv = db.query(Inventory).filter(Inventory.component_name == comp, Inventory.quantity > 0).first()
            if inv:
                inv.quantity -= 1
                used_from_warehouse.append(comp)
                if inv.quantity <= 0:
                    db.delete(inv)

    if campaign.sp_balance < req.sp_cost or campaign.cbill_balance < discounted_cbill_cost:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient Treasury or SP! Requires {req.sp_cost} SP and  C-Bills."
        )

    campaign.sp_balance -= req.sp_cost
    campaign.cbill_balance -= discounted_cbill_cost

    unit_name = f"{req.chassis} ({req.model})"
    if req.unit_id:
        unit = db.query(Unit).filter(Unit.id == req.unit_id).first()
        if unit:
            unit.model = req.model
            unit.bv2 = req.bv2
            unit.tonnage = req.tonnage
            unit_name = f"{unit.chassis} ({unit.model})"

    else:
        unit = Unit(
            campaign_id=campaign.id,
            chassis=req.chassis,
            model=req.model,
            tonnage=req.tonnage,
            tech_base="Inner Sphere",
            bv2=req.bv2,
            armor_damage=0,
            structure_damage=0
        )
        db.add(unit)

    db.add(CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type="Refit",
        description=f"Custom loadout refit applied to {unit_name}. Billed {req.sp_cost} SP &  C-Bills."
    ))

    db.commit()
    return {
        "message": f"Successfully commissioned custom unit {unit_name}!", 
        "used_from_warehouse": used_from_warehouse
    }

@app.patch("/api/v1/units/{unit_id}/damage")
def update_unit_damage(unit_id: int, damage: UnitDamageUpdate, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    unit.armor_damage = max(0, damage.armor_damage)
    unit.structure_damage = max(0, damage.structure_damage)
    db.commit()
    db.refresh(unit)
    return unit

@app.post("/api/v1/units/{unit_id}/repair")
def repair_and_bill_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    if unit.armor_damage == 0 and unit.structure_damage == 0:
        raise HTTPException(status_code=400, detail="Unit has no active damage to repair.")

    armor_req = RepairRequest(component_type="Armor", amount_damaged=unit.armor_damage, tech_base=unit.tech_base)
    struct_req = RepairRequest(component_type="Structure", amount_damaged=unit.structure_damage, tech_base=unit.tech_base)

    armor_est = calculate_repair_task(armor_req) if unit.armor_damage > 0 else None
    struct_est = calculate_repair_task(struct_req) if unit.structure_damage > 0 else None

    total_sp = (armor_est.sp_cost if armor_est else 0) + (struct_est.sp_cost if struct_est else 0)
    total_cbills = (armor_est.cbill_cost if armor_est else 0.0) + (struct_est.cbill_cost if struct_est else 0.0)

    campaign = db.query(Campaign).filter(Campaign.id == unit.campaign_id).first()
    if campaign:
        if campaign.sp_balance < total_sp or campaign.cbill_balance < total_cbills:
            raise HTTPException(status_code=400, detail="Insufficient SP or C-Bills in treasury!")
        
        campaign.sp_balance -= total_sp
        campaign.cbill_balance -= total_cbills

    unit.armor_damage = 0
    unit.structure_damage = 0

    db.add(CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type="Repair",
        description=f"Repaired battle damage for {unit.chassis} ({unit.model}). Billed {total_sp} SP &  C-Bills."
    ))

    db.commit()
    return {"message": f"Successfully repaired {unit.chassis}!", "unit": unit}

@app.post("/api/v1/market/buy-supplies")
def market_buy_supplies(purchase: MarketPurchaseSuppliesRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.cbill_balance < purchase.cbill_cost or campaign.wp_balance < purchase.wp_cost:
        raise HTTPException(status_code=400, detail="Insufficient treasury funds or WP!")

    campaign.cbill_balance -= purchase.cbill_cost
    campaign.wp_balance -= purchase.wp_cost
    campaign.sp_balance += purchase.sp_amount

    db.commit()
    return {"message": f"Supplies purchased! +{purchase.sp_amount} Support Points credited.", "sp_balance": campaign.sp_balance}

@app.get("/api/v1/missions")
def get_missions(db: Session = Depends(get_db)):
    return db.query(Mission).all()

@app.post("/api/v1/missions")
def create_mission(mission_data: MissionCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()

    # Calculate Negotiated Final C-Bills & WP based on terms
    salvage_mult = 0.7 if mission_data.salvage_rights == "Full (100%)" else 0.85 if mission_data.salvage_rights == "Shared (50%)" else 1.15
    blc_mult = 0.85 if mission_data.blc_coverage == 1.0 else 0.92 if mission_data.blc_coverage == 0.5 else 1.05
    trans_mult = 1.10 if mission_data.transport_allowance == 1.0 else 1.05 if mission_data.transport_allowance == 0.5 else 1.0

    final_cbills = mission_data.base_cbill * salvage_mult * blc_mult * trans_mult
    final_wp = int(mission_data.wp_reward * (1.2 if mission_data.command_rights == "Independent" else 1.0))

    new_mission = Mission(
        campaign_id=campaign.id if campaign else 1,
        name=mission_data.name,
        mission_type=mission_data.mission_type,
        employer=mission_data.employer,
        wp_reward=final_wp,
        cbill_reward=final_cbills,
        salvage_rights=mission_data.salvage_rights,
        blc_coverage=mission_data.blc_coverage,
        transport_allowance=mission_data.transport_allowance,
        command_rights=mission_data.command_rights,
        status="Active"
    )
    db.add(new_mission)

    db.add(CampaignLog(
        campaign_id=campaign.id if campaign else 1,
        log_date=campaign.current_date if campaign else "3025-01-01",
        event_type="Contract",
        description=f"Signed Contract: {mission_data.name} ({mission_data.employer}). Reward:  C-Bills | BLC: {int(mission_data.blc_coverage*100)}% | Salvage: {mission_data.salvage_rights}."
    ))

    db.commit()
    db.refresh(new_mission)
    return new_mission

@app.post("/api/v1/missions/{mission_id}/complete")
def complete_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    if mission.status == "Completed":
        raise HTTPException(status_code=400, detail="Mission already completed")

    campaign = db.query(Campaign).filter(Campaign.id == mission.campaign_id).first()
    if campaign:
        campaign.wp_balance += mission.wp_reward
        campaign.cbill_balance += mission.cbill_reward

    mission.status = "Completed"
    db.commit()
    return {"message": "Mission completed successfully!", "mission": mission}

@app.get("/api/v1/pilots")
def get_pilots(db: Session = Depends(get_db)):
    pilots = db.query(Pilot).all()
    results = []
    for p in pilots:
        unit_info = None
        if p.assigned_unit:
            unit_info = f"{p.assigned_unit.chassis} ({p.assigned_unit.model})"
        results.append({
            "id": p.id,
            "name": p.name,
            "callsign": p.callsign,
            "gunnery": p.gunnery,
            "piloting": p.piloting,
            "status": p.status,
            "injuries": p.injuries,
            "days_remaining": p.days_remaining,
            "unit_id": p.unit_id,
            "assigned_unit": unit_info
        })
    return results

@app.post("/api/v1/pilots")
def create_pilot(pilot_data: PilotCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    new_pilot = Pilot(
        campaign_id=campaign.id if campaign else 1,
        name=pilot_data.name,
        callsign=pilot_data.callsign,
        gunnery=pilot_data.gunnery,
        piloting=pilot_data.piloting,
        unit_id=pilot_data.unit_id if pilot_data.unit_id else None,
        status="Active",
        injuries=0,
        days_remaining=0
    )
    db.add(new_pilot)
    db.commit()
    db.refresh(new_pilot)
    return new_pilot

@app.post("/api/v1/pilots/{pilot_id}/treat")
def treat_pilot_medical(pilot_id: int, db: Session = Depends(get_db)):
    pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
    if not pilot or pilot.status != "Injured":
        raise HTTPException(status_code=400, detail="Pilot is not currently injured or in MedBay.")

    campaign = db.query(Campaign).filter(Campaign.id == pilot.campaign_id).first()
    sp_cost = 50
    if campaign.sp_balance < sp_cost:
        raise HTTPException(status_code=400, detail=f"Requires {sp_cost} Support Points for emergency medical treatment!")

    campaign.sp_balance -= sp_cost
    pilot.days_remaining = max(0, pilot.days_remaining - 15)
    
    if pilot.days_remaining == 0:
        pilot.injuries = 0
        pilot.status = "Active"

    db.add(CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type="Medical",
        description=f"Applied emergency MedBay treatment to {pilot.name}. Expedited recovery time by -15 days."
    ))

    db.commit()
    return {"message": f"Emergency treatment applied to {pilot.name}!", "days_remaining": pilot.days_remaining}