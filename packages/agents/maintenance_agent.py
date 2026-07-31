from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from packages.database.models import Campaign, Unit, CriticalHit, Inventory, CampaignLog
from packages.engine.mechlab import MechLabEngine

class MaintenanceAgent:
    """Agent 4: Maintenance & Inventory Agent
    Responsibilities: Roster repair queues, refits, engineering warehouse management,
    parts inventory, procurement markets, unit sales/purchases, and interactive MechLab loadout fitting.
    """

    AVAILABLE_MARKET_MECHS = [
        {"chassis": "Centurion", "model": "CN9-A", "tonnage": 50, "bv2": 945, "wp_cost": 450, "tech_base": "Inner Sphere"},
        {"chassis": "Hunchback", "model": "HBK-4G", "tonnage": 50, "bv2": 1041, "wp_cost": 380, "tech_base": "Inner Sphere"},
        {"chassis": "Catapult", "model": "CPT-C1", "tonnage": 65, "bv2": 1399, "wp_cost": 590, "tech_base": "Inner Sphere"},
        {"chassis": "Atlas", "model": "AS7-D", "tonnage": 100, "bv2": 1897, "wp_cost": 960, "tech_base": "Inner Sphere"},
        {"chassis": "Timber Wolf", "model": "Prime", "tonnage": 75, "bv2": 2737, "wp_cost": 1420, "tech_base": "Clan"}
    ]

    @classmethod
    def get_market_mechs(cls) -> List[Dict[str, Any]]:
        """Returns mechs available in the procurement market."""
        return cls.AVAILABLE_MARKET_MECHS

    @classmethod
    def purchase_unit(
        cls,
        db: Session,
        chassis: str,
        model: str,
        tonnage: int,
        bv2: int,
        wp_cost: int = 400,
        tech_base: str = "Inner Sphere"
    ) -> Dict[str, Any]:
        """Purchases a Mech from the procurement market using Warchest Points (WP)."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        if campaign.wp_balance < wp_cost:
            raise ValueError(f"Insufficient WP balance ({campaign.wp_balance} WP) for Mech procurement ({wp_cost} WP required).")

        campaign.wp_balance -= wp_cost

        new_unit = Unit(
            campaign_id=campaign.id,
            chassis=chassis,
            model=model,
            tonnage=tonnage,
            tech_base=tech_base,
            bv2=bv2,
            armor_damage=0,
            structure_damage=0
        )
        db.add(new_unit)
        db.commit()

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Procurement",
            description=f"Procured {chassis} {model} ({tonnage}T) for {wp_cost} WP."
        ))
        db.commit()
        db.refresh(new_unit)

        return {
            "message": f"Successfully procured {chassis} {model}!",
            "unit_id": new_unit.id,
            "wp_balance": campaign.wp_balance
        }

    @classmethod
    def sell_unit(cls, db: Session, unit_id: int) -> Dict[str, Any]:
        """Sells a Mech from the roster for Warchest Points (WP) based on its condition."""
        unit = db.query(Unit).filter(Unit.id == unit_id).first()
        if not unit:
            raise ValueError("Unit not found")
        campaign = db.query(Campaign).filter(Campaign.id == unit.campaign_id).first()

        base_wp = unit.tonnage * 8.0
        condition_factor = max(0.2, 1.0 - ((unit.armor_damage * 0.5 + unit.structure_damage * 2.5) / base_wp))
        salvage_wp = int(round(base_wp * 0.6 * condition_factor))

        campaign.wp_balance += salvage_wp
        unit_name = f"{unit.chassis} {unit.model}"

        db.delete(unit)
        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Sales",
            description=f"Sold {unit_name} to local market for {salvage_wp} WP."
        ))
        db.commit()

        return {
            "message": f"Sold {unit_name} for ${salvage_payout:,.2f} C-Bills",
            "payout": salvage_payout
        }

    @classmethod
    def validate_build_loadout(
        cls,
        tonnage: int,
        components: List[str],
        double_heat_sinks: bool = False
    ) -> Dict[str, Any]:
        """Calculates tonnage, heat curve, alpha strike heat, and fitting validation metrics for custom builds."""
        return MechLabEngine.calculate_build_metrics(
            max_tonnage=tonnage,
            components=components,
            double_heat_sinks=double_heat_sinks
        )

    @classmethod
    def repair_unit_armor_and_structure(cls, db: Session, unit_id: int) -> Dict[str, Any]:
        """Repairs all armor and structure damage on a specified Mech unit and advances campaign clock."""
        from datetime import datetime, timedelta
        unit = db.query(Unit).filter(Unit.id == unit_id).first()
        if not unit:
            raise ValueError("Unit not found")
        campaign = db.query(Campaign).filter(Campaign.id == unit.campaign_id).first()
        if not campaign:
            raise ValueError("Campaign not found")

        total_damage = (unit.armor_damage or 0) + (unit.structure_damage or 0)
        repair_days = max(1, total_damage // 10) if total_damage > 0 else 1

        try:
            dt = datetime.strptime(campaign.current_date, "%Y-%m-%d") + timedelta(days=repair_days)
            campaign.current_date = dt.strftime("%Y-%m-%d")
        except Exception:
            pass

        overhead_cost = repair_days * 5000.0
        campaign.cbill_balance -= (150000.0 + overhead_cost)
        campaign.sp_balance = max(0, campaign.sp_balance - 20)
        unit.armor_damage = 0
        unit.structure_damage = 0

        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Tech Bay Repair",
            description=f"Tech Bay completed full armor & structure repair on {unit.chassis} {unit.model} (+{repair_days} Days). Overhead: ${overhead_cost:,.2f} C-Bills."
        ))

        db.commit()
        return {
            "message": f"Unit {unit.chassis} {unit.model} repaired successfully (+{repair_days} Days added to timeline)",
            "unit_id": unit_id,
            "days_added": repair_days,
            "current_date": campaign.current_date
        }

    @classmethod
    def replace_critical_component(cls, db: Session, critical_hit_id: int) -> Dict[str, Any]:
        """Replaces a destroyed critical component using inventory stock or purchasing a new component and advances timeline clock."""
        from datetime import datetime, timedelta
        crit = db.query(CriticalHit).filter(CriticalHit.id == critical_hit_id).first()
        if not crit:
            raise ValueError("Critical hit record not found")

        unit = db.query(Unit).filter(Unit.id == crit.unit_id).first()
        campaign = db.query(Campaign).filter(Campaign.id == unit.campaign_id).first()

        inv = db.query(Inventory).filter(Inventory.component_name == crit.component_name, Inventory.quantity > 0).first()
        if inv:
            inv.quantity -= 1
            if inv.quantity <= 0:
                db.delete(inv)
            used_stock = True
        else:
            campaign.cbill_balance -= 100000.0
            used_stock = False

        component_name = crit.component_name
        replace_days = 7 if "Engine" in component_name or "Gyro" in component_name else 3

        try:
            dt = datetime.strptime(campaign.current_date, "%Y-%m-%d") + timedelta(days=replace_days)
            campaign.current_date = dt.strftime("%Y-%m-%d")
        except Exception:
            pass

        overhead_cost = replace_days * 5000.0
        campaign.cbill_balance -= overhead_cost

        db.delete(crit)
        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Component Replacement",
            description=f"Tech Bay replaced destroyed {component_name} on {unit.chassis} {unit.model} (+{replace_days} Days)."
        ))
        db.commit()

        return {
            "message": f"Replaced {component_name} on {unit.chassis} (+{replace_days} Days added to timeline)",
            "used_inventory_stock": used_stock,
            "component_name": component_name,
            "days_added": replace_days,
            "current_date": campaign.current_date
        }

    @classmethod
    def commit_loadout(
        cls,
        db: Session,
        chassis: str,
        model: str,
        tonnage: int,
        bv2: int,
        sp_cost: float,
        cbill_cost: float,
        unit_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Commits a custom Mech loadout configuration and deducts costs."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        campaign.sp_balance -= int(sp_cost)
        campaign.cbill_balance -= cbill_cost

        if unit_id:
            unit = db.query(Unit).filter(Unit.id == unit_id).first()
            if unit:
                unit.model = model
                unit.bv2 = bv2
        else:
            unit = Unit(
                campaign_id=campaign.id,
                chassis=chassis,
                model=model,
                tonnage=tonnage,
                bv2=bv2
            )
            db.add(unit)

        db.commit()
        return {"message": f"Loadout for {chassis} {model} committed successfully!"}

    @classmethod
    def purchase_supplies(
        cls,
        db: Session,
        sp_amount: int = 0,
        cbill_cost: float = 0.0,
        wp_cost: int = 0
    ) -> Dict[str, Any]:
        """Purchases Support Points (SP) from market for C-Bills or WP."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        campaign.cbill_balance -= cbill_cost
        campaign.wp_balance -= wp_cost
        campaign.sp_balance += sp_amount

        db.commit()
        return {
            "message": f"Purchased +{sp_amount} SP",
            "new_sp_balance": campaign.sp_balance,
            "new_cbill_balance": campaign.cbill_balance
        }

    @classmethod
    def add_inventory(
        cls,
        db: Session,
        component_name: str,
        quantity: int = 1,
        category: str = "Weapon"
    ) -> Inventory:
        """Adds or updates stock of a component in warehouse inventory."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        existing = db.query(Inventory).filter(Inventory.component_name == component_name).first()
        if existing:
            existing.quantity += quantity
            inv = existing
        else:
            inv = Inventory(
                campaign_id=campaign.id,
                component_name=component_name,
                quantity=quantity,
                category=category
            )
            db.add(inv)

        db.commit()
        db.refresh(inv)
        return inv
