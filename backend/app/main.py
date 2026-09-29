"""FastAPI app: CORS, startup (create_all), health route."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.models import Meeting, Participant, User  # noqa: F401 (register tables)
from app.seed import seed_if_empty

app = FastAPI(title="zoom-clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # Create tables then seed demo data only when the users table is empty.
    # Reboots with data do not duplicate rows.
    Base.metadata.create_all(bind=engine)
    seed_if_empty()


@app.get("/api/health")
def health():
    return {"status": "ok"}
