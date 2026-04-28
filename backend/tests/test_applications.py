import pytest

TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
}

TEST_APP = {
    "company_name": "Acme Corp",
    "role": "Software Engineer",
    "status": "applied"
}

async def get_auth_headers(client):
    await client.post("/auth/register", json=TEST_USER)
    response = await client.post("/auth/jwt/login", data={
        "username": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_application(client):
    headers = await get_auth_headers(client)
    response = await client.post("/applications/", json=TEST_APP, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == TEST_APP["company_name"]
    assert data["role"] == TEST_APP["role"]

@pytest.mark.asyncio
async def test_get_applications(client):
    headers = await get_auth_headers(client)
    await client.post("/applications/", json=TEST_APP, headers=headers)
    response = await client.get("/applications/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

@pytest.mark.asyncio
async def test_update_application(client):
    headers = await get_auth_headers(client)
    create = await client.post("/applications/", json=TEST_APP, headers=headers)
    app_id = create.json()["id"]
    response = await client.put(f"/applications/{app_id}", json={"status": "interview"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "interview"

@pytest.mark.asyncio
async def test_delete_application(client):
    headers = await get_auth_headers(client)
    create = await client.post("/applications/", json=TEST_APP, headers=headers)
    app_id = create.json()["id"]
    response = await client.delete(f"/applications/{app_id}", headers=headers)
    assert response.status_code == 200
    get = await client.get("/applications/", headers=headers)
    assert len(get.json()) == 0

@pytest.mark.asyncio
async def test_unauthenticated_access(client):
    response = await client.get("/applications/")
    assert response.status_code == 401