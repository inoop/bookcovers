# Import all models so Alembic and SQLAlchemy can discover them
from app.models.book_cover import BookCover, BookCoverContributor  # noqa: F401
from app.models.collaboration import Favorite, Folder, FolderMembership  # noqa: F401
from app.models.creative_brief import CreativeBrief  # noqa: F401
from app.models.freelancer_profile import FreelancerProfile  # noqa: F401
from app.models.lead import EmailSubscription, Inquiry  # noqa: F401
from app.models.legal import LegalContactLink  # noqa: F401
from app.models.media import MediaAsset  # noqa: F401
from app.models.notes import FeedbackEntry, ProfileNote  # noqa: F401
from app.models.orders import BriefOrder, ConciergeOrder  # noqa: F401
from app.models.portfolio_asset import PortfolioAsset  # noqa: F401
from app.models.taxonomy import TaxonomyTerm  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.content import ResourceArticle  # noqa: F401
from app.models.concierge import ConciergePackage  # noqa: F401
from app.models.settings import AppSetting  # noqa: F401
