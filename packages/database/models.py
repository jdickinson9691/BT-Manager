from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Mercenary Command")
    wp_balance = Column(Integer, default=1250)
    sp_balance = Column(Integer, default=450)
    cbill_balance = Column(Float, default=18500000.0)

    units = relationship("Unit", back_populates="campaign")
    missions = relationship("Mission", back_populates="campaign")

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), default=1)
    chassis = Column(String, nullable=False)
    model = Column(String, nullable=False)
    tonnage = Column(Integer, nullable=False)
    tech_base = Column(String, default="Inner Sphere")
    bv2 = Column(Integer, default=1000)
    armor_damage = Column(Integer, default=0)
    structure_damage = Column(Integer, default=0)

    campaign = relationship("Campaign", back_populates="units")

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), default=1)
    name = Column(String, nullable=False)
    mission_type = Column(String, default="Raid")
    employer = Column(String, default="Free Worlds League")
    wp_reward = Column(Integer, default=300)
    cbill_reward = Column(Float, default=2500000.0)
    status = Column(String, default="Active")  # Active, Completed, Failed

    campaign = relationship("Campaign", back_populates="missions")