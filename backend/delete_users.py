import asyncio
from app.db.database import AsyncSessionLocal
from app.db.models import User
from sqlalchemy import select, delete

async def delete_all_users():
    async with AsyncSessionLocal() as db:
        try:
            # Get all users
            result = await db.execute(select(User))
            users = result.scalars().all()
            print(f"Found {len(users)} users to delete")
            
            if not users:
                print("No users to delete.")
                return
            
            # Delete all users using delete statement
            user_ids = [user.id for user in users]
            for user in users:
                print(f"Deleting user: {user.email} (ID: {user.id})")
            
            await db.execute(delete(User).where(User.id.in_(user_ids)))
            await db.commit()
            print("All users deleted successfully!")
            
        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    # Confirm before deleting
    response = input("Are you sure you want to delete ALL users? (yes/no): ")
    if response.lower() == "yes":
        asyncio.run(delete_all_users())
    else:
        print("Cancelled.")