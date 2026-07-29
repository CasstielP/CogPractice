import asyncio

from database.mongodb import client, initialize_database
from models.transaction import Transaction
from models.user import User
from utils.security import hash_password


async def seed_database() -> None:
    await initialize_database()

    # Optional: clear existing development data first
    await Transaction.find_all().delete()
    await User.find_all().delete()

    users = [
        User(
            name="John Smith",
            email="john@example.com",
            password_hash=hash_password("101010"),
            balance=1000.00,
        ),
        User(
            name="Jane Doe",
            email="jane@example.com",
            password_hash=hash_password("101010"),
            balance=500.00,
        ),
        User(
            name="Casstiel Pi",
            email="casstiel@example.com",
            password_hash=hash_password("101010"),
            balance=1000.00,
        ),
    ]

    await User.insert_many(users)

    print(f"Seeded {len(users)} users.")

    await client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())