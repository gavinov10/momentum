from fastapi import Depends
from fastapi_users import FastAPIUsers
from app.auth.user_manager import UserManager
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

from app.db.models import User
from app.db.database import AsyncSessionLocal

import os
from dotenv import load_dotenv

load_dotenv()
SECRET = os.getenv("SECRET", "your-secret-key-change-in-production")

# 1) User DB dependency
async def get_user_db():
    """Yield SQLAlchemy user database (async)."""
    async with AsyncSessionLocal() as session:
        # SQLAlchemyUserDatabase: try keyword arguments to ensure correct order
        user_db = SQLAlchemyUserDatabase(user_table=User, session=session)
        yield user_db

# 2) User manager dependency
async def get_user_manager(user_db=Depends(get_user_db)):
    """Yield UserManager instance."""
    yield UserManager(user_db)

# 3) JWT strategy
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

# 4) Auth backend
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# 5) FastAPIUsers INSTANCE — IMPORTANT: pass get_user_manager, NOT get_user_db
fastapi_users = FastAPIUsers[User, int](
    get_user_manager,      # ← this is the first arg
    [auth_backend],        # ← list of backends
)