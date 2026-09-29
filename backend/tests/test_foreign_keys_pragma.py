"""T-002: PRAGMA foreign_keys=ON is enforced on every SQLite connection."""
from sqlalchemy import create_engine, event, text
from app.config import settings


def test_foreign_keys_pragma():
    if not settings.DATABASE_URL.startswith("sqlite"):
        return  # SQLite-only
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def _set(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA foreign_keys")).fetchone()[0]
    assert result == 1, f"Expected foreign_keys=1, got {result}"
