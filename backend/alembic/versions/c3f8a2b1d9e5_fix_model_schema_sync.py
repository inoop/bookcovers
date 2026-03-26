"""Fix model/schema sync: avatar_asset_id, portfolio_asset FK, and missing tables

Revision ID: c3f8a2b1d9e5
Revises: a1b2c3d4e5f6
Create Date: 2026-03-25 00:00:00.000000

Fixes three model-migration mismatches:
1. freelancer_profiles was missing avatar_asset_id column
2. portfolio_assets had user_id (from a1b2c3d4e5f6) but model expects freelancer_profile_id
3. app_settings, resource_articles, concierge_packages tables were never created by migrations
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


revision: str = "c3f8a2b1d9e5"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(bind, table_name: str) -> bool:
    result = bind.execute(
        text("SELECT to_regclass('public.' || :t)"),
        {"t": table_name},
    )
    return result.scalar() is not None


def _column_exists(bind, table_name: str, column_name: str) -> bool:
    result = bind.execute(
        text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_schema = 'public' AND table_name = :t AND column_name = :c"
        ),
        {"t": table_name, "c": column_name},
    )
    return result.fetchone() is not None


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Revert a1b2c3d4e5f6: replace user_id with freelancer_profile_id in portfolio_assets
    if _column_exists(bind, "portfolio_assets", "user_id"):
        op.drop_column("portfolio_assets", "user_id")
    if not _column_exists(bind, "portfolio_assets", "freelancer_profile_id"):
        op.add_column(
            "portfolio_assets",
            sa.Column(
                "freelancer_profile_id",
                sa.String(36),
                sa.ForeignKey("freelancer_profiles.id"),
                nullable=True,
            ),
        )

    # 3. Create app_settings table
    if not _table_exists(bind, "app_settings"):
        op.create_table(
            "app_settings",
            sa.Column("key", sa.String(100), nullable=False),
            sa.Column("value", sa.Text(), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column(
                "updated_at",
                sa.DateTime(),
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("key"),
        )

    # 4. Create resource_articles table
    if not _table_exists(bind, "resource_articles"):
        op.create_table(
            "resource_articles",
            sa.Column("id", sa.String(36), nullable=False),
            sa.Column("title", sa.String(500), nullable=False),
            sa.Column("slug", sa.String(255), nullable=True),
            sa.Column("summary", sa.Text(), nullable=True),
            sa.Column("body", sa.Text(), nullable=True),
            sa.Column("category", sa.String(100), nullable=True),
            sa.Column("tags", sa.JSON(), nullable=True),
            sa.Column("is_published", sa.Boolean(), nullable=False),
            sa.Column("author_user_id", sa.String(36), nullable=True),
            sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
            sa.ForeignKeyConstraint(["author_user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug"),
        )

    # 5. Create concierge_packages table
    if not _table_exists(bind, "concierge_packages"):
        op.create_table(
            "concierge_packages",
            sa.Column("id", sa.String(36), nullable=False),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("price_cents", sa.Integer(), nullable=False),
            sa.Column("currency", sa.String(3), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade() -> None:
    op.drop_table("concierge_packages")
    op.drop_table("resource_articles")
    op.drop_table("app_settings")

    # Revert portfolio_assets back to user_id
    op.drop_column("portfolio_assets", "freelancer_profile_id")
    op.add_column(
        "portfolio_assets",
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
    )
