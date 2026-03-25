"""Tests for slug collision handling."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

from tests.conftest import FREELANCER_HEADERS, FREELANCER2_HEADERS, create_profile


@pytest.mark.asyncio
async def test_duplicate_name_gets_unique_slug(client: AsyncClient):
    """Two profiles with the same name should get different slugs."""
    p1 = await create_profile(client, FREELANCER_HEADERS, name="Niels Brouwers", email="a@example.com")
    assert p1["slug"] == "niels-brouwers"

    p2 = await create_profile(client, FREELANCER2_HEADERS, name="Niels Brouwers", email="b@example.com")
    assert p2["slug"] == "niels-brouwers-2"


@pytest.mark.asyncio
async def test_update_name_to_collision_gets_unique_slug(client: AsyncClient):
    """Updating a profile's name to match another should get a unique slug."""
    await create_profile(client, FREELANCER_HEADERS, name="Alice Smith", email="a@example.com")
    await create_profile(client, FREELANCER2_HEADERS, name="Bob Jones", email="b@example.com")

    # Update Bob's name to Alice Smith
    resp = await client.put(
        "/api/freelancer/profile",
        json={"name": "Alice Smith"},
        headers=FREELANCER2_HEADERS,
    )
    assert resp.status_code == 200
    assert resp.json()["slug"] == "alice-smith-2"


@pytest.mark.asyncio
async def test_update_own_name_keeps_slug(client: AsyncClient):
    """Updating your own profile (without name change) should keep the same slug."""
    await create_profile(client, FREELANCER_HEADERS, name="Test Artist", email="a@example.com")

    resp = await client.put(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "summary": "Updated bio"},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 200
    assert resp.json()["slug"] == "test-artist"  # Same slug, no collision with self
