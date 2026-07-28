import asyncio

from database.mongodb import (
    users_collection,
    transactions_collection,
)


async def seed_database():
    await users_collection.delete_many({})
    await transactions_collection.delete_many({})

    users = [
        {
            "name": "John",
            "email": "john@example.com",
            "balance": 1000.00,
        },
        {
            "name": "Jane",
            "email": "jane@example.com",
            "balance": 500.00,
        },
    ]

    user_result = await users_collection.insert_many(users)

    john_id = user_result.inserted_ids[0]
    jane_id = user_result.inserted_ids[1]

    transactions = [
        {
            "user_id": john_id,
            "type": "deposit",
            "amount": 1000.00,
            "balance_after": 1000.00,
        },
        {
            "user_id": jane_id,
            "type": "deposit",
            "amount": 500.00,
            "balance_after": 500.00,
        },
    ]

    await transactions_collection.insert_many(transactions)

    print("Database seeded successfully")


if __name__ == "__main__":
    asyncio.run(seed_database())