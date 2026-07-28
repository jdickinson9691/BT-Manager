from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from packages.database.db import Base

class Pilot(Base):
    __tablename__ = "pilots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    callsign = Column(String, nullable=True)
    gunnery_skill = Column(Integer, default=4)
    piloting_skill = Column(Integer, default=5)
    status = Column(String, default="Active")  # Active, Injured, KIA
    monthly_salary = Column(Integer, default=1500)

    units = relationship("Unit", back_populates="assigned_pilot")

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    chassis = Column(String, nullable=False)
    model = Column(String, nullable=False)
    tonnage = Column(Integer, nullable=False)
    bv2 = Column(Integer, default=0)
    tech_base = Column(String, default="Inner Sphere")
    status = Column(String, default="Operational")  # Operational, Maintenance, Destroyed
    
    current_armor = Column(JSON, nullable=True)     # Stores current armor values dict
    current_structure = Column(JSON, nullable=True) # Stores current internal structure values dict
    
    assigned_pilot_id = Column(Integer, ForeignKey("pilots.id"), nullable=True)
    assigned_pilot = relationship("Pilot", back_populates="units")

class ContractTrack(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    employer = Column(String, nullable=False)
    target = Column(String, nullable=False)
    warchest_entry_fee = Column(Integer, default=0)
    potential_wp_payout = Column(Integer, default=0)
    cbill_base_pay = Column(Float, default=0.0)
    status = Column(String, default="Open")  # Open, Active, Completed, Failed

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id = Column(Integer, primary_key=True, index=True)
    currency_type = Column(String, nullable=False)  # "WP", "SP", "CBills"
    amount = Column(Float, nullable=False)           # Positive for income, negative for expense
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
