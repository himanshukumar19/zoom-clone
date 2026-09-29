"""Meeting record: instant or scheduled, lifecycle scheduled -> live -> ended."""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Meeting(Base):
    __tablename__ = "meetings"
    __table_args__ = (
        CheckConstraint("type IN ('instant', 'scheduled')", name="ck_meetings_type"),
        CheckConstraint(
            "status IN ('scheduled', 'live', 'ended')", name="ck_meetings_status"
        ),
        CheckConstraint(
            "duration_minutes IS NULL OR duration_minutes > 0",
            name="ck_meetings_duration_positive",
        ),
        Index("ix_meetings_host_status_start", "host_id", "status", "scheduled_start"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # 10 random digits, first non-zero; stored raw ("1234567890"), never spaced.
    meeting_code: Mapped[str] = mapped_column(
        String(10), unique=True, nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    host_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    scheduled_start: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )

    host: Mapped["User"] = relationship("User", back_populates="meetings")
    # Deleting a meeting removes its participants; nothing orphans.
    participants: Mapped[list["Participant"]] = relationship(
        "Participant",
        back_populates="meeting",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
