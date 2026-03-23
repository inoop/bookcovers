from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.schemas.freelancer import WebsiteLink


class ReviewSummaryResponse(BaseModel):
    submitted: int
    under_review: int
    changes_requested: int
    approved: int
    rejected: int
    archived: int


class ProfileQueueItem(BaseModel):
    id: str
    name: str
    email: str
    slug: str | None = None
    status: str
    created_at: datetime
    last_reviewed_at: datetime | None = None
    review_owner_id: str | None = None
    audience_tags: list[str] | None = None
    style_tags: list[str] | None = None

    model_config = {"from_attributes": True}


class ProfileNoteResponse(BaseModel):
    id: str
    note_type: str
    body: str
    author_user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileNoteCreateRequest(BaseModel):
    note_type: str = "general"
    body: str


class PortfolioAssetReviewResponse(BaseModel):
    id: str
    title: str | None = None
    description: str | None = None
    asset_type: str
    review_status: str
    visibility: str
    sort_order: int
    tags: list[str] | None = None
    media_url: str | None = None

    model_config = {"from_attributes": True}


class FreelancerInternalResponse(BaseModel):
    """Full profile as seen by a reviewer. Includes all internal fields, notes, and assets."""

    id: str
    slug: str | None = None
    status: str
    name: str
    pronouns: str | None = None
    summary: str | None = None
    email: str
    website_links: list[WebsiteLink] | None = None
    current_locations: list[str] | None = None
    past_locations: list[str] | None = None
    is_self_submission: bool = True
    relation_type: str | None = None
    has_agent: bool = False
    agent_details: str | None = None
    worked_with_prh: bool = False
    prh_details: str | None = None
    employee_of_prh: bool = False
    prh_employee_details: str | None = None
    audience_tags: list[str] | None = None
    style_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    image_tags: list[str] | None = None
    uses_ai: bool = False
    ai_details: str | None = None
    lived_experience_statement: str | None = None
    books_excited_about: list[str] | None = None
    profile_statement: str | None = None
    approved_for_hire: bool = False
    featured: bool = False
    rate_info: dict | None = None
    review_owner_id: str | None = None
    last_reviewed_at: datetime | None = None
    created_at: datetime
    notes: list[ProfileNoteResponse] = []
    portfolio_assets: list[PortfolioAssetReviewResponse] = []

    model_config = {"from_attributes": True}


class ReviewActionRequest(BaseModel):
    action: str  # claim | approve | reject | request_changes | archive | hide
    note: str | None = None


class AssetReviewActionRequest(BaseModel):
    action: str  # approve | reject | hide
