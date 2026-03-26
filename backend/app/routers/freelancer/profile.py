from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.freelancer_profile import FreelancerProfile, ProfileStatus
from app.models.portfolio_asset import PortfolioAsset, AssetVisibility
from app.models.media import MediaAsset
from app.schemas.freelancer import (
    FreelancerOwnProfileResponse,
    FreelancerProfileCreateRequest,
    FreelancerProfileUpdateRequest,
    PortfolioAssetPublicResponse,
)
from app.services.auth import AuthUser
from app.services.storage import get_storage_service, StorageService, generate_storage_key
from app.config import get_settings

router = APIRouter(prefix="/api/freelancer/profile", tags=["freelancer-profile"])


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    return slug


async def _unique_slug(db: AsyncSession, name: str, exclude_profile_id: str | None = None) -> str:
    base = _slugify(name)
    slug = base
    counter = 1
    while True:
        stmt = sa.select(FreelancerProfile.id).where(FreelancerProfile.slug == slug)
        if exclude_profile_id:
            stmt = stmt.where(FreelancerProfile.id != exclude_profile_id)
        exists = (await db.execute(stmt)).scalar_one_or_none()
        if exists is None:
            return slug
        counter += 1
        slug = f"{base}-{counter}"


async def _get_own_profile(
    db: AsyncSession, user: AuthUser
) -> FreelancerProfile | None:
    stmt = sa.select(FreelancerProfile).where(FreelancerProfile.user_id == user.id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _build_response(
    db: AsyncSession, profile: FreelancerProfile, storage: StorageService
) -> FreelancerOwnProfileResponse:
    # Get portfolio assets
    stmt = (
        sa.select(PortfolioAsset)
        .where(
            PortfolioAsset.freelancer_profile_id == profile.id,
            PortfolioAsset.visibility != AssetVisibility.HIDDEN.value,
        )
        .order_by(PortfolioAsset.sort_order.asc())
    )
    result = await db.execute(stmt)
    assets = list(result.scalars().all())

    asset_responses = []
    for a in assets:
        media_url = None
        media = await db.get(MediaAsset, a.media_asset_id)
        if media:
            media_url = storage.get_url(media.storage_key)
        asset_responses.append(
            PortfolioAssetPublicResponse(
                id=a.id,
                title=a.title,
                description=a.description,
                asset_type=a.asset_type,
                sort_order=a.sort_order,
                tags=a.tags,
                media_url=media_url,
            )
        )

    avatar_url = None
    if profile.avatar_asset_id:
        avatar_media = await db.get(MediaAsset, profile.avatar_asset_id)
        if avatar_media:
            avatar_url = storage.get_url(avatar_media.storage_key)

    return FreelancerOwnProfileResponse(
        id=profile.id,
        slug=profile.slug,
        status=profile.status,
        name=profile.name,
        pronouns=profile.pronouns,
        summary=profile.summary,
        email=profile.email,
        website_links=profile.website_links,
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
        avatar_url=avatar_url,
        portfolio_assets=asset_responses,
    )


@router.post("", response_model=FreelancerOwnProfileResponse, status_code=201)
async def create_profile(
    body: FreelancerProfileCreateRequest,
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    existing = await _get_own_profile(db, user)
    if existing:
        raise HTTPException(409, "Profile already exists. Use PUT to update.")

    slug = await _unique_slug(db, body.name)
    profile = FreelancerProfile(
        user_id=user.id,
        name=body.name,
        email=body.email,
        is_self_submission=body.is_self_submission,
        relation_type=body.relation_type,
        slug=slug,
        status=ProfileStatus.DRAFT.value,
    )
    db.add(profile)
    await db.flush()
    await db.refresh(profile)
    return await _build_response(db, profile, storage)


@router.get("", response_model=FreelancerOwnProfileResponse)
async def get_own_profile(
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_own_profile(db, user)
    if not profile:
        raise HTTPException(404, "No profile found. Create one first.")
    return await _build_response(db, profile, storage)


@router.put("", response_model=FreelancerOwnProfileResponse)
async def update_profile(
    body: FreelancerProfileUpdateRequest,
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_own_profile(db, user)
    if not profile:
        raise HTTPException(404, "No profile found. Create one first.")

    editable_statuses = {ProfileStatus.DRAFT.value, ProfileStatus.CHANGES_REQUESTED.value, ProfileStatus.APPROVED.value}
    if profile.status not in editable_statuses:
        raise HTTPException(
            403,
            f"Profile cannot be edited in '{profile.status}' status. "
            f"Editable statuses: {', '.join(editable_statuses)}",
        )

    update_data = body.model_dump(exclude_unset=True)

    # Convert website_links from Pydantic models to dicts for JSON storage
    if "website_links" in update_data and update_data["website_links"] is not None:
        update_data["website_links"] = [
            link.model_dump() if hasattr(link, "model_dump") else link
            for link in update_data["website_links"]
        ]

    for field, value in update_data.items():
        setattr(profile, field, value)

    # Re-generate slug if name changed
    if "name" in update_data:
        profile.slug = await _unique_slug(db, profile.name, exclude_profile_id=profile.id)

    await db.flush()
    await db.refresh(profile)
    return await _build_response(db, profile, storage)


@router.post("/submit", response_model=FreelancerOwnProfileResponse)
async def submit_profile(
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_own_profile(db, user)
    if not profile:
        raise HTTPException(404, "No profile found. Create one first.")

    submittable = {ProfileStatus.DRAFT.value, ProfileStatus.CHANGES_REQUESTED.value}
    if profile.status not in submittable:
        raise HTTPException(
            403,
            f"Profile cannot be submitted from '{profile.status}' status.",
        )

    # Validate required fields (labels are user-facing)
    missing = []
    if not profile.name:
        missing.append("Full Name")
    if not profile.email:
        missing.append("Email")
    if not profile.current_locations or not any(
        loc.strip() for loc in profile.current_locations
    ):
        missing.append("Current Location(s)")
    if not profile.audience_tags:
        missing.append("Audience")
    if not profile.style_tags:
        missing.append("Style")
    if not profile.profile_statement:
        missing.append("Artist Profile Statement")

    # Check for at least one portfolio asset
    asset_count = (
        await db.execute(
            sa.select(sa.func.count())
            .select_from(PortfolioAsset)
            .where(
                PortfolioAsset.freelancer_profile_id == profile.id,
                PortfolioAsset.visibility != AssetVisibility.HIDDEN.value,
            )
        )
    ).scalar_one()
    if asset_count == 0:
        missing.append("Work Samples (upload at least one)")

    if missing:
        raise HTTPException(
            422,
            detail={
                "message": "Missing required fields for submission",
                "missing_fields": missing,
            },
        )

    profile.status = ProfileStatus.SUBMITTED.value
    await db.flush()
    await db.refresh(profile)
    return await _build_response(db, profile, storage)


@router.post("/retract", response_model=FreelancerOwnProfileResponse)
async def retract_profile(
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_own_profile(db, user)
    if not profile:
        raise HTTPException(404, "No profile found. Create one first.")

    retractable = {ProfileStatus.SUBMITTED.value, ProfileStatus.UNDER_REVIEW.value}
    if profile.status not in retractable:
        raise HTTPException(
            403,
            f"Cannot retract profile in '{profile.status}' status.",
        )

    profile.status = ProfileStatus.DRAFT.value
    await db.flush()
    await db.refresh(profile)
    return await _build_response(db, profile, storage)


ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            400,
            f"File type '{file.content_type}' not allowed. Accepted: JPEG, PNG, WebP",
        )

    content = await file.read()
    if len(content) > MAX_AVATAR_SIZE:
        raise HTTPException(400, "Avatar file exceeds 5MB limit")
    await file.seek(0)

    storage_key = generate_storage_key(file.filename or "avatar.jpg", prefix="avatars")
    await storage.upload(file, storage_key)

    settings = get_settings()
    media = MediaAsset(
        uploaded_by_user_id=user.id,
        filename=file.filename or "avatar.jpg",
        content_type=file.content_type or "image/jpeg",
        size_bytes=len(content),
        storage_backend=settings.STORAGE_BACKEND,
        storage_key=storage_key,
    )
    db.add(media)
    await db.flush()

    profile = await _get_own_profile(db, user)
    if profile:
        profile.avatar_asset_id = media.id
        await db.flush()

    return {"id": media.id, "url": storage.get_url(storage_key)}


@router.delete("/avatar", response_model=FreelancerOwnProfileResponse)
async def delete_avatar(
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_own_profile(db, user)
    if not profile:
        raise HTTPException(404, "No profile found.")
    profile.avatar_asset_id = None
    await db.flush()
    await db.refresh(profile)
    return await _build_response(db, profile, storage)
