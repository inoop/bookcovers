from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import sqlalchemy as sa

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.freelancer_profile import FreelancerProfile
from app.models.media import MediaAsset, StorageBackend
from app.models.portfolio_asset import (
    PortfolioAsset,
    AssetType,
    AssetVisibility,
    ReviewStatus,
)
from app.schemas.freelancer import (
    PortfolioAssetCreateResponse,
    PortfolioAssetUpdateRequest,
    PortfolioReorderRequest,
    PortfolioAssetPublicResponse,
)
from app.services.auth import AuthUser
from app.services.storage import get_storage_service, StorageService, generate_storage_key
from app.config import get_settings

router = APIRouter(prefix="/api/freelancer/portfolio", tags=["freelancer-portfolio"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _asset_type_from_content(content_type: str) -> str:
    if content_type == "application/pdf":
        return AssetType.PDF.value
    return AssetType.IMAGE.value


async def _get_freelancer_profile(db: AsyncSession, user: AuthUser) -> FreelancerProfile:
    result = await db.execute(
        sa.select(FreelancerProfile).where(FreelancerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(404, "Freelancer profile not found")
    return profile


async def _get_own_asset(
    db: AsyncSession, asset_id: str, profile: FreelancerProfile
) -> PortfolioAsset:
    asset = await db.get(PortfolioAsset, asset_id)
    if not asset or asset.freelancer_profile_id != profile.id:
        raise HTTPException(404, "Portfolio asset not found")
    return asset


@router.post("", response_model=PortfolioAssetCreateResponse, status_code=201)
async def upload_portfolio_asset(
    file: UploadFile = File(...),
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            400,
            f"File type '{file.content_type}' not allowed. "
            f"Accepted: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    # Read file and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB")
    await file.seek(0)  # Reset for storage upload

    profile = await _get_freelancer_profile(db, user)

    # Upload to storage
    storage_key = generate_storage_key(file.filename or "upload.bin", prefix="portfolio")
    await storage.upload(file, storage_key)

    # Create media asset
    settings = get_settings()
    media = MediaAsset(
        uploaded_by_user_id=user.id,
        filename=file.filename or "upload.bin",
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
        storage_backend=settings.STORAGE_BACKEND,
        storage_key=storage_key,
    )
    db.add(media)
    await db.flush()

    # Get next sort order
    max_order = (
        await db.execute(
            sa.select(sa.func.coalesce(sa.func.max(PortfolioAsset.sort_order), -1))
            .where(PortfolioAsset.freelancer_profile_id == profile.id)
        )
    ).scalar_one()

    # Create portfolio asset
    asset = PortfolioAsset(
        freelancer_profile_id=profile.id,
        media_asset_id=media.id,
        asset_type=_asset_type_from_content(file.content_type or ""),
        visibility=AssetVisibility.PUBLIC.value,
        review_status=ReviewStatus.PENDING.value,
        sort_order=max_order + 1,
    )
    db.add(asset)
    await db.flush()
    await db.refresh(asset)

    return PortfolioAssetCreateResponse(
        id=asset.id,
        title=asset.title,
        description=asset.description,
        asset_type=asset.asset_type,
        sort_order=asset.sort_order,
        review_status=asset.review_status,
        visibility=asset.visibility,
        tags=asset.tags,
        media_url=storage.get_url(storage_key),
    )


@router.get("", response_model=list[PortfolioAssetPublicResponse])
async def list_own_portfolio(
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_freelancer_profile(db, user)
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

    responses = []
    for a in assets:
        media_url = None
        media = await db.get(MediaAsset, a.media_asset_id)
        if media:
            media_url = storage.get_url(media.storage_key)
        responses.append(
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
    return responses


@router.put("/reorder", status_code=200)
async def reorder_portfolio(
    body: PortfolioReorderRequest,
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
):
    profile = await _get_freelancer_profile(db, user)
    for item in body.items:
        asset = await _get_own_asset(db, item.id, profile)
        asset.sort_order = item.sort_order

    await db.flush()
    return {"status": "ok"}


@router.put("/{asset_id}", response_model=PortfolioAssetPublicResponse)
async def update_portfolio_asset(
    asset_id: str,
    body: PortfolioAssetUpdateRequest,
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    profile = await _get_freelancer_profile(db, user)
    asset = await _get_own_asset(db, asset_id, profile)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)

    await db.flush()
    await db.refresh(asset)

    media_url = None
    media = await db.get(MediaAsset, asset.media_asset_id)
    if media:
        media_url = storage.get_url(media.storage_key)

    return PortfolioAssetPublicResponse(
        id=asset.id,
        title=asset.title,
        description=asset.description,
        asset_type=asset.asset_type,
        sort_order=asset.sort_order,
        tags=asset.tags,
        media_url=media_url,
    )


@router.delete("/{asset_id}", status_code=204)
async def delete_portfolio_asset(
    asset_id: str,
    user: AuthUser = Depends(require_roles("freelancer")),
    db: AsyncSession = Depends(get_db),
):
    profile = await _get_freelancer_profile(db, user)
    asset = await _get_own_asset(db, asset_id, profile)
    asset.visibility = AssetVisibility.HIDDEN.value
    await db.flush()
