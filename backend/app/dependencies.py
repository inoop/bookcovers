"""Central re-exports for FastAPI dependency injection."""

from app.database import get_db  # noqa: F401
from app.middleware.rbac import require_roles  # noqa: F401
from app.services.auth import get_current_user, get_optional_user  # noqa: F401
from app.services.storage import get_storage_service  # noqa: F401
