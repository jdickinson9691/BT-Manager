from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from packages.database.models import Campaign, Mission, Unit, Pilot, CriticalHit, Inventory, CampaignLog
from packages.agents.contract_generator import ContractGenerator
from packages.engine.warchest import WarchestEngine

class OperationsAgent:
    """Agent 2: Operations & Contracts Agent
    Responsibilities: Command deck operations, day advancement, payroll processing,
    active deployment frames, procedural contract generation, Warchest Track objectives, and AAR combat stories.
    """

    @classmethod
    def advance_timeline(cls, db: Session, days: int) -> Dict[str, Any]:
        """Advances campaign timeline by specified days and deducts daily overhead in SP."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        current_dt = datetime.strptime(campaign.current_date, "%Y-%m-%d")
        new_dt = current_dt + timedelta(days=days)
        campaign.current_date = new_dt.strftime("%Y-%m-%d")

        overhead_discount = 0.85 if campaign.mrb_rating == "A" else 0.92 if campaign.mrb_rating == "B" else 1.0
        overhead_cost = int(round((campaign.daily_overhead or 10.0) * days * overhead_discount))
        campaign.sp_balance = max(0, (campaign.sp_balance or 0) - overhead_cost)

        pilots = db.query(Pilot).filter(Pilot.status == "Injured").all()
        recovered_names = []
        for p in pilots:
            if p.days_remaining > 0:
                p.days_remaining = max(0, p.days_remaining - days)
                if p.days_remaining == 0:
                    p.injuries = 0
                    p.status = "Active"
                    recovered_names.append(p.name)

        log_desc = f"Advanced campaign timeline by {days} day(s). Support overhead: {overhead_cost} SP."
        if recovered_names:
            log_desc += f" MedBay Release: {', '.join(recovered_names)} fully healed!"

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Timeline",
            description=log_desc
        ))
        db.commit()

        return {
            "message": f"Advanced {days} day(s)",
            "current_date": campaign.current_date,
            "overhead_incurred_sp": overhead_cost,
            "recovered_pilots": recovered_names
        }

    @classmethod
    def generate_procedural_contract(cls, db: Session) -> Mission:
        """Generates a procedural contract mission with MRB rating bonuses and AI intel summary."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        briefing = ContractGenerator.generate_procedural_contract(era=campaign.current_date[:4])

        mrb_bonus = 1.15 if campaign.mrb_rating == "A" else 1.08 if campaign.mrb_rating == "B" else 1.0
        final_wp = int(briefing["wp_reward"] * mrb_bonus)
        final_sp = int(briefing.get("sp_reward", 200) * mrb_bonus)

        mission = Mission(
            campaign_id=campaign.id,
            name=briefing["name"],
            mission_type=briefing["mission_type"],
            employer=briefing["employer"],
            wp_reward=final_wp,
            sp_reward=final_sp,
            cbill_reward=0.0,
            salvage_rights=briefing["salvage_rights"],
            blc_coverage=0.5,
            transport_allowance=0.5,
            command_rights="Integrated",
            status="Active"
        )
        db.add(mission)
        db.commit()

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Intel Brief",
            description=briefing["intel_summary"]
        ))
        db.commit()
        db.refresh(mission)
        return mission

    @classmethod
    def complete_warchest_track(
        cls,
        db: Session,
        mission_id: int,
        entry_fee_wp: int = 50,
        objectives: Optional[List[Dict[str, Any]]] = None,
        bonus_sp: int = 50
    ) -> Dict[str, Any]:
        """Settles a Warchest Track with optional objectives and records an itemized financial ledger entry."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if not mission:
            raise ValueError("Mission not found")

        reward_wp = mission.wp_reward or 400
        if objectives:
            for obj in objectives:
                if obj.get("completed", False):
                    reward_wp += obj.get("wp_bonus", 50)

        settlement = WarchestEngine.calculate_track_settlement(
            entry_fee_wp=entry_fee_wp,
            objective_rewards_wp=reward_wp,
            bonus_sp=bonus_sp
        )

        campaign.wp_balance += settlement["net_wp"]
        campaign.sp_balance += settlement["total_sp_earned"]
        mission.status = "Completed"

        ledger_desc = (
            f"Settled Warchest Track '{mission.name}'. "
            f"Entry Fee: -{entry_fee_wp} WP | Objective Payout: +{reward_wp} WP | "
            f"Financial Settlement: +{settlement['net_wp']} WP, +{settlement['total_sp_earned']} SP."
        )

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Financial Ledger",
            description=ledger_desc
        ))
        db.commit()

        return {
            "message": f"Track '{mission.name}' settled successfully!",
            "settlement": settlement
        }

    @classmethod
    def generate_contract(
        cls,
        db: Session,
        name: str,
        mission_type: str = "Raid",
        employer: str = "House Davion",
        wp_reward: int = 400,
        sp_reward: int = 200,
        salvage_rights: str = "Shared (50%)",
        blc_coverage: float = 0.5,
        transport_allowance: float = 0.5,
        command_rights: str = "Integrated"
    ) -> Mission:
        """Generates a manual contract mission with MRB rating multiplier bonuses."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        mrb_bonus = 1.15 if campaign.mrb_rating == "A" else 1.08 if campaign.mrb_rating == "B" else 1.0
        final_wp = int(wp_reward * mrb_bonus)
        final_sp = int(sp_reward * mrb_bonus)

        mission = Mission(
            campaign_id=campaign.id,
            name=name,
            mission_type=mission_type,
            employer=employer,
            wp_reward=final_wp,
            sp_reward=final_sp,
            cbill_reward=0.0,
            salvage_rights=salvage_rights,
            blc_coverage=blc_coverage,
            transport_allowance=transport_allowance,
            command_rights=command_rights,
            status="Active"
        )
        db.add(mission)
        db.commit()
        db.refresh(mission)
        return mission

    @classmethod
    def process_aar(
        cls,
        db: Session,
        unit_logs: List[Dict[str, Any]],
        pilot_logs: Optional[List[Dict[str, Any]]] = None,
        mission_id: Optional[int] = None,
        salvage_cbill_value: float = 0.0,
        salvage_items: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Processes After-Action Report (AAR) for combat engagements and writes combat story narrative."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        total_est_repair_cost = 0.0

        for ulog in unit_logs:
            unit_id = ulog.get("unit_id")
            unit = db.query(Unit).filter(Unit.id == unit_id).first()
            if unit:
                if ulog.get("is_destroyed", False):
                    db.delete(unit)
                else:
                    armor_loss = ulog.get("armor_loss", 0)
                    struct_loss = ulog.get("structure_loss", 0)
                    unit.armor_damage += armor_loss
                    unit.structure_damage += struct_loss
                    total_est_repair_cost += (armor_loss * 500.0) + (struct_loss * 2500.0)

                    for crit in ulog.get("critical_hits", []):
                        db.add(CriticalHit(
                            unit_id=unit.id,
                            location=crit.get("location", "CT"),
                            component_name=crit.get("component_name", "Component"),
                            is_destroyed=True
                        ))
                        total_est_repair_cost += 100000.0

        total_xp_awarded_dict = {}

        if pilot_logs:
            for plog in pilot_logs:
                pilot_id = plog.get("pilot_id")
                pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
                if pilot:
                    injuries = plog.get("injuries_sustained", 0)
                    if injuries > 0:
                        pilot.injuries += injuries
                        if pilot.injuries >= 6:
                            pilot.status = "Deceased"
                            pilot.days_remaining = 0
                        else:
                            pilot.status = "Injured"
                            pilot.days_remaining = pilot.injuries * 15

                    # A Time of War v4.0 XP Formula: Base 15 XP + Kills + Bondsmen + Flawless Bonus
                    earned_xp = 15 # Base participation
                    kills_count = plog.get("kills_count", 0)
                    kills_details = plog.get("kills_details", [])

                    for k in kills_details:
                        tonnage = k.get("enemy_mech_tonnage", 50)
                        kill_xp = 15 if tonnage >= 65 else 10 # Heavy/Assault Mech bonus
                        earned_xp += kill_xp
                        if k.get("is_bondsman_captured", False):
                            earned_xp += 15 # Bondsman capture XP
                            pilot.bondsmen = (pilot.bondsmen or 0) + 1

                    if kills_count > len(kills_details):
                        earned_xp += (kills_count - len(kills_details)) * 10

                    if plog.get("flawless_performance", False):
                        earned_xp += 10 # Flawless zero breach bonus

                    pilot.kills = (pilot.kills or 0) + max(kills_count, len(kills_details))
                    pilot.xp = (pilot.xp or 0) + earned_xp
                    total_xp_awarded_dict[pilot.name] = earned_xp

        salvage_modifier = 1.0
        mission_name = "Independent Skirmish"

        if mission_id:
            mission = db.query(Mission).filter(Mission.id == mission_id).first()
            if mission and mission.status == "Active":
                mission_name = mission.name
                campaign.wp_balance += mission.wp_reward
                campaign.cbill_balance += mission.cbill_reward
                mission.status = "Completed"

                blc_payout = total_est_repair_cost * mission.blc_coverage
                campaign.cbill_balance += blc_payout

                if "25%" in str(mission.salvage_rights) or "Exchange" in str(mission.salvage_rights):
                    salvage_modifier = 0.25
                elif "50%" in str(mission.salvage_rights) or "Shared" in str(mission.salvage_rights):
                    salvage_modifier = 0.50
                else:
                    salvage_modifier = 1.00

                campaign.reputation_score = min(100, campaign.reputation_score + 5)
                if campaign.reputation_score >= 90:
                    campaign.mrb_rating = "A"
                elif campaign.reputation_score >= 75:
                    campaign.mrb_rating = "B"
                elif campaign.reputation_score >= 60:
                    campaign.mrb_rating = "C"

        effective_salvage = salvage_cbill_value * salvage_modifier
        if effective_salvage > 0:
            campaign.cbill_balance += effective_salvage

        if salvage_items:
            for item_name in salvage_items:
                inv = db.query(Inventory).filter(Inventory.component_name == item_name).first()
                if inv:
                    inv.quantity += 1
                else:
                    db.add(Inventory(campaign_id=campaign.id, component_name=item_name, quantity=1, category="Salvage"))

        narrative = ContractGenerator.generate_aar_narrative(
            mission_name=mission_name,
            units_engaged=len(unit_logs),
            salvage_cash=effective_salvage,
            recovered_items_count=len(salvage_items) if salvage_items else 0
        )

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="AAR Narrative",
            description=narrative
        ))

        db.commit()
        return {
            "message": "After-Action Report processed successfully",
            "effective_salvage": effective_salvage,
            "xp_awarded": total_xp_awarded_dict,
            "narrative": narrative
        }
