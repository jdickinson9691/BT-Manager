# Agent Contract: Schema & Data Model Engine

## Objective
Define and implement SQLAlchemy models, Pydantic schemas, and SQLite database initialization for BT-Manager.

## Output Specifications
1. \packages/database/models.py\:
   - \Unit\: Chassis, model, tech base, tonnage, BV2, armor state, critical hit tracking, status (active, damaged, destroyed).
   - \Pilot\: Name, callsign, gunnery skill, piloting skill, status, salary/upkeep.
   - \ContractTrack\: Title, enemy force, Warchest Entry Fee, Objectives, Mission Payoff.
   - \LedgerEntry\: Transaction type (Warchest Points, Support Points, C-Bills), amount, description, timestamp.

2. \packages/database/schemas.py\:
   - Pydantic models corresponding to creation and API responses for Units, Pilots, Contracts, and Ledger entries.

3. \packages/database/db.py\:
   - SQLite connection engine, SessionLocal factory, and DB table creation utilities.

## Definition of Done
- Models establish correct foreign key relationships (e.g., Unit -> Pilot assignment).
- SQLite tables create without error upon database initialization script.
- Pydantic schemas correctly validate incoming JSON data payloads.
