"""Seed initial taxonomy data and sample records for local development."""
from __future__ import annotations

import asyncio

from app.config import get_settings
from app.database import async_session_factory, Base, engine
from app.models.taxonomy import TaxonomyTerm
from app.models.user import User, UserRole
from app.models.freelancer_profile import FreelancerProfile, ProfileStatus
from app.models.media import MediaAsset, StorageBackend
from app.models.portfolio_asset import PortfolioAsset, AssetType, AssetVisibility, ReviewStatus
from app.models.book_cover import BookCover, BookCoverContributor, CoverVisibility, ContributorType
import app.models  # noqa: F401


TAXONOMY_DATA = {
    "audience": [
        "Adult Fiction", "Adult Nonfiction", "Young Adult", "Middle Grade",
        "Picture Book", "Board Book", "Graphic Novel", "Cover Design", "Map", "Other",
    ],
    "style": [
        "Illustration", "Design", "Photography", "Typography / Hand Lettering",
        "Animation / Motion Graphics", "Graphic Artist", "Colorist",
        "Lettering", "Black and White Line Art", "Other",
    ],
    "genre": [
        "Literary Fiction", "Romance", "Mystery / Thriller", "Science Fiction",
        "Fantasy", "Horror", "Historical Fiction", "Contemporary Fiction",
        "Memoir", "Biography", "History", "Science", "Self-Help",
        "Business", "Cookbook", "Art / Photography", "Poetry", "Religion / Spirituality",
        "Travel", "Humor", "True Crime", "Politics", "Health / Wellness",
    ],
    "image_tag": [
        "Animals", "Editorial", "Portraits", "Vector Art", "Collage",
        "Watercolor", "Digital Painting", "Pencil / Charcoal", "Oil / Acrylic",
        "Mixed Media", "Botanical", "Landscapes", "Architecture", "Abstract",
        "Patterns", "Typography-focused", "Photographic", "Minimalist",
        "Retro / Vintage", "Whimsical", "Dark / Moody",
    ],
    "project_type": [
        "Book Cover", "Full Wrap Cover", "Interior Illustrations",
        "Series Branding", "E-book Cover", "Audiobook Cover", "Other",
    ],
}


def _slug(label: str) -> str:
    return label.lower().replace(" / ", "-").replace(" ", "-").replace(".", "")


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        # Check if already seeded
        from sqlalchemy import select, func

        count = (await db.execute(select(func.count()).select_from(TaxonomyTerm))).scalar_one()
        if count > 0:
            print(f"Taxonomy already seeded ({count} terms). Skipping taxonomy seed.")
        else:
            for category, labels in TAXONOMY_DATA.items():
                for i, label in enumerate(labels):
                    term = TaxonomyTerm(
                        category=category,
                        label=label,
                        slug=_slug(label),
                        sort_order=i,
                        is_active=True,
                    )
                    db.add(term)
            await db.commit()
            print(f"Seeded {sum(len(v) for v in TAXONOMY_DATA.values())} taxonomy terms.")

        # Only seed sample users in local dev
        settings = get_settings()
        if settings.ENVIRONMENT != "local":
            return

        # Seed sample users + profiles for dev
        user_count = (await db.execute(select(func.count()).select_from(User))).scalar_one()
        if user_count > 0:
            print(f"Users already exist ({user_count}). Skipping sample data.")
            return

        # Create dev users
        admin_user = User(
            external_id="dev-admin-001",
            email="admin@localhost",
            display_name="Admin User",
            role=UserRole.ADMIN.value,
        )
        freelancer_user1 = User(
            external_id="dev-freelancer-001",
            email="artist1@example.com",
            display_name="Elena Vasquez",
            role=UserRole.FREELANCER.value,
        )
        freelancer_user2 = User(
            external_id="dev-freelancer-002",
            email="artist2@example.com",
            display_name="Marcus Chen",
            role=UserRole.FREELANCER.value,
        )
        freelancer_user3 = User(
            external_id="dev-freelancer-003",
            email="artist3@example.com",
            display_name="Priya Sharma",
            role=UserRole.FREELANCER.value,
        )
        db.add_all([admin_user, freelancer_user1, freelancer_user2, freelancer_user3])
        await db.flush()

        # Create sample media assets (placeholders)
        media1 = MediaAsset(
            uploaded_by_user_id=freelancer_user1.id,
            filename="portfolio-1.jpg",
            content_type="image/jpeg",
            size_bytes=150000,
            storage_backend=StorageBackend.LOCAL.value,
            storage_key="samples/portfolio-1.jpg",
        )
        media2 = MediaAsset(
            uploaded_by_user_id=freelancer_user2.id,
            filename="portfolio-2.jpg",
            content_type="image/jpeg",
            size_bytes=200000,
            storage_backend=StorageBackend.LOCAL.value,
            storage_key="samples/portfolio-2.jpg",
        )
        media3 = MediaAsset(
            uploaded_by_user_id=freelancer_user3.id,
            filename="portfolio-3.jpg",
            content_type="image/jpeg",
            size_bytes=180000,
            storage_backend=StorageBackend.LOCAL.value,
            storage_key="samples/portfolio-3.jpg",
        )
        cover_media = MediaAsset(
            uploaded_by_user_id=admin_user.id,
            filename="cover-1.jpg",
            content_type="image/jpeg",
            size_bytes=250000,
            storage_backend=StorageBackend.LOCAL.value,
            storage_key="samples/cover-1.jpg",
        )
        db.add_all([media1, media2, media3, cover_media])
        await db.flush()

        # Create freelancer profiles
        profile1 = FreelancerProfile(
            user_id=freelancer_user1.id,
            slug="elena-vasquez",
            name="Elena Vasquez",
            pronouns="she/her",
            email="artist1@example.com",
            summary="Award-winning illustrator specializing in literary fiction and magical realism covers.",
            profile_statement="I bring stories to life through richly textured, emotionally resonant illustrations that honor the author's vision while creating an irresistible shelf presence.",
            current_locations=["New York, NY", "Mexico City, Mexico"],
            audience_tags=["Adult Fiction", "Young Adult"],
            style_tags=["Illustration", "Design"],
            genre_tags=["Literary Fiction", "Fantasy", "Historical Fiction"],
            image_tags=["Portraits", "Watercolor", "Botanical"],
            uses_ai=False,
            is_self_submission=True,
            approved_for_hire=True,
            status=ProfileStatus.APPROVED.value,
            featured=True,
            website_links=[
                {"url": "https://elenavasquez.art", "label": "Portfolio"},
                {"url": "https://instagram.com/elenavasquezart", "label": "Instagram"},
            ],
        )
        profile2 = FreelancerProfile(
            user_id=freelancer_user2.id,
            slug="marcus-chen",
            name="Marcus Chen",
            pronouns="he/him",
            email="artist2@example.com",
            summary="Typographer and book designer with a focus on bold, modern cover designs.",
            profile_statement="I specialize in type-driven cover design that commands attention. Clean lines, unexpected compositions, and respect for the text.",
            current_locations=["San Francisco, CA"],
            audience_tags=["Adult Fiction", "Adult Nonfiction"],
            style_tags=["Design", "Typography / Hand Lettering"],
            genre_tags=["Literary Fiction", "Memoir", "Business"],
            image_tags=["Typography-focused", "Minimalist", "Abstract"],
            uses_ai=False,
            is_self_submission=True,
            approved_for_hire=True,
            status=ProfileStatus.APPROVED.value,
            featured=False,
        )
        profile3 = FreelancerProfile(
            user_id=freelancer_user3.id,
            slug="priya-sharma",
            name="Priya Sharma",
            email="artist3@example.com",
            summary="Children's book illustrator creating vibrant, inclusive worlds.",
            profile_statement="My illustrations celebrate diverse characters and lush environments. I work in digital painting and watercolor.",
            current_locations=["London, UK"],
            audience_tags=["Picture Book", "Middle Grade"],
            style_tags=["Illustration"],
            genre_tags=["Fantasy", "Contemporary Fiction"],
            image_tags=["Whimsical", "Digital Painting", "Landscapes"],
            uses_ai=False,
            is_self_submission=True,
            approved_for_hire=True,
            status=ProfileStatus.APPROVED.value,
            featured=True,
        )
        db.add_all([profile1, profile2, profile3])
        await db.flush()

        # Create portfolio assets
        pa1 = PortfolioAsset(
            user_id=freelancer_user1.id,
            media_asset_id=media1.id,
            title="The Garden of Forgotten Things",
            description="Cover illustration for literary fiction novel",
            asset_type=AssetType.IMAGE.value,
            visibility=AssetVisibility.PUBLIC.value,
            review_status=ReviewStatus.APPROVED.value,
            sort_order=0,
            tags=["watercolor", "botanical", "literary"],
        )
        pa2 = PortfolioAsset(
            user_id=freelancer_user2.id,
            media_asset_id=media2.id,
            title="Zero Sum",
            description="Cover design for business thriller",
            asset_type=AssetType.IMAGE.value,
            visibility=AssetVisibility.PUBLIC.value,
            review_status=ReviewStatus.APPROVED.value,
            sort_order=0,
            tags=["typography", "minimalist"],
        )
        pa3 = PortfolioAsset(
            user_id=freelancer_user3.id,
            media_asset_id=media3.id,
            title="Moonbeam Adventures",
            description="Cover for middle grade fantasy series",
            asset_type=AssetType.IMAGE.value,
            visibility=AssetVisibility.PUBLIC.value,
            review_status=ReviewStatus.APPROVED.value,
            sort_order=0,
            tags=["whimsical", "fantasy", "children"],
        )
        db.add_all([pa1, pa2, pa3])
        await db.flush()

        # Create a book cover
        book_cover = BookCover(
            title="The Garden of Forgotten Things",
            subtitle="A Novel",
            author_name="Isabelle Moreau",
            publisher="Penguin Random House",
            imprint="Viking",
            audience_tags=["Adult Fiction"],
            genre_tags=["Literary Fiction", "Historical Fiction"],
            visual_tags=["Watercolor", "Botanical", "Portraits"],
            primary_image_asset_id=cover_media.id,
            visibility=CoverVisibility.PUBLIC.value,
            slug="garden-of-forgotten-things",
        )
        db.add(book_cover)
        await db.flush()

        contrib = BookCoverContributor(
            book_cover_id=book_cover.id,
            freelancer_profile_id=profile1.id,
            contributor_name="Elena Vasquez",
            contributor_type=ContributorType.ILLUSTRATOR.value,
        )
        db.add(contrib)

        await db.commit()
        print("Seeded 3 sample freelancers, 3 portfolio assets, 1 book cover.")


if __name__ == "__main__":
    asyncio.run(seed())
