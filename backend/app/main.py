"""FastAPI app: CORS, startup (create_all), health route."""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.config import settings
from app.database import Base, engine, get_db
from app.models import Meeting, Participant, User  # noqa: F401 (register tables)
from app.routers.meetings import router as meetings_router
from app.seed import seed_if_empty

app = FastAPI(title="zoom-clone API")

app.include_router(meetings_router)

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
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/v1/models")
def v1_models():
    """Stub to silence OpenAI-probe tools (LM Studio, AI extensions) hitting this port."""
    return {"object": "list", "data": []}



@app.get("/api/me")
def get_me(db: Session = Depends(get_db)):
    from sqlalchemy import select
    user = db.execute(select(User).where(User.id == 1)).scalar_one_or_none()
    if not user:
        return {"id": 1, "name": "Demo User", "email": "demo@example.com"}
    return {"id": user.id, "name": user.name, "email": user.email}
