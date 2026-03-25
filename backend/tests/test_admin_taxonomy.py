"""Tests for admin taxonomy management endpoints."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

from tests.conftest import ADMIN_HEADERS, REVIEWER_HEADERS


async def _create_term(client: AsyncClient, category: str, label: str, slug: str, sort_order: int = 0) -> dict:
    resp = await client.post(
        "/api/admin/taxonomy",
        json={"category": category, "label": label, "slug": slug, "sort_order": sort_order, "is_active": True},
        headers=ADMIN_HEADERS,
    )
    assert resp.status_code == 201
    return resp.json()


@pytest.mark.asyncio
async def test_create_taxonomy_term(client: AsyncClient):
    resp = await client.post(
        "/api/admin/taxonomy",
        json={"category": "style", "label": "Watercolor", "slug": "watercolor", "sort_order": 0, "is_active": True},
        headers=ADMIN_HEADERS,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["label"] == "Watercolor"
    assert data["category"] == "style"
    assert data["slug"] == "watercolor"
    assert data["is_active"] is True
    assert "id" in data



@pytest.mark.asyncio
async def test_list_taxonomy_terms(client: AsyncClient):
    for i, (label, slug) in enumerate([("Illustration", "illustration"), ("Design", "design"), ("Photography", "photography")]):
        await _create_term(client, "style", label, slug, i)

    resp = await client.get("/api/admin/taxonomy", headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    assert len(resp.json()) == 3


@pytest.mark.asyncio
async def test_list_taxonomy_terms_reviewer_can_read(client: AsyncClient):
    """Reviewers have read access to taxonomy terms."""
    await _create_term(client, "style", "Illustration", "illustration")
    resp = await client.get("/api/admin/taxonomy", headers=REVIEWER_HEADERS)
    assert resp.status_code == 200
    assert len(resp.json()) == 1



@pytest.mark.asyncio
async def test_list_taxonomy_by_category(client: AsyncClient):
    await _create_term(client, "style", "Illustration", "illustration")
    await _create_term(client, "genre", "Fantasy", "fantasy")

    resp = await client.get("/api/admin/taxonomy", params={"category": "style"}, headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    terms = resp.json()
    assert len(terms) == 1
    assert terms[0]["category"] == "style"


@pytest.mark.asyncio
async def test_list_excludes_inactive_by_default(client: AsyncClient):
    """Inactive terms are hidden unless include_inactive=true is passed."""
    await _create_term(client, "style", "Active Style", "active-style")
    # Create an inactive term
    await client.post(
        "/api/admin/taxonomy",
        json={"category": "style", "label": "Inactive Style", "slug": "inactive-style", "sort_order": 1, "is_active": False},
        headers=ADMIN_HEADERS,
    )

    resp = await client.get("/api/admin/taxonomy", headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    labels = [t["label"] for t in resp.json()]
    assert "Active Style" in labels
    assert "Inactive Style" not in labels


@pytest.mark.asyncio
async def test_list_includes_inactive_when_requested(client: AsyncClient):
    await _create_term(client, "style", "Active Style", "active-style")
    await client.post(
        "/api/admin/taxonomy",
        json={"category": "style", "label": "Inactive Style", "slug": "inactive-style", "sort_order": 1, "is_active": False},
        headers=ADMIN_HEADERS,
    )

    resp = await client.get("/api/admin/taxonomy", params={"include_inactive": "true"}, headers=ADMIN_HEADERS)
    labels = [t["label"] for t in resp.json()]
    assert "Active Style" in labels
    assert "Inactive Style" in labels


@pytest.mark.asyncio
async def test_update_taxonomy_term_label(client: AsyncClient):
    term = await _create_term(client, "style", "Old Name", "old-name")

    resp = await client.put(
        f"/api/admin/taxonomy/{term['id']}",
        json={"label": "New Name"},
        headers=ADMIN_HEADERS,
    )
    assert resp.status_code == 200
    assert resp.json()["label"] == "New Name"


@pytest.mark.asyncio
async def test_update_taxonomy_term_not_found(client: AsyncClient):
    resp = await client.put(
        "/api/admin/taxonomy/nonexistent",
        json={"label": "Whatever"},
        headers=ADMIN_HEADERS,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_taxonomy_term(client: AsyncClient):
    term = await _create_term(client, "style", "To Delete", "to-delete")

    resp = await client.delete(f"/api/admin/taxonomy/{term['id']}", headers=ADMIN_HEADERS)
    assert resp.status_code == 204

    resp = await client.get("/api/admin/taxonomy", headers=ADMIN_HEADERS)
    assert all(t["id"] != term["id"] for t in resp.json())


@pytest.mark.asyncio
async def test_delete_taxonomy_term_not_found(client: AsyncClient):
    resp = await client.delete("/api/admin/taxonomy/nonexistent", headers=ADMIN_HEADERS)
    assert resp.status_code == 404


