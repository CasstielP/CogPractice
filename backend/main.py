from contextlib import asynccontextmanager
from datetime import datetime, timezone

from mangum import Mangum
from beanie import PydanticObjectId
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from database.mongodb import client, initialize_database
from dependencies.auth import get_current_user
from models.transaction import Transaction
from models.user import User
from schemas.auth import TokenResponse
from schemas.transaction import TransactionCreate
from schemas.user import UserCreate, UserResponse, UserUpdate
from utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    await initialize_database()

    print("Successfully connected to MongoDB Atlas")

    yield



app = FastAPI(
    title="Banking API Demo",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://d122npaojsqmsd.cloudfront.net",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------

async def find_user(
    user_id: PydanticObjectId,
) -> User:
    """
    Find and return the Beanie User document.

    This helper must return User, not UserResponse, because
    routes need access to methods such as save() and delete().
    """
    user = await User.get(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


# ---------------------------------------------------------
# Public authentication routes
# ---------------------------------------------------------

@app.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
async def create_user(
    user_data: UserCreate,
):
    """
    Public sign-up endpoint.
    """
    normalized_email = user_data.email.strip().lower()

    existing_user = await User.find_one(
        User.email == normalized_email
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    new_user = User(
        name=user_data.name.strip(),
        email=normalized_email,
        password_hash=hash_password(user_data.password),
        balance=0.0,
    )

    await new_user.insert()

    return UserResponse.form_user(new_user)


@app.post(
    "/auth/login",
    response_model=TokenResponse,
    tags=["Authentication"],
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    """
    Verify the email and password, then issue a JWT.

    OAuth2PasswordRequestForm uses the field name 'username',
    but this application treats it as the user's email.
    """
    normalized_email = form_data.username.strip().lower()

    user = await User.find_one(
        User.email == normalized_email
    )

    if user is None or not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    access_token = create_access_token(
        user_id=str(user.id)
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


@app.get(
    "/auth/me",
    response_model=UserResponse,
    tags=["Authentication"],
)
async def get_authenticated_user(
    current_user: User = Depends(get_current_user),
):
    """
    Return the user identified by the JWT.
    """
    return UserResponse.form_user(current_user)


# ---------------------------------------------------------
# Protected user routes
# ---------------------------------------------------------

@app.get(
    "/users",
    response_model=list[UserResponse],
    tags=["Users"],
)
async def get_users(
    current_user: User = Depends(get_current_user),
):
    """
    Return all users.

    The current_user parameter is not used directly, but
    Depends(get_current_user) makes the route protected.
    """
    users = await User.find_all().to_list()

    return [
        UserResponse.form_user(user)
        for user in users
    ]


@app.get(
    "/users/{user_id}",
    response_model=UserResponse,
    tags=["Users"],
)
async def get_user(
    user_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
):
    user = await find_user(user_id)

    return UserResponse.form_user(user)


@app.put(
    "/users/{user_id}",
    response_model=UserResponse,
    tags=["Users"],
)
async def update_user(
    user_id: PydanticObjectId,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    user = await find_user(user_id)

    normalized_email = user_data.email.strip().lower()

    existing_user = await User.find_one(
        User.email == normalized_email
    )

    if (
        existing_user is not None
        and existing_user.id != user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user.name = user_data.name.strip()
    user.email = normalized_email
    user.updated_at = datetime.now(timezone.utc)

    await user.save()

    return UserResponse.form_user(user)


@app.delete(
    "/users/{user_id}",
    tags=["Users"],
)
async def delete_user(
    user_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
):
    user = await find_user(user_id)

    user_transactions = await Transaction.find(
        Transaction.user.id == user.id
    ).to_list()

    for transaction in user_transactions:
        await transaction.delete()

    await user.delete()

    return {
        "message": "User deleted successfully",
    }


# ---------------------------------------------------------
# Protected transaction routes
# ---------------------------------------------------------

@app.post("/account/deposit")
async def deposit_funds(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
):
    current_user.balance += transaction_data.amount
    current_user.updated_at = datetime.now(timezone.utc)

    await current_user.save()

    transaction = Transaction(
        user=current_user,
        type="deposit",
        amount=transaction_data.amount,
        balance_after=current_user.balance,
    )

    await transaction.insert()

    return {
        "message": "Deposit successful",
        "transaction": transaction,
    }



@app.post(
    "/account/withdraw",
    tags=["Transactions"],
    status_code=status.HTTP_201_CREATED,
)
async def withdraw_funds(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
):
    if transaction_data.amount > current_user.balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds",
        )

    current_user.balance -= transaction_data.amount
    current_user.updated_at = datetime.now(timezone.utc)

    await current_user.save()

    transaction = Transaction(
        user=current_user,
        type="withdrawal",
        amount=transaction_data.amount,
        balance_after=current_user.balance,
    )

    await transaction.insert()

    return {
        "message": "Withdrawal successful",
        "balance": current_user.balance,
        "transaction": transaction,
    }



@app.get(
    "/users/{user_id}/balance",
    tags=["Transactions"],
)
async def get_user_account_balance(
    user_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
):
    user = await find_user(user_id)

    return {
        "user_id": str(user.id),
        "balance": user.balance,
    }


@app.get(
    "/users/{user_id}/transactions",
    tags=["Transactions"],
    response_model=list[Transaction],
)
async def get_user_transaction_history(
    user_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
):
    user = await find_user(user_id)

    return await Transaction.find(
        Transaction.user.id == user.id
    ).sort("-created_at").to_list()



handler = Mangum(app)