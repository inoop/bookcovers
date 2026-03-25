"""profile: add avatar_asset_id

Revision ID: c3d4e5f6a7b8
Revises: a1b2c3d4e5f6
Create Date: 2026-03-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("freelancer_profiles") as batch_op:
        batch_op.add_column(
            sa.Column("avatar_asset_id", sa.String(36), nullable=True)
        )


def downgrade() -> None:
    with op.batch_alter_table("freelancer_profiles") as batch_op:
        batch_op.drop_column("avatar_asset_id")
