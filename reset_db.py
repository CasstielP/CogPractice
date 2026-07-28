import asyncio

from database.mongodb import client, initialize_database
from models.transaction import Transaction
from models.user import User


async def reset_database() -> None:
    await initialize_database()

    deleted_transactions = await Transaction.delete_all()
    deleted_users = await User.delete_all()

    print("Database reset complete")
    print(f"Deleted transactions: {deleted_transactions.deleted_count}")
    print(f"Deleted users: {deleted_users.deleted_count}")

    await client.close()


if __name__ == "__main__":
    asyncio.run(reset_database())