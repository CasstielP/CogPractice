import os

from beanie import init_beanie
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

from models.transaction import Transaction
from models.user import User


load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")


if not MONGODB_URL:
    raise RuntimeError(
        "MONGODB_URL is not configured"
    )

if not DATABASE_NAME:
    raise RuntimeError(
        "DATABASE_NAME is not configured"
    )


client = AsyncMongoClient(MONGODB_URL)


async def initialize_database() -> None:
    database = client[DATABASE_NAME]

    await init_beanie(
        database=database,
        document_models=[
            User,
            Transaction,
        ],
    )