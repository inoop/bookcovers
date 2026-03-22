export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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
