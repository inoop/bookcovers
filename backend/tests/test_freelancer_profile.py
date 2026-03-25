"""Tests for freelancer profile CRUD and submission flow."""
from __future__ import annotations

import io
import pytest
from httpx import AsyncClient

from tests.conftest import FREELANCER_HEADERS


@pytest.mark.asyncio
async def test_create_profile(client: AsyncClient):
    resp = await client.post(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "email": "test@example.com"},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Artist"
    assert data["status"] == "draft"
    assert data["slug"] == "test-artist"


@pytest.mark.asyncio
async def test_update_persists_current_locations(client: AsyncClient):
    """Verify that updating current_locations actually persists the value."""
    # Create
    await client.post(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "email": "test@example.com"},
        headers=FREELANCER_HEADERS,
    )

    # Update with current_locations
    resp = await client.put(
        "/api/freelancer/profile",
        json={"current_locations": ["New York, NY", "Los Angeles, CA"]},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 200
    assert resp.json()["current_locations"] == ["New York, NY", "Los Angeles, CA"]

    # GET and verify persisted
    resp = await client.get("/api/freelancer/profile", headers=FREELANCER_HEADERS)
    assert resp.status_code == 200
    assert resp.json()["current_locations"] == ["New York, NY", "Los Angeles, CA"]


@pytest.mark.asyncio
async def test_update_with_all_fields_persists(client: AsyncClient):
    """Verify a full update (as the frontend sends it) persists all fields."""
    await client.post(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "email": "test@example.com"},
        headers=FREELANCER_HEADERS,
    )

    full_update = {
        "name": "Test Artist",
        "email": "test@example.com",
        "pronouns": "they/them",
        "summary": "A test bio",
        "current_locations": ["NYC"],
        "past_locations": [],
        "audience_tags": ["Adult Fiction"],
        "style_tags": ["Illustration"],
        "genre_tags": [],
        "image_tags": [],
        "uses_ai": False,
        "profile_statement": "My art statement",
        "has_agent": False,
        "worked_with_prh": False,
        "employee_of_prh": False,
        "is_self_submission": True,
        "website_links": [],
        "books_excited_about": [],
    }
    resp = await client.put(
        "/api/freelancer/profile",
        json=full_update,
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["current_locations"] == ["NYC"]
    assert data["audience_tags"] == ["Adult Fiction"]
    assert data["style_tags"] == ["Illustration"]
    assert data["profile_statement"] == "My art statement"


@pytest.mark.asyncio
async def test_submit_fails_without_required_fields(client: AsyncClient):
    """Submit should fail with human-readable missing field names."""
    await client.post(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "email": "test@example.com"},
        headers=FREELANCER_HEADERS,
    )

    resp = await client.post("/api/freelancer/profile/submit", headers=FREELANCER_HEADERS)
    assert resp.status_code == 422
    detail = resp.json()["detail"]
    assert "Current Location(s)" in detail["missing_fields"]
    assert "Audience" in detail["missing_fields"]
    assert "Style" in detail["missing_fields"]
    assert "Artist Profile Statement" in detail["missing_fields"]
    assert "Work Samples (upload at least one)" in detail["missing_fields"]
    # Should NOT contain snake_case names
    assert "current_locations" not in detail["missing_fields"]


@pytest.mark.asyncio
async def test_submit_fails_with_empty_current_locations(client: AsyncClient):
    """Submit should fail when current_locations is explicitly []."""
    await client.post(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "email": "test@example.com"},
        headers=FREELANCER_HEADERS,
    )
    await client.put(
        "/api/freelancer/profile",
        json={
            "current_locations": [],  # empty, not None
            "audience_tags": ["Adult Fiction"],
            "style_tags": ["Illustration"],
            "profile_statement": "My statement",
        },
        headers=FREELANCER_HEADERS,
    )

    resp = await client.post("/api/freelancer/profile/submit", headers=FREELANCER_HEADERS)
    assert resp.status_code == 422
    detail = resp.json()["detail"]
    assert "Current Location(s)" in detail["missing_fields"]


@pytest.mark.asyncio
async def test_submit_fails_with_blank_string_current_locations(client: AsyncClient):
    """Submit should fail when current_locations contains only blank strings."""
    await client.post(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "email": "test@example.com"},
        headers=FREELANCER_HEADERS,
    )
    await client.put(
        "/api/freelancer/profile",
        json={
            "current_locations": ["", "  "],
            "audience_tags": ["Adult Fiction"],
            "style_tags": ["Illustration"],
            "profile_statement": "My statement",
        },
        headers=FREELANCER_HEADERS,
    )

    resp = await client.post("/api/freelancer/profile/submit", headers=FREELANCER_HEADERS)
    assert resp.status_code == 422
    detail = resp.json()["detail"]
    assert "Current Location(s)" in detail["missing_fields"]


@pytest.mark.asyncio
async def test_submit_succeeds_with_all_required_fields(client: AsyncClient):
    """Full save-then-submit flow should work when all fields are filled."""
    # Create profile
    await client.post(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "email": "test@example.com"},
        headers=FREELANCER_HEADERS,
    )

    # Update with all required fields
    await client.put(
        "/api/freelancer/profile",
        json={
            "current_locations": ["NYC"],
            "audience_tags": ["Adult Fiction"],
            "style_tags": ["Illustration"],
            "profile_statement": "My art statement",
        },
        headers=FREELANCER_HEADERS,
    )

    # Upload a portfolio asset
    file_content = b"fake image content for testing"
    resp = await client.post(
        "/api/freelancer/portfolio",
        files={"file": ("test.jpg", io.BytesIO(file_content), "image/jpeg")},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 201

    # Submit
    resp = await client.post("/api/freelancer/profile/submit", headers=FREELANCER_HEADERS)
    assert resp.status_code == 200
    assert resp.json()["status"] == "submitted"


@pytest.mark.asyncio
async def test_full_frontend_flow(client: AsyncClient):
    """Simulate the exact frontend flow: getValues() sends ALL fields including empty ones."""
    # Step 1: Create
    resp = await client.post(
        "/api/freelancer/profile",
        json={"name": "Test Artist", "email": "test@example.com"},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 201

    # Step 2: Upload portfolio asset first
    resp = await client.post(
        "/api/freelancer/portfolio",
        files={"file": ("sample.jpg", io.BytesIO(b"image data"), "image/jpeg")},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 201

    # Step 3: Frontend calls getValues() which returns ALL fields, including empty ones
    # This is what the frontend sends — note empty arrays for unfilled fields
    full_form_data = {
        "name": "Test Artist",
        "pronouns": "",
        "summary": "",
        "email": "test@example.com",
        "website_links": [],
        "current_locations": ["Brooklyn, NY"],
        "past_locations": [],
        "has_agent": False,
        "agent_details": "",
        "worked_with_prh": False,
        "prh_details": "",
        "employee_of_prh": False,
        "prh_employee_details": "",
        "audience_tags": ["Young Adult"],
        "style_tags": ["Illustration", "Design"],
        "genre_tags": [],
        "image_tags": [],
        "uses_ai": False,
        "ai_details": "",
        "lived_experience_statement": "",
        "books_excited_about": [],
        "profile_statement": "I create vibrant illustrations",
        "is_self_submission": True,
        "relation_type": "",
    }
    resp = await client.put(
        "/api/freelancer/profile",
        json=full_form_data,
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["current_locations"] == ["Brooklyn, NY"]

    # Step 4: Submit
    resp = await client.post("/api/freelancer/profile/submit", headers=FREELANCER_HEADERS)
    assert resp.status_code == 200, f"Submit failed: {resp.json()}"
    assert resp.json()["status"] == "submitted"
