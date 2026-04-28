import pytest

TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
}

@pytest.mark.asyncio
async def test_register_user(client):
    response = await client.post("/auth/register", json=TEST_USER)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == TEST_USER["email"]

@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    await client.post("/auth/register", json=TEST_USER)
    response = await client.post("/auth/register", json=TEST_USER)
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/auth/register", json=TEST_USER)
    response = await client.post("/auth/jwt/login", data={
        "username": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/auth/register", json=TEST_USER)
    response = await client.post("/auth/jwt/login", data={
        "username": TEST_USER["email"],
        "password": "wrongpassword"
    })
    assert response.status_code == 400