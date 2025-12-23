from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.db.models import ApplicationStatus

class ApplicationCreate(BaseModel):
    company_name: str
    role: str
    company_size: Optional[str] = None
    date_applied: Optional[datetime] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.SAVED

class ApplicationRead(BaseModel):
    id: int
    user_id: int
    company_name: str
    company_size: Optional[str] = None
    role: str
    date_applied: Optional[datetime] = None
    status: ApplicationStatus
    job_url: Optional[str] = None
    notes: Optional[str] = None
    last_activity: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None