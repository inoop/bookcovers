from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.freelancer_profile import FreelancerProfile, ProfileStatus
from app.models.notes import NoteType, NoteVisibility, ProfileNote
from app.models.portfolio_asset import PortfolioAsset, ReviewStatus
from app.models.base import new_uuid


# --- Profile transition map ---
# (current_status, action) -> next_status

PROFILE_TRANSITIONS: dict[tuple[ProfileStatus, str], ProfileStatus] = {
    (ProfileStatus.SUBMITTED, "claim"):             ProfileStatus.UNDER_REVIEW,
    (ProfileStatus.SUBMITTED, "approve"):           ProfileStatus.APPROVED,
    (ProfileStatus.SUBMITTED, "reject"):            ProfileStatus.REJECTED,
    (ProfileStatus.SUBMITTED, "request_changes"):   ProfileStatus.CHANGES_REQUESTED,
    (ProfileStatus.UNDER_REVIEW, "approve"):        ProfileStatus.APPROVED,
    (ProfileStatus.UNDER_REVIEW, "reject"):         ProfileStatus.REJECTED,
    (ProfileStatus.UNDER_REVIEW, "request_changes"): ProfileStatus.CHANGES_REQUESTED,
    (ProfileStatus.UNDER_REVIEW, "archive"):        ProfileStatus.ARCHIVED,
    (ProfileStatus.APPROVED, "archive"):            ProfileStatus.ARCHIVED,
    (ProfileStatus.APPROVED, "hide"):               ProfileStatus.SUSPENDED,
    (ProfileStatus.REJECTED, "archive"):            ProfileStatus.ARCHIVED,
    (ProfileStatus.CHANGES_REQUESTED, "archive"):   ProfileStatus.ARCHIVED,
}

# --- Asset transition map ---

ASSET_TRANSITIONS: dict[tuple[ReviewStatus, str], ReviewStatus] = {
    (ReviewStatus.PENDING, "approve"):  ReviewStatus.APPROVED,
    (ReviewStatus.PENDING, "reject"):   ReviewStatus.REJECTED,
    (ReviewStatus.PENDING, "hide"):     ReviewStatus.HIDDEN,
    (ReviewStatus.APPROVED, "reject"):  ReviewStatus.REJECTED,
    (ReviewStatus.APPROVED, "hide"):    ReviewStatus.HIDDEN,
    (ReviewStatus.REJECTED, "approve"): ReviewStatus.APPROVED,
    (ReviewStatus.HIDDEN, "approve"):   ReviewStatus.APPROVED,
}


async def apply_profile_action(
    db: AsyncSession,
    profile: FreelancerProfile,
    action: str,
    actor_user_id: str,
    note_body: str | None = None,
) -> FreelancerProfile:
    """Apply a moderation action to a profile.

    Validates the transition, updates status and metadata, and writes a
    SYSTEM audit note. Raises HTTPException(400) for invalid transitions.
    """
    current = ProfileStatus(profile.status)
    key = (current, action)

    if key not in PROFILE_TRANSITIONS:
        valid = [a for (s, a) in PROFILE_TRANSITIONS if s == current]
        raise HTTPException(
            400,
            detail={
                "message": f"Action '{action}' is not valid from status '{current.value}'",
                "valid_actions": valid,
            },
        )

    next_status = PROFILE_TRANSITIONS[key]
    profile.status = next_status.value
    profile.last_reviewed_at = datetime.now(timezone.utc)

    if action == "claim":
        profile.review_owner_id = actor_user_id

    # Write system audit note
    audit_body = f"Status changed: {current.value} → {next_status.value} (action: {action})"
    if note_body:
        audit_body += f"\n\nReviewer note: {note_body}"

    audit_note = ProfileNote(
        id=new_uuid(),
        freelancer_profile_id=profile.id,
        author_user_id=actor_user_id,
        note_type=NoteType.SYSTEM.value,
        body=audit_body,
        visibility=NoteVisibility.INTERNAL.value,
    )
    db.add(audit_note)

    # If reviewer supplied a separate human note, store it as GENERAL too
    if note_body and action != "claim":
        human_note = ProfileNote(
            id=new_uuid(),
            freelancer_profile_id=profile.id,
            author_user_id=actor_user_id,
            note_type=NoteType.GENERAL.value,
            body=note_body,
            visibility=NoteVisibility.INTERNAL.value,
        )
        db.add(human_note)

    await db.flush()
    await db.refresh(profile)
    return profile


async def apply_asset_action(
    db: AsyncSession,
    asset: PortfolioAsset,
    action: str,
    actor_user_id: str,  # noqa: ARG001 — reserved for future audit on assets
) -> PortfolioAsset:
    """Apply a moderation action to a portfolio asset.

    Raises HTTPException(400) for invalid transitions.
    """
    current = ReviewStatus(asset.review_status)
    key = (current, action)

    if key not in ASSET_TRANSITIONS:
        valid = [a for (s, a) in ASSET_TRANSITIONS if s == current]
        raise HTTPException(
            400,
            detail={
                "message": f"Action '{action}' is not valid from review_status '{current.value}'",
                "valid_actions": valid,
            },
        )

    next_status = ASSET_TRANSITIONS[key]
    asset.review_status = next_status.value

    await db.flush()
    await db.refresh(asset)
    return asset
