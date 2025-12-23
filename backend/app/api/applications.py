from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.db.models import Application
from app.schemas.application import ApplicationCreate, ApplicationRead
from fastapi_users import FastAPIUsers
from app.auth.config import fastapi_users
from app.db.models import User

# get the current user dependency
current_user = fastapi_users.current_user()

router = APIRouter()

@router.post("/", response_model= ApplicationRead)
async def create_application(
    application: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):

    # Convert Pydantic model to SQLAlchemy model
    db_application = Application(**application.model_dump(), user_id=user.id)

    # add to database
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)

    return db_application

@router.get("/", response_model=list[ApplicationRead])
async def list_applications(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Application).filter(Application.user_id == user.id)
    )
    applications = result.scalars().all()
    return applications