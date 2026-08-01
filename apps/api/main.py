from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from packages.database.db import init_db, get_db
from packages.database.models import Campaign, Unit, Mission, Pilot, Inventory, CampaignLog
from packages.data_importer.mtf_parser import MTFParser
from packages.data_importer.sarna_client import SarnaClient
from packages.agents import (
    CoreAgent,
    OperationsAgent,
    MapAgent,
    MaintenanceAgent,
    PersonnelAgent,
    DataSyncAgent,
    EraFactionAgent
)

app = FastAPI(title="BT-Manager API (Agent-Driven Core)", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    CoreAgent.setup_database()
    db = next(get_db())
    CoreAgent.get_campaign(db)

class AdvanceTimeRequest(BaseModel):
    days: int = 1

class JumpRequest(BaseModel):
    destination_system: str
    distance_ly: float = 22.1
    jump_cost: float = 120000.0

class CustomStarterUnit(BaseModel):
    chassis: str
    model: str
    tonnage: int
    bv2: int
    tech_base: str = "Inner Sphere"

class CustomStarterPilot(BaseModel):
    name: str
    callsign: str
    gunnery: int = 4
    piloting: int = 5
    spa: str = "None"
    xp: int = 50

class CampaignCreateRequest(BaseModel):
    campaign_name: str = "Succession Wars 3025"
    company_name: str = "Wolf's Irregulars"
    commander_name: str = "Major Jaime Wolf"
    era: str = "3025"
    faction: str = "House Davion"
    starting_funds: float = 1500.0
    custom_units: Optional[List[CustomStarterUnit]] = None
    custom_pilots: Optional[List[CustomStarterPilot]] = None

class DeployForceRequest(BaseModel):
    dropzone: str = "Alpha DZ (Flat Plains)"
    deployed_unit_ids: Optional[List[int]] = []

class NetworkConfigRequest(BaseModel):
    mul_online: bool = True
    sarna_online: bool = True
    megamek_online: bool = True

GLOBAL_NETWORK_CONFIG = {
    "mul_online": True,
    "sarna_online": True,
    "megamek_online": True
}

class CustomLogCreate(BaseModel):
    event_type: str = "Journal"
    description: str

class UnitCreate(BaseModel):
    chassis: str
    model: str
    tonnage: int
    tech_base: Optional[str] = "Inner Sphere"
    bv2: Optional[int] = 1000

class BuyMechRequest(BaseModel):
    chassis: str
    model: str
    tonnage: int
    bv2: int
    wp_cost: int = 400
    tech_base: str = "Inner Sphere"

class ValidateBuildRequest(BaseModel):
    tonnage: int
    components: List[str]
    double_heat_sinks: bool = False

class ImportMTFRequest(BaseModel):
    mtf_content: str

class CommitLoadoutRequest(BaseModel):
    unit_id: Optional[int] = None
    chassis: str
    model: str
    tonnage: int
    bv2: int
    sp_cost: float = 50.0
    components_used: Optional[List[str]] = []

class UnitDamageUpdate(BaseModel):
    armor_damage: int
    structure_damage: int

class RansomBondsmanRequest(BaseModel):
    pilot_id: int
    ransom_amount: int = 50

class IntegrateBondsmanRequest(BaseModel):
    pilot_id: int
    bondsman_name: str = "MechWarrior Marcus Trent"
    callsign: str = "Bondsman"

class TakeLoanRequest(BaseModel):
    principal: float = 500.0
    interest_rate: float = 0.05

class RepayLoanRequest(BaseModel):
    repayment_amount: float = 100.0

class NegotiateContractRequest(BaseModel):
    mission_id: int
    payout_multiplier: float = 1.0
    salvage_pct: float = 50.0
    blc_pct: float = 50.0
    player_lance_bv: int = 5463

class MissionCreate(BaseModel):
    name: str
    mission_type: str = "Raid"
    employer: str = "House Davion"
    wp_reward: int = 400
    sp_reward: int = 200
    salvage_rights: str = "Shared (50%)"
    blc_coverage: float = 0.5
    transport_allowance: float = 0.5
    command_rights: str = "Integrated"

class ObjectiveItem(BaseModel):
    name: str
    completed: bool = True
    wp_bonus: int = 50

class CompleteTrackRequest(BaseModel):
    entry_fee_wp: int = 50
    objectives: Optional[List[ObjectiveItem]] = []
    bonus_sp: int = 50

class PilotCreate(BaseModel):
    name: str
    callsign: str
    gunnery: int = 4
    piloting: int = 5
    unit_id: Optional[int] = None

class PilotUpgradeSkillRequest(BaseModel):
    skill_type: str = "gunnery"

class PilotAssignSPARequest(BaseModel):
    spa_name: str

class PilotAwardXPRequest(BaseModel):
    xp_amount: int = 15
    kills_added: int = 0

class MarketPurchaseSuppliesRequest(BaseModel):
    sp_amount: int = 0
    cbill_cost: float = 0.0
    wp_cost: int = 0

class InventoryAddRequest(BaseModel):
    component_name: str
    quantity: int = 1
    category: str = "Weapon"

class CriticalHitLog(BaseModel):
    location: str
    component_name: str

class UnitCombatLog(BaseModel):
    unit_id: int
    armor_loss: int = 0
    structure_loss: int = 0
    is_destroyed: bool = False
    critical_hits: Optional[List[CriticalHitLog]] = []

class PilotCombatLog(BaseModel):
    pilot_id: int
    injuries_sustained: int = 0

class AARSubmitRequest(BaseModel):
    mission_id: Optional[int] = None
    unit_logs: List[UnitCombatLog]
    pilot_logs: Optional[List[PilotCombatLog]] = []
    salvage_cbill_value: float = 0.0
    salvage_items: Optional[List[str]] = []

class ComponentRepairRequest(BaseModel):
    critical_hit_id: int

@app.get("/")
def read_root():
    return {"status": "online", "system": "BT-Manager Agent-Driven Core Engine v2.1"}

@app.get("/api/v1/network/config")
def get_network_config():
    return GLOBAL_NETWORK_CONFIG

@app.post("/api/v1/network/config")
def update_network_config(config: NetworkConfigRequest):
    GLOBAL_NETWORK_CONFIG["mul_online"] = config.mul_online
    GLOBAL_NETWORK_CONFIG["sarna_online"] = config.sarna_online
    GLOBAL_NETWORK_CONFIG["megamek_online"] = config.megamek_online
    
    DataSyncAgent.set_mode(
        mul_online=config.mul_online,
        sarna_online=config.sarna_online,
        megamek_online=config.megamek_online
    )
    
    return {
        "status": "updated",
        "config": GLOBAL_NETWORK_CONFIG,
        "message": f"Network toggles updated: MUL={'Online' if config.mul_online else 'Cached'}, Sarna={'Online' if config.sarna_online else 'Cached'}, MegaMek={'Online' if config.megamek_online else 'Cached'}"
    }

@app.get("/api/v1/ledger/balance")
def get_balance(db: Session = Depends(get_db)):
    return CoreAgent.get_ledger_summary(db)

@app.get("/api/v1/campaigns")
def list_campaigns(db: Session = Depends(get_db)):
    camps = db.query(Campaign).all()
    return [{"id": c.id, "name": c.name, "current_date": c.current_date, "cbill_balance": c.cbill_balance, "mrb_rating": c.mrb_rating, "era": getattr(c, 'era', "3025") or "3025"} for c in camps]

@app.post("/api/v1/campaigns/create")
def create_new_campaign(req: CampaignCreateRequest, db: Session = Depends(get_db)):
    era_details = EraFactionAgent.get_era_details(req.era)
    
    campaign = Campaign(
        name=f"{req.campaign_name} ({req.company_name})",
        wp_balance=1000,
        sp_balance=500,
        cbill_balance=req.starting_funds,
        current_date=era_details["default_date"],
        daily_overhead=5000.0,
        mrb_rating="C",
        reputation_score=50,
        era=req.era
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    # Seed starting units (use custom_units if provided, else era defaults)
    created_units = []
    units_to_seed = [u.dict() if hasattr(u, "dict") else u for u in req.custom_units] if req.custom_units else era_details["starting_units"]
    
    for u in units_to_seed:
        unit = Unit(
            campaign_id=campaign.id,
            chassis=u.get("chassis", "Marauder"),
            model=u.get("model", "MAD-3R"),
            tonnage=int(u.get("tonnage", 75)),
            tech_base=u.get("tech_base", "Inner Sphere"),
            bv2=int(u.get("bv2", 1363))
        )
        db.add(unit)
        db.commit()
        db.refresh(unit)
        created_units.append(unit)

    # Seed starting pilots (use custom_pilots if provided, else era defaults)
    pilots_to_seed = [p.dict() if hasattr(p, "dict") else p for p in req.custom_pilots] if req.custom_pilots else era_details["pilots"]
    
    for idx, p_info in enumerate(pilots_to_seed):
        assigned_u_id = created_units[idx].id if idx < len(created_units) else None
        db.add(Pilot(
            campaign_id=campaign.id,
            name=p_info.get("name", "MechWarrior"),
            callsign=p_info.get("callsign", "Ace"),
            gunnery=int(p_info.get("gunnery", 4)),
            piloting=int(p_info.get("piloting", 5)),
            unit_id=assigned_u_id,
            status="Active",
            xp=int(p_info.get("xp", 50)),
            spa=p_info.get("spa", "None")
        ))

    # Add Commander Pilot if provided and not already in custom list
    if req.commander_name and not any(p.get("name") == req.commander_name for p in pilots_to_seed):
        db.add(Pilot(
            campaign_id=campaign.id,
            name=req.commander_name,
            callsign="Commander",
            gunnery=3,
            piloting=4,
            unit_id=created_units[0].id if created_units else None,
            status="Active",
            xp=50,
            spa="Tactical Genius"
        ))

    # Seed era-accurate starting inventory equipment
    for item in era_details["inventory"]:
        db.add(Inventory(
            campaign_id=campaign.id,
            component_name=item["component_name"],
            quantity=item["quantity"],
            category=item["category"]
        ))

    m1 = Mission(campaign_id=campaign.id, name=f"Garrison Contract ({req.faction})", mission_type="Garrison", employer=req.faction, wp_reward=350, cbill_reward=3500000.0, status="Available")
    m2 = Mission(campaign_id=campaign.id, name="Objective Recon Patrol", mission_type="Recon", employer="Independent", wp_reward=300, cbill_reward=2800000.0, status="Available")
    db.add_all([m1, m2])

    db.add(CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type="Setup",
        description=f"Campaign '{req.campaign_name}' initialized for unit '{req.company_name}' under Era {era_details['name']} ({req.faction}). Custom roster & pilots linked."
    ))
    db.commit()
    return CoreAgent.get_ledger_summary(db)

@app.get("/api/v1/campaign/export")
def export_campaign_save(db: Session = Depends(get_db)):
    return CoreAgent.export_campaign_json(db)

@app.post("/api/v1/campaign/import")
def import_campaign_save(data: Dict[str, Any], db: Session = Depends(get_db)):
    try:
        CoreAgent.import_campaign_json(db, data)
        return {"message": "Campaign state restored successfully!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/v1/data/eras")
def get_supported_eras():
    return EraFactionAgent.get_supported_eras()

@app.get("/api/v1/data/mul/preview")
def preview_mul_chassis(chassis: str, era_code: str = "3025"):
    return DataSyncAgent.fetch_mul_unit_preview(chassis, era_code)

@app.get("/api/v1/starmap")
def get_starmap(era: str = "Late Succession War - Renaissance (3020–3049)"):
    return MapAgent.get_star_map(era)

@app.post("/api/v1/timeline/advance")
def advance_campaign_time(req: AdvanceTimeRequest, db: Session = Depends(get_db)):
    try:
        return OperationsAgent.advance_timeline(db, req.days)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/v1/logs")
def get_campaign_logs(db: Session = Depends(get_db)):
    return db.query(CampaignLog).order_by(CampaignLog.id.desc()).all()

@app.post("/api/v1/logs")
def add_custom_log(log_data: CustomLogCreate, db: Session = Depends(get_db)):
    campaign = CoreAgent.get_campaign(db)
    new_log = CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type=log_data.event_type,
        description=log_data.description
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@app.get("/api/v1/units")
def get_units(db: Session = Depends(get_db)):
    units = db.query(Unit).all()
    results = []
    for u in units:
        crits = [{"id": c.id, "location": c.location, "component_name": c.component_name} for c in u.critical_hits]
        sarna_url = SarnaClient.get_mech_wiki_url(u.chassis)
        results.append({
            "id": u.id, "campaign_id": u.campaign_id, "chassis": u.chassis, "model": u.model,
            "tonnage": u.tonnage, "tech_base": u.tech_base, "bv2": u.bv2,
            "armor_damage": u.armor_damage, "structure_damage": u.structure_damage,
            "sarna_url": sarna_url, "critical_hits": crits
        })
    return results

@app.post("/api/v1/units")
def add_unit(unit_data: UnitCreate, db: Session = Depends(get_db)):
    campaign = CoreAgent.get_campaign(db)
    new_unit = Unit(
        campaign_id=campaign.id,
        chassis=unit_data.chassis,
        model=unit_data.model,
        tonnage=unit_data.tonnage,
        tech_base=unit_data.tech_base,
        bv2=unit_data.bv2
    )
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    return new_unit

@app.post("/api/v1/units/{unit_id}/sell")
def sell_unit(unit_id: int, db: Session = Depends(get_db)):
    try:
        return MaintenanceAgent.sell_unit(db, unit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/v1/market/mechs")
def get_procurement_mechs(era_code: str = "3025", faction: str = "Mercenary"):
    return EraFactionAgent.filter_market_units_by_era_and_faction(era_code, faction)

@app.get("/api/v1/units/master")
def get_master_unit_database(era_code: str = "3025", faction: Optional[str] = None, unit_type: Optional[str] = None, tech_base: Optional[str] = None):
    from packages.data_importer.master_unit_database import MasterUnitDatabase
    return MasterUnitDatabase.filter_units(era_code=era_code, faction=faction, unit_type=unit_type, tech_base=tech_base)


@app.post("/api/v1/market/buy-mech")
def buy_procurement_mech(req: BuyMechRequest, db: Session = Depends(get_db)):
    try:
        return MaintenanceAgent.purchase_unit(
            db=db,
            chassis=req.chassis,
            model=req.model,
            tonnage=req.tonnage,
            bv2=req.bv2,
            wp_cost=req.wp_cost,
            tech_base=req.tech_base
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/builder/validate-build")
def validate_mech_build(req: ValidateBuildRequest):
    return MaintenanceAgent.validate_build_loadout(
        tonnage=req.tonnage,
        components=req.components,
        double_heat_sinks=req.double_heat_sinks
    )

@app.post("/api/v1/units/import-mtf")
def import_mtf_mech(req: ImportMTFRequest, db: Session = Depends(get_db)):
    parsed = MTFParser.parse(req.mtf_content)
    if not parsed["chassis"]:
        raise HTTPException(status_code=400, detail="Invalid MTF payload: Chassis name missing")

    campaign = CoreAgent.get_campaign(db)
    new_unit = Unit(
        campaign_id=campaign.id,
        chassis=parsed["chassis"],
        model=parsed["model"] or "Custom",
        tonnage=parsed["tonnage"] or 50,
        tech_base=parsed["tech_base"] or "Inner Sphere",
        bv2=parsed["bv2"] or 1000
    )
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)

    sarna_url = SarnaClient.get_mech_wiki_url(parsed["chassis"])
    return {
        "message": f"Successfully imported {parsed['chassis']} {parsed['model']} into roster!",
        "unit_id": new_unit.id,
        "parsed_mech": parsed,
        "sarna_url": sarna_url
    }

@app.get("/api/v1/sarna/wiki-url")
def get_sarna_url(chassis: str):
    return {"chassis": chassis, "url": SarnaClient.get_mech_wiki_url(chassis)}

@app.post("/api/v1/personnel/bondsmen/ransom")
def ransom_bondsman_endpoint(req: RansomBondsmanRequest, db: Session = Depends(get_db)):
    try:
        return PersonnelAgent.ransom_bondsman(db, req.pilot_id, req.ransom_amount)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/personnel/bondsmen/integrate")
def integrate_bondsman_endpoint(req: IntegrateBondsmanRequest, db: Session = Depends(get_db)):
    try:
        return PersonnelAgent.integrate_bondsman(db, req.pilot_id, req.bondsman_name, req.callsign)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/ledger/loan/take")
def take_loan_endpoint(req: TakeLoanRequest, db: Session = Depends(get_db)):
    try:
        return CoreAgent.take_loan(db, req.principal, req.interest_rate)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/ledger/loan/repay")
def repay_loan_endpoint(req: RepayLoanRequest, db: Session = Depends(get_db)):
    try:
        return CoreAgent.repay_loan(db, req.repayment_amount)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/contracts/negotiate")
def negotiate_contract_endpoint(req: NegotiateContractRequest, db: Session = Depends(get_db)):
    try:
        return ContractGenerator.negotiate_contract(
            db=db,
            mission_id=req.mission_id,
            payout_multiplier=req.payout_multiplier,
            salvage_pct=req.salvage_pct,
            blc_pct=req.blc_pct,
            player_lance_bv=req.player_lance_bv
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

class GenerateOpForRequest(BaseModel):
    target_bv: int = 5000
    era: str = "3025"
    enemy_faction: str = "OpFor Force"

@app.post("/api/v1/contracts/opfor/generate")
def generate_opfor_endpoint(req: GenerateOpForRequest):
    return ContractGenerator.generate_opfor_roster(target_bv=req.target_bv, era_code=req.era, enemy_faction=req.enemy_faction)

@app.get("/api/v1/sarna/search")
def search_sarna_wiki(query: str):
    return SarnaClient.search_sarna(query)

@app.get("/api/v1/inventory")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()

@app.post("/api/v1/inventory")
def add_inventory_item(item: InventoryAddRequest, db: Session = Depends(get_db)):
    try:
        return MaintenanceAgent.add_inventory(db, item.component_name, item.quantity, item.category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/aar/submit")
def submit_after_action_report(aar: AARSubmitRequest, db: Session = Depends(get_db)):
    try:
        u_logs = [log.dict() for log in aar.unit_logs]
        p_logs = [log.dict() for log in aar.pilot_logs] if aar.pilot_logs else []
        return OperationsAgent.process_aar(
            db=db,
            unit_logs=u_logs,
            pilot_logs=p_logs,
            mission_id=aar.mission_id,
            salvage_cbill_value=aar.salvage_cbill_value,
            salvage_items=aar.salvage_items
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/units/repair-critical")
def repair_critical_component(req: ComponentRepairRequest, db: Session = Depends(get_db)):
    try:
        return MaintenanceAgent.replace_critical_component(db, req.critical_hit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/v1/builder/commit")
def commit_custom_loadout(req: CommitLoadoutRequest, db: Session = Depends(get_db)):
    try:
        return MaintenanceAgent.commit_loadout(
            db=db,
            chassis=req.chassis,
            model=req.model,
            tonnage=req.tonnage,
            bv2=req.bv2,
            sp_cost=req.sp_cost,
            cbill_cost=req.cbill_cost,
            unit_id=req.unit_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/api/v1/units/{unit_id}/damage")
def update_unit_damage(unit_id: int, damage: UnitDamageUpdate, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    unit.armor_damage = max(0, damage.armor_damage)
    unit.structure_damage = max(0, damage.structure_damage)
    db.commit()
    return unit

@app.post("/api/v1/units/{unit_id}/repair")
def repair_and_bill_unit(unit_id: int, db: Session = Depends(get_db)):
    try:
        return MaintenanceAgent.repair_unit_armor_and_structure(db, unit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/v1/market/buy-supplies")
def market_buy_supplies(purchase: MarketPurchaseSuppliesRequest, db: Session = Depends(get_db)):
    try:
        return MaintenanceAgent.purchase_supplies(db, purchase.sp_amount, purchase.cbill_cost, purchase.wp_cost)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/missions/{mission_id}/accept")
def accept_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    mission.status = "Active"
    campaign = db.query(Campaign).first()
    if campaign:
        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Contract Signing",
            description=f"Formally signed contract for Operation '{mission.name}' with {mission.employer}."
        ))
    db.commit()
    return {"message": f"Contract for '{mission.name}' accepted!", "mission": mission}

@app.post("/api/v1/missions/{mission_id}/deploy")
def deploy_force_to_combat(mission_id: int, req: DeployForceRequest, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    campaign = db.query(Campaign).first()
    if mission:
        mission.status = "In Combat"
    if campaign:
        db.add(CampaignLog(
            campaign_id=campaign.id,
            log_date=campaign.current_date,
            event_type="Force Deployment",
            description=f"Command Lance deployed to {req.dropzone} for Operation '{mission.name if mission else 'Combat Drop'}'. DropShip insertion vector established."
        ))
    db.commit()
    return {"message": "Command Lance deployed to combat theater!", "status": "In Combat", "dropzone": req.dropzone}

@app.post("/api/v1/starmap/jump")
def starmap_jump_transit(req: JumpRequest, db: Session = Depends(get_db)):
    campaign = CoreAgent.get_campaign(db)
    if campaign.cbill_balance < req.jump_cost:
        raise HTTPException(status_code=400, detail="Insufficient C-Bills for JumpShip transit fee!")
    
    campaign.cbill_balance -= req.jump_cost
    try:
        from datetime import datetime, timedelta
        dt = datetime.strptime(campaign.current_date, "%Y-%m-%d") + timedelta(days=7)
        campaign.current_date = dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    db.add(CampaignLog(
        campaign_id=campaign.id,
        log_date=campaign.current_date,
        event_type="JumpNet Transit",
        description=f"JumpShip completed jump vector to {req.destination_system} ({req.distance_ly} LY). Fee: ${req.jump_cost:,.2f} C-Bills."
    ))
    db.commit()
    return {
        "message": f"JumpShip arrived at system {req.destination_system}!",
        "current_date": campaign.current_date,
        "cbill_balance": campaign.cbill_balance
    }

@app.get("/api/v1/missions")
def get_missions(db: Session = Depends(get_db)):
    return db.query(Mission).all()

@app.post("/api/v1/missions/generate-procedural")
def generate_procedural_mission(db: Session = Depends(get_db)):
    try:
        return OperationsAgent.generate_procedural_contract(db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/missions")
def create_mission(mission_data: MissionCreate, db: Session = Depends(get_db)):
    try:
        return OperationsAgent.generate_contract(
            db=db,
            name=mission_data.name,
            mission_type=mission_data.mission_type,
            employer=mission_data.employer,
            base_cbill=mission_data.base_cbill,
            wp_reward=mission_data.wp_reward,
            salvage_rights=mission_data.salvage_rights,
            blc_coverage=mission_data.blc_coverage,
            transport_allowance=mission_data.transport_allowance,
            command_rights=mission_data.command_rights
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/missions/{mission_id}/complete-track")
def complete_mission_track(mission_id: int, req: CompleteTrackRequest, db: Session = Depends(get_db)):
    try:
        objs = [o.dict() for o in req.objectives] if req.objectives else []
        return OperationsAgent.complete_warchest_track(
            db=db,
            mission_id=mission_id,
            entry_fee_wp=req.entry_fee_wp,
            objectives=objs,
            bonus_sp=req.bonus_sp
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/missions/{mission_id}/complete")
def complete_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    campaign = db.query(Campaign).filter(Campaign.id == mission.campaign_id).first()
    campaign.wp_balance += mission.wp_reward
    campaign.cbill_balance += mission.cbill_reward
    mission.status = "Completed"
    db.commit()
    return {"message": "Mission completed!"}

@app.get("/api/v1/pilots")
def get_pilots(db: Session = Depends(get_db)):
    return db.query(Pilot).all()

@app.get("/api/v1/pilots/spas")
def get_available_spas():
    return PersonnelAgent.AVAILABLE_SPAS

@app.post("/api/v1/pilots")
def create_pilot(pilot_data: PilotCreate, db: Session = Depends(get_db)):
    try:
        return PersonnelAgent.recruit_pilot(
            db=db,
            name=pilot_data.name,
            callsign=pilot_data.callsign,
            gunnery=pilot_data.gunnery,
            piloting=pilot_data.piloting,
            unit_id=pilot_data.unit_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/pilots/{pilot_id}/upgrade-skill")
def upgrade_pilot_skill(pilot_id: int, req: PilotUpgradeSkillRequest, db: Session = Depends(get_db)):
    try:
        return PersonnelAgent.upgrade_pilot_skill(db, pilot_id, req.skill_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/pilots/{pilot_id}/assign-spa")
def assign_pilot_spa(pilot_id: int, req: PilotAssignSPARequest, db: Session = Depends(get_db)):
    try:
        return PersonnelAgent.assign_spa(db, pilot_id, req.spa_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/pilots/{pilot_id}/award-xp")
def award_pilot_xp(pilot_id: int, req: PilotAwardXPRequest, db: Session = Depends(get_db)):
    try:
        return PersonnelAgent.award_xp(db, pilot_id, req.xp_amount, req.kills_added)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/pilots/{pilot_id}/treat")
def treat_pilot_medical(pilot_id: int, db: Session = Depends(get_db)):
    try:
        return PersonnelAgent.treat_medbay(db, pilot_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))