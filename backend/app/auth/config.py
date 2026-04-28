from fastapi import Depends
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from httpx_oauth.clients.google import GoogleOAuth2

from app.auth.user_manager import UserManager
from app.db.models import User
from app.db.database import AsyncSessionLocal

import os
from dotenv import load_dotenv

load_dotenv()

SECRET = os.getenv("SECRET", "your-secret-key-change-in-production")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

# Google OAuth client — only one definition with scopes
google_oauth_client = GoogleOAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    scopes=["openid", "email", "profile"],
)

# 1) User DB dependency
async def get_user_db():
    async with AsyncSessionLocal() as session:
        from app.db.models import OAuthAccount
        yield SQLAlchemyUserDatabase(session, User, OAuthAccount)

# 2) User manager dependency
async def get_user_manager(user_db=Depends(get_user_db)):
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

# 5) FastAPIUsers instance
fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)