from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="BT-Manager API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"system": "BT-Manager API", "status": "online"}

@app.get("/health")
def health_check():
    return {"status": "ok", "database": "sqlite_ready"}
