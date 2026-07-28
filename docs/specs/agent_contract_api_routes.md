# Agent Contract: FastAPI Endpoint Implementation

## Objective
Implement RESTful API endpoints for managing campaign resources, invoking calculation engines, and interacting with SQLite storage.

## Output Specifications
1. \pps/api/main.py\:
   - CORS middleware enabled for Next.js frontend (\http://localhost:3000\).
   - **Pilot Routes**: \GET /api/v1/pilots\, \POST /api/v1/pilots\, \GET /api/v1/pilots/{id}\
   - **Unit Routes**: \GET /api/v1/units\, \POST /api/v1/units\, \GET /api/v1/units/{id}\
   - **Contract Routes**: \GET /api/v1/contracts\, \POST /api/v1/contracts\
   - **Ledger Routes**: \GET /api/v1/ledger\, \POST /api/v1/ledger\, \GET /api/v1/ledger/balance\
   - **Engine Triggers**:
     - \POST /api/v1/engine/repair-cost\: Calculates SP and C-Bill repair costs.
     - \POST /api/v1/engine/bv-adjust\: Calculates skill-adjusted BV2.

## Definition of Done
- FastAPI server starts without configuration errors.
- Endpoints return properly validated JSON responses via Pydantic schemas.
- Automatic interactive documentation is accessible at \http://127.0.0.1:8000/docs\.
