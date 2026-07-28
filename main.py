from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI()

# DTO
class UserCreate(BaseModel):
    name: str
    email: str

users = [
    {
        "id": 1,
        "name": "John",
        "email": "john@sample.com"
    },
    {
        "id": 2,
        "name": "Jane",
        "email": "jane@sample.com"
    }
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
@app.get('users/{user_id}')
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

    user.append(new_user) # simulating async database action

    return new_user


# update user info
@app.put('users/{user_id}')
def update_user(user_id: int, user_to_update: UserCreate):

    for user in users:
        if user["id"] == user_id:
            user["name"] == user_to_update.name
            user["email"] == user_to_update.email

            return user

    raise HTTPException(
        status_code = 404,
        detail = "User Not Found"
    )



# delete user
@app.delete("user/{user_id}")
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