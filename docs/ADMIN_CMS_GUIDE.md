# ADMIN CMS GUIDE

**Last Updated:** 2026-06-23 (Clerk auth documentation; Projects + Locations editors added)

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
    services/page.tsx         ← Services CRUD (consulting business model)
    gallery/page.tsx          ← Image gallery with upload + drag reorder
    contact/page.tsx          ← Contact info editor
```

### Auth Flow (Clerk)
1. `src/proxy.ts` uses `clerkMiddleware` to protect `/admin(.*)` routes — unauthenticated visitors redirected to Clerk sign-in
2. Layout `(protected)/layout.tsx` adds defense-in-depth via `auth()` from `@clerk/nextjs/server` — checks `userId` and `sessionClaims.email` against `ADMIN_EMAIL`
3. Login page at `(auth)/login/[[...rest]]/` renders Clerk's `<SignIn />` component — handles authentication, MFA, password reset, social login
4. Convex mutations enforce auth server-side via `requireAdmin(ctx)` using `ctx.auth.getUserIdentity()` — no admin token needed
5. Logout via `useClerk().signOut()` — redirects to home page
6. Rate limiting: Convex-persisted, 5 login attempts per 15 minutes per email

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

**IMPORTANT:** Always use `saveGalleryImageFromStorage` for gallery uploads. The legacy `addGalleryImage` mutation that previously accepted `url:""` has been removed entirely (see `BUG_FIXES_REGISTRY.md` Bug #1).

### Services (`/admin/services`)
Separate `services` table with three categories reflecting Chef Mohamed's consulting business model.

**Categories (chef-friendly labels):**
| Schema value | Admin label | Usage |
|---|---|---|
| `artisanal` | Artisanal Baking | Baking services (croissants, sourdough, pastries) |
| `consulting` | Consulting | Menu development, QA systems, production optimization |
| `training` | Training | Team workshops, one-on-one coaching |

**List View:** Sortable cards (drag handle + emoji icon + name + description preview + category badge + visibility switch + edit/delete). Category filter tabs above the list.

**Form Fields in Dialog:**
- Service Type (Select — Artisanal Baking / Consulting / Training)
- Service Name — English (Input, required)
- اسم الخدمة — العربية (Input, `dir="rtl"`, optional — defaults to NEEDS_PROFESSIONAL_TRANSLATION)
- What this includes — English (Textarea, 500 char max, required)
- تفاصيل الخدمة — العربية (Textarea, `dir="rtl"`, 500 char max, optional)
- Emoji Icon (Input + picker strip of 12 common bakery emojis, preview box)
- Show on website? (Switch)

**Validation:** English name + description required. Arabic fields fall back to "NEEDS_PROFESSIONAL_TRANSLATION" placeholder.

**Data Model:**
| Field | Type | Notes |
|---|---|---|
| `category` | union: artisanal / consulting / training | Drives filter tabs and display grouping |
| `name_en` / `name_ar` | string | Bilingual |
| `description_en` / `description_ar` | string | Bilingual |
| `icon` | nullable string | Emoji character, stored as-is |
| `isVisible` | boolean | Controls public display |
| `order` | number | Set via drag reorder |

### Contact Info (`/admin/contact`)
Stored in `siteSettings.contactInfo` (nested object).

Fields:
- phone, email, instagram (optional), bookingUrl (optional)
- address_en, address_ar (Arabic `dir="rtl"`)

### About Section (`/admin/about`)
Stored in `siteSettings.aboutContent` (nested object in single document).

Fields:
| Field | Type | RTL |
|---|---|---|
| `heading_en` | Input | No |
| `heading_ar` | Input | Yes — `dir="rtl"` |
| `bio_en` | Textarea | No |
| `bio_ar` | Textarea | Yes — `dir="rtl"` |
| `imageUrl` | ImageUploadField | — |
| `skills` | Badge editor (add/remove via input + Enter) | — |

- Wrapped in `<SectionEditorShell>` (sticky save bar + unsaved-change guard)
- Skills array managed as text badges with `X` to remove; Enter in the input adds
- Image upload uses the shared `ImageUploadField` which resolves storageId → URL via the `getStorageUrl` mutation before passing the URL up

---

### Projects / Career (`/admin/projects`)
Separate `projects` table with full CRUD + drag reorder.

**Categories (career stages):**
| Schema value | Admin label | Usage |
|---|---|---|
| `early` | Early Career | Bench assistant, junior roles |
| `specialization` | Specialization | Focus on pastry, baking, fermentation |
| `leadership` | Leadership | Head chef, team lead roles |
| `founder` | Founded from Scratch | Own bakery/business launches |
| `international` | International | Work outside Egypt |

**Form Fields in Dialog:**
- `role_en`, `role_ar` (Input, Arabic `dir="rtl"`)
- `workplace_en`, `workplace_ar` (Input, Arabic `dir="rtl"`)
- `location_en`, `location_ar` (Input, Arabic `dir="rtl"`)
- `description_en`, `description_ar` (Textarea, Arabic `dir="rtl"`)
- Career Stage (Select — Early / Specialization / Leadership / Founded from Scratch / International)
- `isHighlight` (Switch — Featured badge)
- `imageUrl` (ImageUploadField)
- Dates: `startDate`, `endDate` (Input type=month)

### Locations / Service Areas (`/admin/locations`)
Separate `locations` table with CRUD.

**Form Fields in Dialog:**
- `name_en`, `name_ar` (Input, Arabic `dir="rtl"`)
- Region (Select — Cairo / International)
- `neighborhoods` (Input — comma-separated list)
- `markerIcon` (Input + emoji picker)

---

## Clerk Auth

### Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_FRONTEND_API_URL=https://<your-clerk-instance>.clerk.accounts.dev
ADMIN_EMAIL=your-email@example.com
```

### Login
1. Visit `/en/admin/login` or `/ar/admin/login`
2. Clerk's `<SignIn />` component renders the auth UI — sign in with the email matching `ADMIN_EMAIL`
3. On success → redirect to `/admin/dashboard`

### Logout
Click "Logout" in the admin sidebar — calls `useClerk().signOut()` which destroys the Clerk session and redirects to the home page.

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
| `services` | `name_en/ar`, `description_en/ar`, `category`, `icon`, `isVisible`, `order` | services |
| `gallery` | `url`(nullable), `storageId`(nullable), `caption_en/ar`, `order` | gallery |

All tables except `siteSettings` use individual documents with `createdAt: number()`.

---

## First-Run Content Seeding

A non-technical operator should be able to bring up a brand-new deployment with realistic example content in one step.

### Mutation
`mutations:seedBakeryContent` (defined in `convex/mutations.ts`).

### How to run

**Terminal:**
```bash
npx convex run mutations:seedBakeryContent
```

**Convex Dashboard:**
1. Open the project's dashboard
2. **Functions** → `mutations` → `seedBakeryContent`
3. Click **Run Function** (no arguments needed)

### What it does (idempotent)

| Table | Behavior |
|---|---|
| `siteSettings` | Insert hero + about + contact ONLY if no document with `key="main"` exists. Existing edits are never overwritten. |
| `menuItems` | Insert 8 example bakery items ONLY if the table is empty. |
| `testimonials` | Insert 3 example reviews ONLY if the table is empty. |
| `gallery` | **Skipped on purpose.** Real bakery photos must be uploaded via Admin → Photo Gallery so they live in Convex storage. |

The mutation returns a summary object so the operator can verify what was inserted vs. left alone.

### Why the seed exists

Chef Mohamed logging into a brand-new deployment with empty hero text and zero menu items has no idea what to do. Seeding lets him edit *example* content (replace the headline, change a menu item) — which is much less intimidating than authoring everything from scratch.

After the seed runs, point him to `/admin/dashboard` and tell him: "Everything you see on the public site can be changed from here. Click any card to edit that part."

---

## Plain-Language Admin Patterns

These are the names Chef Mohamed sees in the admin nav and editors. They map to internal/dev terms as follows:

| User sees (admin nav) | Internal term | Why the rename |
|---|---|---|
| "Homepage Welcome" | hero / heroContent | A baker doesn't know what a "hero section" is |
| "About Me" | aboutContent | Owns the section emotionally |
| "Customer Reviews" | testimonials | "Testimonial" is corporate jargon |
| "Photo Gallery" | gallery | Specifies it's photos, not video/etc. |
| "Contact Info" | contactInfo | Clear and short |

| User sees (editor field) | Internal term | Why the rename |
|---|---|---|
| "Big welcome message" | heading_en/ar | Describes what it visually IS |
| "Short description" | subheading_en/ar | Tells the user about length expectations |
| "Button text" | ctaLabel_en/ar | "CTA" is acronym-speak |
| "Your Story" | bio_en/ar | "Bio" feels clinical for a baker |
| "What you do best" | skills | More verb-driven, less résumé-like |

If adding a new field, name it for the baker's mental model — not the database column name. See PROJECT_RULES Rule 14a.

---

## Canonical Chef-Friendly Field Labels

The table below is the **single source of truth** for admin editor labels. Every `Label` element rendered inside an admin editor MUST use the English label from this table. Arabic labels are stored in translation files under `admin.fields.*`.

Source: `CHEF_PROFILE.md` Section 7 — reviewed and approved by Chef Mohamed.

### Section-Level Nav Labels

| Convex Schema Key | Admin Nav Label (EN) | Admin Nav Label (AR) |
|---|---|---|
| `heroContent` | Homepage Welcome | الترحيب في الرئيسية |
| `aboutContent` | About Me / My Story | عني / قصتي |
| `projects` | My Work Experience | خبراتي العملية |
| `menuItems` | My Menu Items | قائمتي |
| `testimonials` | Customer Reviews | تقييمات العملاء |
| `services` | Services | الخدمات |
| `gallery` | My Work Photos | صور أعمالي |
| `locations` | Service Areas | مناطق الخدمة |
| `contactInfo` | Contact Info | معلومات التواصل |

### Field-Level Editor Labels

| Convex Field | Chef-Friendly Label (EN) | Chef-Friendly Label (AR) |
|---|---|---|
| `heading_en` | Main Title (English) | العنوان الرئيسي (إنجليزي) |
| `heading_ar` | العنوان الرئيسي (عربي) | العنوان الرئيسي (عربي) |
| `subheading_en` | Short Description (English) | وصف قصير (إنجليزي) |
| `subheading_ar` | Short Description (Arabic) | وصف قصير (عربي) |
| `bio_en` | Your Story (English) | قصتك (إنجليزي) |
| `bio_ar` | قصتك (عربي) | قصتك (عربي) |
| `ctaLabel_en` | Button Text (English) | نص الزر (إنجليزي) |
| `ctaLabel_ar` | Button Text (Arabic) | نص الزر (عربي) |
| `price` | Price | السعر |
| `isAvailable` | Currently making this? | متوفر الآن؟ |
| `isVisible` | Show on website? | إظهار على الموقع؟ |
| `order` | Position (lower = first) | الترتيب (الأقل = الأول) |
| `imageUrl` | Photo of this item | صورة العنصر |
| `name_en` | Item Name (English) | اسم العنصر (إنجليزي) |
| `name_ar` | Item Name (Arabic) | اسم العنصر (عربي) |
| `description_en` | Description (English) | الوصف (إنجليزي) |
| `description_ar` | Description (Arabic) | الوصف (عربي) |
| `category` | Category | التصنيف |
| `customerName` | Customer Name | اسم العميل |
| `quote_en` | What they said (English) | رأيهم (إنجليزي) |
| `quote_ar` | What they said (Arabic) | رأيهم (عربي) |
| `rating` | Stars (1 to 5) | التقييم (١-٥) |
| `phone` | Phone Number | رقم الهاتف |
| `email` | Email | البريد الإلكتروني |
| `instagram` | Instagram Handle (without @) | معرف إنستغرام (بدون @) |
| `bookingUrl` | Catering / Booking Link | رابط الحجز |
| `address_en` | Bakery Address (English) | عنوان المخبز (إنجليزي) |
| `address_ar` | Bakery Address (Arabic) | عنوان المخبز (عربي) |
| `skills` | What you do best | مهاراتك |
| `education_en` | Education (English) | التعليم (إنجليزي) |
| `education_ar` | التعليم (عربي) | التعليم (عربي) |
| `caption_en` | Photo Caption (English) | تعليق الصورة (إنجليزي) |
| `caption_ar` | Photo Caption (Arabic) | تعليق الصورة (عربي) |
| `storageId` | (not user-facing — auto-managed) | — |
| `role_en` | Your Role (English) | دورك (إنجليزي) |
| `role_ar` | دورك (عربي) | دورك (عربي) |
| `workplace_en` | Workplace (English) | مكان العمل (إنجليزي) |
| `workplace_ar` | مكان العمل (عربي) | مكان العمل (عربي) |
| `location_en` | Location (English) | الموقع (إنجليزي) |
| `location_ar` | الموقع (عربي) | الموقع (عربي) |
| `description_en` | What you did there (English) | ماذا فعلت هناك (إنجليزي) |
| `description_ar` | ماذا فعلت هناك (عربي) | ماذا فعلت هناك (عربي) |
| `category` (projects) | Career Stage | مرحلة المسيرة |
| `isHighlight` | Featured (show badge) | مميز (إظهار شارة) |
| `name_en` (locations) | Location Name (English) | اسم الموقع (إنجليزي) |
| `name_ar` (locations) | اسم الموقع (عربي) | اسم الموقع (عربي) |
| `region` | Region | المنطقة |
| `neighborhoods` | Neighborhoods (comma-separated) | الأحياء (مفصولة بفاصلة) |
| `markerIcon` | Icon (emoji) | الأيقونة (إيموجي) |
| `requestTypes` | Contact Form Options | خيارات نموذج التواصل |
| `businessHours` | Business Hours Note | ملاحظة ساعات العمل |
| `whatsapp` | WhatsApp Link | رابط واتساب |
| `responseTime_en` | Response Time (English) | وقت الاستجابة (إنجليزي) |
| `responseTime_ar` | وقت الاستجابة (عربي) | وقت الاستجابة (عربي) |
| `secondaryPhone` | Secondary Phone | هاتف ثانوي |

**Rule:** When adding a new field to any admin editor, look up its Convex field name in the table above. Use the English label verbatim. Never invent a new label without adding it to this table first.

---

## Arabic Labels — Live as of 2026-06-23

All Arabic (`locale=ar`) labels in the admin panel are **now live**. Professional translations imported from `arabic-translations.json`.

| Admin Section | Arabic Nav Label | Status |
|---|---|---|
| Dashboard | لوحة التحكم | ✅ Live |
| Hero | ترحيب الصفحة الرئيسية | ✅ Live |
| About | عني | ✅ Live |
| Projects / Career | خبراتي العملية | ✅ Live |
| Menu Items | عناصر القائمة | ✅ Live |
| Services | الخدمات | ✅ Live |
| Testimonials | آراء العملاء | ✅ Live |
| Gallery | معرض الصور | ✅ Live |
| Locations | مناطق الخدمة | ✅ Live |
| Contact | بيانات التواصل | ✅ Live |

**Projects editor field labels** (`admin.fields.*`) are now translated for all EN/AR bilingual pairs: role, workplace, location, description, career stage selector, and highlight badge toggle.

**Drag-reorder tooltip** (`admin.actions.dragReorder = "اسحب لإعادة الترتيب"`) is active in all sortable admin editors.

**BusinessHours component** now has `hours.closed = "مغلق"` and full `days.*` (7 keys) for Arabic rendering of the Contact section business hours grid.

**Source:** `arabic-translations.json` (professional translator delivery) merged into `src/i18n/messages/ar.json`.
