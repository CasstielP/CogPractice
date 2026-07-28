from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


app = FastAPI()



# helper functions
def get_user(user_id: int):

    for user in users:
        if user["id"] == user_id:
            return user

    raise HTTPException(
        status_code = 404,
        detail = "User Not Found"
    )


# DTO
class UserCreate(BaseModel):
    name: str
    email: str


class TranscationCreate(BaseModel):
    amount: float = Field(gt = 0)

# temp seeder data
users = [
    {
        "id": 1,
        "name": "John",
        "email": "john@sample.com",
        "balance": 1000
    },
    {
        "id": 2,
        "name": "Jane",
        "email": "jane@sample.com",
        "balance": 1000
    }
]

transactions = [

]

# default route
@app.get('/')
def root():
    return {"mesasge": "FastAPI is running"}


# get all users
@app.get('/users')
def get_users():
    return users


# get user by id
@app.get('/users/{user_id}')
def get_user(user_id: int):

    for user in users:
        if user["id"] == user_id:
            return user

    raise HTTPException(
        status_code = 404,
        detail = "User Not Found"
    )


# create new user
@app.post('/users')
def create_user(user: UserCreate):

    new_user = {
        "id": len(users) + 1,
        "name": user.name,
        "email": user.email
    }

    users.append(new_user) # simulating async database action

    return new_user


# update user info
@app.put('/users/{user_id}')
def update_user(user_id: int, user_to_update: UserCreate):

    for user in users:
        if user["id"] == user_id:
            user["name"] = user_to_update.name
            user["email"] = user_to_update.email

            return user

    raise HTTPException(
        status_code = 404,
        detail = "User Not Found"
    )



# delete user
@app.delete("/user/{user_id}")
def delete_user(user_id: int):
    for user in users:
        if user['id'] == user_id:
            users.remove(user)

            return{
                "Message": "User Deleted"
            }
    raise HTTPException(
        status = 404,
        detail = "User Not Found"
    )


# deposit funds
@app.post('/users/{user_id}/deposit')
def deposit_funds(user_id: int, transaction: TranscationCreate):
    user = get_user(user_id)

    user["balance"] += transaction.amount

    new_transaction = {
        "id": len(transactions) + 1,
        "user_id": user_id,
        "type": "deposit",
        "amount": transaction.amount,
        "balance_after": user["balance"]
    }

    transactions.append(new_transaction)

    return {
        "message": "Deposit successful",
        "transaction": new_transaction
    }


# withdraw funds
@app.post("/users/{user_id}/withdraw")
def withdraw_funds(user_id: int, transaction: TranscationCreate):
    user = get_user(user_id)

    if transaction.amount > user["balance"]:
        raise HTTPException(
            status = 400,
            detail = "Insufficient funds"
        )

    user["balance"] -= transaction.amount

    new_transaction = {
        "id": len(transactions) +1,
        "user_id": user_id,
        "type": "withdrawal",
        "amount": transaction.amount,
        "balance_after": user["balance"]
    }

    transactions.append(transaction)

    return {
        "message": "Withdrawal successful",
        "transaction": new_transaction
    }


# get user transaction history 
@app.get('/users/{user_id}/transactions')
def get_user_transaction_history(user_id: int):
    get_user(user_id)

    user_transactions = [
        transaction for transaction in transactions
        if transaction["user_id"] == user_id
    ]

    return user_transactions

# get user account balance
@app.get("/users/{user_id}/balance")
def get_user_account_balance(user_id: int):

    user = get_user(user_id)

    return {
        "balance": user["balance"]
    }