from fastapi_users import BaseUserManager
from fastapi_users.exceptions import UserAlreadyExists
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.exc import IntegrityError
from typing import Optional, Any

from app.db.models import User

class UserManager(BaseUserManager[User, int]):
    """Custom user manager for async SQLAlchemy"""
    
    def __init__(self, user_db: SQLAlchemyUserDatabase):
        super().__init__(user_db)

    def get_user_id(self, user: User) -> str:
        """Return user ID as string for tokens."""
        return str(user.id)

    def parse_id(self, user_id: str) -> int:
        """Convert ID from token (string) back to int."""
        return int(user_id)
    
    async def create(
        self,
        user_create,
        safe: bool = False,
        request: Optional[Any] = None
    ):
        """Override create to handle the safe parameter"""
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