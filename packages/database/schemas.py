from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

# --- PILOT SCHEMAS ---
class PilotBase(BaseModel):
    name: str
    callsign: Optional[str] = None
    gunnery_skill: int = 4
    piloting_skill: int = 5
    status: str = "Active"
    monthly_salary: int = 1500

class PilotCreate(PilotBase):
    pass

class PilotResponse(PilotBase):
    id: int
    class Config:
        from_attributes = True

# --- UNIT SCHEMAS ---
class UnitBase(BaseModel):
    chassis: str
    model: str
    tonnage: int
    bv2: int = 0
    tech_base: str = "Inner Sphere"
    status: str = "Operational"
    current_armor: Optional[Dict[str, int]] = None
    current_structure: Optional[Dict[str, int]] = None
    assigned_pilot_id: Optional[int] = None

class UnitCreate(UnitBase):
    pass

class UnitResponse(UnitBase):
    id: int
    assigned_pilot: Optional[PilotResponse] = None
    class Config:
        from_attributes = True

# --- LEDGER SCHEMAS ---
class LedgerCreate(BaseModel):
    currency_type: str
    amount: float
    description: str

class LedgerResponse(LedgerCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
