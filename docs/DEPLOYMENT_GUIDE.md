# Deployment Guide — Chef Mohamed Bakery Portfolio

**Last Updated:** 2026-06-23
**Target Audience:** Developer or DevOps engineer performing initial deployment
**Prerequisites:** Node.js 20.9+, npm, Vercel account, GitHub account

---

## 1. Environment Overview

| Service | Purpose | Account Needed |
|---------|---------|---------------|
| Vercel | Hosting (Next.js SSR, Edge functions) | vercel.com |
| Convex | Database, file storage, real-time sync | convex.dev |
| GitHub | Source code, CI/CD | github.com |

---

## 2. Vercel Setup

### 2.1 Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (connects to Vercel project)
cd chef-bakery-portfolio
vercel --prod
```

Or via Vercel Dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`chef-bakery-portfolio`)
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npx next build` (default)
5. Output directory: `.next` (default)

### 2.2 Environment Variables

Add ALL of the following in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://<your-project>.convex.cloud` | From `npx convex init` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | Your custom domain |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | `sk_test_...` | Clerk Dashboard → API Keys |
| `CLERK_FRONTEND_API_URL` | `https://<instance>.clerk.accounts.dev` | Clerk Dashboard |
| `ADMIN_EMAIL` | `admin@example.com` | Single admin email for access control |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/admin/login` | Clerk sign-in path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/admin/signup` | Clerk sign-up path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/admin/dashboard` | Post-login redirect |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` | `/` | Post-logout redirect |

**Important:** Add these for ALL environments (Production, Preview, Development).

---

## 3. Convex Setup

### 3.1 Create Convex Project

```bash
# Login to Convex
npx convex login

# Create project (follow prompts)
npx convex init
# → Creates a project at https://dashboard.convex.dev
# → Outputs NEXT_PUBLIC_CONVEX_URL
```

### 3.2 Deploy Convex Functions

```bash
# Deploy schema, queries, mutations to production
npx convex deploy

# This deploys:
#   - convex/schema.ts     → 9 tables (siteSettings, menuItems, services, testimonials, gallery, projects, locations, contactInquiries, rateLimitEntries)
#   - convex/queries.ts    → 16+ query functions
#   - convex/mutations.ts  → 30+ mutation functions
#   - convex/files.ts      → Convex storage upload/download
#   - convex/auth.ts       → requireAdmin() guard for write mutations
```

### 3.3 Seed the Database

After deploying functions, seed the database with example content:

```bash
npx convex run mutations:seedBakeryContent
```

This inserts:
- `siteSettings` — Hero content, About bio, Contact info
- `menuItems` — 2 items (Signature Sourdough, Classic Croissant — prices null, hidden)
- `testimonials` — 3 placeholder reviews (hidden)
- `services` — 9 service offerings across 3 categories (artisanal, consulting, training)
- `projects` — 9 work experience entries (Ralph's Cafe through KUP Saudi Arabia)
- `locations` — 2 entries (Greater Cairo, Kingdom of Saudi Arabia)
- `gallery` — NOT seeded (must be uploaded via admin)

**Verify seed output:**
```json
{ "seeded": true }
```

If `{ "seeded": false, "reason": "already exists" }`, the database already has content — no duplicates created.

### 3.4 Convex Dashboard

Monitor your data at: `https://dashboard.convex.dev`

Useful views:
- **Data → siteSettings** — Edit raw JSON if admin UI has issues
- **Functions → mutations → seedBakeryContent** — Re-run seed
- **Logs** — Debug function errors

---

## 4. Domain Configuration

### 4.1 Custom Domain on Vercel

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain: `bakery.chefmohamed.com` (or your domain)
3. Follow Vercel's DNS instructions (add CNAME record at your DNS provider)

### 4.2 Arabic Locale Routing

Arabic is handled by `next-intl` with `localePrefix: "always"`. URLs:

```
https://yourdomain.com/en           → English homepage
https://yourdomain.com/ar           → Arabic homepage
https://yourdomain.com/en/menu      → Menu (English)
https://yourdomain.com/ar/menu      → القائمة (Arabic)
```

No additional server configuration needed — i18n routing is built into the app.

---

## 5. Post-Deploy Verification Checklist

### 5.1 Public Pages

| Check | URL | Expected |
|-------|-----|----------|
| Homepage (EN) | `/en` | Hero banner + Menu grid + About story + Testimonials + Gallery + Contact form + CTA |
| Homepage (AR) | `/ar` | RTL layout, Cairo font, Arabic text |
| Menu | `/en/menu` | Category filter tabs, skeleton loading, cards with prices |
| Gallery | `/en/gallery` | Masonry layout (empty if no photos uploaded) |
| Contact | `/en/contact` | Phone/email/address cards + contact form |

### 5.2 Admin Panel

| Check | URL | Expected |
|-------|-----|----------|
| Login | `/en/admin/login` | Clerk SignIn component renders |
| Dashboard | `/en/admin/dashboard` | Stats cards + 9 action cards |
| Hero editor | `/en/admin/hero` | Bilingual heading/subheading/CTA inputs |
| Menu editor | `/en/admin/menu` | DnD reorder, category filter, add/edit dialog |
| Services editor | `/en/admin/services` | Sortable cards, category filter, emoji picker |
| Gallery | `/en/admin/gallery` | Multi-file upload, DnD reorder |
| Logout | Admin sidebar → Logout | Redirects to home page |

### 5.3 Theme & RTL

| Check | Action | Expected |
|-------|--------|----------|
| Dark mode | Visit any page | Dark background, rose gold accents |
| Light mode | Click Sun icon in navbar | Warm cream background, warm brown text |
| Arabic RTL | Visit `/ar` | Everything mirrored, Cairo font, right-aligned |
| Theme persistence | Refresh page | Theme stays (localStorage) |

### 5.4 Auth

| Check | Action | Expected |
|-------|--------|----------|
| Login | Visit `/en/admin/login` | Clerk SignIn form renders |
| Login success | Sign in with admin email via Clerk | Redirects to /admin/dashboard |
| Login failure | Wrong email/password | Clerk shows error, no redirect |
| Session persistence | Close & reopen browser | Session persists (Clerk-managed) |
| Logout | Click Logout in admin sidebar | Redirects to home page |

---

## 6. Troubleshooting FAQ

### "Seed fails — validation error"

**Symptom:** `npx convex run mutations:seedBakeryContent` returns schema validation error

**Cause:** The schema changed since the last deploy. Existing documents don't have new fields.

**Fix:**
```bash
# Option A: Deploy updated schema first
npx convex deploy
npx convex run mutations:seedBakeryContent

# Option B: If data exists, make new fields optional in convex/schema.ts
# (v.optional(v.nullable(v.string())) instead of v.nullable(v.string()))
```

### "Images not loading on public site"

**Symptom:** Gallery images show broken icons after admin upload

**Verify:**
1. Check Convex Dashboard → Data → `gallery` — does each row have a `url`?
2. If `url` is `null`, the upload didn't complete — re-upload via admin
3. If `url` has a value, open it directly in browser — should redirect to Convex CDN

**Fix:** Re-upload images via Admin → Gallery. Each upload goes through `generateUploadUrl` → XHR PUT → `saveGalleryImageFromStorage`.

### "Arabic text is showing English"

**Symptom:** Arabic locale shows English placeholder text

**Cause:** Arabic translations marked `NEEDS_PROFESSIONAL_TRANSLATION` were never replaced.

**Fix (pre-2026-06-23):** 
1. Check `src/i18n/messages/ar.json` for `NEEDS_PROFESSIONAL_TRANSLATION` values
2. Replace each with native-speaker Arabic translation
3. Redeploy: `git push` → Vercel auto-deploys

**Status as of 2026-06-23:** ✅ All professional translations imported. Zero `NEEDS_PROFESSIONAL_TRANSLATION` remaining in seed data or i18n files.

### "Login redirects to /admin/login infinitely"

**Symptom:** After Clerk sign-in, page redirects back to login page

**Cause:** Clerk environment variables are missing or incorrect.

**Verify:**
1. Check Vercel Dashboard → Environment Variables → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
2. Verify `CLERK_FRONTEND_API_URL` matches your Clerk instance
3. Check Clerk Dashboard → Sessions for error logs

**Fix:** Update Clerk env vars on Vercel, ensure the Clerk instance is configured for your domain, and redeploy.

### "Build fails on Vercel"

**Symptom:** Deployment logs show build error

**Common causes:**
1. Missing `NEXT_PUBLIC_CONVEX_URL` — must be set in Vercel env vars
2. TypeScript error — run `npx tsc --noEmit` locally first
3. Node.js version mismatch — set Vercel to Node.js 20.x (Project Settings → Node.js Version)

---

## 7. Environment Variable Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | `https://reliable-deer-270.convex.cloud` | Convex deployment URL (from `npx convex init`) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://bakery.chefmohamed.com` | Public site URL (used for canonical/SEO) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | `pk_test_...` | Clerk publishable key (from Clerk Dashboard) |
| `CLERK_SECRET_KEY` | ✅ | `sk_test_...` | Clerk secret key (from Clerk Dashboard) |
| `CLERK_FRONTEND_API_URL` | ✅ | `https://<instance>.clerk.accounts.dev` | Clerk frontend API URL |
| `ADMIN_EMAIL` | ✅ | `your-email@example.com` | Single admin email for access control |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | `/admin/login` | Clerk sign-in path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | `/admin/signup` | Clerk sign-up path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | ✅ | `/admin/dashboard` | Post-login redirect |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` | ✅ | `/` | Post-logout redirect |
| `CONVEX_DEPLOYMENT` | ❌ | (auto) | Set by Convex CLI for local dev |

---

## 8. Quick Start (New Developer)

```bash
# Clone and install
git clone <repo-url> chef-bakery-portfolio
cd chef-bakery-portfolio
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Clerk keys and Convex URL

# Set up Convex
npx convex login
npx convex init
npx convex dev --once

# Run locally
npx next dev

# Open: http://localhost:3000/en/admin/login
# Sign in with your admin email via Clerk
```
