from __future__ import annotations

import math
import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.freelancer_profile import FreelancerProfile, ProfileStatus
from app.models.media import MediaAsset
from app.models.notes import NoteType, NoteVisibility, ProfileNote
from app.models.portfolio_asset import PortfolioAsset
from app.models.base import new_uuid
from app.schemas.freelancer import PaginatedResponse, WebsiteLink
from app.schemas.review import (
    AssetReviewActionRequest,
    FreelancerInternalResponse,
    PortfolioAssetReviewResponse,
    ProfileNoteCreateRequest,
    ProfileNoteResponse,
    ProfileQueueItem,
    ReviewActionRequest,
    ReviewSummaryResponse,
)
from app.services.auth import AuthUser
from app.services.moderation import apply_asset_action, apply_profile_action
from app.services.storage import StorageService, get_storage_service

router = APIRouter(prefix="/api/internal/review", tags=["internal-review"])

_REVIEWER_ROLES = ("reviewer", "admin")


async def _get_profile_or_404(db: AsyncSession, profile_id: str) -> FreelancerProfile:
    profile = await db.get(FreelancerProfile, profile_id)
    if not profile:
        raise HTTPException(404, "Profile not found")
    return profile


async def _build_asset_response(
    db: AsyncSession, asset: PortfolioAsset, storage: StorageService
) -> PortfolioAssetReviewResponse:
    media_url = None
    if asset.media_asset_id:
        media = await db.get(MediaAsset, asset.media_asset_id)
        if media:
            media_url = storage.get_url(media.storage_key)
    return PortfolioAssetReviewResponse(
        id=asset.id,
        title=asset.title,
        description=asset.description,
        asset_type=asset.asset_type,
        review_status=asset.review_status,
        visibility=asset.visibility,
        sort_order=asset.sort_order,
        tags=asset.tags,
        media_url=media_url,
    )


async def _build_internal_response(
    db: AsyncSession, profile: FreelancerProfile, storage: StorageService
) -> FreelancerInternalResponse:
    # Portfolio assets (all, for reviewer)
    assets_stmt = (
        sa.select(PortfolioAsset)
        .where(PortfolioAsset.user_id == profile.user_id)
        .order_by(PortfolioAsset.sort_order.asc())
    )
    assets = list((await db.execute(assets_stmt)).scalars().all())
    asset_responses = [await _build_asset_response(db, a, storage) for a in assets]

    # Notes (newest first)
    notes_stmt = (
        sa.select(ProfileNote)
        .where(ProfileNote.freelancer_profile_id == profile.id)
        .order_by(ProfileNote.created_at.desc())
    )
    notes = list((await db.execute(notes_stmt)).scalars().all())
    note_responses = [
        ProfileNoteResponse(
            id=n.id,
            note_type=n.note_type,
            body=n.body,
            author_user_id=n.author_user_id,
            created_at=n.created_at,
        )
        for n in notes
    ]

    website_links = None
    if profile.website_links:
        website_links = [
            WebsiteLink(**lnk) if isinstance(lnk, dict) else lnk
            for lnk in profile.website_links
        ]

    return FreelancerInternalResponse(
        id=profile.id,
        slug=profile.slug,
        status=profile.status,
        name=profile.name,
        pronouns=profile.pronouns,
        summary=profile.summary,
        email=profile.email,
        website_links=website_links,
        current_locations=profile.current_locations,
        past_locations=profile.past_locations,
        is_self_submission=profile.is_self_submission,
        relation_type=profile.relation_type,
        has_agent=profile.has_agent,
        agent_details=profile.agent_details,
        worked_with_prh=profile.worked_with_prh,
        prh_details=profile.prh_details,
        employee_of_prh=profile.employee_of_prh,
        prh_employee_details=profile.prh_employee_details,
        audience_tags=profile.audience_tags,
        style_tags=profile.style_tags,
        genre_tags=profile.genre_tags,
        image_tags=profile.image_tags,
        uses_ai=profile.uses_ai,
        ai_details=profile.ai_details,
        lived_experience_statement=profile.lived_experience_statement,
        books_excited_about=profile.books_excited_about,
        profile_statement=profile.profile_statement,
        approved_for_hire=profile.approved_for_hire,
        featured=profile.featured,
        rate_info=profile.rate_info,
        review_owner_id=profile.review_owner_id,
        last_reviewed_at=profile.last_reviewed_at,
        created_at=profile.created_at,
        notes=note_responses,
        portfolio_assets=asset_responses,
    )


# --- Summary ---

@router.get("/summary", response_model=ReviewSummaryResponse)
async def get_review_summary(
    _user: AuthUser = Depends(require_roles(*_REVIEWER_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    counts: dict[str, int] = {}
    for status in (
        ProfileStatus.SUBMITTED,
        ProfileStatus.UNDER_REVIEW,
        ProfileStatus.CHANGES_REQUESTED,
        ProfileStatus.APPROVED,
        ProfileStatus.REJECTED,
        ProfileStatus.ARCHIVED,
    ):
        count = (
            await db.execute(
                sa.select(sa.func.count())
                .select_from(FreelancerProfile)
                .where(FreelancerProfile.status == status.value)
            )
        ).scalar_one()
        counts[status.value] = count

    return ReviewSummaryResponse(
        submitted=counts[ProfileStatus.SUBMITTED.value],
        under_review=counts[ProfileStatus.UNDER_REVIEW.value],
        changes_requested=counts[ProfileStatus.CHANGES_REQUESTED.value],
        approved=counts[ProfileStatus.APPROVED.value],
        rejected=counts[ProfileStatus.REJECTED.value],
        archived=counts[ProfileStatus.ARCHIVED.value],
    )


# --- Queue ---

@router.get("/queue", response_model=PaginatedResponse)
async def get_review_queue(
    status: str = "submitted,under_review",
    page: int = 1,
    page_size: int = 25,
    _user: AuthUser = Depends(require_roles(*_REVIEWER_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    statuses = [s.strip() for s in status.split(",") if s.strip()]

    base_stmt = sa.select(FreelancerProfile).where(
        FreelancerProfile.status.in_(statuses)
    )
    total = (
        await db.execute(
            sa.select(sa.func.count())
            .select_from(FreelancerProfile)
            .where(FreelancerProfile.status.in_(statuses))
        )
    ).scalar_one()

    stmt = (
        base_stmt.order_by(FreelancerProfile.created_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    profiles = list((await db.execute(stmt)).scalars().all())

    items = [
        ProfileQueueItem(
            id=p.id,
            name=p.name,
            email=p.email,
            slug=p.slug,
            status=p.status,
            created_at=p.created_at,
            last_reviewed_at=p.last_reviewed_at,
            review_owner_id=p.review_owner_id,
            audience_tags=p.audience_tags,
            style_tags=p.style_tags,
        )
        for p in profiles
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


# --- Profile detail ---

@router.get("/profiles/{profile_id}", response_model=FreelancerInternalResponse)
async def get_internal_profile(
    profile_id: str,
    _user: AuthUser = Depends(require_roles(*_REVIEWER_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_profile_or_404(db, profile_id)
    return await _build_internal_response(db, profile, storage)


# --- Profile actions ---

@router.post("/profiles/{profile_id}/actions", response_model=FreelancerInternalResponse)
async def perform_profile_action(
    profile_id: str,
    body: ReviewActionRequest,
    user: AuthUser = Depends(require_roles(*_REVIEWER_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_profile_or_404(db, profile_id)
    await apply_profile_action(db, profile, body.action, user.id, body.note)
    return await _build_internal_response(db, profile, storage)


# --- Asset listing ---

@router.get(
    "/profiles/{profile_id}/assets",
    response_model=list[PortfolioAssetReviewResponse],
)
async def get_profile_assets(
    profile_id: str,
    _user: AuthUser = Depends(require_roles(*_REVIEWER_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_profile_or_404(db, profile_id)
    stmt = (
        sa.select(PortfolioAsset)
        .where(PortfolioAsset.user_id == profile.user_id)
        .order_by(PortfolioAsset.sort_order.asc())
    )
    assets = list((await db.execute(stmt)).scalars().all())
    return [await _build_asset_response(db, a, storage) for a in assets]


# --- Asset actions ---

@router.post(
    "/assets/{asset_id}/actions",
    response_model=PortfolioAssetReviewResponse,
)
async def perform_asset_action(
    asset_id: str,
    body: AssetReviewActionRequest,
    user: AuthUser = Depends(require_roles(*_REVIEWER_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    asset = await db.get(PortfolioAsset, asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found")
    await apply_asset_action(db, asset, body.action, user.id)
    return await _build_asset_response(db, asset, storage)


# --- Notes ---

@router.get(
    "/profiles/{profile_id}/notes",
    response_model=list[ProfileNoteResponse],
)
async def get_profile_notes(
    profile_id: str,
    _user: AuthUser = Depends(require_roles(*_REVIEWER_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)
    stmt = (
        sa.select(ProfileNote)
        .where(ProfileNote.freelancer_profile_id == profile_id)
        .order_by(ProfileNote.created_at.desc())
    )
    notes = list((await db.execute(stmt)).scalars().all())
    return [
        ProfileNoteResponse(
            id=n.id,
            note_type=n.note_type,
            body=n.body,
            author_user_id=n.author_user_id,
            created_at=n.created_at,
        )
        for n in notes
    ]


@router.post(
    "/profiles/{profile_id}/notes",
    response_model=ProfileNoteResponse,
    status_code=201,
)
async def create_profile_note(
    profile_id: str,
    body: ProfileNoteCreateRequest,
    user: AuthUser = Depends(require_roles(*_REVIEWER_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)

    valid_types = {t.value for t in NoteType} - {NoteType.SYSTEM.value}
    if body.note_type not in valid_types:
        raise HTTPException(
            422,
            f"Invalid note_type '{body.note_type}'. Valid values: {sorted(valid_types)}",
        )

    note = ProfileNote(
        id=new_uuid(),
        freelancer_profile_id=profile_id,
        author_user_id=user.id,
        note_type=body.note_type,
        body=body.body,
        visibility=NoteVisibility.INTERNAL.value,
    )
    db.add(note)
    await db.flush()
    await db.refresh(note)

    return ProfileNoteResponse(
        id=note.id,
        note_type=note.note_type,
        body=note.body,
        author_user_id=note.author_user_id,
        created_at=note.created_at,
    )
