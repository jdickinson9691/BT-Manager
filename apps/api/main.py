from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from packages.database.db import SessionLocal, init_db
from packages.database import models, schemas
from packages.engine.warchest import WarchestEngine
from packages.engine.repairs import RepairEngine
from packages.engine.bv_calculator import BV2Calculator

# Initialize DB tables on startup
init_db()

app = FastAPI(title="BT-Manager API", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency for DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "online", "system": "BT-Manager API"}

# --- PILOT ENDPOINTS ---
@app.get("/api/v1/pilots", response_model=List[schemas.PilotResponse])
def get_pilots(db: Session = Depends(get_db)):
    return db.query(models.Pilot).all()

@app.post("/api/v1/pilots", response_model=schemas.PilotResponse)
def create_pilot(pilot: schemas.PilotCreate, db: Session = Depends(get_db)):
    db_pilot = models.Pilot(**pilot.dict())
    db.add(db_pilot)
    db.commit()
    db.refresh(db_pilot)
    return db_pilot

# --- UNIT ENDPOINTS ---
@app.get("/api/v1/units", response_model=List[schemas.UnitResponse])
def get_units(db: Session = Depends(get_db)):
    return db.query(models.Unit).all()

@app.post("/api/v1/units", response_model=schemas.UnitResponse)
def create_unit(unit: schemas.UnitCreate, db: Session = Depends(get_db)):
    db_unit = models.Unit(**unit.dict())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

# --- LEDGER ENDPOINTS ---
@app.get("/api/v1/ledger", response_model=List[schemas.LedgerResponse])
def get_ledger(db: Session = Depends(get_db)):
    return db.query(models.LedgerEntry).order_by(models.LedgerEntry.created_at.desc()).all()

@app.post("/api/v1/ledger", response_model=schemas.LedgerResponse)
def add_ledger_entry(entry: schemas.LedgerCreate, db: Session = Depends(get_db)):
    db_entry = models.LedgerEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/api/v1/ledger/balance")
def get_ledger_balance(db: Session = Depends(get_db)):
    entries = db.query(models.LedgerEntry).all()
    balances = {"WP": 0.0, "SP": 0.0, "CBills": 0.0}
    for e in entries:
        if e.currency_type in balances:
            balances[e.currency_type] += e.amount
    return balances

# --- CALCULATION ENGINE TRIGGERS ---
@app.post("/api/v1/engine/repair-cost")
def calculate_repair(points_missing: int, tech_base: str = "Inner Sphere"):
    return RepairEngine.calculate_armor_repair_cost(points_missing, tech_base)

@app.post("/api/v1/engine/bv-adjust")
def calculate_bv(base_bv: int, gunnery: int = 4, piloting: int = 5):
    adjusted = BV2Calculator.get_adjusted_bv(base_bv, gunnery, piloting)
    return {"base_bv": base_bv, "adjusted_bv": adjusted}
