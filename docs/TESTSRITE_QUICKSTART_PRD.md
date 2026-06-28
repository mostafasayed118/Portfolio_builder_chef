# Chef Mohamed Portfolio — TestSprite Quickstart PRD (Condensed)

> **For quick upload to TestSprite Web Portal.**
> Covers all P0 features. Upload alongside `TESTSRITE_PRD.md` or `IMPLEMENTATION_BLUEPRINT.md`.

## Public Site

1. **Hero** — animated heading/subheading/CTA, stats badges, chef portrait, RTL mirror
2. **About** — bilingual bio (3 paragraphs), 6 skill tags, chef image
3. **Services** — 3 categories (artisanal, consulting, training), icon cards, service lists
4. **Projects** — 8 career timeline cards, 5 categories, highlight badges
5. **Menu** — 4-category filterable grid, product cards (image, name, price)
6. **Contact** — validated form (name/email/phone/message), WhatsApp CTA, rate-limited (5/15min)
7. **Bilingual** — EN/AR switch, full RTL layout, no text hardcoded

## Admin CMS

1. **Login** — Clerk-hosted, email/password + Google OAuth, 3-layer auth guard
2. **Dashboard** — stats cards + 9 quick-action links
3. **Hero Editor** — bilingual textareas + image upload
4. **About Editor** — bilingual bio + skill tags + image
5. **Menu CRUD** — create/read/update/delete/reorder + image upload + visibility toggle
6. **Services CRUD** — create/read/update/delete/reorder + visibility
7. **Projects CRUD** — create/read/update/delete/reorder + highlight toggle
8. **Contact Editor** — phone/WhatsApp/email/locations
9. **Gallery** — image upload + reorder + delete
10. **Testimonials CRUD** — create/read/update/delete + star rating
11. **Inbox** — contact submissions table

## Key Auth Flows

- Unauthenticated → redirected to Clerk sign-in
- Non-admin email → `/admin/unauthorized` page
- Convex `requireAdmin()` enforces server-side
- Rate-limited login: 5 attempts / 15min / email

## Data Integrity Rules

- All bilingual content has both EN and AR values
- Image uploads validated: type (jpeg/png/gif), size (max 5MB)
- Drag reorder persists order across sessions
- Optimistic UI updates on visibility toggles
