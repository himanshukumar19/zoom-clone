"""Meeting Code generation, display form, and Invite Link (D4, D5).

A code is 10 random digits whose first digit is never zero. It is stored
raw ("1234567890") and only ever shown spaced ("123 456 7890"). The Invite
Link is derived from the configured frontend origin on the fly -- it is
computed, never persisted.
"""

import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Meeting

CODE_LENGTH = 10
# 9 * 10^9 possible codes; a collision on the first few tries is vanishingly
# rare, so a small cap is enough to fail loudly instead of looping forever.
MAX_ATTEMPTS = 20


def generate_meeting_code(db: Session) -> str:
    """Return a 10-digit code no Meeting is using yet.

    The pre-check plus retry handles the normal case; the unique index on
    meetings.meeting_code remains the hard guarantee behind it.
    """
    for _ in range(MAX_ATTEMPTS):
        # secrets (not random) so codes are not guessable from process state.
        digits = [str(secrets.randbelow(9) + 1)]  # first digit 1-9, never 0
        digits += [str(secrets.randbelow(10)) for _ in range(CODE_LENGTH - 1)]
        code = "".join(digits)
        taken = db.scalar(select(Meeting.id).where(Meeting.meeting_code == code))
        if taken is None:
            return code
    raise RuntimeError(
        f"No free meeting code in {MAX_ATTEMPTS} attempts -- refusing to reuse a code"
    )


def format_meeting_code(code: str) -> str:
    """Display form only: 1234567890 -> 123 456 7890."""
    return f"{code[:3]} {code[3:6]} {code[6:]}"


def build_invite_link(code: str) -> str:
    """Invite Link = {FRONTEND_URL}/join/{code}. Computed, never stored."""
    return f"{settings.FRONTEND_URL.rstrip('/')}/join/{code}"
