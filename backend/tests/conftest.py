"""Test setup: an isolated SQLite file per run, seeded like a fresh boot.

The HTTP API is the test seam (spec 00), so tests talk to a TestClient and
assert status codes, envelopes, and stored state -- never internal helpers.
"""

import os
import tempfile
from pathlib import Path

import pytest

# Redirect the app to a throwaway database *before* app.config is imported,
# otherwise the engine would point at the developer's local zoom_clone.db.
TEST_DB_PATH = Path(tempfile.mkdtemp(prefix="zoom_clone_tests_")) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, SessionLocal, engine, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed_if_empty  # noqa: E402


@pytest.fixture()
def client():
    """Fresh schema + seed data per test, so every test starts from known state."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_if_empty()

    with SessionLocal() as session:

        def override_get_db():
            yield session

        app.dependency_overrides[get_db] = override_get_db
        # Entering the context runs the app's startup hook, whose seed is a
        # no-op here because this fixture already seeded the same rows.
        with TestClient(app) as test_client:
            yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
