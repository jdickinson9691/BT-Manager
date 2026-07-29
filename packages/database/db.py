from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./dev.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    import packages.database.models as models
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        campaign = db.query(models.Campaign).first()
        if not campaign:
            default_campaign = models.Campaign(
                name="Mercenary Unit",
                wp_balance=1000,
                sp_balance=500,
                cbill_balance=15000000.0,
                current_date="3025-01-01",
                daily_overhead=5000.0
            )
            db.add(default_campaign)
            db.commit()
            db.refresh(default_campaign)

            # Default Units
            db.add(models.Unit(campaign_id=default_campaign.id, chassis="Marauder", model="MAD-3R", tonnage=75, bv2=1363))
            
            # Default Warehouse Stock
            db.add(models.Inventory(campaign_id=default_campaign.id, component_name="PPC", quantity=2, category="Weapon"))
            db.add(models.Inventory(campaign_id=default_campaign.id, component_name="Medium Laser", quantity=4, category="Weapon"))
            
            # Default Contract
            db.add(models.Mission(campaign_id=default_campaign.id, name="Operation Red Storm", mission_type="Raid", employer="House Davion", wp_reward=350, cbill_reward=3000000.0))
            
            # Default Pilot
            db.add(models.Pilot(campaign_id=default_campaign.id, name="Grayson Carlyle", callsign="Shadow", gunnery=3, piloting=4))
            
            # Default Initial Journal Entry
            db.add(models.CampaignLog(campaign_id=default_campaign.id, log_date="3025-01-01", event_type="System", description="Mercenary Unit campaign initialized on 3025-01-01."))
            
            db.commit()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()