from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.db.database import Base

class User(Base):           # This allows user to inherit from Base = becomes a table
    __tablename__ = "users" # Table name in DB

    id = Column(Integer, primary_key=True, index=True)              # Auto-incrementing ID
    name = Column(String, nullable=False)                           # requires name in that field
    email = Column(String, unique=True, index=True, nullable=False) #unique_email
    created_at = Column(DateTime, default=datetime.now(timezone.utc)) # auto-set on creation
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc)) #auto-update

    #relationship to Applications
    applications = relationship("Application", back_populates="user")

class ApplicationStatus(enum.Enum):
    SAVED = "saved"
    APPLIED = "applied"
    OA = "oa"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String,nullable=False)
    company_size = Column(String, nullable=True)
    role = Column(String, nullable=False)
    date_applied = Column(DateTime, nullable=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SAVED)
    job_url = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    last_activity = Column(DateTime, default=datetime.now(timezone.utc))
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    #relation to User
    user = relationship("User", back_populates="applications")