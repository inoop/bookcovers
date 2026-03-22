# Internal Book-Cover Marketplace Functional Specification

## Document Purpose

This document specifies a build-ready internal platform that replicates the functional capabilities of ineedabookcover.com while using Penguin Random House’s existing brand, original copy, original information architecture labels where appropriate, and original visual design.

This specification is intended to be detailed enough for engineering, product, design, and operations teams to implement the platform without needing further product decisions.

## Source Basis

This specification combines three inputs:

1. Observed public functionality from ineedabookcover.com.
2. Internal profile-schema work from Artist and Designer Profile Fields.xlsx.
3. Internal database goals and capability requirements from Freelancer Database.pdf.

## Functional-Equivalent Guardrails

The implementation must preserve workflow and capability parity, not expressive duplication.

* Do not copy the source site’s branding, page copy, taxonomy labels, illustration style, page composition, or package names verbatim.
* Use the company’s existing brand system and naming conventions.
* Treat prices, labels, categories, and package names as configurable admin data.
* Preserve the business process:
  * discover talent
  * browse cover work
  * operate an internal freelancer database

## Executive Summary

The target product is a visual-first talent and book-cover marketplace with two tightly related surfaces:

1. A internal-facing discovery platform for authors, editors, marketers, and other hiring users.
2. An internal freelancer database and operations console for maintaining talent records, approvals, notes, folders, 
3. A public-facing site where artists and designers can create a profile that becomes part of a database that is searchable by internal staff when hiring for freelance work. 

The internalproduct must support:
* browsing and filtering freelancer/designer profiles
* browsing and filtering completed book covers
* viewing rich freelancer profile pages
* capturing newsletter and inquiry leads
* moderation and approval before public visibility
* talent tagging and search
* notes, feedback, favorites, and private/shared folders
* rate and representation tracking
* prior-company-engagement tracking
* legal-portal linking

The publicproduct must support:
* freelancer profile creation and editing
* Ability to upload multiple work samples
* deletion and archival of profiles 
* Sign up for newsletter

## Product Goals

### Primary Goals

* Reduce friction in finding and evaluating freelance artists, designers, illustrators, photographers, and related specialists.

* Centralize talent data in a searchable visual repository.

* Support hiring workflows for and internal company teams.

* Increase discovery of emerging and underrepresented talent through richer metadata and searchable lived-experience fields.

* 

### Success Criteria

* Users can find relevant freelancers in three or fewer query/refinement steps.

* Only approved freelancers are publicly searchable.

* 

* Internal users can organize talent into personal and shared collections.

* Admin users can moderate submissions and activate/deactivate freelancers without engineering support.

## Roles

| Role | Description | Primary Capabilities |
| :---- | :---- | :---- |
| Anonymous visitor | Any public visitor | browse marketing pages, submit inquiries, start brief submission |
| Hiring user | Author, editor, marketer, or internal business stakeholder | browse talent, favorite, save to folders, add notes |
| Freelancer | Artist, designer, illustrator, photographer, lettering artist, animator, or adjacent creative | create/edit profile, upload samples, disclose metadata, submit for approval |
| Reviewer | Editorial or talent-ops staff | review profiles, approve/reject/hide assets, leave internal notes,  |
|  |  |  |
| Admin | System operator | manage taxonomies, settings, content, permissions, deletion/archive workflows |

## Core User Journeys

### Private Discovery

1. User lands on the site.

2. User browses freelancers or book covers.

3. User filters by medium, audience, genre, style, location, tags, or lived-experience criteria where permitted.

4. User opens detail pages to evaluate fit.

5. User either contacts through an inquiry path 

1. 

### Freelancer Onboarding

1. Freelancer creates an account or opens a profile submission flow.

2. Freelancer fills profile fields, uploads samples, and discloses AI use and representation status.

3. Profile is submitted.

4. Reviewer vets the profile andapproves, rejects, or requests changes.

5. Approved profile becomes searchable and eligible for hiring.

### Internal Talent Curation

1. Internal user searches the talent database.

2. User reviews portfolios and metadata.

3. User saves records to favorites or folders.

4. User adds internal notes or feedback.

5. User links freelancer/contact records to legal intake or contract workflows.

## Public Product Areas

## 1\. Marketing and Navigation Shell

### Requirements

* Global header with entry points for:

  * freelancers/designers directory

  * book-cover archive

  * 

  * designer or freelancer-focused onboarding content

* Global footer with:

  * informational pages

  * support/contact

  * newsletter capture

  * legal/privacy links

* Homepage or landing pages must clearly funnel users into:

  * browse talent

  * browse covers

  * 

### Acceptance Criteria

* A first-time visitor can reach any top-level product area in one click from the homepage.

* Navigation labels can be changed by admins without code changes.

* Primary calls to action are configurable by page.

## 2\. Freelancer Directory

### Purpose

Provide a searchable and filterable visual directory of approved freelancers.

### Directory Listing Requirements

* Grid or list cards for freelancer profiles.

* Each card should support:

  * display name

  * avatar or representative artwork

  * short summary or profile statement excerpt

  * primary classifications

  * selected genre/style badges

  * location summary

  * optional representation status badge if business-approved

* Sort options:

  * relevance

  * newest approved

  * alphabetical

  * featured/manual ordering

* Filters:

  * audience classification

  * style

  * genre

  * image categories/tags

  * current location

  * past locations

  * AI use

  * representation status

  * prior-company-work flag

  * approved-for-hire

* Search:

  * keyword search over approved searchable fields only

  * typeahead for location and controlled taxonomy fields

  * URL-persisted filter state

### Directory Behavior

* Only profiles with approved\_for\_hire \= true and active public status are listed.

* Hidden, rejected, draft, or archived profiles must not appear publicly.

* Empty states should suggest alternative filters and a brief-submission CTA.

* Search results should remain shareable via query parameters.

### Acceptance Criteria

* User can combine at least five filters without losing result accuracy.

* Search and filter state survive page reload and copy-paste of the URL.

* Non-searchable profile fields are never indexed into public search.

## 3\. Freelancer Profile Page

### Purpose

Provide a rich public detail page for each approved freelancer.

### Public Profile Sections

* Name and pronouns if provided and public.

* Short summary or profile statement.

* Profile hero image or representative portfolio image.

* Classification badges:

  * audience

  * medium/style

  * genre

  * image tags

* Current location summary.

* Website and social links.

* Portfolio gallery.

* Optional additional work samples or resume link if made public.

* AI use disclosure summary if policy requires public visibility.

* Inquiry or project CTA.

### Private/Internal-Only Data

The following must never be public by default:

* email

* agent contact details

* PRH contact/division details

* employee status details

* internal notes

* internal feedback

* approval metadata

* legal-link data

### Acceptance Criteria

* Profile page renders with zero public exposure of admin-only fields.

* Portfolio media supports images and PDFs where policy allows.

* Missing optional fields do not create broken layouts.

## 4\. Book-Cover Archive

### Purpose

Showcase completed cover work as a discovery and trust-building surface.

### Archive Listing Requirements

* Searchable gallery of book covers.

* Card fields:

  * cover image

  * title

  * subtitle if available

  * author

  * freelancer/designer attribution

  * publisher or imprint if available

  * genre/audience metadata

* Filters:

  * genre

  * audience

  * visual style

  * contributor

  * publisher/imprint

  * tags

* Sort options:

  * newest

  * featured

  * alphabetical

  * relevance

### Cover Detail Requirements

* Full-size image or image gallery.

* Book metadata.

* Credits for designer, illustrator, photographer, lettering artist, and related contributors.

* Links to freelancer profiles where applicable.

* Optional book detail link or external retailer link if policy allows.

* Related covers based on shared metadata.

### Acceptance Criteria

* Users can navigate from a cover to all credited freelancer profiles.

* Archive supports at least one contributor type beyond “designer”.

* Cover records can be public even if not tied to an active brief.

## 5\. Creative Brief and Jobs Board

### Purpose

Provide a paid workflow for project owners to submit structured cover briefs and distribute them to qualified freelancers.

### Brief Submission Form Requirements

The form must support:

* project title / book title

* author or client name

* contact email

* project type

* audience category

* genre

* brief summary

* detailed creative direction

* comparable titles or inspiration

* general likes

* general dislikes

* timeline

* budget or budget range

* rights/usage context where relevant

* file uploads

* public-vs-private distribution selection

* optional outreach to all matching designers/freelancers

* optional concierge add-ons

* consent to review terms and publication policy

### Brief Publication Model

* Brief starts in draft.

* Moves to pending\_payment.

* On successful payment, moves to queued\_for\_review.

* Reviewer can:

  * publish

  * return for edits

  * reject

  * convert to private outreach only

* Published brief can appear in a public jobs/brief index.

### Public Brief Page Requirements

* Public brief detail page with:

  * posted date

  * project metadata

  * creative description

  * likes/dislikes

  * budget/timeline

  * attachments or attachment summary

  * application or contact instructions

  * status

### Freelancer-Facing Behavior

* Relevant freelancers may browse active briefs.

* System may send digest or alert emails for newly published briefs.

* Closed or expired briefs remain archived or hidden based on policy.

### Acceptance Criteria

* User cannot publish a brief without successful payment unless admin override is applied.

* Reviewer can convert a public brief into private-only distribution without deleting the record.

* Briefs can accept multiple file attachments with type and size validation.

## 6\. Concierge Services

### Purpose

Offer premium support around freelancer matching or creative brief handling.

### Requirements

* Configurable service catalog with:

  * package name

  * package description

  * price

  * lead time

  * included deliverables

* Upsell entry points from:

  * brief submission flow

  * jobs landing page

  * standalone service page

* Separate order records for concierge purchases.

* Ability to fulfill concierge service independently of public brief publication.

### Acceptance Criteria

* Admin can add, retire, or rename service packages without code changes.

* Concierge purchases can be attached to a brief or created standalone.

## 7\. Resources and Content

### Purpose

Support SEO, education, and demand generation via editorial content.

### Requirements

* Resource/article index page.

* Article detail pages.

* Optional categories and tags.

* Author attribution.

* Newsletter capture module.

* Contextual CTAs to browse talent or post a brief.

* Related-content recommendations.

### Acceptance Criteria

* Editors can publish resource content without engineering involvement.

* Content pages support structured metadata for SEO and social sharing.

## 8\. Contact, Newsletter, and Lead Capture

### Requirements

* Newsletter signup form.

* Contact/inquiry form.

* Optional lead-capture forms on high-intent pages.

* Admin-configurable destination email or CRM integration.

* Spam mitigation.

### Acceptance Criteria

* Every lead form stores a durable internal record even if downstream CRM sync fails.

* Users receive confirmation messaging after submit.

## Internal Product Areas

## 9\. Freelancer Database

### Purpose

Serve as a centralized, visual-first repository of freelancers across art and design disciplines for both public discovery and internal curation.

### Must-Have Capabilities

* user-editable profiles

* portfolios

* optional self-identification questions/fields

* tagging, links, notes, and feedback

* searching, sorting, and filtering

### Nice-to-Have or Planned Capabilities

* personal favorite options

* optional rate information

* track prior PRH work

* track whether artist has an agent and who it is

* privacy settings on folders

### Additional Internal Requirements

* Ability to create groups or folders based on team, project, or favorites.

* Ability to link freelancer/contact records into a legal portal or legal intake workflow.

* Vetting process before active public listing.

* Informational visibility controls for internal-only fields.

* User-requested and admin-driven deletion support.

* International accessibility and localization support as future scope.

## 10\. Moderation and Talent Operations

### Requirements

* Queue of newly submitted or edited freelancer profiles.

* Queue of uploaded portfolio assets pending review if policy requires.

* Review actions:

  * approve

  * reject

  * request changes

  * hide asset

  * archive

* Reviewer notes visible only internally.

* Audit history on state changes.

### Acceptance Criteria

* Every approval or rejection action records actor and timestamp.

* Public visibility updates happen only through explicit approval workflow or admin override.

## 11\. Internal Collaboration Features

### Favorites

* Any authorized internal business user can favorite a freelancer.

* Favorites are private to the user by default.

### Folders

* Users can create folders or groups.

* Folder types:

  * private

  * shared with selected users

  * shared with a team

* Folders can contain freelancer profiles and optionally cover records.

### Notes and Feedback

* Internal users can leave structured or freeform notes on freelancer records.

* Notes can optionally be tagged by context:

  * portfolio quality

  * responsiveness

  * project fit

  * prior experience

  * legal/compliance

* Feedback can be attached after a project concludes.

### Acceptance Criteria

* Notes never appear publicly.

* Shared folders respect membership permissions.

* Removing a freelancer from public view does not delete their membership in internal folders.

## 12\. Legal and Compliance Linking

### Requirements

* Freelancer record can store legal-intake linkage metadata.

* Link may be:

  * external URL

  * external system ID

  * workflow status

* Internal users can see whether legal onboarding has started, is pending, or is complete.

### Acceptance Criteria

* Legal-link fields are visible only to authorized internal roles.

* External legal-system outage does not block profile viewing.

## Canonical Data Model

## Entity List

| Entity | Purpose |
| :---- | :---- |
| User | authentication and role ownership |
| FreelancerProfile | canonical artist/designer/freelancer record |
| PortfolioAsset | uploaded sample work or profile media |
| BookCover | completed cover showcase record |
| BookCoverContributor | credits bridge between cover and contributors |
| CreativeBrief | project brief submitted by hiring user |
| BriefOrder | payment/order record for brief publication |
| ConciergeOrder | payment/order record for premium services |
| ResourceArticle | editorial content item |
| TaxonomyTerm | controlled vocabulary entry |
| Folder | internal saved collection |
| FolderMembership | items inside folders |
| Favorite | user-to-freelancer save relation |
| ProfileNote | internal notes on freelancer |
| FeedbackEntry | post-project or evaluation feedback |
| LegalContactLink | legal-system relationship record |
| MediaAsset | generic file/media abstraction |
| Inquiry | contact/lead form submission |
| EmailSubscription | newsletter or alert enrollment |

## Core Entity Relationship Diagram

erDiagram  
    USER ||--o{ FREELANCER\_PROFILE : owns  
    USER ||--o{ FOLDER : creates  
    USER ||--o{ FAVORITE : saves  
    USER ||--o{ PROFILE\_NOTE : writes  
    USER ||--o{ FEEDBACK\_ENTRY : writes  
    FREELANCER\_PROFILE ||--o{ PORTFOLIO\_ASSET : has  
    FREELANCER\_PROFILE ||--o{ BOOK\_COVER\_CONTRIBUTOR : credited\_on  
    BOOK\_COVER ||--o{ BOOK\_COVER\_CONTRIBUTOR : has  
    CREATIVE\_BRIEF ||--|| BRIEF\_ORDER : paid\_by  
    CREATIVE\_BRIEF ||--o{ CONCIERGE\_ORDER : enhanced\_by  
    FREELANCER\_PROFILE ||--o{ LEGAL\_CONTACT\_LINK : linked\_to  
    FOLDER ||--o{ FOLDER\_MEMBERSHIP : contains  
    FREELANCER\_PROFILE ||--o{ FOLDER\_MEMBERSHIP : included\_in  
    FREELANCER\_PROFILE ||--o{ PROFILE\_NOTE : receives  
    FREELANCER\_PROFILE ||--o{ FEEDBACK\_ENTRY : receives  
    RESOURCE\_ARTICLE ||--o{ MEDIA\_ASSET : embeds  
    FREELANCER\_PROFILE ||--o{ MEDIA\_ASSET : references  
    CREATIVE\_BRIEF ||--o{ MEDIA\_ASSET : attaches

## FreelancerProfile Schema

### Profile Field Table

The spreadsheet is the authoritative source for these profile fields.

| No. | Category | Field | Type | Required | Searchable | Visibility | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | About Me | Artist Relation | yes/no plus relation dropdown | yes | no | internal | identifies whether submitter is self or representative |
| 2 | About Me | Name | free text | yes | yes | public | first and last name |
| 3 | About Me | Pronouns | free text | no | no | public | optional public field |
| 4 | About Me | Summary | free text | no | no | public | short bio |
| 5 | About Me | Email | free text | yes | no | internal | direct contact field |
| 6 | About Me | Personal Website/Social Media Links | links | no | no | public | one-to-many links |
| 7 | About Me | Resume | upload | no | no | internal or gated | file upload |
| 8 | About Me | Current Location(s) | multi-select plus free text | yes | yes | public/internal | should support typeahead and multiple values |
| 9 | About Me | Past Locations | multi-select plus free text | no | yes | internal or public configurable | should support multiple values |
| 10 | About Me | Agent | yes/no plus free text | yes | no | internal | includes agent name, agency, contact info |
| 11 | About Me | Previously Worked with PRH | yes/no plus free text | yes | no | internal | includes PRH contact and division/country |
| 12 | About Me | Employee of PRH | yes/no plus free text | yes | no | internal | includes division |
| 13 | Artistic Classifications | Adult or Children/Young Adult | multi-select plus other | yes | yes | public | includes adult, graphic novel, cover, picture book, board book, middle grade, young adult, map, other |
| 14 | Artistic Classifications | Style | multi-select plus other | yes | yes | public | includes illustration, design, photography, typography/hand lettering, animation/motion graphics, graphic artist, colorists, lettering, black and white line art, other |
| 15 | Artistic Classifications | Genre | multi-select plus other | no | yes | public | supports fiction and nonfiction genres |
| 16 | Artistic Classifications | Samples | upload | yes | no | public/internal | JPG, PNG, PDF with max-size limits |
| 17 | Artistic Classifications | Image Categories/Tags | multi-select plus free text | no | yes | public | visual tags such as animals, editorial, portraits, vector art, collage, ocean, line |
| 18 | Artistic Classifications | Uses AI | yes/no plus description | yes | yes | internal plus policy-driven public summary | stores tools and usage explanation |
| 19 | Self-Identification | How lived experience informs art/style | free text | no | yes | permissioned | searchable only where legally/policy approved |
| 20 | Self-Identification | Books excited to work on | multi-select | no | no | internal | interest matching field |
| 21 | Self-Identification | Artist profile statement / specialization info | free text | yes | yes | public | long-form statement |
| 22 | Admin | Approved for hire | yes/no | no | no | admin-only | controls discoverability and activation |

### Additional PDF-Driven Profile Fields

These fields are not in the spreadsheet but are required by the PDF or operationally necessary:

| Field | Type | Visibility | Notes |
| :---- | :---- | :---- | :---- |
| Public status | enum | admin/internal | draft, submitted, under\_review, approved, rejected, archived, deleted |
| Rate information | structured money fields | internal | optional nice-to-have |
| Featured flag | boolean | admin-only | for manual merchandising |
| Legal workflow status | enum/link | internal | driven by legal-link integration |
| Last reviewed at | timestamp | internal | moderation support |
| Review owner | user reference | internal | moderation support |
| Folder count | derived integer | internal | collaboration metadata |
| Favorite count | derived integer | internal/admin | optional analytics |

## Portfolio and Media Model

### PortfolioAsset

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID | yes | primary key |
| freelancer\_profile\_id | UUID | yes | owner |
| media\_asset\_id | UUID | yes | backing file |
| title | string | no | caption/title |
| description | text | no | context |
| asset\_type | enum | yes | image, PDF, video, link |
| visibility | enum | yes | public, internal, hidden |
| review\_status | enum | yes | pending, approved, rejected, hidden |
| sort\_order | integer | yes | gallery order |
| tags | array | no | searchable metadata |

## BookCover

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID | yes | primary key |
| title | string | yes | book title |
| subtitle | string | no | optional |
| author\_name | string | yes | public metadata |
| publisher | string | no | optional |
| imprint | string | no | optional |
| publication\_date | date | no | optional |
| audience\_tags | array | no | classification |
| genre\_tags | array | no | classification |
| visual\_tags | array | no | search/filter |
| primary\_image\_asset\_id | UUID | yes | cover art |
| external\_book\_url | string | no | optional |
| visibility | enum | yes | public, hidden, archived |

## CreativeBrief

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID | yes | primary key |
| submitter\_name | string | yes | person submitting |
| submitter\_email | string | yes | notifications |
| company\_or\_author\_name | string | no | client context |
| project\_title | string | yes | book/project title |
| project\_type | enum | yes | configurable |
| audience\_tags | array | yes | classification |
| genre\_tags | array | yes | classification |
| summary | text | yes | short brief |
| creative\_direction | rich text | yes | detailed ask |
| comp\_titles | rich text | no | inspiration |
| likes | rich text | no | preferences |
| dislikes | rich text | no | guardrails |
| budget\_text | string | no | user-facing budget input |
| timeline\_text | string | no | schedule |
| distribution\_mode | enum | yes | public, private\_outreach |
| status | enum | yes | workflow state |
| review\_notes | text | no | internal only |
| published\_at | timestamp | no | public listing time |
| closes\_at | timestamp | no | optional |

## Folder

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID | yes | primary key |
| owner\_user\_id | UUID | yes | creator |
| name | string | yes | folder label |
| privacy | enum | yes | private, shared\_users, shared\_team |
| description | text | no | context |
| shared\_with | array | no | users or groups |

## ProfileNote

| Field | Type | Required | Notes |
| :---- | :---- | :---- | :---- |
| id | UUID | yes | primary key |
| freelancer\_profile\_id | UUID | yes | target |
| author\_user\_id | UUID | yes | note creator |
| note\_type | enum | yes | general, fit, compliance, project, evaluation |
| body | text | yes | note content |
| visibility | enum | yes | internal only for v1 |

## Status Models

### Freelancer Profile State

stateDiagram-v2  
    \[\*\] \--\> Draft  
    Draft \--\> Submitted : submit profile  
    Submitted \--\> UnderReview : reviewer opens  
    UnderReview \--\> ChangesRequested : reviewer requests edits  
    ChangesRequested \--\> Submitted : freelancer resubmits  
    UnderReview \--\> Approved : admin approves  
    UnderReview \--\> Rejected : admin rejects  
    Approved \--\> Archived : admin archives  
    Approved \--\> Suspended : admin hides from public  
    Suspended \--\> Approved : admin restores  
    Archived \--\> Approved : admin restores  
    Rejected \--\> Draft : freelancer restarts  
    Approved \--\> Deleted : deletion flow  
    Archived \--\> Deleted : deletion flow

### Creative Brief State

| State | Meaning |
| :---- | :---- |
| draft | brief started, not submitted |
| pending\_payment | form complete, awaiting payment |
| paid | payment completed, awaiting review |
| queued\_for\_review | ready for editorial decision |
| changes\_requested | submitter must revise |
| published | visible on public jobs surface |
| private\_outreach | not publicly listed, distributed privately |
| closed | no longer accepting responses |
| rejected | declined |
| archived | retained for history |

## Permissions and Visibility

| Capability | Anonymous | Hiring User | Freelancer | Internal Business User | Reviewer | Admin |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Browse public freelancers | yes | yes | yes | yes | yes | yes |
| Browse public covers | yes | yes | yes | yes | yes | yes |
| Submit creative brief | yes | yes | no | yes | yes | yes |
| Pay for brief or concierge | yes | yes | no | yes | yes | yes |
| Create/edit freelancer profile | no | no | yes | no | yes | yes |
| View internal-only profile fields | no | no | own limited view | yes | yes | yes |
| Approve freelancer profiles | no | no | no | no | yes | yes |
| Add notes/feedback | no | no | no | yes | yes | yes |
| Create private folders | no | no | no | yes | yes | yes |
| Create shared folders | no | no | no | yes | yes | yes |
| Manage taxonomies | no | no | no | no | no | yes |
| Delete/archive records | no | no | request only | no | limited | yes |

## Search and Taxonomy Design

### Searchable Public Fields

* name

* current location(s)

* past locations if policy allows public indexing

* audience classification

* style

* genre

* image categories/tags

* AI use boolean

* lived-experience field only if governance explicitly permits

* profile statement / specialization

### Searchable Internal-Only Fields

* prior PRH work flag

* agent flag

* employee-of-PRH flag

* rate information

* legal workflow status

* internal notes tags

### Taxonomy Design Rules

* Taxonomies must be admin-manageable.

* Every taxonomy must support:

  * active/inactive status

  * sort order

  * alias/synonym for search

  * public label

  * internal label if needed

* Free-text plus controlled taxonomy hybrid fields should support:

  * standardized option selection

  * free-text additions

  * later admin normalization

### Typeahead Requirements

* Locations require master-list-backed typeahead with free-text fallback.

* Typeahead should support city, state/region, and country composition.

* Multiple values must be supported for current and past locations.

## Workflows

## 1\. Freelancer Submission and Activation

flowchart TD  
    A\[Freelancer starts profile\] \--\> B\[Enter profile fields\]  
    B \--\> C\[Upload samples and links\]  
    C \--\> D\[Submit for review\]  
    D \--\> E{Reviewer decision}  
    E \--\>|Request changes| F\[Return with feedback\]  
    F \--\> B  
    E \--\>|Reject| G\[Set rejected status\]  
    E \--\>|Approve| H\[Set approved\_for\_hire\]  
    H \--\> I\[Public listing enabled\]

### Workflow Rules

* Submission requires all required fields.

* Approval requires explicit reviewer or admin action.

* Approved status and approved\_for\_hire \= true are both required for public listing.

* Portfolio assets may require independent approval if moderation policy is strict.

## 2\. Creative Brief Submission and Payment

flowchart TD  
    A\[User opens brief form\] \--\> B\[Complete project and creative details\]  
    B \--\> C\[Upload files\]  
    C \--\> D\[Select distribution mode and add-ons\]  
    D \--\> E\[Review pricing\]  
    E \--\> F\[Checkout\]  
    F \--\>|Payment success| G\[Create order and mark paid\]  
    F \--\>|Payment failure| H\[Remain pending payment\]  
    G \--\> I\[Queue for review\]  
    I \--\> J{Reviewer decision}  
    J \--\>|Publish| K\[Public brief listing\]  
    J \--\>|Private outreach| L\[Private distribution only\]  
    J \--\>|Changes requested| M\[Send submitter back to edit\]  
    J \--\>|Reject| N\[Rejected with reason\]

### Workflow Rules

* Payment failure must not destroy form state.

* Submitter can resume an incomplete brief from a secure link or account history if authentication exists.

* Reviewer may override payment requirement only with admin permission.

## 3\. Internal Talent Curation

sequenceDiagram  
    participant U as Internal User  
    participant S as Search Service  
    participant P as Freelancer Profile  
    participant F as Folder/Favorites  
    participant L as Legal Link

    U-\>\>S: Search by style, genre, location, tags  
    S--\>\>U: Matching freelancers  
    U-\>\>P: Open profile  
    U-\>\>F: Favorite or save to folder  
    U-\>\>P: Add note or feedback  
    U-\>\>L: Link freelancer to legal workflow  
    L--\>\>U: Link status saved

## Notifications and Messaging

### Transactional Emails

* freelancer profile submitted

* changes requested on profile

* profile approved

* profile rejected

* brief payment receipt

* brief received for review

* brief published

* brief changes requested

* concierge order confirmation

* inquiry receipt

* newsletter confirmation if double opt-in is used

### Internal Notifications

* new profile awaiting review

* new brief awaiting review

* payment failure requiring manual intervention

* legal-link sync failure

## Payments and Integrations

### Payment Requirements

* Provider-agnostic payment abstraction.

* Support one-time payment for:

  * brief publishing

  * concierge services

* Store:

  * amount

  * currency

  * payment provider

  * provider transaction ID

  * payment status

  * refund status

### External Integrations

* payment provider

* email provider

* CRM or marketing automation

* asset/file storage

* legal portal or legal intake workflow

* analytics/event tracking

### Failure Handling

* Integration failures must be retriable.

* Core records must persist even if downstream integrations fail.

* Admin UI must surface sync failures.

## CMS and Admin Requirements

### Admin Surfaces

* Taxonomy management.

* Freelancer review queue.

* Brief review queue.

* Cover archive management.

* Resource/article publishing.

* Concierge package management.

* Payment and order lookup.

* Inquiry and newsletter lead management.

* Settings for public labels, CTAs, and featured placements.

### Admin Search

* Search all freelancer records, including non-public ones.

* Filter by:

  * status

  * style

  * genre

  * location

  * AI use

  * prior PRH work

  * agent status

  * approval status

  * legal workflow status

  * folder membership

## Non-Functional Requirements

### Content and SEO

* Clean, crawlable URLs.

* Metadata support for title, description, open graph, and canonical URL.

* Structured data for articles and possibly profile pages.

### Performance

* Directory and archive filters must feel responsive under large datasets.

* Image-heavy pages must use optimized media derivatives.

### Accessibility

* WCAG AA target.

* Keyboard support for filters, forms, modal dialogs, and media galleries.

* Alternative text support for portfolio and cover assets.

### Localization

* Architecture must not block future multi-region or multi-language rollout.

* Internationalization is future scope, but field design should not assume US-only geography.

### Security and Privacy

* Role-based access controls.

* Protection for internal notes and compliance fields.

* File upload validation and malware scanning.

* Audit trail for sensitive admin actions.

## Acceptance Scenarios

### Scenario 1: Approved Freelancer Becomes Public

* Given a freelancer submits all required fields

* When a reviewer approves the profile and sets it approved for hire

* Then the profile appears in public search and directory results

* And internal-only fields remain hidden

### Scenario 2: Public Search Honors Searchability Flags

* Given a profile contains both searchable and non-searchable fields

* When a public visitor runs a keyword search

* Then only searchable fields affect ranking or recall

### Scenario 3: Brief Requires Payment Before Review

* Given a hiring user completes the brief form

* When payment fails

* Then the brief remains resumable but not reviewable

* And the user receives failure messaging

### Scenario 4: Reviewer Converts Brief to Private Outreach

* Given a paid brief is in review

* When reviewer sets distribution mode to private outreach

* Then the brief is not listed publicly

* And relevant freelancers can still be contacted through the system

### Scenario 5: Internal User Curates Talent

* Given an internal user is authenticated

* When the user favorites a freelancer, adds a note, and saves them to a shared folder

* Then those internal objects persist independently of public listing state

### Scenario 6: Legal Workflow Linkage

* Given a freelancer is under consideration

* When an internal user links the record to legal intake

* Then the legal status is visible internally

* And no public user can access that status

## Deliberate Deviations from the Source Site

* Use company brand and terminology instead of source-site branding.

* Normalize public labels where needed to fit existing internal product language.

* Expand the freelancer database to support internal collaboration features not clearly visible on the public source site.

* Treat categories, filters, and package names as configurable.

* Add explicit permissions and moderation rules that the source site likely has but does not expose.

## Gap Analysis: Source Site vs Internal Needs

| Area | Source Site Need | Internal Need | Decision |
| :---- | :---- | :---- | :---- |
| Freelancer profiles | public talent discovery | public \+ internal database | build unified canonical profile model |
| Cover archive | public showcase | showcase \+ talent attribution | support multi-contributor credit model |
| Brief workflow | paid job posting | public posting \+ private distribution | support both public and private modes |
| Concierge | premium upsell | configurable service catalog | model as separate order entity |
| Notes/folders | not clearly public | explicitly required internally | build internal collaboration subsystem |
| Legal linking | not public | explicitly required internally | add internal-only legal-link entity |
| Deletion | not visible | required internally | add admin and user deletion lifecycle |

## Appendix A: Implementation Defaults

* Canonical profile model name: FreelancerProfile

* Public listing eligibility:

  * profile status is approved

  * approved\_for\_hire \= true

  * at least one approved public portfolio asset exists

* Folder privacy default: private

* Favorites default: private to the saving user

* Lived-experience field indexing default: internal-only until policy approval

* Rate information default: internal-only

## Appendix B: Open Technical Recommendations

These are implementation recommendations, not product requirements.

* Use a search engine or indexed query layer that supports:

  * faceting

  * full-text search

  * synonym handling

  * incremental indexing

* Store uploads in object storage with derivative generation.

* Use a headless CMS or internal admin framework for taxonomies and editorial content.

* Keep payment integration abstracted behind an order service.

## Appendix C: Word Export Guidance

The Markdown file should remain the source of truth.

To generate a Word document:

pandoc docs/ineedabookcover-functional-spec.md \-o docs/ineedabookcover-functional-spec.docx

If a branded Word template is needed:

pandoc docs/ineedabookcover-functional-spec.md \\  
  \-o docs/ineedabookcover-functional-spec.docx \\  
  \--reference-doc\=docs/reference.docx

If Mermaid diagrams need high-fidelity Word output, render them to images during export or replace them with exported PNG/SVG assets before generating the .docx.