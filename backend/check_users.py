import asyncio
from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.db.models import User

async def get_all_emails():
    """Query and print all user emails from the database"""
    async with AsyncSessionLocal() as session:
        # Query all users
        result = await session.execute(select(User))
        users = result.scalars().all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print(f"\nFound {len(users)} user(s) in the database:\n")
        for user in users:
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Name: {user.name}")
            print(f"Is Verified: {user.is_verified}")
            print(f"Is Active: {user.is_active}")
            print("-" * 40)

if __name__ == "__main__":
    asyncio.run(get_all_emails())

