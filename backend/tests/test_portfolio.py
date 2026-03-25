"""Tests for portfolio asset management."""
from __future__ import annotations

import io

import pytest
from httpx import AsyncClient

from tests.conftest import FREELANCER_HEADERS, FREELANCER2_HEADERS, create_profile


async def _upload_asset(client: AsyncClient, headers=None, filename="test.jpg", content_type="image/jpeg"):
    headers = headers or FREELANCER_HEADERS
    return await client.post(
        "/api/freelancer/portfolio",
        files={"file": (filename, io.BytesIO(b"fake image content"), content_type)},
        headers=headers,
    )


@pytest.mark.asyncio
async def test_upload_portfolio_asset(client: AsyncClient):
    await create_profile(client)
    resp = await _upload_asset(client)
    assert resp.status_code == 201
    data = resp.json()
    assert data["asset_type"] == "image"
    assert data["sort_order"] == 0


@pytest.mark.asyncio
async def test_upload_pdf_asset(client: AsyncClient):
    await create_profile(client)
    resp = await _upload_asset(client, content_type="application/pdf", filename="portfolio.pdf")
    assert resp.status_code == 201
    assert resp.json()["asset_type"] == "pdf"


@pytest.mark.asyncio
async def test_upload_invalid_content_type(client: AsyncClient):
    await create_profile(client)
    resp = await _upload_asset(client, content_type="application/zip", filename="archive.zip")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_list_own_portfolio(client: AsyncClient):
    await create_profile(client)
    await _upload_asset(client)
    await _upload_asset(client, filename="test2.jpg")

    resp = await client.get("/api/freelancer/portfolio", headers=FREELANCER_HEADERS)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_upload_increments_sort_order(client: AsyncClient):
    await create_profile(client)
    r1 = await _upload_asset(client)
    r2 = await _upload_asset(client, filename="test2.jpg")
    assert r1.json()["sort_order"] == 0
    assert r2.json()["sort_order"] == 1


@pytest.mark.asyncio
async def test_update_portfolio_asset(client: AsyncClient):
    await create_profile(client)
    upload = await _upload_asset(client)
    asset_id = upload.json()["id"]

    resp = await client.put(
        f"/api/freelancer/portfolio/{asset_id}",
        json={"title": "My Cover Art", "description": "Cover for a novel"},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "My Cover Art"
    assert resp.json()["description"] == "Cover for a novel"


@pytest.mark.asyncio
async def test_delete_portfolio_asset(client: AsyncClient):
    """Delete should soft-delete (hide) the asset."""
    await create_profile(client)
    upload = await _upload_asset(client)
    asset_id = upload.json()["id"]

    resp = await client.delete(f"/api/freelancer/portfolio/{asset_id}", headers=FREELANCER_HEADERS)
    assert resp.status_code == 204

    # Asset should be gone from the list (hidden)
    resp = await client.get("/api/freelancer/portfolio", headers=FREELANCER_HEADERS)
    assert len(resp.json()) == 0


@pytest.mark.asyncio
async def test_cannot_access_other_users_asset(client: AsyncClient):
    """Freelancer 2 should not be able to update freelancer 1's asset."""
    await create_profile(client, FREELANCER_HEADERS)
    await create_profile(client, FREELANCER2_HEADERS, name="Other Artist", email="other@example.com")

    upload = await _upload_asset(client, FREELANCER_HEADERS)
    asset_id = upload.json()["id"]

    resp = await client.put(
        f"/api/freelancer/portfolio/{asset_id}",
        json={"title": "Hacked"},
        headers=FREELANCER2_HEADERS,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_reorder_portfolio(client: AsyncClient):
    await create_profile(client)
    r1 = await _upload_asset(client, filename="first.jpg")
    r2 = await _upload_asset(client, filename="second.jpg")
    id1 = r1.json()["id"]
    id2 = r2.json()["id"]

    # Swap order
    resp = await client.put(
        "/api/freelancer/portfolio/reorder",
        json={"items": [{"id": id1, "sort_order": 1}, {"id": id2, "sort_order": 0}]},
        headers=FREELANCER_HEADERS,
    )
    assert resp.status_code == 200

    # Verify order
    resp = await client.get("/api/freelancer/portfolio", headers=FREELANCER_HEADERS)
    assets = resp.json()
    assert assets[0]["id"] == id2
    assert assets[1]["id"] == id1
