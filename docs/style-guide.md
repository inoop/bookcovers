# Penguin Random House-Aligned UX Style Guide

## Purpose

This document defines the visual system for the internal book-cover marketplace and freelancer database application.

It is intended to guide:

- landing-page and marketing design
- React + Material UI application design
- implementation of design tokens
- component styling decisions
- layout, typography, spacing, and interaction behavior

This guide should be treated as the canonical UX style source of truth.

## Source of Truth and Brand Direction

This guide is based on the visual language used on the Penguin Random House US homepage and PRH theme CSS, then translated into a more structured product system.

The PRH reference patterns visible in the homepage and stylesheet are consistent in these ways:

- editorial, literary, and restrained rather than glossy or startup-like
- black-and-white foundation with a warm orange accent
- softer neutral backgrounds for secondary surfaces
- display headlines in a literary serif family
- utility and navigation typography in compact uppercase sans
- a 24px vertical rhythm
- centered, fairly narrow editorial content widths

The goal is **not** to mimic the PRH corporate homepage literally in every UI pattern. The goal is to preserve its tone, typography hierarchy, color balance, and spacing logic while making the product interface clearer, denser, and more usable.

## Design Principles

### 1. Editorial, Not Generic SaaS

The interface should feel like a literary institution rather than a startup dashboard.

- Use typography hierarchy before color hierarchy.
- Use whitespace before heavy borders.
- Prefer quiet structure over ornamental decoration.
- Let imagery and cover art carry visual richness.

### 2. Controlled Warmth

The brand is not cold minimalism. It uses crisp black, paper white, warm orange, and muted blue-gray accents with restraint.

- Accent color should feel intentional, not sprayed across every control.
- Large surfaces should remain neutral.
- Calls to action should be obvious without turning the UI into an orange wall.

### 3. Strong Rhythm

PRH's CSS uses a 24px line-height and repeated 24/48 spacing intervals. That cadence should remain visible here.

- Major vertical spacing should anchor to 24px multiples.
- Body text should sit comfortably on a 24px rhythm.
- Sections should breathe.

### 4. Product Clarity Over Marketing Purity

The application UI should stay brand-aligned but must outperform the marketing site in clarity.

- Denser layouts are allowed in app pages.
- Data views may use simplified typography.
- Interaction states must be stronger and more explicit than the marketing reference.

### 5. Light Mode Only

Do not design, spec, or optimize for dark mode in v1.

## Brand Tokens

## Color System

### Core Palette

These are the foundation colors taken from the PRH brand reference and normalized for product use.

| Token | Value | Usage |
| --- | --- | --- |
| `brand.ink` | `#000000` | primary text, headline text, icon default, key dividers |
| `brand.paper` | `#FFFFFF` | primary background, cards, dialogs |
| `brand.orange` | `#FF6600` | primary accent, CTA, links in action contexts |
| `brand.orangeSoft` | `#FF6F00` | editorial accent, eyebrow text, featured labels |
| `brand.blueSlate` | `#3C5A75` | secondary accent, section headers, tabs, utility links |
| `brand.charcoal` | `#231F20` | app shell accents, dark utility surfaces, footer base |
| `brand.textBody` | `#464646` | default body text |
| `brand.textMuted` | `#757575` | secondary text |
| `brand.textSubtle` | `#999999` | metadata |
| `brand.line` | `#5D5D5D` | strong divider |
| `brand.lineSoft` | `#C2C4C8` | subdued divider |
| `brand.surfaceSoft` | `#F8F8F9` | subtle section banding |
| `brand.surfaceSoftAlt` | `#F7F7F7` | alternate neutral surface |
| `brand.surfaceRaised` | `#F4F4F4` | hover panel or muted card surface |
| `brand.linkAlt` | `#007DAC` | secondary interactive link treatment |

### Semantic Role Mapping

| Role | Token |
| --- | --- |
| `bg.canvas` | `#FFFFFF` |
| `bg.subtle` | `#F8F8F9` |
| `bg.raised` | `#F4F4F4` |
| `bg.inverse` | `#231F20` |
| `text.primary` | `#000000` |
| `text.body` | `#464646` |
| `text.secondary` | `#757575` |
| `text.muted` | `#999999` |
| `text.inverse` | `#FFFFFF` |
| `border.default` | `#C2C4C8` |
| `border.strong` | `#5D5D5D` |
| `action.primary` | `#FF6600` |
| `action.primaryHover` | `#E65C00` |
| `action.secondary` | `#3C5A75` |
| `action.secondaryHover` | `#31495F` |
| `link.default` | `#000000` |
| `link.accent` | `#FF6600` |
| `link.utility` | `#3C5A75` |
| `focus.ring` | `#007DAC` |
| `status.success` | `#2E6F4E` |
| `status.warning` | `#A15C00` |
| `status.error` | `#A62B1F` |
| `status.info` | `#3C5A75` |

### Color Usage Rules

- The application should be at least 70% white or soft neutral surfaces.
- Orange is primarily for:
  - primary CTA
  - active link emphasis
  - badges and labels with high intentionality
- Blue-slate is for:
  - secondary links
  - section labels
  - selected utility states
- Black should dominate typography and key dividers.
- Avoid large orange backgrounds except for intentional CTA strips or banner accents.
- Avoid saturated blues outside utility or informational contexts.

## Typography

## Font Families

Use the exact PRH-style font stack if licensed.

### Primary Fonts

| Use | Primary | Fallback |
| --- | --- | --- |
| Display serif | `Shift-Light`, `Shift-Medium`, `Shift-Bold` | `Georgia`, `Iowan Old Style`, `Times New Roman`, serif |
| UI sans | `Fort-Light`, `Fort-Medium`, `Fort-Bold` | `Helvetica Neue`, `Helvetica`, `Arial`, sans-serif |
| Utility / nav sans | `Futura W01 Book`, `Futura W01 Bold` | `Avenir Next`, `Avenir`, `Helvetica Neue`, `Arial`, sans-serif |

### Fallback Strategy

- If Shift is unavailable, use `Georgia` for website display headings and `Iowan Old Style` where supported.
- If Fort is unavailable, use `Helvetica Neue`.
- If Futura W01 is unavailable, use `Avenir Next`.
- The product should never fall back to default MUI Roboto as the visible first-choice brand font.

## Typographic Tone

- **Shift** is for literary display moments.
- **Fort** is for body, UI labels, and readable product text.
- **Futura** is for uppercase utility and compact navigation treatments.

## Base Typography Settings

- Root sizing logic: 14px base with a 24px rhythm.
- Website body default:
  - `font-family: Fort-Light`
  - `font-size: 16px`
  - `line-height: 24px`
- Application body default:
  - `font-family: Fort-Light`
  - `font-size: 14px`
  - `line-height: 20px`

## Type Scale

### Website Type Scale

| Token | Font | Size | Line Height | Weight | Usage |
| --- | --- | --- | --- | --- | --- |
| `type.display.xl` | Shift-Light | 56px | 60px | 300 | homepage hero headline |
| `type.display.l` | Shift-Light | 44px | 48px | 300 | section-leading headline |
| `type.display.m` | Shift-Light | 32px | 40px | 300 | article/page title |
| `type.display.s` | Shift-Light | 28px | 36px | 300 | featured card title |
| `type.sectionTitle` | Futura W01 Book | 30px | 36px | 400 | content strip title |
| `type.kicker` | Fort-Bold | 13px | 16px | 700 | orange eyebrow label |
| `type.body.l` | Fort-Light | 18px | 28px | 300 | lead paragraph |
| `type.body.m` | Fort-Light | 16px | 24px | 300 | standard body copy |
| `type.body.s` | Fort-Light | 15px | 24px | 300 | card body text |
| `type.meta` | Fort-Light | 11px | 11px | 300 | dates and metadata |
| `type.utility` | Futura W01 Bold | 11px | 14px | 700 | nav, utility labels, pills |

### Application Type Scale

| Token | Font | Size | Line Height | Weight | Usage |
| --- | --- | --- | --- | --- | --- |
| `type.app.pageTitle` | Shift-Light | 36px | 40px | 300 | page header title |
| `type.app.sectionTitle` | Shift-Light | 28px | 32px | 300 | page section title |
| `type.app.panelTitle` | Fort-Medium | 20px | 28px | 500 | cards, panels, drawers |
| `type.app.tableTitle` | Fort-Medium | 16px | 24px | 500 | result item title |
| `type.app.body` | Fort-Light | 14px | 20px | 300 | standard UI body |
| `type.app.bodyStrong` | Fort-Medium | 14px | 20px | 500 | emphasized inline text |
| `type.app.label` | Fort-Medium | 12px | 16px | 500 | field labels |
| `type.app.caption` | Fort-Light | 12px | 16px | 300 | help text, row metadata |
| `type.app.overline` | Futura W01 Bold | 11px | 14px | 700 | pills, section labels, tabs |
| `type.app.button` | Fort-Bold | 12px | 16px | 700 | button labels |

## Typography Rules

- Do not use Shift for long paragraphs.
- Do not use Futura for form labels or body content.
- Use uppercase sparingly and mostly in utility contexts.
- Headline line-length should usually be:
  - 7 to 12 words on website hero sections
  - 4 to 10 words on app page titles
- Body text measure:
  - website: 60 to 74 characters
  - app: 55 to 72 characters

## Spacing System

## Base Rhythm

The system should preserve PRH's 24px rhythm while still giving engineers a usable scale.

### Spacing Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `space.0` | `0` | reset |
| `space.1` | `4px` | tight inline spacing |
| `space.2` | `8px` | icon gaps, compact chips |
| `space.3` | `12px` | compact control spacing |
| `space.4` | `16px` | standard small gap |
| `space.5` | `20px` | medium compact gap |
| `space.6` | `24px` | base vertical rhythm |
| `space.7` | `32px` | card/panel spacing |
| `space.8` | `40px` | large group spacing |
| `space.9` | `48px` | section rhythm |
| `space.10` | `64px` | page block separation |
| `space.11` | `80px` | large landing-page section separation |
| `space.12` | `96px` | hero or page opening spacing |

### Spacing Rules

- Website sections should primarily use `24 / 48 / 80 / 96`.
- Application surfaces should primarily use `12 / 16 / 24 / 32`.
- Never stack arbitrary 8px increments when a 24px rhythm would create cleaner structure.
- Use larger spacing on marketing pages than in application flows.

## Grid and Layout

## Website Layout

### Containers

| Container | Width | Usage |
| --- | --- | --- |
| `container.hero` | `1200px` max | homepage hero and feature composition |
| `container.page` | `1080px` max | marketing interior pages |
| `container.editorial` | `980px` max | PRH-aligned editorial body content |
| `container.reading` | `760px` max | text-heavy resource pages |

### Website Gutters

- Desktop page padding: `24px`
- Tablet page padding: `24px`
- Mobile page padding: `20px`

### Website Columns

- Hero sections:
  - 12-column layout
  - 24px gutters
- Editorial split sections:
  - 7/5 or 6/6 split
- Card rows:
  - 3-up on desktop
  - 2-up on tablet
  - 1-up on mobile

### Website Section Spacing

- Hero top padding: `96px`
- Hero bottom padding: `80px`
- Standard section vertical padding: `64px` to `80px`
- Tight editorial separators: `48px`

## Application Layout

### App Frame

| Region | Spec |
| --- | --- |
| top app bar | `64px` desktop, `56px` mobile |
| left navigation | `280px` expanded, `88px` collapsed |
| content max width | `1440px` for dashboard pages |
| page padding | `32px` desktop, `24px` tablet, `16px` mobile |
| panel padding | `24px` standard |

### App Grid

- Use a 12-column content grid.
- Standard internal gap: `24px`.
- Dense subgrids can use `16px`.
- Results pages may use a two-zone structure:
  - fixed/sticky filter rail
  - flexible results pane

### App Section Spacing

- Page header to first section: `32px`
- Panel to panel: `24px`
- Form field group to field group: `24px`
- Table toolbar to table: `16px`

## Shape, Borders, and Elevation

## Border Radius

| Token | Value | Usage |
| --- | --- | --- |
| `radius.none` | `0` | image crops, strict dividers |
| `radius.sm` | `4px` | fields, chips |
| `radius.md` | `8px` | cards, dialogs |
| `radius.lg` | `12px` | hero overlays, special callouts |
| `radius.pill` | `999px` | pills, compact CTAs |

### Radius Rules

- Do not use oversized 16px to 24px radii on standard UI surfaces.
- PRH's visual language is crisp, not bubbly.
- Pills are acceptable for compact marketing CTAs or labels.

## Borders

- Standard border: `1px solid #C2C4C8`
- Strong border: `1px solid #5D5D5D`
- Section divider: `1px solid #000000` or `#5D5D5D`
- Tables should use horizontal separators more than full boxed outlines.

## Shadows

Use shadows lightly.

| Token | Value | Usage |
| --- | --- | --- |
| `shadow.none` | `none` | default flat PRH look |
| `shadow.sm` | `0 2px 8px rgba(0,0,0,0.06)` | menus, dropdowns |
| `shadow.md` | `0 8px 24px rgba(0,0,0,0.10)` | dialogs, sticky bars |
| `shadow.sticky` | `0 10px 10px -4px rgba(0,0,0,0.4)` | sticky navigation only |

### Shadow Rules

- Prefer borders and spacing before shadows.
- Cards should not float heavily.
- Use the stronger sticky-nav shadow only on fixed headers.

## Motion

## Timing

| Token | Value |
| --- | --- |
| `motion.fast` | `120ms` |
| `motion.base` | `180ms` |
| `motion.slow` | `260ms` |

## Easing

- Default: `cubic-bezier(0.2, 0, 0, 1)`
- Entrance transitions should be subtle.
- Do not use springy or playful motion.

## Motion Rules

- Hover states should fade or shift minimally.
- Avoid scaling cards on hover.
- Use opacity, underline, border-color, or background tint instead.

## Icons and Illustration

- Prefer simple monochrome line or solid icons.
- Default icon color: `#000000`
- Secondary icon color: `#757575`
- Accent icon use: `#3C5A75` or `#FF6600` only when semantically needed
- Avoid rounded playful icon sets.
- Book-cover imagery and artwork should provide the visual richness, not decorative illustrations.

---

# General Website / Landing Page

## Website Tone

The landing site should feel editorial, intelligent, global, and culturally literate.

- Quiet confidence
- Generous whitespace
- Strong typography
- Minimal ornament
- High-quality imagery

## Website Composition

## Header

### Structure

- White background
- Centered or balanced logo placement
- Simple horizontal navigation
- Compact uppercase utility nav
- Search and CTA may sit at right edge

### Header Specs

- Height: `88px` to `104px`
- Top padding should feel airy, not compressed
- Nav text:
  - `Futura W01 Bold`
  - `11px` to `12px`
  - uppercase
  - black default
  - orange hover

### Header Rules

- Do not use a chunky app-like top bar for the public website.
- Dividers in nav can be subtle vertical rules.
- Sticky behavior is allowed for long pages.

## Hero

### Hero Structure

- Kicker/eyebrow
- Shift-based display headline
- Support paragraph
- Primary CTA + optional secondary CTA
- One dominant image or editorial collage

### Hero Specs

- Headline font: `Shift-Light`
- Headline size: `44px` to `56px`
- Headline width: max `10ch` to `14ch`
- Body width: max `560px`
- Kicker:
  - `Fort-Bold`
  - uppercase
  - `13px`
  - orange or blue-slate
- CTA row spacing: `24px` after support copy
- Visual block:
  - use cover mosaics, featured artwork, or talent imagery
  - avoid abstract gradients

### Hero Do

- Let the headline carry the emotion.
- Keep the background mostly white or very light neutral.
- Use one strong image family.

### Hero Don't

- Do not fill the hero with tinted overlays.
- Do not use centered generic SaaS illustration.
- Do not use more than two primary CTAs.

## Section Templates

## 1. Editorial Feature Section

- Left: image or collage
- Right: kicker, Shift headline, paragraph, CTA
- Section padding: `80px`
- Divider: optional thin top border

## 2. Three-Card Story Row

- Section title in Futura or Shift depending on prominence
- Three equal cards
- Each card:
  - image ratio `4:3`
  - title in Shift
  - metadata in Fort-Light `11px`
  - summary in Fort-Light `15px`

## 3. Split Utility Section

Use for:

- browse talent / browse covers
- for authors / for designers
- services / resources

Rules:

- 6/6 split
- pale neutral background on one side only
- keep body copy short

## 4. Newsletter / Conversion Band

- Background: `#F8F8F9`
- Headline in Shift
- Form label and helper in Fort
- Primary button in orange
- No dark background in primary newsletter module

## 5. Footer

- Background: `#231F20`
- Text: white and muted grays
- Link hover: orange or white underline
- Use Fort for body and utility labels
- Keep the footer simple and institutional

## Website Buttons and Links

## Primary CTA

- Fill: `#FF6600`
- Text: white
- Border: `1px solid #FF6600`
- Radius: pill or `999px` for marketing CTA
- Font:
  - `Fort-Bold`
  - `12px`
  - uppercase optional only in promotional zones
- Padding:
  - `10px 20px` for compact
  - `12px 24px` for standard

## Secondary CTA

- Background: white
- Text: `#FF6600`
- Border: `1px solid #FF6600`
- Hover inverts to filled orange

## Text Link

- Default color: black
- Hover: orange or blue-slate
- Use underline on hover, not at rest, in body copy

## Website Cards

### Shared Card Rules

- Flat white or transparent background
- Minimal border treatment
- Strong typographic hierarchy
- Image-first when relevant
- No oversized shadows

### Talent / Story Card

- Title: Shift-Light `28px` or `24px` depending on density
- Metadata: Fort-Light `11px`, uppercase where needed
- Description: Fort-Light `15px/24px`
- CTA link below summary

## Website Forms

- Labels:
  - `Fort-Medium`
  - `13px`
  - black
- Input text:
  - `Fort-Light`
  - `16px`
  - line height `24px`
- Field height: `48px`
- Textarea min height: `144px`
- Borders:
  - `1px solid #C2C4C8`
  - hover to `#5D5D5D`
  - focus to `#007DAC`
- Inputs should remain rectangular with modest radius

## Website Imagery

- Use authentic book covers, artwork, portraiture, and editorial photography.
- Prefer:
  - clean crops
  - visible texture
  - natural contrast
  - restrained color correction
- Avoid:
  - artificial 3D renders
  - generic startup photography
  - neon color overlays

## Website Page Recipes

## Landing Page Recipe

1. Header on white.
2. Hero with left text, right editorial image system.
3. Two-pathway split: browse talent / post a brief.
4. Featured freelancer row.
5. Featured cover archive row.
6. Concierge or premium service section.
7. Resource/article row.
8. Newsletter band.
9. Institutional footer.

## Resource Page Recipe

1. Simple header.
2. Shift headline with metadata.
3. Reading-width body column.
4. Pull quote or related resource callout.
5. CTA to browse talent or post a brief.

---

# React + MUI Application Interface

## Application Tone

The application should feel like the operational counterpart to the website:

- more structured
- more concise
- more efficient
- still clearly literary and brand-owned

This is not a stock MUI admin. It should feel editorially serious, not generic.

## App Shell

## Top App Bar

- Height: `64px`
- Background: white
- Bottom border: `1px solid #C2C4C8`
- Optional sticky behavior
- Logo area left, utility actions right
- Use Fort or Futura for utility nav

## Side Navigation

- Background: `#231F20` or white depending on chosen IA
- Recommended default:
  - left nav in white for broader brand continuity
  - active section marker in orange
  - section labels in Fort-Medium
- Dense admin mode may use charcoal side rail with white text if content area remains bright

### Active Nav State

- left border or leading bar in `#FF6600`
- text black or white depending on surface
- subtle background tint, never a bright full fill

## Page Header

### Layout

- title left
- page actions right
- optional breadcrumbs above title
- optional filter summary below

### Typography

- Title: Shift-Light `36px`
- Subtitle/body: Fort-Light `14px` or `16px`
- Eyebrow: Futura W01 Bold `11px`, uppercase

## MUI Theme Mapping

## Palette Contract

```ts
palette: {
  mode: 'light',
  primary: {
    main: '#FF6600',
    dark: '#E65C00',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#3C5A75',
    dark: '#31495F',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#000000',
    secondary: '#464646',
    disabled: '#999999',
  },
  divider: '#C2C4C8',
  error: { main: '#A62B1F' },
  warning: { main: '#A15C00' },
  info: { main: '#3C5A75' },
  success: { main: '#2E6F4E' },
}
```

## Typography Contract

```ts
typography: {
  fontFamily: '"Fort-Light", "Helvetica Neue", Arial, sans-serif',
  h1: {
    fontFamily: '"Shift-Light", Georgia, serif',
    fontSize: '2.25rem',
    lineHeight: 1.1,
    fontWeight: 300,
  },
  h2: {
    fontFamily: '"Shift-Light", Georgia, serif',
    fontSize: '1.75rem',
    lineHeight: 1.15,
    fontWeight: 300,
  },
  h3: {
    fontFamily: '"Fort-Medium", "Helvetica Neue", Arial, sans-serif',
    fontSize: '1.25rem',
    lineHeight: 1.4,
    fontWeight: 500,
  },
  body1: {
    fontFamily: '"Fort-Light", "Helvetica Neue", Arial, sans-serif',
    fontSize: '0.875rem',
    lineHeight: 1.43,
    fontWeight: 300,
  },
  body2: {
    fontFamily: '"Fort-Light", "Helvetica Neue", Arial, sans-serif',
    fontSize: '0.75rem',
    lineHeight: 1.33,
    fontWeight: 300,
  },
  button: {
    fontFamily: '"Fort-Bold", "Helvetica Neue", Arial, sans-serif',
    fontSize: '0.75rem',
    lineHeight: 1.33,
    fontWeight: 700,
    textTransform: 'none',
  },
  overline: {
    fontFamily: '"Futura W01 Bold", "Avenir Next", Arial, sans-serif',
    fontSize: '0.6875rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
}
```

## Layout and Shape Contract

```ts
spacing: 4,
shape: {
  borderRadius: 8,
},
```

Rules:

- Use `theme.spacing(6)` as the default 24px rhythm anchor.
- Page and panel composition should favor `spacing(4)`, `spacing(6)`, and `spacing(8)`.

## MUI Component Conventions

## Buttons

### Primary Button

- Filled orange
- White text
- No elevation by default
- Radius: `999px` for marketing-style CTAs, `8px` for app actions
- Minimum height: `40px`
- Padding: `10px 18px`

### Secondary Button

- White background
- Orange border
- Orange text
- Hover becomes soft orange fill or filled orange depending on prominence

### Tertiary Button

- Text only
- Black or blue-slate text
- Hover underline or subtle tint

### Destructive Button

- White background
- Error-colored border and text
- Do not make destructive orange

## Text Fields and Inputs

### Input Style

- Background: white
- Border: `1px solid #C2C4C8`
- Radius: `8px`
- Height: `44px`
- Label color: black
- Helper text color: `#757575`
- Focus:
  - border and outline accent to `#007DAC`
  - avoid thick orange focus rings

### Input Rules

- Avoid filled-variant MUI fields.
- Use outlined fields as the system default.
- Placeholder text should be subtle and never look like a label.

## Search and Filter Controls

### Filter Panel

- Background: `#F8F8F9`
- Padding: `24px`
- Section dividers between filter groups
- Group label:
  - Futura or Fort-Bold
  - `11px` to `12px`
  - uppercase
- Multi-select chips should remain compact and flat

### Search Bar

- Height: `48px`
- White background
- Strong black text
- Optional search icon at left
- Use clear affordance and roomy input padding

## Cards and Panels

## Profile Card

- White background
- Border: `1px solid #E1E1E1`
- Radius: `8px`
- Padding: `20px` or `24px`
- No heavy shadow
- Use cover art or avatar as the visual anchor

### Profile Card Type Hierarchy

- Name/title: Fort-Medium `20px`
- Metadata: Fort-Light `12px`
- Tags: Futura/Fort uppercase compact chips
- Summary: Fort-Light `14px/20px`

## Summary Panel

- For dashboards, metrics, and admin overviews
- White or subtle neutral background
- One headline number and one explanatory line
- Keep metrics panels quieter than typical SaaS dashboards

## Tables

### Table Rules

- Horizontal separators only where possible
- Header row:
  - white or very light neutral
  - Fort-Medium `12px`
  - uppercase optional only if table is utility-heavy
- Body rows:
  - Fort-Light `14px`
  - line-height `20px`
- Row hover:
  - `#F8F8F9`
- Selected row:
  - soft tint, not saturated fill

### Table Density

- Default row height: `56px`
- Dense row height: `48px`
- Use dense mode only on admin-heavy pages

## Tabs

- Use text tabs with strong underline indicator
- Indicator color: `#FF6600`
- Inactive tab text: `#757575`
- Active tab text: black
- Font:
  - `Fort-Medium` for app tabs
  - `Futura W01 Bold` for utility dashboards only

## Chips and Tags

### Taxonomy Chips

- Background: `#F8F8F9`
- Border: `1px solid #C2C4C8`
- Text: black or blue-slate
- Radius: `999px`
- Height: compact, `28px` to `32px`

### Selected Chips

- White text on blue-slate or orange only when selection state must be obvious
- Default selected state should prefer blue-slate over orange when many chips are visible

## Alerts and Messaging

### Banner Alerts

- Success: pale green tint with dark green text
- Warning: pale warm tint with brown text
- Error: pale red tint with dark red text
- Info: pale blue-gray tint with dark slate text

### Empty States

- Use a Shift headline for the main message
- Use Fort body for explanation
- Include one primary recovery action
- Keep illustration or icon minimal

## Dialogs and Drawers

- White background
- Radius: `12px`
- Header title in Shift or Fort-Medium depending on formality
- Standard padding: `24px`
- Footer actions aligned right
- Overlay should be soft dark, not fully opaque

## Upload UI

Because the product depends on brief attachments and portfolio samples, upload surfaces need a specific treatment.

### Upload Drop Zone

- White or soft neutral background
- `2px dashed #C2C4C8`
- Radius: `12px`
- Padding: `24px` to `32px`
- Drag-over state:
  - border to blue-slate
  - background tint to very pale neutral blue

### Upload List

- Flat list with file icon, name, type, size, and remove action
- Errors show inline in red

## Product Page Recipes

## Search Results Page

### Structure

- page title and summary
- sticky filter rail left
- result toolbar right top
- cards or list rows below

### Rules

- filters must not visually overpower results
- search term and active facets should appear as compact chips
- sort control sits above results, aligned right

## Freelancer Profile Detail

### Structure

- hero band with name, classifications, primary CTA
- left column summary and metadata
- main content gallery / work samples
- lower notes or related covers section

### Rules

- keep typography elegant and spacious
- let imagery dominate the content area
- avoid cluttered sidebars

## Approval Dashboard

### Structure

- page title
- summary panels
- review queue table
- optional right-side detail drawer

### Rules

- denser than public pages
- preserve neutral surfaces
- use orange only for action emphasis, not row highlighting

## Form Page

### Structure

- left-aligned page heading
- grouped card sections
- sticky action footer for long forms where necessary

### Rules

- keep labels and help text explicit
- use section titles for chunking
- long forms should alternate between white cards and canvas background

## Accessibility Rules

- Minimum contrast must meet WCAG AA.
- Orange on white should not be used for small body text without weight or size support.
- Focus states must be clearly visible and not rely on color alone.
- Form labels must remain visible at all times.
- Interactive elements must have hover, focus, and disabled states defined.
- Avoid using uppercase for large body passages.

## Do / Don't Summary

## Do

- Use Shift for key editorial headlines.
- Use Fort for readable interface text.
- Use Futura for compact utility labels and navigation.
- Keep page backgrounds bright and neutral.
- Let orange create emphasis, not atmosphere.
- Preserve a 24px rhythm in major page spacing.
- Keep MUI overrides strong enough to avoid the stock Material look.

## Don't

- Do not use Roboto as the visible primary typeface.
- Do not introduce purple, neon gradients, glassmorphism, or oversized blobs.
- Do not over-round cards, inputs, or dialogs.
- Do not use deep shadows as a layout substitute.
- Do not turn all selected states orange.
- Do not make every page feel like marketing; the app should be quieter and tighter.

## CSS Variable Contract

```css
:root {
  --color-ink: #000000;
  --color-paper: #ffffff;
  --color-orange: #ff6600;
  --color-orange-soft: #ff6f00;
  --color-blue-slate: #3c5a75;
  --color-charcoal: #231f20;
  --color-text-body: #464646;
  --color-text-muted: #757575;
  --color-text-subtle: #999999;
  --color-border: #c2c4c8;
  --color-border-strong: #5d5d5d;
  --color-surface-soft: #f8f8f9;
  --color-surface-soft-alt: #f7f7f7;
  --color-surface-raised: #f4f4f4;
  --color-link-alt: #007dac;

  --font-display: "Shift-Light", Georgia, serif;
  --font-body: "Fort-Light", "Helvetica Neue", Arial, sans-serif;
  --font-body-strong: "Fort-Medium", "Helvetica Neue", Arial, sans-serif;
  --font-ui-bold: "Fort-Bold", "Helvetica Neue", Arial, sans-serif;
  --font-utility: "Futura W01 Bold", "Avenir Next", Arial, sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --space-10: 64px;
  --space-11: 80px;
  --space-12: 96px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;
}
```

## MUI Override Targets

These components must be overridden to align with this style guide:

- `MuiCssBaseline`
- `MuiTypography`
- `MuiLink`
- `MuiButton`
- `MuiButtonBase`
- `MuiAppBar`
- `MuiToolbar`
- `MuiDrawer`
- `MuiPaper`
- `MuiCard`
- `MuiTextField`
- `MuiFormLabel`
- `MuiOutlinedInput`
- `MuiAutocomplete`
- `MuiChip`
- `MuiTabs`
- `MuiTab`
- `MuiTableCell`
- `MuiTableRow`
- `MuiAlert`
- `MuiDialog`
- `MuiMenu`
- `MuiTooltip`

## Implementation Notes

- Use one token source for both website CSS and MUI theme generation.
- Keep website and app typography variants separate, even when they share fonts.
- Use image cropping and editorial composition rules consistently across talent cards, cover cards, and featured sections.
- Default MUI spacing should still route through the 4px scale, but major composition must prefer multiples that preserve the 24px rhythm.

## Quality Checklist

- Does the page feel literary rather than generic SaaS?
- Is orange used intentionally instead of everywhere?
- Is whitespace doing most of the visual organization work?
- Are headlines noticeably distinct from body text?
- Would the interface still feel on-brand if all images were removed?
- Does the page avoid the default MUI visual fingerprint?
