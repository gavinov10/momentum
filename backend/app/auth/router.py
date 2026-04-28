from fastapi import APIRouter
from app.auth.config import fastapi_users, auth_backend, google_oauth_client, SECRET
from app.auth.schemas import UserCreate, UserRead, UserUpdate
import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

router = APIRouter()

# Register endpoint
router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    tags=["auth"],
)

# Login endpoint
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/jwt",
    tags=["auth"],
)

# Forgot password + reset password endpoints
router.include_router(
    fastapi_users.get_reset_password_router(),
    tags=["auth"],
)

# Google OAuth endpoints
router.include_router(
    fastapi_users.get_oauth_router(
        google_oauth_client,
        auth_backend,
        SECRET,
        redirect_url="http://localhost:5173/auth/callback",
        associate_by_email=True,
        is_verified_by_default=True,
    ),
    prefix="/google",
    tags=["auth"],
)

# User management endpoints
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    tags=["users"],
)