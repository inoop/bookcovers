"""Tests for admin user management endpoints."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.database import async_session_factory
from app.models.user import User
from tests.conftest import ADMIN_HEADERS


async def _seed_users() -> list[User]:
    """Insert test users directly into the database."""
    async with async_session_factory() as db:
        users = [
            User(id="user-1", external_id="ext-1", email="alice@example.com", display_name="Alice", role="freelancer"),
            User(id="user-2", external_id="ext-2", email="bob@example.com", display_name="Bob", role="hiring_user"),
            User(id="user-admin", external_id="ext-admin", email="admin@example.com", display_name="Admin", role="admin"),
        ]
        db.add_all(users)
        await db.commit()
        return users


@pytest.mark.asyncio
async def test_list_users_empty(client: AsyncClient):
    """Empty DB returns an empty list."""
    resp = await client.get("/api/admin/users", headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_users(client: AsyncClient):
    await _seed_users()
    resp = await client.get("/api/admin/users", headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    assert len(resp.json()) == 3


@pytest.mark.asyncio
async def test_list_users_filter_by_role(client: AsyncClient):
    await _seed_users()
    resp = await client.get("/api/admin/users", params={"role": "freelancer"}, headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    users = resp.json()
    assert len(users) == 1
    assert users[0]["email"] == "alice@example.com"


@pytest.mark.asyncio
async def test_update_user_role(client: AsyncClient):
    await _seed_users()
    resp = await client.put(
        "/api/admin/users/user-1/role",
        json={"role": "reviewer"},
        headers=ADMIN_HEADERS,
    )
    assert resp.status_code == 200
    assert resp.json()["role"] == "reviewer"


@pytest.mark.asyncio
async def test_update_user_role_persisted(client: AsyncClient):
    """Role change is reflected in subsequent list response."""
    await _seed_users()
    await client.put(
        "/api/admin/users/user-1/role",
        json={"role": "reviewer"},
        headers=ADMIN_HEADERS,
    )
    resp = await client.get("/api/admin/users", params={"role": "reviewer"}, headers=ADMIN_HEADERS)
    assert any(u["email"] == "alice@example.com" for u in resp.json())


@pytest.mark.asyncio
async def test_update_user_role_not_found(client: AsyncClient):
    resp = await client.put(
        "/api/admin/users/nonexistent/role",
        json={"role": "admin"},
        headers=ADMIN_HEADERS,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_user(client: AsyncClient):
    await _seed_users()
    resp = await client.delete("/api/admin/users/user-1", headers=ADMIN_HEADERS)
    assert resp.status_code == 204

    # Confirm the user is gone
    resp = await client.get("/api/admin/users", headers=ADMIN_HEADERS)
    emails = [u["email"] for u in resp.json()]
    assert "alice@example.com" not in emails


@pytest.mark.asyncio
async def test_delete_self_forbidden(client: AsyncClient):
    """Admin cannot delete their own account."""
    async with async_session_factory() as db:
        db.add(User(
            id="test-admin-001",
            external_id="ext-test-admin-001",
            email="testadmin@example.com",
            display_name="Test Admin",
            role="admin",
        ))
        await db.commit()

    resp = await client.delete("/api/admin/users/test-admin-001", headers=ADMIN_HEADERS)
    assert resp.status_code == 400
    assert "Cannot delete your own account" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_delete_user_not_found(client: AsyncClient):
    resp = await client.delete("/api/admin/users/nonexistent", headers=ADMIN_HEADERS)
    assert resp.status_code == 404
