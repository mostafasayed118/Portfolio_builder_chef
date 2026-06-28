# Chef Mohamed Portfolio — TestSprite Product Requirements Document

> **Purpose:** Spec-driven testing via TestSprite Web Portal.
> **Upload this file as the PRD during TestSprite project creation.**

---

## 1. Project Overview

**Brand:** Chef Mohamed — Artisan French Bakery Consultant
**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Convex 1.41, Clerk Auth
**Bilingual:** English (LTR) + Arabic (RTL) via next-intl v4
**Deployment:** Vercel (production) + Convex Cloud (database + file storage)
**Base URLs:** http://localhost:3000 (dev), https://chef-mohamed.vercel.app (production)

---

## 2. Public Site Features

### 2.1 Hero Section (`/`)
- Animated hero with heading, subheading, CTA button ("Explore the Menu")
- Chef portrait image upload (admin-managed)
- Stats badges (10+ Years Experience, 50+ Products, 1000+ Happy Clients)
- Smooth scroll-down indicator, parallax background
- **RTL variant:** Full mirrored layout for Arabic locale

### 2.2 About Section (`/about`)
- Chef Mohamed's bilingual bio (EN/AR, 3 paragraphs each)
- Skill tags (6 hard skills: French Baked Goods, Sourdough, Croissant Lamination, etc.)
- Chef portrait image
- Animated entrance via motion (scroll-triggered, reduced-motion aware)

### 2.3 Services Section (`/services`)
- 3 categories: Artisanal (bakery products), Consulting (kitchen design, menu dev), Training (workshops)
- Category cards with icons (ChefHat, ClipboardList, GraduationCap)
- Each card lists multiple service items with name + description
- Loading state: 3 skeleton cards
- Empty state: "No services yet" with add CTA

### 2.4 Projects / Portfolio (`/projects`)
- Timeline-style cards: 8 career entries across 5 categories (early, specialization, leadership, founder, international)
- Each card: role, workplace, location, description, optional image, category badge
- Highlight badges for "Founded from Scratch" entries
- Drag-reordered in admin

### 2.5 Menu Gallery (`/menu`)
- Filterable product grid (All, Cakes, Pastries, Cookies, Seasonal)
- Product cards: image, name (bilingual), price, category
- Image lazy loading with blur placeholder
- Empty state per category
- Loading skeleton grid

### 2.6 Gallery (`/gallery`)
- Masonry-style photo grid (Convex file storage)
- Lightbox on image click
- Drag-reorderable in admin

### 2.7 Testimonials (`/testimonials`)
- Star-rated customer reviews (1-5)
- Reviewer name + text (bilingual)
- Carousel/slider display

### 2.8 Contact (`/contact`)
- Contact form: name, email, phone, request type dropdown, message
- WhatsApp direct chat CTA button
- Response time badge ("Usually responds within 24 hours")
- Location cards with city name + neighborhood list
- Form validation: email format, required fields, phone format
- Rate-limited submission (5 per 15min per email)
- **Post-submission:** Success toast, form reset

### 2.9 CTA Banner
- "Order Now" section with primary + secondary buttons
- Links to /contact and /menu

### 2.10 Footer
- Navigation links, contact info, social links
- Bilingual support

---

## 3. Admin CMS Features

### 3.1 Authentication (`/admin/login`)
- Clerk-hosted login page (SignIn component)
- Supports: email/password, Google OAuth, MFA
- Rate-limited: 5 attempts per 15 minutes per email
- 3-layer security: middleware guard → layout guard → Convex `requireAdmin()`

### 3.2 Dashboard (`/admin/dashboard`)
- Stats cards: total menu items, services, testimonials, gallery images, contact inquiries
- Quick-action grid linking to each editor (9 cards)
- Current date/time display in Egyptian format

### 3.3 Hero Editor (`/admin/hero`)
- Textareas: heading_en, heading_ar, subheading_en, subheading_ar
- Inputs: ctaLabel_en, ctaLabel_ar
- Image upload with preview
- Save with toast confirmation

### 3.4 About Editor (`/admin/about`)
- Textareas: heading_en, heading_ar, bio_en (3 paragraphs), bio_ar
- Skill tags editor (add/remove)
- Image upload
- Save with toast confirmation

### 3.5 Menu Editor (`/admin/menu`)
- CRUD table with category filter tabs (All, Cakes, Pastries, Cookies, Seasonal)
- Form dialog: name_en, name_ar, description_en, description_ar, price, category, image upload, available toggle
- Drag-to-reorder via @dnd-kit/sortable
- Bulk visibility toggle (useOptimistic hook)
- Delete with confirmation dialog

### 3.6 Services Editor (`/admin/services`)
- CRUD table with category filter (All, artisanal, consulting, training)
- Form dialog: name_en, name_ar, description_en, description_ar, icon (emoji picker), category, visibility toggle
- Drag-to-reorder
- Optimistic visibility toggle

### 3.7 Testimonials Editor (`/admin/testimonials`)
- CRUD table
- Form: name_en, name_ar, text_en, text_ar, rating (1-5 star selector)
- Visibility toggle

### 3.8 Gallery Editor (`/admin/gallery`)
- Image grid with upload button
- Drag-to-reorder
- Delete with confirmation
- Convex file storage with cleanup on delete

### 3.9 Projects Editor (`/admin/projects`)
- CRUD table
- Form: role_en, role_ar, workplace_en, workplace_ar, location_en, location_ar, description, image, category (5 types), highlight toggle
- Drag-to-reorder

### 3.10 Contact Editor (`/admin/contact`)
- Phone, secondary phone, WhatsApp number inputs
- Email display field
- Location management

### 3.11 Inbox (`/admin/inbox`)
- Contact form submissions table
- Sender name, email, phone, request type, message, timestamp
- Read/unread status

### 3.12 Locations Editor (`/admin/locations`)
- CRUD for service areas
- City name (bilingual), neighborhood list, coordinates (lat/lng), marker icon, visibility toggle

---

## 4. Features & Use Cases

### 4.1 Public Site
| Feature | Use Cases | Priority |
|---------|-----------|----------|
| Hero | Display hero content, CTA click, RTL mirror, stats badges | P0 |
| About | Bio display, skill tags, image, RTL text | P0 |
| Services | Category cards, service list, loading/empty states | P0 |
| Projects | Timeline cards, category badges, highlight badges | P0 |
| Menu | Category filter, product cards, image lazy load, empty state | P0 |
| Gallery | Masonry grid, lightbox, image load | P1 |
| Testimonials | Star rating display, carousel navigation | P1 |
| Contact | Form validation, submission, WhatsApp CTA, rate limit | P0 |
| Bilingual | EN/AR switch, RTL layout, all text localized | P0 |
| Navigation | Mobile hamburger menu, active state, smooth scroll | P1 |
| Footer | Links, contact info, social | P2 |

### 4.2 Admin CMS
| Feature | Use Cases | Priority |
|---------|-----------|----------|
| Login | Clerk login, error handling, MFA, rate limit | P0 |
| Auth Guard | Unauthenticated redirect, non-admin block | P0 |
| Dashboard | Stats display, quick actions | P1 |
| Hero Editor | Load, edit, save, validation | P0 |
| About Editor | Load, edit bio, skills, image upload | P0 |
| Menu CRUD | Create, read, update, delete, reorder, image upload | P0 |
| Services CRUD | Create, read, update, delete, reorder | P0 |
| Testimonials CRUD | Create, read, update, delete, rating | P1 |
| Gallery | Upload, reorder, delete | P1 |
| Projects CRUD | Create, read, update, delete, reorder | P0 |
| Contact Editor | Edit phone, WhatsApp, locations | P1 |
| Inbox | View submissions, read/unread | P2 |
| Locations CRUD | Create, read, update, delete | P1 |

### 4.3 Data Integrity
| Feature | Use Cases | Priority |
|---------|-----------|----------|
| Bilingual Fields | Every entry has both EN/AR, no empty required strings | P0 |
| Image Storage | Upload success, delete cleanup, format validation | P0 |
| Order Preservation | Drag reorder persists on reload | P0 |
| Optimistic Updates | Toggle visibility immediate UI feedback | P0 |

---

## 5. Test Accounts

**Admin account** (for TestSprite test credentials):
- Email: (CONFIGURE IN TESTSRITE PORTAL — use `ADMIN_EMAIL` env var)
- Password: (CONFIGURE IN TESTSRITE PORTAL — Clerk-managed)

---

## 6. API Documentation

### Convex Public Queries (Read-only, no auth)
- `api.queries.getSiteSettings` → Full site content (hero, about, contact)
- `api.queries.getMenuItems` → All menu items filtered by visibility
- `api.queries.getServices` → All services filtered by visibility
- `api.queries.getTestimonials` → All testimonials filtered by visibility
- `api.queries.getGallery` → All gallery images ordered
- `api.queries.getProjects` → All projects filtered by visibility
- `api.queries.getContactInfo` → Contact data (phone, email, WhatsApp)

### Convex Admin Mutations (Auth required)
- `api.mutations.createMenuItem` / `updateMenuItem` / `deleteMenuItem`
- `api.mutations.createService` / `updateService` / `deleteService`
- `api.mutations.createTestimonial` / `updateTestimonial` / `deleteTestimonial`
- `api.mutations.createProject` / `updateProject` / `deleteProject`
- `api.mutations.createLocation` / `updateLocation` / `deleteLocation`
- `api.mutations.updateContactInfo`
- `api.mutations.updateHeroContent`
- `api.mutations.updateAboutContent`
- `api.mutations.reorderMenuItems` / `reorderServices` / `reorderGallery` / `reorderProjects`
- `api.mutations.toggleMenuItemVisibility` / `toggleServiceVisibility` / `toggleTestimonialVisibility`
- `api.mutations.uploadImage` / `deleteImage`
- `api.mutations.submitContactInquiry`
