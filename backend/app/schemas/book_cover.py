from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel


class ContributorResponse(BaseModel):
    id: str
    contributor_name: str
    contributor_type: str
    freelancer_profile_id: str | None = None
    freelancer_name: str | None = None
    freelancer_slug: str | None = None

    model_config = {"from_attributes": True}


class BookCoverCardResponse(BaseModel):
    id: str
    slug: str | None = None
    title: str
    subtitle: str | None = None
    author_name: str
    publisher: str | None = None
    imprint: str | None = None
    audience_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    visual_tags: list[str] | None = None
    primary_image_url: str | None = None
    contributors: list[ContributorResponse] = []

    model_config = {"from_attributes": True}


class BookCoverDetailResponse(BaseModel):
    id: str
    slug: str | None = None
    title: str
    subtitle: str | None = None
    author_name: str
    publisher: str | None = None
    imprint: str | None = None
    publication_date: str | None = None
    audience_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    visual_tags: list[str] | None = None
    primary_image_url: str | None = None
    external_book_url: str | None = None
    contributors: list[ContributorResponse] = []
    related_covers: list[BookCoverCardResponse] = []

    model_config = {"from_attributes": True}


class CoverCreateRequest(BaseModel):
    title: str
    author_name: str
    subtitle: str | None = None
    publisher: str | None = None
    imprint: str | None = None
    publication_date: date | None = None
    audience_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    visual_tags: list[str] | None = None
    external_book_url: str | None = None
    primary_image_asset_id: str
    visibility: str = "public"


class CoverUpdateRequest(BaseModel):
    title: str | None = None
    author_name: str | None = None
    subtitle: str | None = None
    publisher: str | None = None
    imprint: str | None = None
    publication_date: date | None = None
    audience_tags: list[str] | None = None
    genre_tags: list[str] | None = None
    visual_tags: list[str] | None = None
    external_book_url: str | None = None
    primary_image_asset_id: str | None = None
    visibility: str | None = None


class ContributorCreateRequest(BaseModel):
    contributor_name: str
    contributor_type: str = "designer"
    freelancer_profile_id: str | None = None


class CoverAdminResponse(BaseModel):
    id: str
    slug: str | None
    title: str
    subtitle: str | None
    author_name: str
    publisher: str | None
    imprint: str | None
    publication_date: date | None
    audience_tags: list[str] | None
    genre_tags: list[str] | None
    visual_tags: list[str] | None
    primary_image_asset_id: str
    primary_image_url: str | None
    external_book_url: str | None
    visibility: str
    contributors: list[ContributorResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
