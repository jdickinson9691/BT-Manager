from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from packages.database.db import init_db, get_db
from packages.database.models import Campaign, Unit, Mission
from packages.engine.repair import RepairRequest, RepairEstimate, calculate_repair_task

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

class MissionCreate(BaseModel):
    name: str
    mission_type: str = "Raid"
    employer: str = "Mercenary Review Board"
    wp_reward: int = 300
    cbill_reward: float = 2500000.0

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
        bv2=unit_data.bv2
    )
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    return new_unit

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
    return {"message": "Mission completed successfully! Contract reward payout added to treasury.", "mission": mission}

@app.post("/api/v1/engine/repair-cost", response_model=RepairEstimate)
def estimate_repair(request: RepairRequest):
    return calculate_repair_task(request)