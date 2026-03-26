from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class FavoriteToggleResponse(BaseModel):
    profile_id: str
    is_favorite: bool


class FolderCreateRequest(BaseModel):
    name: str
    privacy: str = "private"  # private | shared_users | shared_team
    description: str | None = None
    shared_with: list[str] | None = None  # user IDs for shared_users privacy


class FolderUpdateRequest(BaseModel):
    name: str | None = None
    privacy: str | None = None
    description: str | None = None
    shared_with: list[str] | None = None


class FolderMemberRequest(BaseModel):
    profile_id: str


class NoteUpdateRequest(BaseModel):
    note_type: str | None = None
    body: str | None = None


class FeedbackEntryCreateRequest(BaseModel):
    body: str
    project_context: str | None = None


class FeedbackEntryResponse(BaseModel):
    id: str
    author_user_id: str
    body: str
    project_context: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class InternalFreelancerCard(BaseModel):
    """Compact internal card — includes status and curation metadata."""

    id: str
    slug: str | None = None
    name: str
    pronouns: str | None = None
    summary: str | None = None
    status: str
    approved_for_hire: bool = False
    current_locations: list[str] | None = None
    audience_tags: list[str] | None = None
    style_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    has_agent: bool = False
    worked_with_prh: bool = False
    uses_ai: bool = False
    is_favorite: bool = False       # computed for the requesting user
    folder_ids: list[str] = []      # folder IDs (accessible to user) containing this profile
    hero_image_url: str | None = None

    model_config = {"from_attributes": True}


class FolderResponse(BaseModel):
    id: str
    owner_user_id: str
    name: str
    privacy: str
    description: str | None = None
    shared_with: list[str] | None = None
    created_at: datetime
    member_count: int = 0

    model_config = {"from_attributes": True}


class FolderDetailResponse(FolderResponse):
    members: list[InternalFreelancerCard] = []


class WorkSampleCard(BaseModel):
    id: str
    title: str | None = None
    media_url: str | None = None
    freelancer_name: str
    freelancer_slug: str | None = None
    freelancer_profile_id: str
    created_at: datetime

    model_config = {"from_attributes": True}
