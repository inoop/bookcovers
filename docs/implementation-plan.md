# Implementation Plan: Internal Book-Cover Marketplace

## Tech Stack

| Layer | Local Dev | Cloud (AWS) |
|-------|-----------|-------------|
| Backend | Python / FastAPI / Uvicorn | Same, on ECS Fargate or Lambda |
| Database | SQLite3 (via aiosqlite) | PostgreSQL on RDS (via asyncpg) |
| ORM | SQLAlchemy 2.0 async + Alembic | Same |
| Auth | No auth (dev user injection) | AWS Cognito (JWT validation) |
| File Storage | Local filesystem (`./uploads/`) | S3 + CloudFront |
| Frontend | React 18 + TypeScript + Vite + MUI | Same, served via CloudFront + S3 |
| Email | Console logging | SES or SendGrid |

A single `ENVIRONMENT` config flag (`local` | `staging` | `production`) drives all switching.

---

## Project Structure

```
jobboard/
├── docs/
│   ├── functional-spec.md
│   ├── style-guide.md
│   └── implementation-plan.md
├── backend/
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── alembic/versions/
│   ├── app/
│   │   ├── main.py                  # FastAPI app factory
│   │   ├── config.py                # pydantic-settings, env switching
│   │   ├── database.py              # Async engine/session (SQLite vs PG)
│   │   ├── dependencies.py          # DI for auth, storage, DB session
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── freelancer_profile.py
│   │   │   ├── portfolio_asset.py
│   │   │   ├── book_cover.py
│   │   │   ├── creative_brief.py
│   │   │   ├── taxonomy.py
│   │   │   ├── collaboration.py     # Folder, FolderMembership, Favorite
│   │   │   ├── notes.py             # ProfileNote, FeedbackEntry
│   │   │   ├── legal.py             # LegalContactLink
│   │   │   ├── media.py             # MediaAsset
│   │   │   ├── lead.py              # Inquiry, EmailSubscription
│   │   │   └── orders.py            # BriefOrder, ConciergeOrder
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── public/              # Unauthenticated read paths
│   │   │   ├── internal/            # Hiring user / reviewer endpoints
│   │   │   ├── admin/               # Admin-only endpoints
│   │   │   └── freelancer/          # Freelancer self-service endpoints
│   │   ├── services/
│   │   │   ├── auth.py              # Auth abstraction (none vs Cognito)
│   │   │   ├── storage.py           # File storage (local vs S3)
│   │   │   ├── search.py            # Query builder for filtering
│   │   │   ├── moderation.py        # Profile/brief state machine
│   │   │   └── notifications.py     # Email abstraction
│   │   └── middleware/
│   │       └── rbac.py              # Role-based access control
│   └── tests/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── theme/
│       │   ├── tokens.ts            # Design tokens from style guide
│       │   ├── theme.ts             # MUI createTheme with overrides
│       │   └── fonts.ts             # @font-face declarations
│       ├── api/
│       │   ├── client.ts            # Axios instance + auth injection
│       │   ├── types.ts             # API response types
│       │   └── hooks/               # React Query hooks per domain
│       ├── layouts/
│       │   ├── WebsiteLayout.tsx     # Public shell (header/footer)
│       │   ├── AppLayout.tsx         # Internal app shell (sidebar)
│       │   └── FreelancerLayout.tsx  # Freelancer portal shell
│       ├── pages/
│       │   ├── public/
│       │   ├── internal/
│       │   ├── admin/
│       │   └── freelancer/
│       ├── components/
│       │   ├── shared/
│       │   └── forms/
│       └── hooks/
└── infrastructure/                   # Terraform or CDK (Phase 8)
```

---

## Phase 1: Foundation

**Goal:** Running backend and frontend with zero cloud dependencies locally.

### Tasks

- [ ] **1.1 Backend scaffolding** — Initialize `backend/` with `pyproject.toml`, install FastAPI, SQLAlchemy, Alembic, Uvicorn, pydantic-settings, aiosqlite, asyncpg, boto3, python-multipart
- [ ] **1.2 Config system** — `app/config.py` using pydantic-settings with `ENVIRONMENT` enum driving `DATABASE_URL`, `AUTH_PROVIDER`, `STORAGE_BACKEND`, and optional cloud-specific vars (S3 bucket, Cognito pool ID)
- [ ] **1.3 Database layer** — `app/database.py` with async engine factory and session maker; custom `PortableArray` SQLAlchemy type that uses JSONB on PostgreSQL and JSON-as-text on SQLite
- [ ] **1.4 Auth abstraction** — `services/auth.py` with protocol + two implementations: `LocalAuthService` (dev user via header injection) and `CognitoAuthService` (JWT validation against JWKS). RBAC dependency factory `require_roles(*roles)`
- [ ] **1.5 File storage abstraction** — `services/storage.py` with protocol + `LocalStorageService` (writes to `./uploads/`, serves via static mount) and `S3StorageService` (upload to S3, presigned/CloudFront URLs)
- [ ] **1.6 Core ORM models** — All 19 entities as SQLAlchemy 2.0 declarative models with UUID PKs, audit timestamps, enum status fields. Generate initial Alembic migration
- [ ] **1.7 FastAPI app factory** — `app/main.py` with lifespan handler, CORS middleware, router mounts, and health check endpoint
- [ ] **1.8 Frontend scaffolding** — Vite + React + TypeScript project; install MUI, React Router, TanStack Query, Axios
- [ ] **1.9 MUI theme** — Implement full theme from style guide: palette, typography (Shift/Fort/Futura stacks), spacing, shape, and component overrides for all 22 MUI targets listed in style-guide.md
- [ ] **1.10 Layout shells** — `WebsiteLayout` (public header/footer), `AppLayout` (top bar + side nav), `FreelancerLayout` (simplified portal shell)
- [ ] **1.11 API client** — Axios instance with base URL from env, auth token injection, React Query provider setup

---

## Phase 2: Public Read Paths (Freelancer Directory + Cover Archive)

**Goal:** End-to-end browsing of freelancers and book covers.

### Tasks

- [ ] **2.1 Taxonomy API + seeding** — Admin CRUD for `TaxonomyTerm`; seed initial data (audience types, styles, genres, image tags)
- [ ] **2.2 Freelancer listing API** — `GET /api/public/freelancers` with pagination, multi-field filtering (audience, style, genre, tags, location, AI use), keyword search, sort options. Only approved + approved_for_hire profiles
- [ ] **2.3 Freelancer detail API** — `GET /api/public/freelancers/{id}` with public-only fields and approved portfolio assets
- [ ] **2.4 Book cover listing API** — `GET /api/public/covers` with pagination, filters (genre, audience, style, contributor, imprint), sort
- [ ] **2.5 Book cover detail API** — `GET /api/public/covers/{id}` with contributor credits linking to freelancer profiles, related covers
- [ ] **2.6 Search service** — `services/search.py` query builder supporting faceted filtering, keyword search, sort; abstracted for future OpenSearch migration
- [ ] **2.7 Pydantic response schemas** — Separate `FreelancerPublicResponse`, `FreelancerCardResponse`, `BookCoverResponse` etc. enforcing visibility rules (never expose email, agent info, internal notes)
- [ ] **2.8 Freelancer directory page** — Filter rail (multi-select chips per taxonomy), result grid with profile cards, keyword search bar, sort dropdown, URL query param sync, pagination
- [ ] **2.9 Freelancer profile page** — Hero band (name, pronouns, classifications), portfolio gallery with lightbox, summary, links, location, inquiry CTA
- [ ] **2.10 Cover archive page** — Filter/grid pattern matching directory, cover cards with image/title/author/attribution
- [ ] **2.11 Cover detail page** — Full image, book metadata, contributor credits linking to profiles, related covers

---

## Phase 3: Freelancer Portal (Profile Creation + Portfolio Upload)

**Goal:** Freelancers can create profiles, upload samples, and submit for review.

### Tasks

- [ ] **3.1 Freelancer auth flow** — Cognito sign-up/sign-in integration (cloud) or dev user auto-creation (local); redirect to profile creation on first login
- [ ] **3.2 Profile CRUD API** — Create draft, update, submit for review. State machine enforcement (only draft/changes_requested can be edited). Required field validation on submit
- [ ] **3.3 Portfolio upload API** — Upload files (JPG, PNG, PDF with size limits), create MediaAsset + PortfolioAsset records, update metadata, reorder, soft delete
- [ ] **3.4 Profile editor UI** — Multi-section form (About Me, Artistic Classifications, Self-Identification) with taxonomy autocomplete, location typeahead, portfolio drag-and-drop upload zone, status indicator, submit with confirmation

---

## Phase 4: Moderation and Review

**Goal:** Reviewers can vet freelancer profiles and portfolio assets.

### Tasks

- [ ] **4.1 Moderation state machine** — `services/moderation.py` with explicit transition map, validation, actor/timestamp logging, audit trail
- [ ] **4.2 Profile review API** — Queue listing (filtered by status), full profile detail (all fields including internal), review actions (approve, reject, request changes, archive, hide)
- [ ] **4.3 Asset review API** — Portfolio assets pending review, approve/reject/hide per asset
- [ ] **4.4 Review dashboard UI** — Summary panels (counts by status), queue table, profile detail drawer with all fields, action bar (Approve/Reject/Request Changes), reviewer notes, audit history timeline

---

## Phase 5: Internal Talent Curation

**Goal:** Internal users can search, favorite, organize, annotate, and link freelancers.

### Tasks

- [ ] **5.1 Favorites API** — Toggle favorite on freelancer profiles, list user's favorites
- [ ] **5.2 Folders API** — CRUD folders with privacy enum (private, shared_users, shared_team), add/remove members, list folder contents
- [ ] **5.3 Notes + feedback API** — Create/read/update/delete notes on profiles with note_type enum, post-project feedback entries
- [ ] **5.4 Legal linking API** — Create/update legal contact link (external URL, system ID, workflow status), view status
- [ ] **5.5 Internal search API** — `GET /api/internal/freelancers` with extended filters (status, agent, prior-PRH-work, employee, rate, legal status, folder membership); returns internal fields
- [ ] **5.6 Internal talent DB UI** — Extended filter rail, card/list toggle, favorite toggle, "add to folder" action, internal profile detail (all fields + notes tab + feedback tab + legal panel + folder membership)
- [ ] **5.7 Folder management UI** — Folder list with privacy badges, folder detail grid, create/edit dialog with sharing controls

---

## Phase 6: Creative Briefs, Orders, and Content

**Goal:** Brief submission workflow, jobs board, concierge, resources, lead capture.

### Tasks

- [ ] **6.1 Brief submission API** — Create/update draft, submit (→ pending_payment), payment flow, reviewer actions (publish, private outreach, request changes, reject)
- [ ] **6.2 Payment abstraction** — `services/payment.py` protocol; stub or Stripe integration. BriefOrder + ConciergeOrder records
- [ ] **6.3 Jobs board API** — List published briefs, brief detail page
- [ ] **6.4 Concierge services** — Admin-managed service catalog, order creation (standalone or attached to brief)
- [ ] **6.5 Resources API** — CRUD for ResourceArticle (admin creates, public reads), categories, tags, related content
- [ ] **6.6 Lead capture API** — Contact/inquiry form submission, newsletter signup. Durable storage, rate limiting, optional CAPTCHA
- [ ] **6.7 Brief submission UI** — Multi-step form with file uploads, distribution mode selection, pricing review, checkout flow
- [ ] **6.8 Jobs board + brief detail UI** — Listing page with filters, detail page with metadata/creative direction/budget/timeline
- [ ] **6.9 Resources UI** — Article index and detail pages, related content
- [ ] **6.10 Lead capture components** — Newsletter signup (reusable in footer + conversion bands), contact form page

---

## Phase 7: Website Shell, Landing Pages, and Notifications

**Goal:** Marketing wrapper, landing page, SEO, and transactional emails.

### Tasks

- [ ] **7.1 Website navigation** — Global header (directory, covers, briefs, resources, freelancer onboarding), global footer (charcoal, links, newsletter, legal)
- [ ] **7.2 Landing page** — Hero, two-pathway split, featured freelancer row, featured cover row, concierge section, resource row, newsletter band
- [ ] **7.3 Featured content API** — `GET /api/public/featured/freelancers` and `/covers` (admin-curated via featured flag)
- [ ] **7.4 SEO and metadata** — React Helmet, clean URLs (`/freelancers/{slug}`), Open Graph tags, JSON-LD structured data
- [ ] **7.5 Notification service** — `services/notifications.py` with email abstraction; console logging (local) vs SES (cloud). Templates for all 11 transactional email types from the spec
- [ ] **7.6 Internal notifications** — New profile/brief awaiting review, payment failure alerts, legal-link sync failure

---

## Phase 8: Admin Console and Deployment

**Goal:** Complete admin tooling and deploy to AWS.

### Tasks

- [ ] **8.1 Taxonomy management UI** — Full CRUD with sort order, aliases, active/inactive toggle
- [ ] **8.2 Cover archive management UI** — Create/edit/hide covers, manage contributors
- [ ] **8.3 Concierge package management UI** — Service catalog CRUD
- [ ] **8.4 Content publishing UI** — Resource/article editor with metadata
- [ ] **8.5 Order and lead management UI** — Payment/order lookup, inquiry and newsletter lead tables
- [ ] **8.6 Settings UI** — Configurable labels, CTAs, featured placements
- [ ] **8.7 User management UI** — Role assignment
- [ ] **8.8 AWS infrastructure** — IaC (Terraform or CDK): RDS, S3, Cognito, ECS Fargate or Lambda, CloudFront, SES
- [ ] **8.9 CI/CD pipeline** — Build, test, deploy automation
- [ ] **8.10 Environment config** — SSM Parameter Store or Secrets Manager for cloud-specific config

---

## Key Architectural Decisions

1. **Environment switching** — Single `ENVIRONMENT` flag in config drives all backend selection (DB, auth, storage). No conditional imports scattered through code; each abstraction has a factory that reads config once.

2. **Portable multi-value fields** — Custom `PortableArray` SQLAlchemy type stores as `JSONB` on PostgreSQL and `JSON` text on SQLite. Used for genres, styles, tags, locations, and similar array fields on FreelancerProfile, BookCover, and CreativeBrief.

3. **Visibility via schema layering** — Separate Pydantic response schemas per audience (`FreelancerPublicResponse`, `FreelancerInternalResponse`, `FreelancerOwnResponse`). Safer than dynamic field filtering; enforced at the serialization boundary.

4. **State machine as a service** — Explicit `{(current_state, action): next_state}` transition map in `services/moderation.py`. Every transition is validated, logged with actor + timestamp, and independently testable.

5. **Search abstraction** — SQL-based filtering initially (ILIKE + array containment). `SearchService` protocol allows future migration to OpenSearch/Elasticsearch without changing routers or frontend.

6. **Auth as a swappable dependency** — `AuthService` protocol with `LocalAuthService` (header-based dev user) and `CognitoAuthService` (JWT/JWKS). Injected via FastAPI `Depends()`. RBAC layer sits on top regardless of auth provider.
