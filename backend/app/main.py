from fastapi import FastAPI
from app.api.applications import router as applications_router
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.api.gmail_sync import router as gmail_sync_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications_router, prefix="/applications", tags=["applications"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/")
def root():
    return {"message": "Momentum is running"}

app.include_router(gmail_sync_router, prefix="/gmail", tags=["gmail"])