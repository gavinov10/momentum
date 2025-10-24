from fastapi import FastAPI
from app.api.applications import router as applications_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications_router, prefix="/applications", tags=["applications"])

@app.get("/")
def root():
    return{"message": "Momentum is running"}