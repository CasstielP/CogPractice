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

    password: str = Field(
        min_length = 8,
        max_length = 128,
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


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    balance: float

    @classmethod
    def form_user(cls, user):
        return cls(
            id=str(user.id),
            name=user.name,
            email=user.email,
            balance=user.balance,
        )