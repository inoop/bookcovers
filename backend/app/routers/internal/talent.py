from __future__ import annotations

import math
from typing import List

import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.rbac import require_roles
from app.models.base import new_uuid
from app.models.collaboration import Favorite, Folder, FolderMembership, FolderPrivacy
from app.models.freelancer_profile import FreelancerProfile
from app.models.media import MediaAsset
from app.models.notes import NoteType, NoteVisibility, ProfileNote
from app.models.notes import FeedbackEntry
from app.models.portfolio_asset import AssetVisibility, PortfolioAsset, ReviewStatus
from app.schemas.freelancer import PaginatedResponse
from app.schemas.internal import (
    FavoriteToggleResponse,
    FeedbackEntryCreateRequest,
    FeedbackEntryResponse,
    FolderCreateRequest,
    FolderDetailResponse,
    FolderMemberRequest,
    FolderResponse,
    FolderUpdateRequest,
    InternalFreelancerCard,
    NoteUpdateRequest,
)
from app.schemas.review import (
    FreelancerInternalResponse,
    ProfileNoteCreateRequest,
    ProfileNoteResponse,
)
from app.services.auth import AuthUser
from app.services.search import search_freelancers_internal
from app.services.storage import StorageService, get_storage_service

router = APIRouter(prefix="/api/internal", tags=["internal-talent"])

_INTERNAL_ROLES = ("hiring_user", "reviewer", "admin")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _get_profile_or_404(db: AsyncSession, profile_id: str) -> FreelancerProfile:
    profile = await db.get(FreelancerProfile, profile_id)
    if not profile:
        raise HTTPException(404, "Profile not found")
    return profile


async def _get_folder_or_404(db: AsyncSession, folder_id: str) -> Folder:
    folder = await db.get(Folder, folder_id)
    if not folder:
        raise HTTPException(404, "Folder not found")
    return folder


def _user_can_access_folder(folder: Folder, user_id: str) -> bool:
    if folder.owner_user_id == user_id:
        return True
    if folder.privacy == FolderPrivacy.SHARED_TEAM.value:
        return True
    if folder.privacy == FolderPrivacy.SHARED_USERS.value:
        shared = folder.shared_with or []
        return user_id in shared
    return False


async def _member_count(db: AsyncSession, folder_id: str) -> int:
    return (
        await db.execute(
            sa.select(sa.func.count())
            .select_from(FolderMembership)
            .where(FolderMembership.folder_id == folder_id)
        )
    ).scalar_one()


async def _hero_url(
    db: AsyncSession, user_id: str, storage: StorageService
) -> str | None:
    stmt = (
        sa.select(PortfolioAsset)
        .where(
            PortfolioAsset.user_id == user_id,
            PortfolioAsset.visibility == AssetVisibility.PUBLIC.value,
            PortfolioAsset.review_status == ReviewStatus.APPROVED.value,
        )
        .order_by(PortfolioAsset.sort_order.asc())
        .limit(1)
    )
    asset = (await db.execute(stmt)).scalar_one_or_none()
    if not asset:
        return None
    media = await db.get(MediaAsset, asset.media_asset_id)
    if not media:
        return None
    return storage.get_url(media.storage_key)


async def _build_card(
    db: AsyncSession,
    profile: FreelancerProfile,
    user_favorites: set[str],
    user_folder_map: dict[str, list[str]],
    storage: StorageService,
) -> InternalFreelancerCard:
    """Build InternalFreelancerCard.

    user_favorites: set of profile IDs favorited by the requesting user.
    user_folder_map: dict mapping profile_id → list of folder_ids.
    """
    hero_url = await _hero_url(db, profile.user_id, storage)
    return InternalFreelancerCard(
        id=profile.id,
        slug=profile.slug,
        name=profile.name,
        pronouns=profile.pronouns,
        summary=profile.summary,
        status=profile.status,
        approved_for_hire=profile.approved_for_hire,
        current_locations=profile.current_locations,
        audience_tags=profile.audience_tags,
        style_tags=profile.style_tags,
        genre_tags=profile.genre_tags,
        has_agent=profile.has_agent,
        worked_with_prh=profile.worked_with_prh,
        uses_ai=profile.uses_ai,
        is_favorite=profile.id in user_favorites,
        folder_ids=user_folder_map.get(profile.id, []),
        hero_image_url=hero_url,
    )


async def _load_user_favorites(db: AsyncSession, user_id: str) -> set[str]:
    """Return set of profile IDs favorited by user."""
    rows = (
        await db.execute(
            sa.select(Favorite.freelancer_profile_id).where(Favorite.user_id == user_id)
        )
    ).scalars().all()
    return set(rows)


async def _load_user_folder_map(
    db: AsyncSession, user_id: str, profile_ids: list[str]
) -> dict[str, list[str]]:
    """Return dict mapping profile_id → list[folder_id] for folders accessible to user."""
    if not profile_ids:
        return {}
    # Load all accessible folders for user
    all_folders_stmt = sa.select(Folder).where(
        sa.or_(
            Folder.owner_user_id == user_id,
            Folder.privacy == FolderPrivacy.SHARED_TEAM.value,
        )
    )
    all_folders = list((await db.execute(all_folders_stmt)).scalars().all())
    # Include shared_users folders where user is in shared_with
    shared_folders_stmt = sa.select(Folder).where(
        Folder.privacy == FolderPrivacy.SHARED_USERS.value
    )
    shared_folders = list((await db.execute(shared_folders_stmt)).scalars().all())
    accessible_folder_ids = {f.id for f in all_folders}
    accessible_folder_ids.update(
        f.id for f in shared_folders if user_id in (f.shared_with or [])
    )

    if not accessible_folder_ids:
        return {}

    memberships_stmt = (
        sa.select(FolderMembership)
        .where(
            FolderMembership.folder_id.in_(accessible_folder_ids),
            FolderMembership.freelancer_profile_id.in_(profile_ids),
        )
    )
    memberships = list((await db.execute(memberships_stmt)).scalars().all())
    result: dict[str, list[str]] = {}
    for m in memberships:
        result.setdefault(m.freelancer_profile_id, []).append(m.folder_id)
    return result


async def _folder_to_response(db: AsyncSession, folder: Folder) -> FolderResponse:
    count = await _member_count(db, folder.id)
    return FolderResponse(
        id=folder.id,
        owner_user_id=folder.owner_user_id,
        name=folder.name,
        privacy=folder.privacy,
        description=folder.description,
        shared_with=folder.shared_with,
        created_at=folder.created_at,
        member_count=count,
    )


# ---------------------------------------------------------------------------
# Favorites
# ---------------------------------------------------------------------------


@router.post(
    "/talent/favorites/{profile_id}",
    response_model=FavoriteToggleResponse,
)
async def toggle_favorite(
    profile_id: str,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)

    existing = (
        await db.execute(
            sa.select(Favorite).where(
                Favorite.user_id == user.id,
                Favorite.freelancer_profile_id == profile_id,
            )
        )
    ).scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.flush()
        return FavoriteToggleResponse(profile_id=profile_id, is_favorite=False)
    else:
        fav = Favorite(
            id=new_uuid(),
            user_id=user.id,
            freelancer_profile_id=profile_id,
        )
        db.add(fav)
        await db.flush()
        return FavoriteToggleResponse(profile_id=profile_id, is_favorite=True)


@router.get(
    "/talent/favorites",
    response_model=PaginatedResponse,
)
async def list_favorites(
    page: int = 1,
    page_size: int = 24,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    total = (
        await db.execute(
            sa.select(sa.func.count())
            .select_from(Favorite)
            .where(Favorite.user_id == user.id)
        )
    ).scalar_one()

    stmt = (
        sa.select(FreelancerProfile)
        .join(Favorite, sa.and_(
            Favorite.freelancer_profile_id == FreelancerProfile.id,
            Favorite.user_id == user.id,
        ))
        .order_by(Favorite.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    profiles = list((await db.execute(stmt)).scalars().all())

    user_favorites = {p.id for p in profiles}  # all returned are favorites
    profile_ids = [p.id for p in profiles]
    folder_map = await _load_user_folder_map(db, user.id, profile_ids)

    items = [
        await _build_card(db, p, user_favorites, folder_map, storage)
        for p in profiles
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


# ---------------------------------------------------------------------------
# Folders
# ---------------------------------------------------------------------------


@router.get("/talent/folders", response_model=list[FolderResponse])
async def list_folders(
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    # Load owned + shared_team
    owned_team_stmt = sa.select(Folder).where(
        sa.or_(
            Folder.owner_user_id == user.id,
            Folder.privacy == FolderPrivacy.SHARED_TEAM.value,
        )
    )
    folders = list((await db.execute(owned_team_stmt)).scalars().all())

    # Load shared_users and filter in Python
    shared_stmt = sa.select(Folder).where(
        Folder.privacy == FolderPrivacy.SHARED_USERS.value,
        Folder.owner_user_id != user.id,  # don't double-count owned shared_users folders
    )
    shared = list((await db.execute(shared_stmt)).scalars().all())
    folders.extend(f for f in shared if user.id in (f.shared_with or []))

    # Deduplicate (owned shared_users folders already in first query)
    seen = set()
    unique_folders = []
    for f in folders:
        if f.id not in seen:
            seen.add(f.id)
            unique_folders.append(f)

    return [await _folder_to_response(db, f) for f in unique_folders]


@router.post("/talent/folders", response_model=FolderResponse, status_code=201)
async def create_folder(
    body: FolderCreateRequest,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    folder = Folder(
        id=new_uuid(),
        owner_user_id=user.id,
        name=body.name,
        privacy=body.privacy,
        description=body.description,
        shared_with=body.shared_with,
    )
    db.add(folder)
    await db.flush()
    await db.refresh(folder)
    return await _folder_to_response(db, folder)


@router.get("/talent/folders/{folder_id}", response_model=FolderDetailResponse)
async def get_folder_detail(
    folder_id: str,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    folder = await _get_folder_or_404(db, folder_id)
    if not _user_can_access_folder(folder, user.id):
        raise HTTPException(403, "You do not have access to this folder")

    # Load member profiles
    stmt = (
        sa.select(FreelancerProfile)
        .join(FolderMembership, FolderMembership.freelancer_profile_id == FreelancerProfile.id)
        .where(FolderMembership.folder_id == folder_id)
        .order_by(FolderMembership.created_at.asc())
    )
    profiles = list((await db.execute(stmt)).scalars().all())

    user_favorites = await _load_user_favorites(db, user.id)
    profile_ids = [p.id for p in profiles]
    folder_map = await _load_user_folder_map(db, user.id, profile_ids)

    member_cards = [
        await _build_card(db, p, user_favorites, folder_map, storage)
        for p in profiles
    ]

    base = await _folder_to_response(db, folder)
    return FolderDetailResponse(
        **base.model_dump(),
        members=member_cards,
    )


@router.put("/talent/folders/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: str,
    body: FolderUpdateRequest,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    folder = await _get_folder_or_404(db, folder_id)
    if folder.owner_user_id != user.id:
        raise HTTPException(403, "Only the folder owner can edit it")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(folder, field, value)

    await db.flush()
    await db.refresh(folder)
    return await _folder_to_response(db, folder)


@router.delete("/talent/folders/{folder_id}", status_code=204)
async def delete_folder(
    folder_id: str,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    folder = await _get_folder_or_404(db, folder_id)
    if folder.owner_user_id != user.id:
        raise HTTPException(403, "Only the folder owner can delete it")
    await db.delete(folder)
    await db.flush()


@router.post("/talent/folders/{folder_id}/members", response_model=FolderResponse)
async def add_folder_member(
    folder_id: str,
    body: FolderMemberRequest,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    folder = await _get_folder_or_404(db, folder_id)
    if not _user_can_access_folder(folder, user.id):
        raise HTTPException(403, "You do not have access to this folder")

    await _get_profile_or_404(db, body.profile_id)

    membership = FolderMembership(
        id=new_uuid(),
        folder_id=folder_id,
        freelancer_profile_id=body.profile_id,
    )
    db.add(membership)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()  # duplicate — already a member, that's fine

    return await _folder_to_response(db, folder)


@router.delete("/talent/folders/{folder_id}/members/{profile_id}", status_code=204)
async def remove_folder_member(
    folder_id: str,
    profile_id: str,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    folder = await _get_folder_or_404(db, folder_id)
    if not _user_can_access_folder(folder, user.id):
        raise HTTPException(403, "You do not have access to this folder")

    membership = (
        await db.execute(
            sa.select(FolderMembership).where(
                FolderMembership.folder_id == folder_id,
                FolderMembership.freelancer_profile_id == profile_id,
            )
        )
    ).scalar_one_or_none()

    if membership:
        await db.delete(membership)
        await db.flush()


# ---------------------------------------------------------------------------
# Notes (full CRUD, human-authored only — SYSTEM notes excluded)
# ---------------------------------------------------------------------------

_HUMAN_NOTE_TYPES = {t.value for t in NoteType} - {NoteType.SYSTEM.value}


@router.get(
    "/talent/profiles/{profile_id}/notes",
    response_model=list[ProfileNoteResponse],
)
async def list_talent_notes(
    profile_id: str,
    _user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)
    stmt = (
        sa.select(ProfileNote)
        .where(
            ProfileNote.freelancer_profile_id == profile_id,
            ProfileNote.note_type != NoteType.SYSTEM.value,
        )
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
    "/talent/profiles/{profile_id}/notes",
    response_model=ProfileNoteResponse,
    status_code=201,
)
async def create_talent_note(
    profile_id: str,
    body: ProfileNoteCreateRequest,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)

    if body.note_type not in _HUMAN_NOTE_TYPES:
        raise HTTPException(
            422,
            f"Invalid note_type '{body.note_type}'. Valid values: {sorted(_HUMAN_NOTE_TYPES)}",
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


@router.put(
    "/talent/profiles/{profile_id}/notes/{note_id}",
    response_model=ProfileNoteResponse,
)
async def update_talent_note(
    profile_id: str,
    note_id: str,
    body: NoteUpdateRequest,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)

    note = await db.get(ProfileNote, note_id)
    if not note or note.freelancer_profile_id != profile_id:
        raise HTTPException(404, "Note not found")
    if note.author_user_id != user.id:
        raise HTTPException(403, "Only the note author can edit it")

    update_data = body.model_dump(exclude_unset=True)
    if "note_type" in update_data and update_data["note_type"] not in _HUMAN_NOTE_TYPES:
        raise HTTPException(
            422,
            f"Invalid note_type. Valid values: {sorted(_HUMAN_NOTE_TYPES)}",
        )
    for field, value in update_data.items():
        setattr(note, field, value)

    await db.flush()
    await db.refresh(note)

    return ProfileNoteResponse(
        id=note.id,
        note_type=note.note_type,
        body=note.body,
        author_user_id=note.author_user_id,
        created_at=note.created_at,
    )


@router.delete(
    "/talent/profiles/{profile_id}/notes/{note_id}",
    status_code=204,
)
async def delete_talent_note(
    profile_id: str,
    note_id: str,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)

    note = await db.get(ProfileNote, note_id)
    if not note or note.freelancer_profile_id != profile_id:
        raise HTTPException(404, "Note not found")
    if note.author_user_id != user.id:
        raise HTTPException(403, "Only the note author can delete it")

    await db.delete(note)
    await db.flush()


# ---------------------------------------------------------------------------
# Feedback entries
# ---------------------------------------------------------------------------


@router.get(
    "/talent/profiles/{profile_id}/feedback",
    response_model=list[FeedbackEntryResponse],
)
async def list_feedback(
    profile_id: str,
    _user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)
    stmt = (
        sa.select(FeedbackEntry)
        .where(FeedbackEntry.freelancer_profile_id == profile_id)
        .order_by(FeedbackEntry.created_at.desc())
    )
    entries = list((await db.execute(stmt)).scalars().all())
    return [
        FeedbackEntryResponse(
            id=e.id,
            author_user_id=e.author_user_id,
            body=e.body,
            project_context=e.project_context,
            created_at=e.created_at,
        )
        for e in entries
    ]


@router.post(
    "/talent/profiles/{profile_id}/feedback",
    response_model=FeedbackEntryResponse,
    status_code=201,
)
async def create_feedback(
    profile_id: str,
    body: FeedbackEntryCreateRequest,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    await _get_profile_or_404(db, profile_id)

    entry = FeedbackEntry(
        id=new_uuid(),
        freelancer_profile_id=profile_id,
        author_user_id=user.id,
        body=body.body,
        project_context=body.project_context,
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)

    return FeedbackEntryResponse(
        id=entry.id,
        author_user_id=entry.author_user_id,
        body=entry.body,
        project_context=entry.project_context,
        created_at=entry.created_at,
    )


# ---------------------------------------------------------------------------
# Internal freelancer search
# ---------------------------------------------------------------------------


@router.get("/freelancers", response_model=PaginatedResponse)
async def search_internal_freelancers(
    q: str | None = None,
    status: str | None = None,  # comma-separated
    audience: list[str] = Query(default=[]),
    style: list[str] = Query(default=[]),
    genre: list[str] = Query(default=[]),
    location: str | None = None,
    uses_ai: bool | None = None,
    has_agent: bool | None = None,
    worked_with_prh: bool | None = None,
    employee_of_prh: bool | None = None,
    folder_id: str | None = None,
    is_favorite: bool | None = None,
    sort: str = "newest",
    page: int = 1,
    page_size: int = 24,
    user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    status_list = [s.strip() for s in status.split(",") if s.strip()] if status else None

    profiles, total = await search_freelancers_internal(
        db,
        user.id,
        q=q,
        status=status_list,
        audience=audience or None,
        style=style or None,
        genre=genre or None,
        location=location,
        uses_ai=uses_ai,
        has_agent=has_agent,
        worked_with_prh=worked_with_prh,
        employee_of_prh=employee_of_prh,
        folder_id=folder_id,
        is_favorite=is_favorite,
        sort=sort,
        page=page,
        page_size=page_size,
    )

    user_favorites = await _load_user_favorites(db, user.id)
    profile_ids = [p.id for p in profiles]
    folder_map = await _load_user_folder_map(db, user.id, profile_ids)

    items = [
        await _build_card(db, p, user_favorites, folder_map, storage)
        for p in profiles
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/freelancers/{profile_id}", response_model=FreelancerInternalResponse)
async def get_internal_freelancer(
    profile_id: str,
    _user: AuthUser = Depends(require_roles(*_INTERNAL_ROLES)),
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
):
    """Return full internal profile — reuses the same builder from the review router."""
    from app.routers.internal.review import _build_internal_response

    profile = await _get_profile_or_404(db, profile_id)
    return await _build_internal_response(db, profile, storage)
