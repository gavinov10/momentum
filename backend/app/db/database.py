from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

# load environment variable from .env
load_dotenv()

# get database URL from environment
# gives access to the variables from .env
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./momentum.db") 
# for postgres later use --> postgresql+asyncpg...

#Create the database engine
# allows SQLalchemy to send SQL commands and retrieve the results from the DB
engine = create_async_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# create session factory
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

#Create base class for models
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session