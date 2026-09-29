"""Shared schema helpers.

Times go out in UTC with a `Z` designator (D6) so the browser can render
them in the viewer's own timezone.
"""

from datetime import datetime, timezone
from typing import Annotated

from pydantic import PlainSerializer


def _to_utc_z(value: datetime) -> str:
    """SQLite hands back naive datetimes; treat those as UTC, then end with Z."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


# Only affects the JSON body; the model attribute stays a real datetime.
UtcDateTime = Annotated[
    datetime, PlainSerializer(_to_utc_z, return_type=str, when_used="json")
]
