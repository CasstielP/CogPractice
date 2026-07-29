from contextlib import asynccontextmanager
from datetime import datetime, timezone

from beanie import PydanticObjectId
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from utils.security import hash_password, verify_password
from schemas.user import UserResponse
from database.mongodb import client, initialize_database
from models.transaction import Transaction
from models.user import User
from schemas.transaction import TransactionCreate
from schemas.user import UserCreate, UserUpdate

security = HTTPBasic()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    await initialize_database()

    print("Successfully connected to MongoDB Atlas")

    yield

    await client.close()


async def get_current_user_basic(
    credentials: HTTPBasicCredentials = Depends(security),
) -> User:
    normalized_email = credentials.username.lower().strip()

    user = await User.find_one(
        User.email == normalized_email
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    if not verify_password(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    return user

app = FastAPI(
    title="Banking API Demo",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# helper function 
async def find_user(
    user_id: PydanticObjectId,
) -> User:
    user = await User.get(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse.form_user(user)


# create new user
@app.post(
    "/users",
    status_code=status.HTTP_201_CREATED,
)
async def create_user(user_data: UserCreate):
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


#authenticate user
@app.get(
    "/auth/me",
    response_model=UserResponse,
)
async def get_authenticated_user(
    current_user: User = Depends(get_current_user_basic),
):
    return UserResponse.form_user(current_user)



# get all users
@app.get("/users")
async def get_users():
    users = await User.find_all().to_list()
    return [
        UserResponse.form_user(user)
        for user in users
    ]


# get user by id
@app.get("/users/{user_id}")
async def get_user(
    user_id: PydanticObjectId,
):
    user = await find_user(user_id) 
    return UserResponse.form_user(user)


# update user
@app.put(
    "/users/{user_id}",
    tags=["Users"],
    response_model=User,
)
async def update_user(
    user_id: PydanticObjectId,
    user_data: UserUpdate,
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


#delete user
@app.delete(
    "/users/{user_id}",
    tags=["Users"],
)
async def delete_user(
    user_id: PydanticObjectId,
):
    user = await find_user(user_id)

    user_transactions = await Transaction.find(
        Transaction.user.id == user.id
    ).to_list()

    for transaction in user_transactions:
        await transaction.delete()

    await user.delete()

    return {
        "message": "User deleted successfully"
    }



# deposite money 
@app.post(
    "/users/{user_id}/deposit",
    tags=["Transactions"],
    status_code=status.HTTP_201_CREATED,
)
async def deposit_funds(
    user_id: PydanticObjectId,
    transaction_data: TransactionCreate,
):
    user = await find_user(user_id)

    user.balance += transaction_data.amount
    user.updated_at = datetime.now(timezone.utc)

    await user.save()

    transaction = Transaction(
        user=user,
        type="deposit",
        amount=transaction_data.amount,
        balance_after=user.balance,
    )

    await transaction.insert()

    return {
        "message": "Deposit successful",
        "transaction": transaction,
    }


# withdraw money 
@app.post(
    "/users/{user_id}/withdraw",
    tags=["Transactions"],
    status_code=status.HTTP_201_CREATED,
)
async def withdraw_funds(
    user_id: PydanticObjectId,
    transaction_data: TransactionCreate,
):
    user = await find_user(user_id)

    if transaction_data.amount > user.balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds",
        )

    user.balance -= transaction_data.amount
    user.updated_at = datetime.now(timezone.utc)

    await user.save()

    transaction = Transaction(
        user=user,
        type="withdrawal",
        amount=transaction_data.amount,
        balance_after=user.balance,
    )

    await transaction.insert()

    return {
        "message": "Withdrawal successful",
        "transaction": transaction,
    }


# get account balance
@app.get(
    "/users/{user_id}/balance",
    tags=["Transactions"],
)
async def get_user_account_balance(
    user_id: PydanticObjectId,
):
    user = await find_user(user_id)

    return {
        "user_id": str(user.id),
        "balance": user.balance,
    }


# get transaction history
@app.get(
    "/users/{user_id}/transactions",
    tags=["Transactions"],
    response_model=list[Transaction],
)
async def get_user_transaction_history(
    user_id: PydanticObjectId,
):
    user = await find_user(user_id)

    return await Transaction.find(
        Transaction.user.id == user.id
    ).sort("-created_at").to_list()