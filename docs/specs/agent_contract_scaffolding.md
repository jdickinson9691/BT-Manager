# Agent Contract: Workspace Scaffolding & App Initialization

## Objective
Establish the foundational monorepo files for FastAPI (backend) and Next.js (frontend) to verify local execution and prepare for GitHub push.

## Output Specifications
1. \pps/api/main.py\ - FastAPI entry point with CORS enabled and a \/health\ check endpoint.
2. \pps/api/requirements.txt\ - Backend dependencies (fastapi, uvicorn, pydantic, sqlite3/sqlalchemy).
3. \pps/web/\ - Next.js setup with Tailwind CSS support.
4. \.gitignore\ - Proper exclusions for Python (venv, __pycache__) and Node (node_modules, .next).

## Definition of Done
- \python -m uvicorn main:app\ starts clean on port 8000.
- Next.js dev server starts clean.
- Initial git commit is created cleanly.
