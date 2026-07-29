from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from packages.database.db import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Mercenary Unit")
    wp_balance = Column(Integer, default=1000)
    sp_balance = Column(Integer, default=500)
    cbill_balance = Column(Float, default=15000000.0)
    current_date = Column(String, default="3025-01-01")
    daily_overhead = Column(Float, default=5000.0)

    units = relationship("Unit", back_populates="campaign")
    missions = relationship("Mission", back_populates="campaign")
    pilots = relationship("Pilot", back_populates="campaign")
    inventory = relationship("Inventory", back_populates="campaign")
    logs = relationship("CampaignLog", back_populates="campaign")

class CampaignLog(Base):
    __tablename__ = "campaign_logs"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    log_date = Column(String)
    event_type = Column(String) # e.g., "AAR", "Refit", "Payroll", "Contract"
    description = Column(String)

    campaign = relationship("Campaign", back_populates="logs")

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    chassis = Column(String)
    model = Column(String)
    tonnage = Column(Integer)
    tech_base = Column(String, default="Inner Sphere")
    bv2 = Column(Integer, default=1000)
    armor_damage = Column(Integer, default=0)
    structure_damage = Column(Integer, default=0)

    campaign = relationship("Campaign", back_populates="units")
    pilots = relationship("Pilot", back_populates="assigned_unit")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    component_name = Column(String)
    quantity = Column(Integer, default=1)
    category = Column(String, default="Weapon")

    campaign = relationship("Campaign", back_populates="inventory")

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    name = Column(String)
    mission_type = Column(String)
    employer = Column(String)
    wp_reward = Column(Integer)
    cbill_reward = Column(Float)
    status = Column(String, default="Active")

    campaign = relationship("Campaign", back_populates="missions")

class Pilot(Base):
    __tablename__ = "pilots"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    name = Column(String)
    callsign = Column(String)
    gunnery = Column(Integer, default=4)
    piloting = Column(Integer, default=5)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)
    status = Column(String, default="Active")

    campaign = relationship("Campaign", back_populates="pilots")
    assigned_unit = relationship("Unit", back_populates="pilots")