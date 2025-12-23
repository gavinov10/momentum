from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict

 # schema for registration 
class UserCreate(BaseModel): #validates registration input (email, passoword, name)
    email: EmailStr
    password: str
    name: str

# Data that is safe to return
class UserRead(BaseModel): # defines safe user data to return (no password)
    id: int
    email: str
    name: str
    is_active: bool
    is_superuser: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)

# schema for updating user information
class UserUpdate(BaseModel): # allows partial updates(optional)
    name: str | None = None
    email: EmailStr | None = None

