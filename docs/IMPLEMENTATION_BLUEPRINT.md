# IMPLEMENTATION BLUEPRINT — Chef Mohamed Mamdouh Portfolio CMS

**Author:** Principal Full-Stack Architect & Business Analyst
**Date:** 2026-06-22
**Status:** ACTIVE (Phase 1-3 complete; Arabic translations complete 2026-06-23)
**Source of Truth:** `docs/CHEF_PROFILE.md` (derived from Mohamed Mamdouh Mohamed's CV)

---

## Executive Summary

This blueprint bridges the gap between Chef Mohamed's business requirements (French Bakery Consultant portfolio with 9 services, 7 workplace experiences, Cairo base + international reach) and the existing Convex/Next.js codebase. It identifies what EXISTS vs. what's MISSING, then provides the exact implementation plan for each layer.

### What Already Exists
- ✅ Convex schema with 9 tables: `siteSettings`, `menuItems`, `testimonials`, `services`, `gallery`, `projects`, `locations`, `contactInquiries`, `rateLimitEntries`
- ✅ Full CRUD mutations for all tables
- ✅ Clerk auth with three-layer security (middleware, layout guard, Convex requireAdmin)
- ✅ Admin dashboard with 11 editors (hero, about, projects, menu, services, testimonials, gallery, locations, contact, inbox, settings)
- ✅ Public sections: Hero, About, Projects, Menu, Services, Testimonials, Gallery, Locations, Contact, CTA
- ✅ Bilingual EN/AR with RTL support via next-intl v4
- ✅ Professional Arabic translations imported (all 215 i18n keys, seed data)

### What's Missing (Gaps to Close) — All Addressed
1. ~~`projects` table~~ — ✅ Added (9 seeded entries)
2. ~~`locations` table~~ — ✅ Added (2 seeded entries)
3. ~~`siteSettings` extensions~~ — ✅ Added `requestTypes`, `businessHours`, `statsBadges`
4. ~~Projects admin editor~~ — ✅ Complete with full CRUD + drag reorder
5. ~~Projects public section~~ — ✅ `ProjectsSection.tsx` rendering card grid
6. ~~Contact section enhancements~~ — ✅ WhatsApp CTA, Response Time badge, dynamic Request Types
7. ~~Hero stats badges~~ — ✅ Displayed in Hero section
8. ~~SEO metadata~~ — ✅ Brand name fixed (Bug #15)

---

## STEP 1: CONVEX SCHEMA DESIGN

### 1A. New Table: `projects`

Work experience entries displayed as cards on the public portfolio. Each card shows role, workplace, location, description, and optional image/logo.

```ts
// convex/schema.ts — ADD to existing schema
projects: defineTable({
  role_en: v.string(),                          // "Head Chef"
  role_ar: v.string(),                          // "شيف رئيسي"
  workplace_en: v.string(),                     // "Fornalia Bakery"
  workplace_ar: v.string(),                     // "مخبز فورناليا"
  location_en: v.string(),                      // "Fifth Settlement, Cairo"
  location_ar: v.string(),                      // "التجمع الخامس، القاهرة"
  description_en: v.string(),                   // Brief role description (2-3 sentences)
  description_ar: v.string(),
  imageUrl: v.nullable(v.string()),             // Workplace logo or bakery photo
  category: v.union(
    v.literal("early"),                         // Ralph's Cafe (entry-level)
    v.literal("specialization"),                 // Croissant & Sourdough kitchen, Richius, Life Snacks
    v.literal("leadership"),                     // The Daily Need, Fornalia Bakery
    v.literal("founder"),                        // Nabit Bakery, Rotoo Bakery (opened from scratch)
    v.literal("international"),                  // KUP Saudi Arabia
  ),
  order: v.number(),                            // Display order (drag-to-reorder)
  isVisible: v.boolean(),                       // Show/hide on public site
  isHighlight: v.optional(v.boolean()),         // Featured badge (e.g., "Founded from scratch")
  createdAt: v.number(),
})
  .index("by_order", ["order"])
  .index("by_visible", ["isVisible"])
  .index("by_category", ["category"]),
```

**Seed data (8 entries from CHEF_PROFILE.md §2 timeline):**

| # | workplace_en | role_en | location_en | category | isHighlight |
|---|---|---|---|---|---|
| 1 | Ralph's Cafe | Chef Assistant | Maadi, Cairo | early | false |
| 2 | Croissant & Sourdough Kitchen | Chef — Croissant & Sourdough | Cairo | specialization | false |
| 3 | Richius (Maadi Residences) | Chef — Sourdough | Maadi, Cairo | specialization | false |
| 4 | Life Snacks | Chef — Sourdough | Cairo | specialization | false |
| 5 | The Daily Need | Assistant Head Chef | Industrial Zone, Fifth Settlement | leadership | false |
| 6 | Fornalia Bakery | Head Chef | Industrial Zone, Fifth Settlement | leadership | false |
| 7 | Nabit Bakery | Head Chef (Founded from Scratch) | Gardenia Zahraa Compound, Nasr City | founder | true |
| 8 | Rotoo Bakery | Head Chef (Founded from Scratch) | Cairo | founder | true |
| 9 | KUP Saudi Arabia | Consultant Bakery Chef | Kingdom of Saudi Arabia | international | true |

### 1B. New Table: `locations`

Geographic markers for the portfolio. Used to display Cairo base + international experience.

```ts
// convex/schema.ts — ADD to existing schema
locations: defineTable({
  name_en: v.string(),                          // "Greater Cairo"
  name_ar: v.string(),                          // "القاهرة الكبرى"
  region: v.union(
    v.literal("cairo"),                          // Cairo neighborhoods
    v.literal("international"),                  // International locations
  ),
  neighborhoods: v.array(v.string()),           // ["Maadi", "Fifth Settlement", "Nasr City"]
  neighborhoods_ar: v.array(v.string()),        // ["المعادي", "التجمع الخامس", "مدينة نصر"]
  markerIcon: v.string(),                       // Emoji or icon identifier
  order: v.number(),
  isVisible: v.boolean(),
  createdAt: v.number(),
})
  .index("by_order", ["order"]),
```

**Seed data:**

| name_en | region | neighborhoods | markerIcon |
|---|---|---|---|
| Greater Cairo | cairo | Maadi, Fifth Settlement, Nasr City, October City | 📍 |
| Kingdom of Saudi Arabia | international | — | 🌍 |

### 1C. Extend `siteSettings` Schema

Add missing fields to the existing `siteSettings` document.

```ts
// convex/schema.ts — EXTEND siteSettings.contactInfo
contactInfo: v.object({
  // ... existing fields ...
  phone: v.string(),
  email: v.string(),
  instagram: v.nullable(v.string()),
  address_en: v.string(),
  address_ar: v.string(),
  bookingUrl: v.nullable(v.string()),
  whatsapp: v.nullable(v.string()),
  responseTime_en: v.nullable(v.string()),
  responseTime_ar: v.nullable(v.string()),
  secondaryPhone: v.nullable(v.string()),

  // NEW fields:
  requestTypes: v.optional(v.array(v.object({
    value: v.string(),                          // "consulting"
    label_en: v.string(),                       // "Bakery Consulting"
    label_ar: v.string(),                       // "استشارات مخبوزات"
  }))),
  businessHours: v.optional(v.object({
    note_en: v.string(),                        // "Available for consultations and custom orders"
    note_ar: v.string(),
  })),
}),

// EXTEND siteSettings.aboutContent
aboutContent: v.object({
  // ... existing fields ...
  heading_en: v.string(),
  heading_ar: v.string(),
  bio_en: v.string(),
  bio_ar: v.string(),
  imageUrl: v.nullable(v.string()),
  skills: v.array(v.string()),
  stats: v.optional(v.array(v.string())),
  tagline_en: v.optional(v.nullable(v.string())),
  tagline_ar: v.optional(v.nullable(v.string())),

  // NEW fields:
  education_en: v.optional(v.nullable(v.string())),  // "Technical Diploma in Industrial Studies — Mesta (2012–2016)"
  education_ar: v.optional(v.nullable(v.string())),
}),
```

### 1D. Schema Summary — Complete Table Inventory

| Table | Purpose | Seed Count | CRUD Admin Page |
|---|---|---|---|
| `siteSettings` | Hero, About, Contact (singleton) | 1 doc | hero, about, contact |
| `projects` | Work experience cards | 9 entries | **NEW: projects** |
| `services` | 9 services across 3 categories | 9 entries | services |
| `menuItems` | Bakery products | 2 entries | menu |
| `testimonials` | Customer quotes | 3 placeholders | testimonials |
| `gallery` | Photo gallery | 0 (upload via admin) | gallery |
| `locations` | Geographic markers | 2 entries | **NEW: locations** |
| `contactInquiries` | Form submissions | 0 | inbox view |
| `rateLimitEntries` | Login rate limiting | 0 | system |

---

## STEP 2: AUTHENTICATION & SECURITY (CLERK SINGLE-ADMIN)

### Current State (Already Implemented)
The project uses Clerk for authentication with a three-layer security architecture. See `TECH_STACK_PATTERNS.md` for the authoritative patterns.

### Three-Layer Security Architecture

```
Layer 1: Clerk Middleware (Route Protection)
  └─ src/proxy.ts (Next.js 16)
     └─ clerkMiddleware() protects /admin(.*) routes
     └─ auth.protect() redirects unauthenticated users to Clerk sign-in

Layer 2: Layout Guard (Defense-in-Depth)
  └─ src/app/[locale]/admin/(protected)/layout.tsx
     └─ auth() from @clerk/nextjs/server checks userId + ADMIN_EMAIL
     └─ Redirects to /admin/login or /admin/unauthorized

Layer 3: Convex requireAdmin (Mutation Protection)
  └─ convex/auth.ts
     └─ requireAdmin(ctx) verifies Clerk identity via ctx.auth.getUserIdentity()
     └─ Enforces single admin email against ADMIN_EMAIL
     └─ Called as first line in EVERY write mutation
```

### Single-Admin Enforcement Rules

```ts
// convex/auth.ts — SINGLE SOURCE OF TRUTH for Convex auth
import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";

export async function requireAdmin(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("Unauthorized: Not authenticated");
  }

  const email = identity.email;
  if (email !== process.env.ADMIN_EMAIL) {
    throw new ConvexError("Unauthorized: Not the designated admin");
  }

  return { userId: identity.subject, email };
}
```

### Environment Variables Required

```bash
# .env.local — Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<YOUR_PK_TEST_KEY>
CLERK_SECRET_KEY=<YOUR_SK_TEST_KEY>
CLERK_FRONTEND_API_URL=https://<instance>.clerk.accounts.dev
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Convex
NEXT_PUBLIC_CONVEX_URL=https://<project>.convex.cloud
```

### Convex Auth Config
```ts
// convex/auth.config.ts
export default {
  providers: [
    { domain: process.env.CLERK_FRONTEND_API_URL!, applicationID: "convex" },
  ],
};
```

### Security Checklist
- [x] No public signup — Clerk Dashboard limits signups
- [x] Layout guard checks userId + email before rendering admin pages
- [x] Convex mutations validated via requireAdmin() with Clerk identity
- [x] Public site remains completely unauthenticated
- [x] Rate limiting: 5 login attempts per 15 minutes (Convex-persisted)
- [x] All write mutations protected at three independent layers

---

## STEP 3: ADMIN DASHBOARD ARCHITECTURE

### 3A. Complete Editor Inventory

| Admin Page | Route | Schema Target | Mutations |
|---|---|---|---|
| Dashboard | `/admin/dashboard` | Read-only stats | `getDashboardStats` |
| Homepage Welcome | `/admin/hero` | `siteSettings.heroContent` | `updateHeroContent` |
| About Me | `/admin/about` | `siteSettings.aboutContent` | `updateAboutContent` |
| My Projects | `/admin/projects` | `projects` table | **NEW: createProject, updateProject, deleteProject, reorderProjects** |
| My Menu | `/admin/menu` | `menuItems` table | `createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems` |
| My Services | `/admin/services` | `services` table | `createService, updateService, deleteService, reorderServices` |
| Customer Reviews | `/admin/testimonials` | `testimonials` table | `createTestimonial, updateTestimonial, deleteTestimonial` |
| Photo Gallery | `/admin/gallery` | `gallery` table | `saveGalleryImageFromStorage, deleteGalleryImage, reorderGallery` |
| Contact Info | `/admin/contact` | `siteSettings.contactInfo` | `updateContactInfo` |
| Locations | `/admin/locations` | `locations` table | **NEW: createLocation, updateLocation, deleteLocation, reorderLocations** |
| Inbox | `/admin/inbox` | `contactInquiries` table | `markInquiryRead` |

### 3B. Projects Editor — NEW

**Route:** `/admin/projects`

**List View:**
- Card-based layout (not table) — each card shows: workplace name, role, location, category badge, visibility switch, edit/delete buttons
- Category filter tabs: All, Early Career, Specialization, Leadership, Founded, International
- Drag-to-reorder via `@dnd-kit/sortable`
- Add Project button → Dialog opens

**Form Fields in Dialog:**

| Field | Input Type | RTL | Required |
|---|---|---|---|
| Role — English | Input | No | Yes |
| الدور — العربية | Input | Yes | No (defaults to NEEDS_TRANSLATION) |
| Workplace — English | Input | No | Yes |
| مكان العمل — العربية | Input | Yes | No |
| Location — English | Input | No | Yes |
| الموقع — العربية | Input | Yes | No |
| Description — English | Textarea | No | Yes |
| الوصف — العربية | Textarea | Yes | No |
| Career Stage | Select (Early/Specialization/Leadership/Founded/International) | No | Yes |
| Photo of this workplace | ImageUploadField | — | No |
| Show on website? | Switch | — | Yes |
| Featured badge | Switch | — | No |

**Chef-Friendly Labels (Rule 14d):**

| Convex Field | Label (EN) | Label (AR) |
|---|---|---|
| `role_en` | Your Role (English) | دورك (إنجليزي) |
| `role_ar` | دورك (عربي) | دورك (عربي) |
| `workplace_en` | Workplace (English) | مكان العمل (إنجليزي) |
| `workplace_ar` | مكان العمل (عربي) | مكان العمل (عربي) |
| `location_en` | Location (English) | الموقع (إنجليزي) |
| `location_ar` | الموقع (عربي) | الموقع (عربي) |
| `description_en` | What you did there (English) | ماذا فعلت هناك (إنجليزي) |
| `description_ar` | ماذا فعلت هناك (عربي) | ماذا فعلت هناك (عربي) |
| `category` | Career Stage | مرحلة المسيرة |
| `isHighlight` | Featured (show badge) | مميز (إظهار شارة) |

### 3C. Locations Editor — NEW

**Route:** `/admin/locations`

**List View:**
- Simple card list with drag-to-reorder
- Each card: name, region badge, neighborhood tags, visibility switch

**Form Fields:**

| Field | Input Type | RTL |
|---|---|---|
| Location Name — English | Input | No |
| اسم الموقع — العربية | Input | Yes |
| Region | Select (Cairo / International) | No |
| Neighborhoods (English) | Tag input (comma-separated or Enter-to-add) | No |
| أحياء (العربية) | Tag input, dir="rtl" | Yes |
| Icon | Emoji picker or text input | No |
| Show on website? | Switch | — |

### 3D. Enhanced Contact Editor

**Extend existing `/admin/contact` with new fields:**

| New Field | Input Type | Notes |
|---|---|---|
| Request Type Options | Dynamic list editor (add/remove rows) | Each row: value + label_en + label_ar |
| Business Hours Note — English | Textarea | "Available for consultations and custom orders" |
| ملاحظة ساعات العمل — العربية | Textarea, dir="rtl" | Arabic translation |

### 3E. Admin Editor Checklist (Every Editor Must Follow)

Per PROJECT_RULES.md Rule 14:

1. `useQuery` the source data, `useMutation` the updater
2. Wrap in `<SectionEditorShell>` (save/cancel bar, unsaved-change guard, view-on-site link)
3. Bilingual fields — English input + Arabic input with `dir="rtl"` and `text-right`
4. Cover every editable schema field
5. `<ImageUploadField>` for nullable `imageUrl` fields
6. `loaded`-flag pattern to seed form state once on query resolve
7. `hasUnsaved` boolean comparing local state to query result
8. `toast.success` / `toast.error` from `sonner` after mutation resolves
9. Plain-language labels matching canonical table in ADMIN_CMS_GUIDE.md

---

## STEP 4: PUBLIC PORTFOLIO RENDERING

### 4A. Page Component Structure

```
src/app/[locale]/
  (site)/
    layout.tsx              ← Header + Footer
    page.tsx                ← Home (Hero + About snippet + Services preview + CTA)
    about/page.tsx          ← Full About + Projects/Experience
    services/page.tsx       ← All 9 services by category
    menu/page.tsx           ← Bakery menu items
    contact/page.tsx        ← Contact form + WhatsApp CTA + Business hours
    gallery/page.tsx        ← Photo gallery
  admin/
    (auth)/login/page.tsx
    (protected)/
      layout.tsx            ← AdminSidebar + AdminTopbar
      dashboard/page.tsx    ← Stats + quick actions
      hero/page.tsx
      about/page.tsx
      projects/page.tsx     ← NEW
      menu/page.tsx
      services/page.tsx
      testimonials/page.tsx
      gallery/page.tsx
      contact/page.tsx
      locations/page.tsx    ← NEW
      inbox/page.tsx
```

### 4B. Public Component Mapping (Section → Schema → Component)

| Section | Schema Source | Component | Route |
|---|---|---|---|
| Hero | `siteSettings.heroContent` | `HeroSection.tsx` | `/` |
| Hero Stats | `siteSettings.aboutContent.stats[]` | (embedded in HeroSection) | `/` |
| About | `siteSettings.aboutContent` | `AboutSection.tsx` | `/about` |
| Tagline | `siteSettings.aboutContent.tagline_en/ar` | (embedded in HeroSection) | `/` |
| Projects/Experience | `projects` table | **NEW: `ProjectsSection.tsx`** | `/about` |
| Services | `services` table | `ServicesSection.tsx` | `/services` |
| Menu | `menuItems` table | `MenuSection.tsx` | `/menu` |
| Testimonials | `testimonials` table | `TestimonialsSection.tsx` | `/` (or `/about`) |
| Gallery | `gallery` table | `GallerySection.tsx` | `/gallery` |
| Contact | `siteSettings.contactInfo` + `contactInquiries` | `ContactSection.tsx` + `ContactForm.tsx` | `/contact` |
| Locations | `locations` table | **NEW: `LocationsSection.tsx`** | `/about` or `/contact` |
| CTA | Static | `CTABanner.tsx` | `/` |

### 4C. NEW: `ProjectsSection.tsx`

**Display:** Card grid (NOT timeline) showcasing each workplace/consulting gig.

```tsx
// Pattern: Similar to ServicesSection but with category grouping
// Data: useQuery(api.queries.getVisibleProjects)
// Layout: 2-column grid on desktop, 1-column on mobile
// Each card shows: workplace name, role, location, description, category badge
// Featured items (isHighlight=true) get a special badge
// Category filter tabs above the grid
```

**Category Display Labels:**

| Category | EN Label | AR Label |
|---|---|---|
| `early` | Early Career | بداية المسيرة |
| `specialization` | Specialization | التخصص |
| `leadership` | Leadership | القيادة |
| `founder` | Founded from Scratch | تأسيس من الصفر |
| `international` | International | دولي |

### 4D. NEW: `LocationsSection.tsx`

**Display:** Map-style cards or tag cloud showing Cairo base + international experience.

```tsx
// Pattern: Simple card grid
// Each card: marker icon + location name + neighborhood tags
// Cairo locations show neighborhood chips
// International locations show country name
```

### 4E. Hero Section Enhancement

The Hero should display:
1. **Heading:** "Slow Bread, French Pastry,\nTen Years at the Bench"
2. **Subheading:** "Sourdough, croissants, and a blend of tradition with modern technique — by Chef Mohamed."
3. **CTA Button:** "Explore the Menu"
4. **Tagline:** "French Bakery Consultant — Crafting excellence, one bake at a time."
5. **Stats Badges:** 10+ Years Professional | French Specialist | Menu Development | Team Training | Sourdough Expert | Award-Winning

Stats are stored in `aboutContent.stats[]` but should be displayed in the Hero section.

### 4F. Contact Section Enhancement

The Contact section should display:
1. **Form:** Name, Email, Phone (optional), Request Type dropdown, Message
2. **WhatsApp CTA:** Direct link to `contactInfo.whatsapp`
3. **Response Time Badge:** "24 hours guaranteed" from `contactInfo.responseTime_en`
4. **Business Hours Note:** "Available for consultations and custom orders"
5. **Request Type Options:** Dynamic from `contactInfo.requestTypes[]` (fallback to hardcoded list)

### 4G. Bilingual Rendering Rules

```tsx
// EN/AR content selection
const heading = locale === 'ar' ? data.heading_ar : data.heading_en

// RTL handling
<div dir={locale === 'ar' ? 'rtl' : 'ltr'}>

// Arabic fallback for untranslated fields
const displayName = data.name_ar === 'NEEDS_PROFESSIONAL_TRANSLATION'
  ? data.name_en
  : (locale === 'ar' ? data.name_ar : data.name_en)
```

---

## STEP 5: MEMORY BANK UPDATE SUMMARIES

### 5A. PROJECT_RULES.md — Add Rules 33-38

```markdown
## 33. Projects Table is the Source of Truth for Work Experience

Work experience MUST be stored in the `projects` table, NOT woven into the bio text.
The bio can reference projects narrative-style, but structured data lives in `projects`.

**✅ DO:**
- Display projects via `useQuery(api.queries.getVisibleProjects)`
- Each project card shows: role, workplace, location, description, category badge

**❌ DON'T:**
- Do NOT hardcode work history in AboutSection.tsx
- Do NOT create a separate "Experience" component that bypasses the schema
```

## 34. Contact Request Types Come From Schema

The Request Type dropdown in the contact form MUST read from `contactInfo.requestTypes[]`.
Fallback to hardcoded list only if requestTypes is empty or missing.

**✅ DO:**
```tsx
const requestTypes = contactInfo?.requestTypes ?? [
  { value: "consulting", label_en: "Bakery Consulting", label_ar: "استشارات مخبوزات" },
  // ... default fallbacks
]
```

**❌ DON'T:**
- Do NOT hardcode request types in the form component
- Do NOT assume specific request type values exist in the schema
```

## 35. Locations Table for Geographic Display

Geographic information (Cairo base, international experience) MUST be stored in the `locations` table.
The contact address field is for the business address, not a list of service areas.

**✅ DO:**
- Use `locations` table for service area display
- Use `contactInfo.address_en/ar` for the business address only

**❌ DON'T:**
- Do NOT put neighborhood lists in the contact address field
- Do NOT hardcode locations in the public components
```

## 36. Stats Badges Belong in Hero, Not About

`aboutContent.stats[]` is displayed in the Hero section, not buried in the About page.
The About page shows bio + skills + education. Stats are Hero-level visual elements.

**✅ DO:**
- Render `stats[]` in `HeroSection.tsx` as badge chips below the CTA
- Keep `skills[]` in `AboutSection.tsx` as a separate list

**❌ DON'T:**
- Do NOT duplicate stats in both Hero and About
- Do NOT remove stats from aboutContent schema (they're stored there for admin simplicity)
```

## 37. CMS Content Boundaries

The admin CMS controls ONLY content displayed on the public site. It does NOT control:
- Navigation structure (i18n-translated labels in `admin.nav.*`, but routes are hardcoded)
- Route structure (file-system based)
- Theme/colors (OKLCH tokens in globals.css)
- Authentication method (Clerk config via Clerk Dashboard)

**❌ DON'T:**
- Do NOT add "navigation editor" or "theme editor" to the admin
- Do NOT make route structure configurable via database
```

## 38. Single-Admin Enforcement

Only ONE admin account exists. There is no user management, no role system, no multi-tenant support.
The admin identity is enforced at three layers (cookie, Server Action, Convex mutation).

**❌ DON'T:**
- Do NOT add a "users" table or "roles" field
- Do NOT implement invitation flows or admin registration
- Do NOT create middleware that checks for multiple admin emails
```
```

### 5B. TECH_STACK_PATTERNS.md — Add Patterns

```markdown
## Projects CRUD Pattern

### Query
```ts
export const getVisibleProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .collect()
      .then((items) => items.sort((a, b) => a.order - b.order));
  },
});
```

### Mutation (create)
```ts
export const createProject = mutation({
  args: projectFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("projects", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

### Client Component
```tsx
'use client'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'

export function ProjectsSection() {
  const projects = useQuery(api.queries.getVisibleProjects)
  if (!projects) return <Skeleton className="h-64 w-full" />
  if (projects.length === 0) return <EmptyState />
  return <ProjectCardGrid projects={projects} />
}
```
```

### 5C. ADMIN_CMS_GUIDE.md — Add Canonical Labels

```markdown
### Section-Level Nav Labels (ADD to existing table)

| Convex Schema Key | Admin Nav Label (EN) | Admin Nav Label (AR) |
|---|---|---|
| `projects` | My Work Experience | خبراتي العملية |
| `locations` | Service Areas | مناطق الخدمة |

### Field-Level Editor Labels (ADD to existing table)

| Convex Field | Chef-Friendly Label (EN) | Chef-Friendly Label (AR) |
|---|---|---|
| `role_en` | Your Role (English) | دورك (إنجليزي) |
| `role_ar` | دورك (عربي) | دورك (عربي) |
| `workplace_en` | Workplace (English) | مكان العمل (إنجليزي) |
| `workplace_ar` | مكان العمل (عربي) | مكان العمل (عربي) |
| `location_en` | Location (English) | الموقع (إنجليزي) |
| `location_ar` | الموقع (عربي) | الموقع (عربي) |
| `description_en` | What you did there (English) | ماذا فعلت هناك (إنجليزي) |
| `description_ar` | ماذا فعلت هناك (عربي) | ماذا فعلت هناك (عربي) |
| `category` | Career Stage | مرحلة المسيرة |
| `isHighlight` | Featured (show badge) | مميز (إظهار شارة) |
| `requestTypes` | Request Type Options | خيارات نوع الطلب |
| `businessHours` | Business Hours Note | ملاحظة ساعات العمل |
| `education_en` | Education (English) | التعليم (إنجليزي) |
| `education_ar` | التعليم (عربي) | التعليم (عربي) |
```

### 5D. BUG_FIXES_REGISTRY.md — Add Prevention Rules

```markdown
## Bug #40: Projects Not in Schema (Experience Woven Into Bio)

**Severity:** High (no CRUD control over work history)

**Root Cause:** Work experience was embedded as narrative text in `aboutContent.bio_en`.
No structured data, no admin editor, no public component for project cards.

**Prevention Rule:**
> Work experience MUST be stored in the `projects` table.
> The bio can reference it narratively, but structured CRUD requires a dedicated table.
> Any future "experience" or "portfolio" content goes in `projects`, not in text fields.

## Bug #41: Contact Request Types Hardcoded

**Severity:** Medium (admin cannot customize dropdown options)

**Root Cause:** The Request Type dropdown in ContactForm used a hardcoded list.
The schema's `contactInfo` had no `requestTypes` field.

**Prevention Rule:**
> Contact form dropdown options MUST be stored in `contactInfo.requestTypes[]`.
> The form reads from the schema, not from hardcoded constants.
> Admin can add/remove/reorder request types via the Contact Info editor.

## Bug #42: Stats Badges Not Displayed in Hero

**Severity:** Low (visual — stats stored but not shown)

**Root Cause:** `aboutContent.stats[]` was stored in the schema but HeroSection
rendered placeholder text instead of the actual stats array.

**Prevention Rule:**
> When the schema stores a display-oriented array (stats, badges, tags),
> the corresponding public component MUST consume it.
> Check: "Does every schema field have a renderer?" before marking feature complete.
```

### 5E. KNOWN_WARNINGS.md — Add Notes

```markdown
## Warning: Relative Project Dates May Show Client/Server Skew

The `projects` table stores `createdAt` as UTC milliseconds.
Relative time display ("2 years ago") uses client-side calculation.
Minor discrepancies (<1 minute) between server render and client hydration are acceptable.
For critical accuracy, compute relative time on server and pass as prop.

## Warning: Arabic Translations Required Before Launch

All fields marked `NEEDS_PROFESSIONAL_TRANSLATION` in the seed data
MUST be replaced by a native-speaker culinary translator before production.
Auto-translation will corrupt bakery terminology (sourdough, levain, lamination, etc.).

## Warning: Projects Category Labels Not Yet in i18n

The `projects.category` union values ("early", "specialization", "leadership", "founder", "international")
need display labels added to `src/i18n/messages/en.json` and `ar.json` under `projects.categories.*`.
This is required before the public ProjectsSection can render category badges.
```

---

## STEP 6: PHASED IMPLEMENTATION ROADMAP

### Phase 1: Schema + Seed (Foundation)
**Goal:** Extend Convex schema with new tables and fields. Update seed mutation.

| Task | Files | Priority |
|---|---|---|
| Add `projects` table to schema | `convex/schema.ts` | P0 |
| Add `locations` table to schema | `convex/schema.ts` | P0 |
| Extend `siteSettings.contactInfo` with `requestTypes`, `businessHours` | `convex/schema.ts` | P0 |
| Extend `siteSettings.aboutContent` with `education_en/ar` | `convex/schema.ts` | P0 |
| Add `createProject`, `updateProject`, `deleteProject`, `reorderProjects` mutations | `convex/mutations.ts` | P0 |
| Add `createLocation`, `updateLocation`, `deleteLocation`, `reorderLocations` mutations | `convex/mutations.ts` | P0 |
| Add `getVisibleProjects`, `getAllProjects` queries | `convex/queries.ts` | P0 |
| Add `getVisibleLocations`, `getAllLocations` queries | `convex/queries.ts` | P0 |
| Update `seedBakeryContent` with 9 project entries + 2 location entries | `convex/mutations.ts` | P0 |
| Run `npx convex dev` to regenerate types | — | P0 |

**Verification:** `npx convex dev` completes without errors. Seed mutation runs successfully.

### Phase 2: Admin Editors (CMS Control)
**Goal:** Build admin editors for new tables. Enhance existing editors.

| Task | Files | Priority |
|---|---|---|
| Create Projects admin editor page | `src/app/[locale]/admin/(protected)/projects/page.tsx` | P0 |
| Create Locations admin editor page | `src/app/[locale]/admin/(protected)/locations/page.tsx` | P1 |
| Add Projects + Locations to admin sidebar nav | `src/components/admin/AdminSidebar.tsx` | P0 |
| Enhance Contact editor with requestTypes + businessHours | `src/app/[locale]/admin/(protected)/contact/page.tsx` | P1 |
| Enhance About editor with education fields | `src/app/[locale]/admin/(protected)/about/page.tsx` | P1 |
| Add i18n keys for new admin nav + field labels | `src/i18n/messages/en.json`, `ar.json` | P0 ✅ |

**Verification:** All admin editors render correctly. CRUD operations persist to Convex.

### Phase 3: Public Components (Portfolio Display)
**Goal:** Build public sections for new data. Enhance existing sections.

| Task | Files | Priority |
|---|---|---|
| Create `ProjectsSection.tsx` component | `src/components/sections/ProjectsSection.tsx` | P0 |
| Create `LocationsSection.tsx` component | `src/components/sections/LocationsSection.tsx` | P1 |
| Enhance `HeroSection.tsx` with stats badges + tagline | `src/components/sections/HeroSection.tsx` | P0 |
| Enhance `ContactSection.tsx` with WhatsApp CTA + Response Time badge | `src/components/sections/ContactSection.tsx` | P1 |
| Enhance `ContactForm.tsx` with dynamic Request Type dropdown | `src/components/sections/ContactForm.tsx` | P1 |
| Update About page to include ProjectsSection | `src/app/[locale]/(site)/about/page.tsx` | P0 |
| Add i18n keys for project categories + location labels | `src/i18n/messages/en.json`, `ar.json` | P0 ✅ |

**Verification:** Public pages display all content correctly in EN and AR with RTL.

### Phase 4: Polish + Documentation
**Goal:** Final QA, documentation updates, pre-launch checklist.

| Task | Files | Priority |
|---|---|---|
| Update MEMORY_BANK files (all 5 docs) | `docs/*.md` | P1 |
| Add Bug #40-42 to BUG_FIXES_REGISTRY.md | `docs/BUG_FIXES_REGISTRY.md` | P1 |
| Update ADMIN_CMS_GUIDE.md with new canonical labels | `docs/ADMIN_CMS_GUIDE.md` | P1 |
| Update TECH_STACK_PATTERNS.md with new patterns | `docs/TECH_STACK_PATTERNS.md` | P1 |
| Run TypeScript check: `npx tsc --noEmit` | — | P0 |
| Test DST transition handling for timestamps | — | P2 |
| Verify all Arabic translations are in place (no NEEDS_PROFESSIONAL_TRANSLATION in production) | — | P0 |

**Verification:** Zero TypeScript errors. All docs reflect current architecture.

---

## Appendix A: Complete File Change Manifest

### New Files
| File | Purpose |
|---|---|
| `src/app/[locale]/admin/(protected)/projects/page.tsx` | Projects admin editor |
| `src/app/[locale]/admin/(protected)/locations/page.tsx` | Locations admin editor |
| `src/components/sections/ProjectsSection.tsx` | Public projects card grid |
| `src/components/sections/LocationsSection.tsx` | Public locations display |

### Modified Files
| File | Changes |
|---|---|
| `convex/schema.ts` | Add `projects`, `locations` tables; extend `siteSettings` |
| `convex/mutations.ts` | Add project/location CRUD mutations; extend seed |
| `convex/queries.ts` | Add project/location queries |
| `src/components/admin/AdminSidebar.tsx` | Add Projects + Locations nav links |
| `src/app/[locale]/admin/(protected)/contact/page.tsx` | Add requestTypes + businessHours fields |
| `src/app/[locale]/admin/(protected)/about/page.tsx` | Add education fields |
| `src/components/sections/HeroSection.tsx` | Add stats badges + tagline display |
| `src/components/sections/ContactSection.tsx` | Add WhatsApp CTA + Response Time badge |
| `src/components/sections/ContactForm.tsx` | Dynamic Request Type dropdown |
| `src/app/[locale]/(site)/about/page.tsx` | Include ProjectsSection |
| `src/i18n/messages/en.json` | Add project/location/i18n keys |
| `src/i18n/messages/ar.json` | Add project/location/i18n keys |
| `docs/PROJECT_RULES.md` | Add Rules 33-38 |
| `docs/TECH_STACK_PATTERNS.md` | Add Projects CRUD pattern |
| `docs/ADMIN_CMS_GUIDE.md` | Add canonical labels for new fields |
| `docs/BUG_FIXES_REGISTRY.md` | Add Bug #40-42 |
| `docs/KNOWN_WARNINGS.md` | Add warnings for Arabic translations + category labels |

---

## Appendix B: Schema Validation Checklist

Before marking Phase 1 complete, verify:

- [ ] `projects` table has all 9 CV-derived entries seeded
- [ ] `locations` table has Cairo + Saudi Arabia entries
- [ ] `siteSettings.contactInfo.requestTypes` defaults to 5 options (consulting, catering, training, partnerships, other)
- [ ] `siteSettings.aboutContent.education_en` contains "Technical Diploma in Industrial Studies — Mesta (2012–2016)"
- [ ] All timestamps use `Date.now()` (UTC milliseconds)
- [ ] All nullable fields use `v.nullable()` (not `v.optional()`)
- [ ] No `as const` type lies in seed data
- [ ] `npx convex dev` regenerates `_generated/` without errors
- [ ] Seed mutation is idempotent (safe to run multiple times)
- [ ] All 9 services have Arabic translations (not NEEDS_PROFESSIONAL_TRANSLATION)

---

*End of Implementation Blueprint*
