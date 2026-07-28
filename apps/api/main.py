from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from packages.database.db import init_db, get_db
from packages.database.models import Campaign, Unit, Mission, Pilot
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

class UnitDamageUpdate(BaseModel):
    armor_damage: int
    structure_damage: int

class MissionCreate(BaseModel):
    name: str
    mission_type: str = "Raid"
    employer: str = "Mercenary Review Board"
    wp_reward: int = 300
    cbill_reward: float = 2500000.0

class PilotCreate(BaseModel):
    name: str
    callsign: str
    gunnery: int = 4
    piloting: int = 5
    unit_id: Optional[int] = None

class RefitApplyRequest(BaseModel):
    new_model: str
    new_bv2: int
    refit_class: str
    tech_rating: str = "Regular"

class MarketPurchaseUnitRequest(BaseModel):
    chassis: str
    model: str
    tonnage: int
    tech_base: str
    bv2: int
    cbill_cost: float
    wp_cost: int = 0

class MarketPurchaseSuppliesRequest(BaseModel):
    sp_amount: int = 0
    cbill_cost: float = 0.0
    wp_cost: int = 0

@app.get("/")
def read_root():
    return {"status": "online", "system": "BT-Manager Core Engine"}

@app.get("/api/v1/ledger/balance")
def get_balance(db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        return {"WP": 0, "SP": 0, "CBills": 0}
    return {"WP": campaign.wp_balance, "SP": campaign.sp_balance, "CBills": campaign.cbill_balance}

@app.get("/api/v1/units")
def get_units(db: Session = Depends(get_db)):
    return db.query(Unit).all()

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

@app.post("/api/v1/builder/commit")
def commit_custom_loadout(req: CommitLoadoutRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign state not found")

    if campaign.sp_balance < req.sp_cost or campaign.cbill_balance < req.cbill_cost:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient Treasury or SP! Requires {req.sp_cost} SP and  C-Bills."
        )

    # Deduct costs
    campaign.sp_balance -= req.sp_cost
    campaign.cbill_balance -= req.cbill_cost

    # Update existing Mech or create new custom variant
    if req.unit_id:
        unit = db.query(Unit).filter(Unit.id == req.unit_id).first()
        if unit:
            unit.model = req.model
            unit.bv2 = req.bv2
            unit.tonnage = req.tonnage
            db.commit()
            db.refresh(unit)
            return {"message": f"Successfully updated {unit.chassis} to custom variant {unit.model}!", "unit": unit}

    # Otherwise create brand new unit
    new_unit = Unit(
        campaign_id=campaign.id,
        chassis=req.chassis,
        model=req.model,
        tonnage=req.tonnage,
        tech_base="Inner Sphere",
        bv2=req.bv2,
        armor_damage=0,
        structure_damage=0
    )
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    return {"message": f"Successfully commissioned new custom unit {new_unit.chassis} ({new_unit.model})!", "unit": new_unit}

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

    db.commit()
    return {"message": f"Successfully repaired {unit.chassis}!", "unit": unit}

@app.post("/api/v1/units/{unit_id}/refit")
def apply_refit(unit_id: int, refit: RefitApplyRequest, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    refit_req = RefitRequest(
        refit_class=refit.refit_class,
        tech_base=unit.tech_base,
        tech_rating=refit.tech_rating,
        tonnage=unit.tonnage
    )
    estimate = calculate_refit_task(refit_req)

    campaign = db.query(Campaign).filter(Campaign.id == unit.campaign_id).first()
    if campaign:
        if campaign.sp_balance < estimate.sp_cost or campaign.cbill_balance < estimate.cbill_cost:
            raise HTTPException(status_code=400, detail="Insufficient SP or C-Bills for this Refit!")
        
        campaign.sp_balance -= estimate.sp_cost
        campaign.cbill_balance -= estimate.cbill_cost

    unit.model = refit.new_model
    unit.bv2 = refit.new_bv2

    db.commit()
    return {"message": f"Refit complete! Variant updated to {unit.model}.", "estimate": estimate, "unit": unit}

@app.post("/api/v1/market/buy-unit")
def market_buy_unit(purchase: MarketPurchaseUnitRequest, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.cbill_balance < purchase.cbill_cost or campaign.wp_balance < purchase.wp_cost:
        raise HTTPException(status_code=400, detail="Insufficient treasury funds or WP to procure this BattleMech!")

    campaign.cbill_balance -= purchase.cbill_cost
    campaign.wp_balance -= purchase.wp_cost

    new_unit = Unit(
        campaign_id=campaign.id,
        chassis=purchase.chassis,
        model=purchase.model,
        tonnage=purchase.tonnage,
        tech_base=purchase.tech_base,
        bv2=purchase.bv2,
        armor_damage=0,
        structure_damage=0
    )
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    return {"message": f"Procured {purchase.chassis} ({purchase.model})!", "unit": new_unit}

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
    new_mission = Mission(
        campaign_id=campaign.id if campaign else 1,
        name=mission_data.name,
        mission_type=mission_data.mission_type,
        employer=mission_data.employer,
        wp_reward=mission_data.wp_reward,
        cbill_reward=mission_data.cbill_reward,
        status="Active"
    )
    db.add(new_mission)
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
        status="Active"
    )
    db.add(new_pilot)
    db.commit()
    db.refresh(new_pilot)
    return new_pilot

@app.post("/api/v1/engine/repair-cost", response_model=RepairEstimate)
def estimate_repair(request: RepairRequest):
    return calculate_repair_task(request)

@app.post("/api/v1/engine/refit-cost", response_model=RepairEstimate)
def estimate_refit(request: RefitRequest):
    return calculate_refit_task(request)