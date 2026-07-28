from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    email: str = Field(
        min_length=3,
        max_length=255,
    )


class UserUpdate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    email: str = Field(
        min_length=3,
        max_length=255,
    )