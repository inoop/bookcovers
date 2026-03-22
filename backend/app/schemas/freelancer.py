from __future__ import annotations

from pydantic import BaseModel


class WebsiteLink(BaseModel):
    url: str
    label: str | None = None


class PortfolioAssetPublicResponse(BaseModel):
    id: str
    title: str | None = None
    description: str | None = None
    asset_type: str
    sort_order: int
    tags: list[str] | None = None
    media_url: str | None = None

    model_config = {"from_attributes": True}


class FreelancerCardResponse(BaseModel):
    """Card-level fields for directory listing. Never includes internal data."""

    id: str
    slug: str | None = None
    name: str
    pronouns: str | None = None
    summary: str | None = None
    current_locations: list[str] | None = None
    audience_tags: list[str] | None = None
    style_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    image_tags: list[str] | None = None
    profile_statement: str | None = None
    featured: bool = False
    hero_image_url: str | None = None

    model_config = {"from_attributes": True}


class FreelancerPublicDetailResponse(BaseModel):
    """Full public profile detail. Never includes email, agent, PRH details, notes, legal."""

    id: str
    slug: str | None = None
    name: str
    pronouns: str | None = None
    summary: str | None = None
    website_links: list[WebsiteLink] | None = None
    current_locations: list[str] | None = None
    audience_tags: list[str] | None = None
    style_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    image_tags: list[str] | None = None
    uses_ai: bool = False
    profile_statement: str | None = None
    featured: bool = False
    portfolio_assets: list[PortfolioAssetPublicResponse] = []

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int


# --- Freelancer Portal (own profile) schemas ---


class FreelancerProfileCreateRequest(BaseModel):
    name: str
    email: str
    is_self_submission: bool = True
    relation_type: str | None = None


class FreelancerProfileUpdateRequest(BaseModel):
    name: str | None = None
    pronouns: str | None = None
    summary: str | None = None
    email: str | None = None
    website_links: list[WebsiteLink] | None = None
    current_locations: list[str] | None = None
    past_locations: list[str] | None = None
    has_agent: bool | None = None
    agent_details: str | None = None
    worked_with_prh: bool | None = None
    prh_details: str | None = None
    employee_of_prh: bool | None = None
    prh_employee_details: str | None = None
    audience_tags: list[str] | None = None
    style_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    image_tags: list[str] | None = None
    uses_ai: bool | None = None
    ai_details: str | None = None
    lived_experience_statement: str | None = None
    books_excited_about: list[str] | None = None
    profile_statement: str | None = None
    is_self_submission: bool | None = None
    relation_type: str | None = None


class FreelancerOwnProfileResponse(BaseModel):
    """Full profile as seen by the owning freelancer. Includes internal-visible fields."""

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
    portfolio_assets: list[PortfolioAssetPublicResponse] = []

    model_config = {"from_attributes": True}


class PortfolioAssetCreateResponse(BaseModel):
    id: str
    title: str | None = None
    description: str | None = None
    asset_type: str
    sort_order: int
    review_status: str
    visibility: str
    tags: list[str] | None = None
    media_url: str | None = None

    model_config = {"from_attributes": True}


class PortfolioAssetUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    visibility: str | None = None
    tags: list[str] | None = None


class PortfolioReorderItem(BaseModel):
    id: str
    sort_order: int


class PortfolioReorderRequest(BaseModel):
    items: list[PortfolioReorderItem]
