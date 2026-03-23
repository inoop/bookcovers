"""portfolio_asset: move FK from freelancer_profiles to users

Revision ID: a1b2c3d4e5f6
Revises: dba435d9f009
Create Date: 2026-03-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "dba435d9f009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add user_id as nullable first so we can backfill
    op.add_column(
        "portfolio_assets",
        sa.Column("user_id", sa.String(36), nullable=True),
    )

    # Backfill from the joined profile
    op.execute(
        """
        UPDATE portfolio_assets
        SET user_id = (
            SELECT fp.user_id
            FROM freelancer_profiles fp
            WHERE fp.id = portfolio_assets.freelancer_profile_id
        )
        """
    )

    # Make non-nullable now that data is populated
    op.alter_column("portfolio_assets", "user_id", nullable=False)

    # Drop old FK constraint and column
    op.drop_constraint(
        "portfolio_assets_freelancer_profile_id_fkey",
        "portfolio_assets",
        type_="foreignkey",
    )
    op.drop_column("portfolio_assets", "freelancer_profile_id")

    # Add new FK
    op.create_foreign_key(
        "portfolio_assets_user_id_fkey",
        "portfolio_assets",
        "users",
        ["user_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "portfolio_assets_user_id_fkey", "portfolio_assets", type_="foreignkey"
    )

    op.add_column(
        "portfolio_assets",
        sa.Column("freelancer_profile_id", sa.String(36), nullable=True),
    )

    op.execute(
        """
        UPDATE portfolio_assets
        SET freelancer_profile_id = (
            SELECT fp.id
            FROM freelancer_profiles fp
            WHERE fp.user_id = portfolio_assets.user_id
        )
        """
    )

    op.alter_column("portfolio_assets", "freelancer_profile_id", nullable=False)

    op.drop_column("portfolio_assets", "user_id")

    op.create_foreign_key(
        "portfolio_assets_freelancer_profile_id_fkey",
        "portfolio_assets",
        "freelancer_profiles",
        ["freelancer_profile_id"],
        ["id"],
    )
