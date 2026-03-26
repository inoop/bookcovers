"""portfolio_asset: move FK from freelancer_profiles to users

Revision ID: a1b2c3d4e5f6
Revises: dba435d9f009
Create Date: 2026-03-23 00:00:00.000000

"""
from typing import Sequence, Union


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "dba435d9f009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass  # no-op: FK refactor was reverted; model keeps freelancer_profile_id


def downgrade() -> None:
    pass
