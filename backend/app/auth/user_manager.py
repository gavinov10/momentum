from fastapi_users import BaseUserManager
from fastapi_users.exceptions import UserAlreadyExists
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.exc import IntegrityError
from typing import Optional, Any
import resend
import os
from dotenv import load_dotenv

from app.db.models import User

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

class UserManager(BaseUserManager[User, int]):
    reset_password_token_secret = os.getenv("SECRET", "your-secret-key-change-in-production")
    
    def __init__(self, user_db: SQLAlchemyUserDatabase):
        super().__init__(user_db)

    def get_user_id(self, user: User) -> str:
        return str(user.id)

    def parse_id(self, user_id: str) -> int:
        return int(user_id)
    
    async def create(self, user_create, safe: bool = False, request: Optional[Any] = None):
        user_dict = user_create.model_dump()
        user_dict["hashed_password"] = self.password_helper.hash(user_dict["password"])
        del user_dict["password"]
        
        try:
            created_user = await self.user_db.create(user_dict)
        except IntegrityError:
            raise UserAlreadyExists()
        
        if hasattr(self, 'on_after_register'):
            await self.on_after_register(created_user, request)
        
        return created_user

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Any] = None):
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": user.email,
            "subject": "Reset your Momentum password",
            "html": f"""
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2>Reset your password</h2>
                    <p>We received a request to reset your Momentum password.</p>
                    <a href="{reset_link}" 
                       style="display: inline-block; padding: 12px 24px; background: #000; 
                              color: #fff; text-decoration: none; border-radius: 6px;">
                        Reset Password
                    </a>
                    <p style="color: #666; font-size: 14px; margin-top: 24px;">
                        This link expires in 1 hour. If you didn't request this, you can ignore this email.
                    </p>
                </div>
            """
        })


async def on_after_forgot_password(self, user: User, token: str, request: Optional[Any] = None):
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    
    try:
        result = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": user.email,
            "subject": "Reset your Momentum password",
            "html": f"""
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2>Reset your password</h2>
                    <p>We received a request to reset your Momentum password.</p>
                    <a href="{reset_link}" 
                       style="display: inline-block; padding: 12px 24px; background: #000; 
                              color: #fff; text-decoration: none; border-radius: 6px;">
                        Reset Password
                    </a>
                    <p style="color: #666; font-size: 14px; margin-top: 24px;">
                        This link expires in 1 hour. If you didn't request this, you can ignore this email.
                    </p>
                </div>
            """
        })
        print(f"DEBUG: Resend result: {result}")
    except Exception as e:
        print(f"DEBUG: Resend error: {e}")