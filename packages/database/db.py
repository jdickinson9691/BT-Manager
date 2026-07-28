import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Campaign, Unit, Mission, Pilot

DB_PATH = os.path.join(os.path.dirname(__file__), "bt_manager.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(Campaign).first():
            default_campaign = Campaign(name="1st Mercenary Command", wp_balance=1250, sp_balance=450, cbill_balance=18500000.0)
            db.add(default_campaign)
            db.commit()
            db.refresh(default_campaign)

            unit1 = Unit(campaign_id=default_campaign.id, chassis="Warhammer", model="WHM-6R", tonnage=70, tech_base="Inner Sphere", bv2=1299)
            unit2 = Unit(campaign_id=default_campaign.id, chassis="Timber Wolf", model="Prime", tonnage=75, tech_base="Clan", bv2=2737)
            db.add_all([unit1, unit2])
            db.commit()

            mission1 = Mission(campaign_id=default_campaign.id, name="Operation Dust Storm", mission_type="Raid", employer="House Davion", wp_reward=400, cbill_reward=3500000.0, status="Active")
            db.add(mission1)

            pilot1 = Pilot(campaign_id=default_campaign.id, unit_id=unit1.id, name="Victor Steiner", callsign="Aegis", gunnery=3, piloting=4, status="Active")
            pilot2 = Pilot(campaign_id=default_campaign.id, unit_id=unit2.id, name="Natasha Kerensky", callsign="Black Widow", gunnery=2, piloting=3, status="Active")
            db.add_all([pilot1, pilot2])

            db.commit()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()