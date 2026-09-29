"""Default-user record. No password column: there is no login (D3)."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )

    # Meetings this user hosts; participants rows where they were the host.
    meetings: Mapped[list["Meeting"]] = relationship(
        "Meeting", back_populates="host", cascade="save-update"
    )
    participations: Mapped[list["Participant"]] = relationship(
        "Participant", back_populates="user"
    )
