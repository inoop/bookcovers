"""Tests for the review workflow and moderation state machine."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

from tests.conftest import (
    FREELANCER_HEADERS,
    FREELANCER2_HEADERS,
    REVIEWER_HEADERS,
    create_profile,
    create_submitted_profile,
)


async def _do_action(client: AsyncClient, profile_id: str, action: str, note: str | None = None) -> object:
    body: dict = {"action": action}
    if note is not None:
        body["note"] = note
    return await client.post(
        f"/api/internal/review/profiles/{profile_id}/actions",
        json=body,
        headers=REVIEWER_HEADERS,
    )


# --- State transitions ---

@pytest.mark.asyncio
async def test_claim_profile(client: AsyncClient):
    """Claiming a submitted profile moves it to under_review and assigns the reviewer."""
    profile = await create_submitted_profile(client)
    assert profile["status"] == "submitted"

    resp = await _do_action(client, profile["id"], "claim")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "under_review"
    assert data["review_owner_id"] == "test-reviewer-001"


@pytest.mark.asyncio
async def test_claim_then_approve(client: AsyncClient):
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "claim")

    resp = await _do_action(client, profile["id"], "approve", note="Looks great!")
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"


@pytest.mark.asyncio
async def test_claim_then_reject(client: AsyncClient):
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "claim")

    resp = await _do_action(client, profile["id"], "reject", note="Not suitable")
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"


@pytest.mark.asyncio
async def test_claim_then_request_changes(client: AsyncClient):
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "claim")

    resp = await _do_action(client, profile["id"], "request_changes", note="Please add more samples")
    assert resp.status_code == 200
    assert resp.json()["status"] == "changes_requested"


@pytest.mark.asyncio
async def test_direct_approve_from_submitted(client: AsyncClient):
    """Submitted profiles can be approved without claiming first."""
    profile = await create_submitted_profile(client)

    resp = await _do_action(client, profile["id"], "approve")
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"


@pytest.mark.asyncio
async def test_approve_then_archive(client: AsyncClient):
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "approve")

    resp = await _do_action(client, profile["id"], "archive")
    assert resp.status_code == 200
    assert resp.json()["status"] == "archived"


@pytest.mark.asyncio
async def test_approve_then_hide(client: AsyncClient):
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "approve")

    resp = await _do_action(client, profile["id"], "hide")
    assert resp.status_code == 200
    assert resp.json()["status"] == "suspended"


@pytest.mark.asyncio
async def test_claim_then_archive(client: AsyncClient):
    """A profile under_review can be archived directly."""
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "claim")

    resp = await _do_action(client, profile["id"], "archive")
    assert resp.status_code == 200
    assert resp.json()["status"] == "archived"


@pytest.mark.asyncio
async def test_rejected_then_archive(client: AsyncClient):
    """Rejected profiles can be archived."""
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "reject")

    resp = await _do_action(client, profile["id"], "archive")
    assert resp.status_code == 200
    assert resp.json()["status"] == "archived"


# --- Invalid transitions ---

@pytest.mark.asyncio
async def test_invalid_action_from_draft(client: AsyncClient):
    """Draft profiles haven't been submitted and cannot be reviewed."""
    profile = await create_profile(client)

    resp = await _do_action(client, profile["id"], "approve")
    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert "not valid" in detail["message"]
    assert "valid_actions" in detail


@pytest.mark.asyncio
async def test_double_approve_rejected(client: AsyncClient):
    """Approving an already-approved profile is an invalid transition."""
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "approve")

    resp = await _do_action(client, profile["id"], "approve")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_hide_from_submitted_rejected(client: AsyncClient):
    """Only approved profiles can be hidden/suspended."""
    profile = await create_submitted_profile(client)

    resp = await _do_action(client, profile["id"], "hide")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_action_on_nonexistent_profile(client: AsyncClient):
    resp = await _do_action(client, "does-not-exist", "approve")
    assert resp.status_code == 404


# --- Audit trail ---

@pytest.mark.asyncio
async def test_action_writes_system_audit_note(client: AsyncClient):
    """Every action produces a system note recording the transition."""
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "claim")

    resp = await client.get(
        f"/api/internal/review/profiles/{profile['id']}/notes",
        headers=REVIEWER_HEADERS,
    )
    assert resp.status_code == 200
    notes = resp.json()
    assert len(notes) >= 1
    # The system note records both old and new status
    assert any("submitted" in n["body"] and "under_review" in n["body"] for n in notes)


@pytest.mark.asyncio
async def test_action_with_note_creates_general_note(client: AsyncClient):
    """When a reviewer supplies a note on approve/reject, a GENERAL note is also created."""
    profile = await create_submitted_profile(client)
    await _do_action(client, profile["id"], "approve", note="Portfolio is excellent")

    resp = await client.get(
        f"/api/internal/review/profiles/{profile['id']}/notes",
        headers=REVIEWER_HEADERS,
    )
    notes = resp.json()
    general_notes = [n for n in notes if n["note_type"] == "general"]
    assert any("Portfolio is excellent" in n["body"] for n in general_notes)


# --- Queue and summary ---

@pytest.mark.asyncio
async def test_review_queue_contains_submitted_profiles(client: AsyncClient):
    await create_submitted_profile(client)

    resp = await client.get("/api/internal/review/queue", headers=REVIEWER_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_review_queue_excludes_drafts(client: AsyncClient):
    await create_profile(client)  # draft, not submitted

    resp = await client.get("/api/internal/review/queue", headers=REVIEWER_HEADERS)
    assert resp.status_code == 200
    assert resp.json()["total"] == 0


@pytest.mark.asyncio
async def test_review_summary_counts(client: AsyncClient):
    # One submitted, one approved
    p1 = await create_submitted_profile(client, headers=FREELANCER_HEADERS, name="Artist One", email="one@example.com")
    p2 = await create_submitted_profile(client, headers=FREELANCER2_HEADERS, name="Artist Two", email="two@example.com")
    await _do_action(client, p2["id"], "approve")

    resp = await client.get("/api/internal/review/summary", headers=REVIEWER_HEADERS)
    assert resp.status_code == 200
    summary = resp.json()
    assert summary["submitted"] == 1
    assert summary["approved"] == 1
    assert summary["under_review"] == 0


# --- Manual notes ---

@pytest.mark.asyncio
async def test_create_reviewer_note(client: AsyncClient):
    profile = await create_submitted_profile(client)

    resp = await client.post(
        f"/api/internal/review/profiles/{profile['id']}/notes",
        json={"note_type": "general", "body": "Initial thoughts on this portfolio"},
        headers=REVIEWER_HEADERS,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["body"] == "Initial thoughts on this portfolio"
    assert data["note_type"] == "general"
    assert data["author_user_id"] == "test-reviewer-001"


@pytest.mark.asyncio
async def test_create_note_invalid_type_rejected(client: AsyncClient):
    """System notes cannot be created manually via the API."""
    profile = await create_submitted_profile(client)

    resp = await client.post(
        f"/api/internal/review/profiles/{profile['id']}/notes",
        json={"note_type": "system", "body": "Trying to fake a system note"},
        headers=REVIEWER_HEADERS,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_get_notes_returns_all_manual_notes(client: AsyncClient):
    """All manually created notes for a profile are returned by the notes endpoint."""
    profile = await create_submitted_profile(client)
    await client.post(
        f"/api/internal/review/profiles/{profile['id']}/notes",
        json={"note_type": "general", "body": "First note"},
        headers=REVIEWER_HEADERS,
    )
    await client.post(
        f"/api/internal/review/profiles/{profile['id']}/notes",
        json={"note_type": "fit", "body": "Second note"},
        headers=REVIEWER_HEADERS,
    )

    resp = await client.get(
        f"/api/internal/review/profiles/{profile['id']}/notes",
        headers=REVIEWER_HEADERS,
    )
    assert resp.status_code == 200
    notes = resp.json()
    bodies = {n["body"] for n in notes}
    assert "First note" in bodies
    assert "Second note" in bodies
