import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.auth.config import get_user_db

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def client():
    # Create a fresh engine and session factory for every test
    engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Override both dependencies
    async def override_get_db():
        async with TestSessionLocal() as session:
            yield session

    async def override_get_user_db():
        async with TestSessionLocal() as session:
            from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
            from app.db.models import User
            yield SQLAlchemyUserDatabase(user_table=User, session=session)

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_user_db] = override_get_user_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    # Teardown — drop all tables and dispose engine
    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()