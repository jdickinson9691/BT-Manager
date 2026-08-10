from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from packages.database.db import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Mercenary Unit")
    wp_balance = Column(Integer, default=1500)
    sp_balance = Column(Integer, default=800)
    cbill_balance = Column(Float, default=0.0)
    current_date = Column(String, default="3025-01-01")
    daily_overhead = Column(Float, default=10.0)
    mrb_rating = Column(String, default="C")
    reputation_score = Column(Integer, default=50)
    loan_balance = Column(Float, default=0.0)
    loan_interest_rate = Column(Float, default=0.05)
    era = Column(String, default="3025")

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
    event_type = Column(String)
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
    critical_hits = relationship("CriticalHit", back_populates="unit", cascade="all, delete-orphan")

class CriticalHit(Base):
    __tablename__ = "critical_hits"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"))
    location = Column(String)
    component_name = Column(String)
    is_destroyed = Column(Boolean, default=True)

    unit = relationship("Unit", back_populates="critical_hits")

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
    wp_reward = Column(Integer, default=400)
    sp_reward = Column(Integer, default=200)
    cbill_reward = Column(Float, default=0.0)
    salvage_rights = Column(String, default="Shared (50%)")
    blc_coverage = Column(Float, default=0.5)
    transport_allowance = Column(Float, default=0.5)
    command_rights = Column(String, default="Integrated")
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
    injuries = Column(Integer, default=0)
    days_remaining = Column(Integer, default=0)
    xp = Column(Integer, default=50)
    spa = Column(String, default="None")
    kills = Column(Integer, default=0)
    bondsmen = Column(Integer, default=0)

    campaign = relationship("Campaign", back_populates="pilots")
    assigned_unit = relationship("Unit", back_populates="pilots")

class RefEquipment(Base):
    __tablename__ = "ref_equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, default="Weapon")
    tonnage = Column(Float, default=1.0)
    critical_slots = Column(Integer, default=1)
    heat = Column(Integer, default=0)
    damage = Column(Integer, default=0)
    min_range = Column(Integer, default=0)
    short_range = Column(Integer, default=3)
    med_range = Column(Integer, default=6)
    long_range = Column(Integer, default=9)
    bv2 = Column(Integer, default=50)
    tech_base = Column(String, default="Inner Sphere")
    rules_level = Column(String, default="Standard")
    cbill_cost = Column(Float, default=100000.0)

class RefUnit(Base):
    __tablename__ = "ref_units"

    id = Column(Integer, primary_key=True, index=True)
    chassis = Column(String, index=True)
    model = Column(String, index=True)
    unit_type = Column(String, default="Mech")  # Mech, Vehicle, Aerospace, BattleArmor
    tonnage = Column(Integer, default=50)
    bv2 = Column(Integer, default=1000)
    tech_base = Column(String, default="Inner Sphere")
    rules_level = Column(String, default="Standard")
    cbill_cost = Column(Float, default=3500000.0)
    intro_year = Column(Integer, default=3025)
    supported_eras = Column(String, default="3025,3050,3062")

class RefSPA(Base):
    __tablename__ = "ref_spas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    xp_cost = Column(Integer, default=30)
    category = Column(String, default="Gunnery")
    description = Column(String)
    effect = Column(String)
    prerequisites = Column(String, default="None")
    rulebook_reference = Column(String, default="A Time of War v4.0")

class RefStarmap(Base):
    __tablename__ = "ref_starmap"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    x_coord = Column(Float, default=0.0)
    y_coord = Column(Float, default=0.0)
    spectral_class = Column(String, default="G2V")
    controlling_faction = Column(String, default="Mercenary")
    region = Column(String, default="Inner Sphere")