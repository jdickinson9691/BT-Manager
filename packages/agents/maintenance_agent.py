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
        {"chassis": "Centurion", "model": "CN9-A", "tonnage": 50, "bv2": 945, "cbill_cost": 4500000.0, "wp_cost": 450, "tech_base": "Inner Sphere"},
        {"chassis": "Hunchback", "model": "HBK-4G", "tonnage": 50, "bv2": 1041, "cbill_cost": 3800000.0, "wp_cost": 380, "tech_base": "Inner Sphere"},
        {"chassis": "Catapult", "model": "CPT-C1", "tonnage": 65, "bv2": 1399, "cbill_cost": 5900000.0, "wp_cost": 590, "tech_base": "Inner Sphere"},
        {"chassis": "Atlas", "model": "AS7-D", "tonnage": 100, "bv2": 1897, "cbill_cost": 9600000.0, "wp_cost": 960, "tech_base": "Inner Sphere"},
        {"chassis": "Timber Wolf", "model": "Prime", "tonnage": 75, "bv2": 2737, "cbill_cost": 14200000.0, "wp_cost": 1420, "tech_base": "Clan"}
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
        cbill_cost: float,
        wp_cost: int = 0,
        tech_base: str = "Inner Sphere"
    ) -> Dict[str, Any]:
        """Purchases a Mech from the procurement market and adds it to the roster."""
        campaign = db.query(Campaign).first()
        if not campaign:
            raise ValueError("No active campaign found")

        if campaign.cbill_balance < cbill_cost:
            raise ValueError("Insufficient C-Bill balance for Mech procurement")
        if campaign.wp_balance < wp_cost:
            raise ValueError("Insufficient WP balance for Mech procurement")

        campaign.cbill_balance -= cbill_cost
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
            description=f"Procured {chassis} {model} ({tonnage}T) for ${cbill_cost:,.2f} C-Bills."
        ))
        db.commit()
        db.refresh(new_unit)

        return {
            "message": f"Successfully procured {chassis} {model}!",
            "unit_id": new_unit.id
        }

    @classmethod
    def sell_unit(cls, db: Session, unit_id: int) -> Dict[str, Any]:
        """Sells a Mech from the roster for C-Bills based on its condition."""
        unit = db.query(Unit).filter(Unit.id == unit_id).first()
        if not unit:
            raise ValueError("Unit not found")
        campaign = db.query(Campaign).filter(Campaign.id == unit.campaign_id).first()

        base_value = unit.tonnage * 80000.0
        condition_factor = max(0.2, 1.0 - ((unit.armor_damage * 500 + unit.structure_damage * 2500) / base_value))
        salvage_payout = round(base_value * 0.6 * condition_factor, 2)

        campaign.cbill_balance += salvage_payout
        unit_name = f"{unit.chassis} {unit.model}"

        db.delete(unit)
        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Sales",
            description=f"Sold {unit_name} to local scrap market for ${salvage_payout:,.2f} C-Bills."
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
        """Repairs all armor and structure damage on a specified Mech unit."""
        unit = db.query(Unit).filter(Unit.id == unit_id).first()
        if not unit:
            raise ValueError("Unit not found")
        campaign = db.query(Campaign).filter(Campaign.id == unit.campaign_id).first()
        if not campaign:
            raise ValueError("Campaign not found")

        campaign.sp_balance = max(0, campaign.sp_balance - 20)
        campaign.cbill_balance -= 150000.0
        unit.armor_damage = 0
        unit.structure_damage = 0

        db.commit()
        return {"message": f"Unit {unit.chassis} {unit.model} repaired successfully", "unit_id": unit_id}

    @classmethod
    def replace_critical_component(cls, db: Session, critical_hit_id: int) -> Dict[str, Any]:
        """Replaces a destroyed critical component using inventory stock or purchasing a new component."""
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
        db.delete(crit)
        db.commit()

        return {
            "message": f"Replaced {component_name} on {unit.chassis}",
            "used_inventory_stock": used_stock,
            "component_name": component_name
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
