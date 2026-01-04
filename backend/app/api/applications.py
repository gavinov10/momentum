from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.db.models import Application
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationUpdate
from fastapi_users import FastAPIUsers
from app.auth.config import fastapi_users
from app.db.models import User

# get the current user dependency
current_user = fastapi_users.current_user()

router = APIRouter()

@router.post("/", response_model=ApplicationRead)
async def create_application(
    application: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    db_application = Application(**application.model_dump(), user_id=user.id)
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

# NEW: Get single application
@router.get("/{application_id}", response_model=ApplicationRead)
async def get_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Application).filter(
            Application.id == application_id,
            Application.user_id == user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return application

# NEW: Update application
@router.put("/{application_id}", response_model=ApplicationRead)
async def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Application).filter(
            Application.id == application_id,
            Application.user_id == user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update fields
    for field, value in application_update.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(application, field, value)
    
    await db.commit()
    await db.refresh(application)
    return application

# NEW: Delete application
@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user)
):
    result = await db.execute(
        select(Application).filter(
            Application.id == application_id,
            Application.user_id == user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    await db.delete(application)
    await db.commit()
    
    return {"message": "Application deleted successfully"}