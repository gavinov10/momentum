from fastapi import APIRouter
from fastapi_users import FastAPIUsers

from app.auth.config import fastapi_users, auth_backend
from app.auth.schemas import UserCreate, UserRead, UserUpdate
from app.db.models import User

router = APIRouter()

#Register endpoint
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

# User management endpoints (get current user, update, etc.)
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    tags=["users"],
)