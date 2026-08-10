from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./dev.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_auto_migrations(engine):
    """Executes automatic SQLite column migrations for existing databases to prevent missing column errors."""
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            # Check campaigns table columns
            res = conn.execute(text("PRAGMA table_info(campaigns)")).fetchall()
            cols = {row[1] for row in res}
            
            if "loan_balance" not in cols:
                conn.execute(text("ALTER TABLE campaigns ADD COLUMN loan_balance FLOAT DEFAULT 0.0"))
            if "loan_interest_rate" not in cols:
                conn.execute(text("ALTER TABLE campaigns ADD COLUMN loan_interest_rate FLOAT DEFAULT 0.05"))
            if "era" not in cols:
                conn.execute(text("ALTER TABLE campaigns ADD COLUMN era VARCHAR DEFAULT '3025'"))
            if "daily_overhead" not in cols:
                conn.execute(text("ALTER TABLE campaigns ADD COLUMN daily_overhead FLOAT DEFAULT 5000.0"))
                
            # Check pilots table columns
            res_pilots = conn.execute(text("PRAGMA table_info(pilots)")).fetchall()
            pilot_cols = {row[1] for row in res_pilots}
            if "bondsmen" not in pilot_cols:
                conn.execute(text("ALTER TABLE pilots ADD COLUMN bondsmen INTEGER DEFAULT 0"))
            if "kills" not in pilot_cols:
                conn.execute(text("ALTER TABLE pilots ADD COLUMN kills INTEGER DEFAULT 0"))
            if "spa" not in pilot_cols:
                conn.execute(text("ALTER TABLE pilots ADD COLUMN spa VARCHAR DEFAULT 'None'"))
            if "xp" not in pilot_cols:
                conn.execute(text("ALTER TABLE pilots ADD COLUMN xp INTEGER DEFAULT 50"))
                
            # Check units table columns
            res_units = conn.execute(text("PRAGMA table_info(units)")).fetchall()
            unit_cols = {row[1] for row in res_units}
            if "tech_base" not in unit_cols:
                conn.execute(text("ALTER TABLE units ADD COLUMN tech_base VARCHAR DEFAULT 'Inner Sphere'"))
            if "bv2" not in unit_cols:
                conn.execute(text("ALTER TABLE units ADD COLUMN bv2 INTEGER DEFAULT 1000"))
            if "armor_damage" not in unit_cols:
                conn.execute(text("ALTER TABLE units ADD COLUMN armor_damage INTEGER DEFAULT 0"))
            if "structure_damage" not in unit_cols:
                conn.execute(text("ALTER TABLE units ADD COLUMN structure_damage INTEGER DEFAULT 0"))
                
            # Check missions table columns
            res_missions = conn.execute(text("PRAGMA table_info(missions)")).fetchall()
            mission_cols = {row[1] for row in res_missions}
            if "sp_reward" not in mission_cols:
                conn.execute(text("ALTER TABLE missions ADD COLUMN sp_reward INTEGER DEFAULT 200"))
            if "salvage_rights" not in mission_cols:
                conn.execute(text("ALTER TABLE missions ADD COLUMN salvage_rights VARCHAR DEFAULT 'Shared (50%)'"))
            if "blc_coverage" not in mission_cols:
                conn.execute(text("ALTER TABLE missions ADD COLUMN blc_coverage FLOAT DEFAULT 0.5"))
            if "transport_allowance" not in mission_cols:
                conn.execute(text("ALTER TABLE missions ADD COLUMN transport_allowance FLOAT DEFAULT 0.5"))
            if "command_rights" not in mission_cols:
                conn.execute(text("ALTER TABLE missions ADD COLUMN command_rights VARCHAR DEFAULT 'Integrated'"))
                
            conn.commit()
    except Exception as e:
        print("[MIGRATION NOTE]", e)

def init_db():
    import packages.database.models as models
    Base.metadata.create_all(bind=engine)
    run_auto_migrations(engine)
    
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