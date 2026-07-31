from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from packages.database.db import init_db, engine
from packages.database.models import Campaign, Unit, Pilot, Mission, Inventory, CampaignLog, CriticalHit

class CoreAgent:
    """Agent 1: Core Launcher & Database Agent
    Responsibilities: Database schema initialization, campaign creation, era selection,
    auto-seeding default campaigns, schema migrations, JSON save/load export/import,
    and persistent campaign state management.
    """

    SUPPORTED_ERAS = [
        "Late Succession War - Renaissance (3020–3049)",
        "Clan Invasion (3050–3061)"
    ]

    @classmethod
    def setup_database(cls) -> None:
        """Initializes database schema and handles automatic column migrations."""
        init_db()
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(pilots)"))
            columns = [row[1] for row in result.fetchall()]
            if "xp" not in columns:
                conn.execute(text("ALTER TABLE pilots ADD COLUMN xp INTEGER DEFAULT 50"))
            if "spa" not in columns:
                conn.execute(text("ALTER TABLE pilots ADD COLUMN spa TEXT DEFAULT 'None'"))
            if "kills" not in columns:
                conn.execute(text("ALTER TABLE pilots ADD COLUMN kills INTEGER DEFAULT 0"))
            
            result_c = conn.execute(text("PRAGMA table_info(campaigns)"))
            c_columns = [row[1] for row in result_c.fetchall()]
            if "era" not in c_columns:
                conn.execute(text("ALTER TABLE campaigns ADD COLUMN era TEXT DEFAULT '3025'"))
            conn.commit()

    @classmethod
    def get_campaign(cls, db: Session) -> Campaign:
        """Fetches the primary active campaign, creating a default seeded campaign if none exists."""
        campaign = db.query(Campaign).first()
        if not campaign:
            campaign = cls.create_default_seeded_campaign(db)
        return campaign

    @classmethod
    def export_campaign_json(cls, db: Session) -> Dict[str, Any]:
        """Serializes complete campaign state into portable JSON format."""
        campaign = cls.get_campaign(db)
        units = db.query(Unit).filter(Unit.campaign_id == campaign.id).all()
        pilots = db.query(Pilot).filter(Pilot.campaign_id == campaign.id).all()
        missions = db.query(Mission).filter(Mission.campaign_id == campaign.id).all()
        inventory = db.query(Inventory).filter(Inventory.campaign_id == campaign.id).all()
        logs = db.query(CampaignLog).filter(CampaignLog.campaign_id == campaign.id).all()

        return {
            "version": "2.0",
            "campaign": {
                "name": campaign.name,
                "wp_balance": campaign.wp_balance,
                "sp_balance": campaign.sp_balance,
                "cbill_balance": campaign.cbill_balance,
                "current_date": campaign.current_date,
                "daily_overhead": campaign.daily_overhead,
                "mrb_rating": campaign.mrb_rating,
                "reputation_score": campaign.reputation_score
            },
            "units": [
                {
                    "chassis": u.chassis, "model": u.model, "tonnage": u.tonnage,
                    "tech_base": u.tech_base, "bv2": u.bv2,
                    "armor_damage": u.armor_damage, "structure_damage": u.structure_damage,
                    "critical_hits": [{"location": c.location, "component_name": c.component_name} for c in u.critical_hits]
                } for u in units
            ],
            "pilots": [
                {
                    "name": p.name, "callsign": p.callsign, "gunnery": p.gunnery,
                    "piloting": p.piloting, "status": p.status, "injuries": p.injuries,
                    "days_remaining": p.days_remaining, "xp": p.xp, "spa": p.spa, "kills": p.kills
                } for p in pilots
            ],
            "missions": [
                {
                    "name": m.name, "mission_type": m.mission_type, "employer": m.employer,
                    "wp_reward": m.wp_reward, "cbill_reward": m.cbill_reward,
                    "salvage_rights": m.salvage_rights, "status": m.status
                } for m in missions
            ],
            "inventory": [
                {"component_name": i.component_name, "quantity": i.quantity, "category": i.category} for i in inventory
            ],
            "logs": [
                {"log_date": l.log_date, "event_type": l.event_type, "description": l.description} for l in logs
            ]
        }

    @classmethod
    def import_campaign_json(cls, db: Session, data: Dict[str, Any]) -> Campaign:
        """Restores complete campaign state from JSON payload."""
        db.query(CampaignLog).delete()
        db.query(Inventory).delete()
        db.query(Mission).delete()
        db.query(Pilot).delete()
        db.query(CriticalHit).delete()
        db.query(Unit).delete()
        db.query(Campaign).delete()
        db.commit()

        c_data = data.get("campaign", {})
        campaign = Campaign(
            name=c_data.get("name", "Restored Campaign"),
            wp_balance=c_data.get("wp_balance", 1000),
            sp_balance=c_data.get("sp_balance", 500),
            cbill_balance=c_data.get("cbill_balance", 15000000.0),
            current_date=c_data.get("current_date", "3025-01-01"),
            daily_overhead=c_data.get("daily_overhead", 5000.0),
            mrb_rating=c_data.get("mrb_rating", "C"),
            reputation_score=c_data.get("reputation_score", 50)
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        for u in data.get("units", []):
            unit = Unit(
                campaign_id=campaign.id, chassis=u.get("chassis"), model=u.get("model"),
                tonnage=u.get("tonnage"), tech_base=u.get("tech_base", "Inner Sphere"),
                bv2=u.get("bv2", 1000), armor_damage=u.get("armor_damage", 0),
                structure_damage=u.get("structure_damage", 0)
            )
            db.add(unit)
            db.commit()
            db.refresh(unit)
            for c in u.get("critical_hits", []):
                db.add(CriticalHit(unit_id=unit.id, location=c.get("location"), component_name=c.get("component_name")))

        for p in data.get("pilots", []):
            db.add(Pilot(
                campaign_id=campaign.id, name=p.get("name"), callsign=p.get("callsign"),
                gunnery=p.get("gunnery", 4), piloting=p.get("piloting", 5),
                status=p.get("status", "Active"), injuries=p.get("injuries", 0),
                days_remaining=p.get("days_remaining", 0), xp=p.get("xp", 50),
                spa=p.get("spa", "None"), kills=p.get("kills", 0)
            ))

        for m in data.get("missions", []):
            db.add(Mission(
                campaign_id=campaign.id, name=m.get("name"), mission_type=m.get("mission_type"),
                employer=m.get("employer"), wp_reward=m.get("wp_reward"), cbill_reward=m.get("cbill_reward"),
                salvage_rights=m.get("salvage_rights", "Shared (50%)"), status=m.get("status", "Active")
            ))

        for i in data.get("inventory", []):
            db.add(Inventory(
                campaign_id=campaign.id, component_name=i.get("component_name"),
                quantity=i.get("quantity", 1), category=i.get("category", "Weapon")
            ))

        for l in data.get("logs", []):
            db.add(CampaignLog(
                campaign_id=campaign.id, log_date=l.get("log_date"),
                event_type=l.get("event_type"), description=l.get("description")
            ))

        db.commit()
        return campaign

    @classmethod
    def create_default_seeded_campaign(cls, db: Session) -> Campaign:
        """Seeds a rich starter mercenary campaign ('Wolf's Irregulars') into the database."""
        campaign = Campaign(
            name="Wolf's Irregulars",
            wp_balance=1250,
            sp_balance=750,
            cbill_balance=15000000.0,
            current_date="3025-01-15",
            daily_overhead=5000.0,
            mrb_rating="B",
            reputation_score=72
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        u1 = Unit(campaign_id=campaign.id, chassis="Marauder", model="MAD-3R", tonnage=75, tech_base="Inner Sphere", bv2=1363)
        u2 = Unit(campaign_id=campaign.id, chassis="Warhammer", model="WHM-6R", tonnage=70, tech_base="Inner Sphere", bv2=1299)
        u3 = Unit(campaign_id=campaign.id, chassis="Shadow Hawk", model="SHD-2H", tonnage=55, tech_base="Inner Sphere", bv2=1064)
        u4 = Unit(campaign_id=campaign.id, chassis="Timber Wolf", model="Prime", tonnage=75, tech_base="Clan", bv2=2737)
        db.add_all([u1, u2, u3, u4])
        db.commit()

        p1 = Pilot(campaign_id=campaign.id, name="Varian Vance", callsign="Grim", gunnery=3, piloting=4, unit_id=u1.id, status="Active", xp=75, spa="Sharpshooter (+1 Accuracy to Called Shots)", kills=4)
        p2 = Pilot(campaign_id=campaign.id, name="Kaelen Cross", callsign="Bishop", gunnery=4, piloting=4, unit_id=u2.id, status="Active", xp=40, spa="Tactical Genius (Reroll Initiative Once)", kills=2)
        p3 = Pilot(campaign_id=campaign.id, name="Mara Sterling", callsign="Vixen", gunnery=3, piloting=3, unit_id=u4.id, status="Active", xp=110, spa="Marksman (Energy Weapon Range Boost)", kills=7)
        db.add_all([p1, p2, p3])

        m1 = Mission(
            campaign_id=campaign.id,
            name="Garrison Defense",
            mission_type="Garrison",
            employer="House Davion",
            wp_reward=350,
            cbill_reward=3500000.0,
            salvage_rights="Shared (50%)",
            status="Available"
        )
        m2 = Mission(
            campaign_id=campaign.id,
            name="Objective Raid",
            mission_type="Raid",
            employer="Draconis Combine Mustered Soldier",
            wp_reward=450,
            cbill_reward=4200000.0,
            salvage_rights="Full Salvage",
            status="Available"
        )
        m3 = Mission(
            campaign_id=campaign.id,
            name="Planetary Reconnaissance",
            mission_type="Recon",
            employer="Independent Local Government",
            wp_reward=300,
            cbill_reward=2800000.0,
            salvage_rights="Shared (25%)",
            status="Available"
        )
        db.add_all([m1, m2, m3])

        inv1 = Inventory(campaign_id=campaign.id, component_name="PPC", quantity=2, category="Weapon")
        inv2 = Inventory(campaign_id=campaign.id, component_name="AC/20", quantity=1, category="Weapon")
        inv3 = Inventory(campaign_id=campaign.id, component_name="Medium Laser", quantity=4, category="Weapon")
        inv4 = Inventory(campaign_id=campaign.id, component_name="Heat Sink", quantity=8, category="Equipment")
        db.add_all([inv1, inv2, inv3, inv4])

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Setup",
            description="Mercenary company 'Wolf's Irregulars' established on Outreach."
        ))

        db.commit()
        return campaign

    @classmethod
    def get_ledger_summary(cls, db: Session) -> Dict[str, Any]:
        """Calculates current financial ledger totals including debt and interest."""
        campaign = cls.get_campaign(db)
        loan_bal = getattr(campaign, 'loan_balance', 0.0) or 0.0
        loan_rate = getattr(campaign, 'loan_interest_rate', 0.05) or 0.05
        monthly_interest = loan_bal * loan_rate

        return {
            "campaign_name": campaign.name,
            "WP": campaign.wp_balance,
            "SP": campaign.sp_balance,
            "CBills": campaign.cbill_balance,
            "current_date": campaign.current_date,
            "daily_overhead": campaign.daily_overhead,
            "mrb_rating": campaign.mrb_rating,
            "reputation_score": campaign.reputation_score,
            "era": getattr(campaign, 'era', "3025") or "3025",
            "loan_balance": loan_bal,
            "loan_interest_rate": loan_rate,
            "monthly_interest_due": monthly_interest
        }

    @classmethod
    def take_loan(cls, db: Session, principal: float = 1000000.0, interest_rate: float = 0.05) -> Dict[str, Any]:
        """Takes out a financial credit loan from ComStar / MRB Bank."""
        campaign = cls.get_campaign(db)
        campaign.cbill_balance += principal
        campaign.loan_balance = (campaign.loan_balance or 0.0) + principal
        campaign.loan_interest_rate = interest_rate

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Loan Financed",
            description=f"Secured ${principal:,.2f} C-Bills loan from ComStar / MRB Bank at {interest_rate*100:.1f}% monthly interest."
        ))
        db.commit()

        return {
            "message": f"Successfully secured ${principal:,.2f} C-Bills credit line!",
            "cbill_balance": campaign.cbill_balance,
            "loan_balance": campaign.loan_balance,
            "loan_interest_rate": campaign.loan_interest_rate
        }

    @classmethod
    def repay_loan(cls, db: Session, repayment_amount: float = 500000.0) -> Dict[str, Any]:
        """Repays active debt balance to ComStar / MRB Bank."""
        campaign = cls.get_campaign(db)
        current_debt = campaign.loan_balance or 0.0
        if current_debt <= 0:
            raise ValueError("Campaign has no outstanding debt to repay")

        actual_repay = min(repayment_amount, current_debt)
        campaign.cbill_balance -= actual_repay
        campaign.loan_balance -= actual_repay

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Loan Repayment",
            description=f"Repaid ${actual_repay:,.2f} C-Bills to ComStar / MRB Bank. Remaining Debt: ${campaign.loan_balance:,.2f}."
        ))
        db.commit()

        return {
            "message": f"Successfully repaid ${actual_repay:,.2f} C-Bills to ComStar / MRB Bank!",
            "cbill_balance": campaign.cbill_balance,
            "remaining_loan_balance": campaign.loan_balance
        }
