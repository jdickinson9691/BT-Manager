from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from packages.database.models import Campaign, Pilot

class PersonnelAgent:
    """Agent 5: Personnel & MedBay Agent
    Responsibilities: Pilot skill progression (Gunnery/Piloting), Special Pilot Abilities (SPAs),
    hiring hall recruitment, XP awards, and MedBay medical triage/treatment workflows.
    """

    AVAILABLE_SPAS = [
        "None",
        "Sharpshooter (+1 Accuracy to Called Shots)",
        "Tactical Genius (Reroll Initiative Once)",
        "Jumping Jack (-1 Target Penalty when Jumping)",
        "Dodge (Physical Attack Evasion Bonus)",
        "Marksman (Energy Weapon Range Boost)",
        "Multi-Tasker (No Multi-Target Penalty)",
        "Weapon Specialist (+1 To-Hit with Primary Weapon)"
    ]

    @classmethod
    def recruit_pilot(
        cls,
        db: Session,
        name: str,
        callsign: str,
        gunnery: int = 4,
        piloting: int = 5,
        unit_id: Optional[int] = None
    ) -> Pilot:
        """Recruits a new pilot into the company roster."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        pilot = Pilot(
            campaign_id=campaign.id,
            name=name,
            callsign=callsign,
            gunnery=gunnery,
            piloting=piloting,
            unit_id=unit_id,
            status="Active",
            xp=25,
            spa="None",
            kills=0
        )
        db.add(pilot)
        db.commit()
        db.refresh(pilot)
        return pilot

    @classmethod
    def treat_medbay(cls, db: Session, pilot_id: int) -> Dict[str, Any]:
        """Accelerates healing of an injured pilot by expending Support Points (SP)."""
        pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
        if not pilot:
            raise ValueError("Pilot not found")
        campaign = db.query(Campaign).filter(Campaign.id == pilot.campaign_id).first()

        campaign.sp_balance = max(0, campaign.sp_balance - 50)
        pilot.days_remaining = max(0, pilot.days_remaining - 15)

        if pilot.days_remaining == 0:
            pilot.injuries = 0
            pilot.status = "Active"

        db.commit()
        return {
            "message": f"Medical treatment administered to {pilot.name}",
            "pilot_status": pilot.status,
            "days_remaining": pilot.days_remaining
        }

    @classmethod
    def upgrade_pilot_skill(cls, db: Session, pilot_id: int, skill_type: str) -> Dict[str, Any]:
        """Upgrades Gunnery (30 XP) or Piloting (20 XP) rating."""
        pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
        if not pilot:
            raise ValueError("Pilot not found")

        if skill_type.lower() == "gunnery":
            cost = 30
            if pilot.xp < cost:
                raise ValueError("Insufficient XP for Gunnery upgrade (Requires 30 XP)")
            if pilot.gunnery <= 0:
                raise ValueError("Gunnery skill already at maximum (0)")
            pilot.xp -= cost
            pilot.gunnery -= 1
        elif skill_type.lower() == "piloting":
            cost = 20
            if pilot.xp < cost:
                raise ValueError("Insufficient XP for Piloting upgrade (Requires 20 XP)")
            if pilot.piloting <= 0:
                raise ValueError("Piloting skill already at maximum (0)")
            pilot.xp -= cost
            pilot.piloting -= 1
        else:
            raise ValueError("Invalid skill_type. Use 'gunnery' or 'piloting'")

        db.commit()
        return {
            "message": f"Upgraded {skill_type.capitalize()} for {pilot.name}",
            "gunnery": pilot.gunnery,
            "piloting": pilot.piloting,
            "remaining_xp": pilot.xp
        }

    @classmethod
    def assign_spa(cls, db: Session, pilot_id: int, spa_name: str) -> Dict[str, Any]:
        """Assigns a Special Pilot Ability (SPA) perk to a pilot."""
        pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
        if not pilot:
            raise ValueError("Pilot not found")

        pilot.spa = spa_name
        db.commit()
        return {"message": f"Assigned SPA perk '{spa_name}' to {pilot.name}", "spa": spa_name}

    @classmethod
    def award_xp(cls, db: Session, pilot_id: int, xp_amount: int = 15, kills_added: int = 0) -> Dict[str, Any]:
        """Awards combat experience XP and kill count credit to a pilot."""
        pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
        if not pilot:
            raise ValueError("Pilot not found")

        pilot.xp += xp_amount
        pilot.kills += kills_added
        db.commit()
        return {
            "message": f"Awarded +{xp_amount} XP and +{kills_added} kills to {pilot.name}",
            "total_xp": pilot.xp,
            "total_kills": pilot.kills
        }

    @classmethod
    def ransom_bondsman(cls, db: Session, pilot_id: int, ransom_amount: int = 50) -> Dict[str, Any]:
        """Ransoms a captured bondsman back to their employer for Warchest Points (WP)."""
        from packages.database.models import CampaignLog
        pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
        if not pilot:
            raise ValueError("Pilot not found")
        if (pilot.bondsmen or 0) <= 0:
            raise ValueError("Pilot has no active bondsmen to ransom")

        campaign = db.query(Campaign).filter(Campaign.id == pilot.campaign_id).first()
        campaign.wp_balance += ransom_amount
        pilot.bondsmen -= 1

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Bondsman Ransom",
            description=f"Ransomed captured enemy bondsman back to employer for {ransom_amount} WP."
        ))
        db.commit()

        return {
            "message": f"Successfully ransomed bondsman for {ransom_amount} WP!",
            "wp_balance": campaign.wp_balance,
            "remaining_bondsmen": pilot.bondsmen
        }

    @classmethod
    def integrate_bondsman(cls, db: Session, pilot_id: int, bondsman_name: str = "MechWarrior Marcus Trent", callsign: str = "Bondsman") -> Dict[str, Any]:
        """Rehabilitates a captured bondsman into an active pilot on the roster."""
        from packages.database.models import CampaignLog
        captor = db.query(Pilot).filter(Pilot.id == pilot_id).first()
        if not captor:
            raise ValueError("Captor pilot not found")
        if (captor.bondsmen or 0) <= 0:
            raise ValueError("Captor pilot has no active bondsmen to integrate")

        campaign = db.query(Campaign).filter(Campaign.id == captor.campaign_id).first()
        captor.bondsmen -= 1

        new_pilot = Pilot(
            campaign_id=campaign.id,
            name=bondsman_name,
            callsign=callsign,
            gunnery=4,
            piloting=5,
            status="Active",
            xp=20,
            spa="None",
            kills=0,
            bondsmen=0
        )
        db.add(new_pilot)
        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Bondsman Integration",
            description=f"Rehabilitated bondsman '{bondsman_name}' ({callsign}) into the active roster as MechWarrior."
        ))
        db.commit()
        db.refresh(new_pilot)

        return {
            "message": f"Rehabilitated '{bondsman_name}' ({callsign}) into active mercenary roster!",
            "new_pilot_id": new_pilot.id
        }
