"""Tests for auth and health endpoints."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

from tests.conftest import ADMIN_HEADERS, FREELANCER_HEADERS


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["environment"] == "local"


@pytest.mark.asyncio
async def test_me_returns_user_info(client: AsyncClient):
    resp = await client.get("/api/me", headers=FREELANCER_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "freelancer@example.com"
    assert data["role"] == "freelancer"


@pytest.mark.asyncio
async def test_me_admin(client: AsyncClient):
    resp = await client.get("/api/me", headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    assert resp.json()["role"] == "admin"


@pytest.mark.asyncio
async def test_me_without_auth(client: AsyncClient):
    """Without auth headers, local dev returns default admin user."""
    resp = await client.get("/api/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "admin@localhost"
    assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_profile_retract(client: AsyncClient):
    """Test retracting a submitted profile (untested in existing test file)."""
    from tests.conftest import create_submitted_profile

    profile = await create_submitted_profile(client)
    assert profile["status"] == "submitted"

    resp = await client.post("/api/freelancer/profile/retract", headers=FREELANCER_HEADERS)
    assert resp.status_code == 200
    assert resp.json()["status"] == "draft"


@pytest.mark.asyncio
async def test_retract_draft_profile_fails(client: AsyncClient):
    """Can't retract a profile that hasn't been submitted."""
    from tests.conftest import create_profile

    await create_profile(client)
    resp = await client.post("/api/freelancer/profile/retract", headers=FREELANCER_HEADERS)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_duplicate_profile_creation(client: AsyncClient):
    """Creating a profile twice should fail with 409."""
    from tests.conftest import create_profile

    await create_profile(client)
    resp = await client.post(
        "/api/freelancer/profile",
        json={"name": "Another Profile", "email": "other@example.com"},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 409
