# ADMIN CMS GUIDE

**Last Updated:** 2026-06-21

## Architecture

### Route Structure
```
src/app/[locale]/admin/
  (auth)/
    login/page.tsx            ← Public, no auth check
  (protected)/
    layout.tsx                ← Auth guard (Server Component)
    dashboard/page.tsx        ← Stats + quick actions
    hero/page.tsx             ← Hero content editor
    about/page.tsx            ← About section editor
    menu/page.tsx             ← Menu CRUD with drag reorder
    testimonials/page.tsx     ← Testimonial CRUD
    gallery/page.tsx          ← Image gallery with upload + drag reorder
    contact/page.tsx          ← Contact info editor
```

### Auth Flow
1. Server Component layout `(protected)/layout.tsx` checks `session.isLoggedIn`
2. If not logged in → `redirect({ href: '/admin/login', locale })`
3. Login page at `(auth)/login/` has NO guard — it's the entry point
4. Login submits POST `/api/admin/login` with `{ username, password }`
5. On success → session cookie set, redirect to `/admin/dashboard`
6. Rate limiting: 5 attempts per IP within 15 minutes

### Layout Components
- **Desktop**: Fixed sidebar (64) + scrollable content area
- **Mobile**: `AdminTopbar` with hamburger → Sheet drawer sidebar
- Sidebar: 48px items, rose gold active border, LanguageToggle, Logout button

---

## Content Management

### Hero Section (`/admin/hero`)
Stored in `siteSettings.heroContent` (nested object in single document).

Fields:
| Field | Type | RTL |
|---|---|---|
| `heading_en` | Textarea | No |
| `heading_ar` | Textarea | Yes — `dir="rtl"` |
| `subheading_en` | Textarea | No |
| `subheading_ar` | Textarea | Yes — `dir="rtl"` |
| `ctaLabel_en` | Input | No |
| `ctaLabel_ar` | Input | Yes — `dir="rtl"` |
| `imageUrl` | ImageUploadField | — |

### Menu Items (`/admin/menu`)
Separate `menuItems` table with full CRUD + drag reorder.

Features:
- Category filter tabs (All, Cakes, Pastries, Cookies, Seasonal)
- Drag-to-reorder using `@dnd-kit/sortable` ← uses mutation `reorderMenuItems({ orderedIds })`
- Inline Switch for availability toggle
- Edit/Delete in Dialog
- Form fields in Dialog:
  - `name_en`, `name_ar` (Input, Arabic has `dir="rtl"`)
  - `description_en`, `description_ar` (Textarea, Arabic `dir="rtl"`)
  - `price` (number Input)
  - `category` (Select dropdown)
  - `isAvailable` (Switch)
- `ImageUploadField` for optional image

### Testimonials (`/admin/testimonials`)
Separate `testimonials` table with visibility toggle.

Features:
- Star rating picker (click 1-5 stars)
- `isVisible` Switch → controls display on public site
- Bilingual quotes: `quote_en`, `quote_ar` (Arabic `dir="rtl"`)

### Gallery (`/admin/gallery`)
Image storage via Convex file storage.

Upload Flow:
1. Click "Add Photos" → Dialog opens
2. Choose files (`input[multiple]`, validates type + 5MB)
3. Each file uploaded via:
   - `generateUploadUrl` mutation → get upload URL
   - XHR PUT to URL (with progress tracking)
   - `saveGalleryImageFromStorage` mutation → stores URL + storageId
4. Images appear in grid with drag reorder
5. Hover shows delete button + drag handle

**IMPORTANT:** Always use `saveGalleryImageFromStorage`, NOT `addGalleryImage` for storage uploads. See `BUG_FIXES_REGISTRY.md` Bug #1.

### Contact Info (`/admin/contact`)
Stored in `siteSettings.contactInfo` (nested object).

Fields:
- phone, email, instagram (optional), bookingUrl (optional)
- address_en, address_ar (Arabic `dir="rtl"`)

### About Section (`/admin/about`)
- Requires `SectionEditorShell` integration (reusable save/cancel bar)
- Skills array managed as text badges

---

## Fixed Credential Auth

### Environment Variables
```env
ADMIN_USERNAME=chef_amira
ADMIN_PASSWORD_HASH=<generated via: npm run generate-password>
SESSION_SECRET=<min 32 chars random string>
```

### Password Setup
```bash
npm run generate-password
# Prompts for password → prints bcrypt hash (rounds=12)
# Paste hash into ADMIN_PASSWORD_HASH in .env.local
```

### Session Handling
- Cookie: `chef_admin_session`, 7-day expiry
- `httpOnly`, `secure` (production), `sameSite: lax`
- Destroyed on logout: `session.destroy()` + redirect to `/admin/login`
- `SessionData` type: `{ isLoggedIn: boolean; username: string }`

---

## RTL Input Handling in Admin

Every Arabic text input in admin editors MUST have:
```tsx
<Input dir="rtl" className="text-right" />
<Textarea dir="rtl" className="text-right" />
```

Currently present in: Hero editor, Menu editor, Testimonials editor, Gallery dialog, Contact editor.

If adding a new bilingual field, always add both English and Arabic inputs with `dir="rtl"` on Arabic.

---

## Editor Save Pattern

The `SectionEditorShell` wrapper provides:
- Sticky bottom save/cancel bar
- `beforeunload` listener when `hasUnsaved` is true
- "View on Site" link
- Breadcrumb navigation back

Usage:
```tsx
<SectionEditorShell
  title="Section Title"
  breadcrumb="Dashboard"
  onSave={handleSave}
  isSaving={saving}
  hasUnsaved={!!hasUnsaved}
  viewSiteHref="/"
>
  <Card>...</Card>
</SectionEditorShell>
```

---

## Data Model Summary

| Table | Key Fields | Admin Page |
|---|---|---|
| `siteSettings` | `heroContent`, `aboutContent`, `contactInfo` (all nested objects) | hero, about, contact |
| `menuItems` | `name_en/ar`, `description_en/ar`, `price`, `category`, `isAvailable`, `order` | menu |
| `testimonials` | `quote_en/ar`, `customerName`, `rating`, `isVisible` | testimonials |
| `gallery` | `url`(nullable), `storageId`(nullable), `caption_en/ar`, `order` | gallery |

All tables except `siteSettings` use individual documents with `createdAt: number()`.
