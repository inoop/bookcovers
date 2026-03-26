import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, PortableJSON  # noqa: F401 — re-export


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime,
        server_default=sa.func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )


def new_uuid() -> str:
    return str(uuid.uuid4())
