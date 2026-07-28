# Project Requirements & Milestone Tracker: BT-Manager

## System Goal
Deliver a localized BattleTech campaign management software using Next.js, FastAPI, and SQLite, integrated with open fan-data standards (MegaMek MTF/BLK formats and Sarna Wiki API).

---

## Milestones & Agent Execution Index

### Milestone 1: Core Setup & Workspace Scaffolding [Status: IN PROGRESS]
- [x] Initialize git repo and setup monorepo directory tree
- [ ] Create Python FastAPI stub with SQLite integration
- [ ] Create Next.js App Router workspace with Tailwind CSS
- [ ] Establish initial GitHub repository and initial commit

### Milestone 2: Data Sourcing & Importer Engine [Status: PENDING]
- [ ] Agent Contract: agent_contract_data_importer.md
- [ ] Build MTF (MegaMek Mech Format) parser for local chassis data
- [ ] Integrate Sarna.net MediaWiki API client for fluff/lore links
- [ ] Define JSON schemas for imported chassis, weapons, and equipment

### Milestone 3: Schema & Data Model Engine [Status: PENDING]
- [ ] Agent Contract: agent_contract_data_models.md
- [ ] Define Unit models (BattleMechs, Pilots, BV2, Damage States)
- [ ] Define Contract & Track models (Warchest Costs, Objectives, Bonuses)
- [ ] Define Financial Ledger models (WP, SP, C-Bill transactions)

### Milestone 4: Python Logic & Calculation Engines [Status: PENDING]
- [ ] Agent Contract: agent_contract_calculation_engine.md
- [ ] Implement Warchest / SP conversion logic
- [ ] Implement Campaign Operations repair/salvage cost algorithms
- [ ] Unit tests for all financial and damage calculations

### Milestone 5: FastAPI Endpoint Implementation [Status: PENDING]
- [ ] Agent Contract: agent_contract_api_routes.md
- [ ] Implement CRUD endpoints for Units, Force Rosters, and Contracts
- [ ] Implement calculation triggers (/api/v1/repair/calculate, /api/v1/ledger/transact)

### Milestone 6: Next.js UI & Campaign Dashboard [Status: PENDING]
- [ ] Agent Contract: agent_contract_frontend_ui.md
- [ ] Build Force Roster & Unit Detail Management views
- [ ] Build Campaign Ledger & Active Contract Track view
- [ ] Integrate API hooks with FastAPI backend
