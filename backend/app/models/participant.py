"""Participant record: host row links user_id, guest rows leave it NULL."""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (
        CheckConstraint(
            "role IN ('host', 'participant')", name="ck_participants_role"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False
    )
    # Set for the host, NULL for guests joining by display name.
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    display_name: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    is_muted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_removed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    # NULL means currently in the meeting.
    left_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="participants")
    user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="participations"
    )
