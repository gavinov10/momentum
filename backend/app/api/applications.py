from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Application
from app.schemas.application import ApplicationCreate, ApplicationRead

router = APIRouter()

@router.post("/", response_model= ApplicationRead)
def create_application(application: ApplicationCreate, db: Session = Depends(get_db)):
    # Convert Pydantic model to SQLAlchemy model
    db_application = Application(**application.model_dump())

    # add to database
    db.add(db_application)
    db.commit()
    db.refresh(db_application)

    return db_application

@router.get("/", response_model=list[ApplicationRead])
def list_applications(db: Session = Depends(get_db)):
    applications = db.query(Application).all()
    return applications