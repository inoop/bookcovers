"""Shared test fixtures."""
from __future__ import annotations

import io
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.database import Base, engine


@pytest_asyncio.fixture
async def client():
    """Create a fresh database and test client for each test."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# Role header helpers
FREELANCER_HEADERS = {
    "X-Dev-User-Id": "test-freelancer-001",
    "X-Dev-Role": "freelancer",
    "X-Dev-Email": "freelancer@example.com",
}

FREELANCER2_HEADERS = {
    "X-Dev-User-Id": "test-freelancer-002",
    "X-Dev-Role": "freelancer",
    "X-Dev-Email": "freelancer2@example.com",
}

ADMIN_HEADERS = {
    "X-Dev-User-Id": "test-admin-001",
    "X-Dev-Role": "admin",
    "X-Dev-Email": "admin@example.com",
}

REVIEWER_HEADERS = {
    "X-Dev-User-Id": "test-reviewer-001",
    "X-Dev-Role": "reviewer",
    "X-Dev-Email": "reviewer@example.com",
}

HIRING_HEADERS = {
    "X-Dev-User-Id": "test-hiring-001",
    "X-Dev-Role": "hiring_user",
    "X-Dev-Email": "hiring@example.com",
}


async def create_profile(client: AsyncClient, headers=None, name="Test Artist", email="test@example.com"):
    """Helper to create a freelancer profile."""
    headers = headers or FREELANCER_HEADERS
    resp = await client.post(
        "/api/freelancer/profile",
        json={"name": name, "email": email},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


async def create_submitted_profile(client: AsyncClient, headers=None, name="Test Artist", email="test@example.com"):
    """Create a profile and submit it for review (with all required fields + portfolio asset)."""
    headers = headers or FREELANCER_HEADERS
    profile = await create_profile(client, headers, name, email)

    await client.put(
        "/api/freelancer/profile",
        json={
            "current_locations": ["NYC"],
            "audience_tags": ["Adult Fiction"],
            "style_tags": ["Illustration"],
            "profile_statement": "My art statement",
        },
        headers=headers,
    )

    await client.post(
        "/api/freelancer/portfolio",
        files={"file": ("test.jpg", io.BytesIO(b"fake image"), "image/jpeg")},
        headers=headers,
    )

    resp = await client.post("/api/freelancer/profile/submit", headers=headers)
    assert resp.status_code == 200
    return resp.json()
