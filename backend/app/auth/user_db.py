from fastapi import Depends
from fastapi_users import FastAPIUsers
from app.auth.user_manager import UserManager
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User
from app.db.database import AsyncSessionLocal

import os
from dotenv import load_dotenv

load_dotenv()
SECRET = os.getenv("SECRET", "your-secret-key-change-in-production")

async def get_user_db():
    """Get the user database session"""
    async with AsyncSessionLocal() as session:
        yield SQLAlchemyUserDatabase(User, session)

async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    """Get the user manager instance"""
    yield UserManager(user_db)

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600) #JWT strategy configuration

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy
)

fastapi_users = FastAPIUsers[User, int](
    get_user_db,
    [auth_backend],
    get_user_manager=get_user_manager,
)