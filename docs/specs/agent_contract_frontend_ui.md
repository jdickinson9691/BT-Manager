# Agent Contract: Next.js UI & Campaign Dashboard

## Objective
Build a web frontend dashboard displaying company force strength, financial ledgers, unit rosters, and quick calculation triggers.

## Output Specifications
1. \pps/web/\:
   - Next.js 14+ App Router project initialized with Tailwind CSS.
2. \pps/web/app/page.tsx\:
   - **Command Dashboard View**:
     - Metric cards for Total BV2, Warchest Points (WP), Support Points (SP), and C-Bill Ledger.
     - Active Unit Roster grid with Mech status indicators.
     - Interactive Repair Calculator tool connected to \/api/v1/engine/repair-cost\.

## Definition of Done
- Next.js dev server starts and renders UI cleanly.
- Frontend fetches and renders active data from FastAPI backend at \http://localhost:8000\.
