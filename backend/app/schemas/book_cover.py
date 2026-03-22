from __future__ import annotations

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
