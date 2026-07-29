from datetime import datetime, timezone
from typing import Annotated

from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    email: Annotated[
        str,
        Indexed(unique=True),
    ]

    password_hash: str

    balance: float = Field(
        default=0.0,
        ge=0,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime | None = None

    class Settings:
        name = "users"