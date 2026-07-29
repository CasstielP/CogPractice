from datetime import datetime, timezone
from typing import Literal

from beanie import Document, Link
from pydantic import Field

from models.user import User


class Transaction(Document):
    user: Link[User]

    type: Literal[
        "deposit",
        "withdrawal",
    ]

    amount: float = Field(gt=0)

    balance_after: float = Field(ge=0)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "transactions"