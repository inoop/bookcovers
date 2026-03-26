from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import sqlalchemy as sa

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.book_cover import BookCover, BookCoverContributor
from app.models.media import MediaAsset
from app.schemas.book_cover import (
    CoverAdminResponse,
    CoverCreateRequest,
    CoverUpdateRequest,
    ContributorCreateRequest,
    ContributorResponse,
)
from app.services.auth import AuthUser
from app.services.storage import get_storage_service, StorageService, generate_storage_key
from app.config import get_settings

router = APIRouter(prefix="/api/admin/covers", tags=["admin-covers"])


def _cover_to_response(cover: BookCover, storage: StorageService) -> CoverAdminResponse:
    image_url = None
    if cover.primary_image:
        storage_key = cover.primary_image.storage_key
        if storage_key:
            image_url = storage.get_url(storage_key)

    return CoverAdminResponse(
        id=cover.id,
        slug=cover.slug,
        title=cover.title,
        subtitle=cover.subtitle,
        author_name=cover.author_name,
        publisher=cover.publisher,
        imprint=cover.imprint,
        publication_date=cover.publication_date,
        audience_tags=cover.audience_tags,
        genre_tags=cover.genre_tags,
        visual_tags=cover.visual_tags,
        primary_image_asset_id=cover.primary_image_asset_id,
        primary_image_url=image_url,
        external_book_url=cover.external_book_url,
        visibility=cover.visibility,
        contributors=[
            ContributorResponse(
                id=c.id,
                contributor_name=c.contributor_name,
                contributor_type=c.contributor_type,
                freelancer_profile_id=c.freelancer_profile_id,
            )
            for c in cover.contributors
        ],
        created_at=cover.created_at,
        updated_at=cover.updated_at,
    )


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload-image")
async def upload_cover_image(
    file: UploadFile = File(...),
    user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            400,
            f"File type '{file.content_type}' not allowed. Accepted: JPEG, PNG, WebP",
        )
    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(400, "Image file exceeds 10 MB limit")
    await file.seek(0)

    settings = get_settings()
    storage_key = generate_storage_key(file.filename or "cover.jpg", prefix="covers")
    await storage.upload(file, storage_key)

    media = MediaAsset(
        uploaded_by_user_id=user.id,
        filename=file.filename or "cover.jpg",
        content_type=file.content_type or "image/jpeg",
        size_bytes=len(content),
        storage_backend=settings.STORAGE_BACKEND,
        storage_key=storage_key,
    )
    db.add(media)
    await db.flush()
    await db.refresh(media)

    return {"id": media.id, "url": storage.get_url(storage_key)}


@router.get("", response_model=list[CoverAdminResponse])
async def list_admin_covers(
    visibility: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    stmt = (
        sa.select(BookCover)
        .options(
            selectinload(BookCover.contributors),
            selectinload(BookCover.primary_image),
        )
        .order_by(BookCover.created_at.desc())
    )
    if visibility:
        stmt = stmt.where(BookCover.visibility == visibility)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    covers = list(result.scalars().all())
    return [_cover_to_response(c, storage) for c in covers]


@router.post("", response_model=CoverAdminResponse, status_code=201)
async def create_cover(
    body: CoverCreateRequest,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    cover = BookCover(**body.model_dump())
    db.add(cover)
    await db.flush()
    cover = await _load_cover(db, cover.id)
    return _cover_to_response(cover, storage)


async def _load_cover(db: AsyncSession, cover_id: str) -> BookCover:
    stmt = (
        sa.select(BookCover)
        .where(BookCover.id == cover_id)
        .options(selectinload(BookCover.contributors), selectinload(BookCover.primary_image))
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.put("/{cover_id}", response_model=CoverAdminResponse)
async def update_cover(
    cover_id: str,
    body: CoverUpdateRequest,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    cover = await db.get(BookCover, cover_id)
    if not cover:
        raise HTTPException(404, "Cover not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(cover, field, value)
    await db.flush()
    cover = await _load_cover(db, cover_id)
    return _cover_to_response(cover, storage)


@router.post("/{cover_id}/contributors", response_model=ContributorResponse, status_code=201)
async def add_contributor(
    cover_id: str,
    body: ContributorCreateRequest,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    cover = await db.get(BookCover, cover_id)
    if not cover:
        raise HTTPException(404, "Cover not found")
    contributor = BookCoverContributor(book_cover_id=cover_id, **body.model_dump())
    db.add(contributor)
    await db.flush()
    await db.refresh(contributor)
    return ContributorResponse(
        id=contributor.id,
        contributor_name=contributor.contributor_name,
        contributor_type=contributor.contributor_type,
        freelancer_profile_id=contributor.freelancer_profile_id,
    )


@router.delete("/{cover_id}/contributors/{contributor_id}", status_code=204)
async def remove_contributor(
    cover_id: str,
    contributor_id: str,
    _user: AuthUser = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    stmt = sa.select(BookCoverContributor).where(
        BookCoverContributor.id == contributor_id,
        BookCoverContributor.book_cover_id == cover_id,
    )
    result = await db.execute(stmt)
    contributor = result.scalar_one_or_none()
    if not contributor:
        raise HTTPException(404, "Contributor not found")
    await db.delete(contributor)
