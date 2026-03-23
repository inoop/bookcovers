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
    op.drop_constraint(
        "portfolio_assets_freelancer_profile_id_fkey",
        "portfolio_assets",
        type_="foreignkey",
    )
    op.drop_column("portfolio_assets", "freelancer_profile_id")
    op.add_column(
        "portfolio_assets",
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("portfolio_assets", "user_id")
    op.add_column(
        "portfolio_assets",
        sa.Column(
            "freelancer_profile_id",
            sa.String(36),
            sa.ForeignKey("freelancer_profiles.id"),
            nullable=False,
        ),
    )
