export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface WorkSampleCard {
  id: string;
  title?: string;
  media_url?: string;
  freelancer_name: string;
  freelancer_slug?: string;
  freelancer_profile_id: string;
  created_at: string;
}

export interface TaxonomyTerm {
  id: string;
  category: string;
  label: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface FreelancerCardResponse {
  id: string;
  slug?: string;
  name: string;
  pronouns?: string;
  summary?: string;
  current_locations?: string[];
  audience_tags?: string[];
  style_tags?: string[];
  genre_tags?: string[];
  image_tags?: string[];
  profile_statement?: string;
  featured: boolean;
  hero_image_url?: string;
}

export interface PortfolioAssetResponse {
  id: string;
  title?: string;
  description?: string;
  asset_type: string;
  sort_order: number;
  tags?: string[];
  media_url?: string;
}

export interface FreelancerDetailResponse {
  id: string;
  slug?: string;
  name: string;
  pronouns?: string;
  summary?: string;
  website_links?: { url: string; label?: string }[];
  current_locations?: string[];
  audience_tags?: string[];
  style_tags?: string[];
  genre_tags?: string[];
  image_tags?: string[];
  uses_ai: boolean;
  profile_statement?: string;
  featured: boolean;
  portfolio_assets: PortfolioAssetResponse[];
}

export interface ContributorResponse {
  id: string;
  contributor_name: string;
  contributor_type: string;
  freelancer_profile_id?: string;
  freelancer_name?: string;
  freelancer_slug?: string;
}

export interface BookCoverCardResponse {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  author_name: string;
  publisher?: string;
  imprint?: string;
  audience_tags?: string[];
  genre_tags?: string[];
  visual_tags?: string[];
  primary_image_url?: string;
  contributors: ContributorResponse[];
}

export interface BookCoverDetailResponse extends BookCoverCardResponse {
  publication_date?: string;
  external_book_url?: string;
  related_covers: BookCoverCardResponse[];
}

export interface FreelancerFilters {
  q?: string;
  audience?: string[];
  style?: string[];
  genre?: string[];
  image_tags?: string[];
  location?: string;
  uses_ai?: boolean;
  sort?: string;
  page?: number;
  page_size?: number;
}

export interface CoverFilters {
  q?: string;
  genre?: string[];
  audience?: string[];
  style?: string[];
  contributor?: string;
  imprint?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}

// --- Freelancer Portal (own profile) types ---

export interface ProfileCreateRequest {
  name: string;
  email: string;
  is_self_submission?: boolean;
  relation_type?: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  pronouns?: string;
  summary?: string;
  email?: string;
  website_links?: { url: string; label?: string }[];
  current_locations?: string[];
  past_locations?: string[];
  has_agent?: boolean;
  agent_details?: string;
  worked_with_prh?: boolean;
  prh_details?: string;
  employee_of_prh?: boolean;
  prh_employee_details?: string;
  audience_tags?: string[];
  style_tags?: string[];
  genre_tags?: string[];
  image_tags?: string[];
  uses_ai?: boolean;
  ai_details?: string;
  lived_experience_statement?: string;
  books_excited_about?: string[];
  profile_statement?: string;
  is_self_submission?: boolean;
  relation_type?: string;
}

export interface OwnProfileResponse {
  id: string;
  slug?: string;
  status: string;
  name: string;
  pronouns?: string;
  summary?: string;
  email: string;
  website_links?: { url: string; label?: string }[];
  current_locations?: string[];
  past_locations?: string[];
  is_self_submission: boolean;
  relation_type?: string;
  has_agent: boolean;
  agent_details?: string;
  worked_with_prh: boolean;
  prh_details?: string;
  employee_of_prh: boolean;
  prh_employee_details?: string;
  audience_tags?: string[];
  style_tags?: string[];
  genre_tags?: string[];
  image_tags?: string[];
  uses_ai: boolean;
  ai_details?: string;
  lived_experience_statement?: string;
  books_excited_about?: string[];
  profile_statement?: string;
  approved_for_hire: boolean;
  portfolio_assets: PortfolioAssetResponse[];
}

export interface PortfolioUploadResponse {
  id: string;
  title?: string;
  description?: string;
  asset_type: string;
  sort_order: number;
  review_status: string;
  visibility: string;
  tags?: string[];
  media_url?: string;
}

export interface PortfolioAssetUpdateRequest {
  title?: string;
  description?: string;
  visibility?: string;
  tags?: string[];
}

// --- Internal review types ---

export interface ReviewSummary {
  submitted: number;
  under_review: number;
  changes_requested: number;
  approved: number;
  rejected: number;
  archived: number;
}

export interface ProfileQueueItem {
  id: string;
  name: string;
  email: string;
  slug?: string;
  status: string;
  created_at: string;
  last_reviewed_at?: string;
  review_owner_id?: string;
  audience_tags?: string[];
  style_tags?: string[];
}

export interface ProfileNote {
  id: string;
  note_type: string;
  body: string;
  author_user_id: string;
  created_at: string;
}

export interface PortfolioAssetReviewItem {
  id: string;
  title?: string;
  description?: string;
  asset_type: string;
  review_status: string;
  visibility: string;
  sort_order: number;
  tags?: string[];
  media_url?: string;
}

export interface FreelancerInternalDetail {
  id: string;
  slug?: string;
  status: string;
  name: string;
  pronouns?: string;
  summary?: string;
  email: string;
  website_links?: { url: string; label?: string }[];
  current_locations?: string[];
  past_locations?: string[];
  is_self_submission: boolean;
  relation_type?: string;
  has_agent: boolean;
  agent_details?: string;
  worked_with_prh: boolean;
  prh_details?: string;
  employee_of_prh: boolean;
  prh_employee_details?: string;
  audience_tags?: string[];
  style_tags?: string[];
  genre_tags?: string[];
  image_tags?: string[];
  uses_ai: boolean;
  ai_details?: string;
  lived_experience_statement?: string;
  books_excited_about?: string[];
  profile_statement?: string;
  approved_for_hire: boolean;
  featured: boolean;
  rate_info?: Record<string, unknown>;
  review_owner_id?: string;
  last_reviewed_at?: string;
  created_at: string;
  notes: ProfileNote[];
  portfolio_assets: PortfolioAssetReviewItem[];
}

export interface ReviewAction {
  action: string;
  note?: string;
}

export interface ReviewQueueFilters {
  status?: string;
  page?: number;
  page_size?: number;
}

// --- Internal talent curation types ---

export interface FavoriteToggleResponse {
  profile_id: string;
  is_favorite: boolean;
}

export interface InternalFreelancerCard {
  id: string;
  slug?: string;
  name: string;
  pronouns?: string;
  summary?: string;
  status: string;
  approved_for_hire: boolean;
  current_locations?: string[];
  audience_tags?: string[];
  style_tags?: string[];
  genre_tags?: string[];
  has_agent: boolean;
  worked_with_prh: boolean;
  uses_ai: boolean;
  is_favorite: boolean;
  folder_ids: string[];
  hero_image_url?: string;
}

export interface FolderResponse {
  id: string;
  owner_user_id: string;
  name: string;
  privacy: string;  // private | shared_users | shared_team
  description?: string;
  shared_with?: string[];
  created_at: string;
  member_count: number;
}

export interface FolderDetailResponse extends FolderResponse {
  members: InternalFreelancerCard[];
}

export interface FolderCreateRequest {
  name: string;
  privacy?: string;
  description?: string;
  shared_with?: string[];
}

export interface FolderUpdateRequest {
  name?: string;
  privacy?: string;
  description?: string;
  shared_with?: string[];
}

export interface FeedbackEntry {
  id: string;
  author_user_id: string;
  body: string;
  project_context?: string;
  created_at: string;
}

export interface FeedbackEntryCreateRequest {
  body: string;
  project_context?: string;
}

export interface NoteUpdateRequest {
  note_type?: string;
  body?: string;
}

// --- Admin types ---

export interface TaxonomyTermAdmin {
  id: string;
  category: string;
  label: string;
  internal_label?: string;
  slug?: string;
  sort_order: number;
  is_active: boolean;
  aliases?: string[];
}

export interface TaxonomyTermCreateRequest {
  category: string;
  label: string;
  internal_label?: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
  aliases?: string[];
}

export interface TaxonomyTermUpdateRequest {
  label?: string;
  internal_label?: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
  aliases?: string[];
}

export interface CoverAdminResponse {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  author_name: string;
  publisher?: string;
  imprint?: string;
  publication_date?: string;
  audience_tags?: string[];
  genre_tags?: string[];
  visual_tags?: string[];
  primary_image_asset_id: string;
  primary_image_url?: string;
  external_book_url?: string;
  visibility: string;
  contributors: ContributorResponse[];
  created_at: string;
  updated_at: string;
}

export interface CoverCreateRequest {
  title: string;
  author_name: string;
  subtitle?: string;
  publisher?: string;
  imprint?: string;
  publication_date?: string;
  audience_tags?: string[];
  genre_tags?: string[];
  visual_tags?: string[];
  external_book_url?: string;
  primary_image_asset_id: string;
  visibility?: string;
}

export interface CoverUpdateRequest {
  title?: string;
  author_name?: string;
  subtitle?: string;
  publisher?: string;
  imprint?: string;
  publication_date?: string;
  audience_tags?: string[];
  genre_tags?: string[];
  visual_tags?: string[];
  external_book_url?: string;
  primary_image_asset_id?: string;
  visibility?: string;
}

export interface ContributorCreateRequest {
  contributor_name: string;
  contributor_type?: string;
  freelancer_profile_id?: string;
}

export interface UserAdminResponse {
  id: string;
  external_id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface BriefOrderAdminResponse {
  id: string;
  creative_brief_id: string;
  amount: number;
  currency: string;
  payment_provider?: string;
  payment_status: string;
  refund_status: string;
  created_at: string;
}

export interface ConciergeOrderAdminResponse {
  id: string;
  creative_brief_id?: string;
  service_name: string;
  amount: number;
  currency: string;
  payment_provider?: string;
  payment_status: string;
  refund_status: string;
  created_at: string;
}

export interface InquiryAdminResponse {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  source_page?: string;
  created_at: string;
}

export interface EmailSubscriptionAdminResponse {
  id: string;
  email: string;
  is_confirmed: boolean;
  subscription_type: string;
  created_at: string;
}

export interface ArticleResponse {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  body?: string;
  category?: string;
  tags?: string[];
  is_published: boolean;
  author_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleCreateRequest {
  title: string;
  slug?: string;
  summary?: string;
  body?: string;
  category?: string;
  tags?: string[];
  is_published?: boolean;
}

export interface ArticleUpdateRequest {
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  category?: string;
  tags?: string[];
  is_published?: boolean;
}

export interface ConciergePackageResponse {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConciergePackageCreateRequest {
  name: string;
  description?: string;
  price_cents: number;
  currency?: string;
  is_active?: boolean;
}

export interface ConciergePackageUpdateRequest {
  name?: string;
  description?: string;
  price_cents?: number;
  currency?: string;
  is_active?: boolean;
}

export interface AppSettingResponse {
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

export interface InternalFreelancerFilters {
  q?: string;
  status?: string;        // comma-separated e.g. "approved,submitted"
  audience?: string[];
  style?: string[];
  genre?: string[];
  location?: string;
  uses_ai?: boolean;
  has_agent?: boolean;
  worked_with_prh?: boolean;
  employee_of_prh?: boolean;
  folder_id?: string;
  is_favorite?: boolean;
  sort?: string;
  page?: number;
  page_size?: number;
}
