# 🚀 Production Deployment Guide — Chef Mohamed Bakery Portfolio

**Last Updated:** 2026-06-29  
**Stack:** Next.js 16 App Router + Convex 1.41 + Clerk Auth + next-intl v4 + Brevo Email  
**Target:** Vercel (frontend) + Convex Cloud (backend)  

---

## Pre-Flight Checklist

Before starting, confirm you have:

- [ ] Node.js 20.9+ installed locally (`node -v`)
- [ ] `npx` available (`npx --version`)
- [ ] Vercel account (vercel.com) — **must be the team/project owner**
- [ ] Convex account (convex.dev) — logged in via CLI (`npx convex whoami`)
- [ ] Clerk account (clerk.com) — with the app set up for this project
- [ ] Brevo account (app.brevo.com) — verified sender + API key generated
- [ ] Custom domain purchased (if using one) and DNS managed at your registrar
- [ ] `BREVO_API_KEY` IP authorized: Brevo Dashboard → Security → Authorised IPs → add `216.235.222.6` (Convex production IP)

---

## Step 1: Convex Production

### 1.1 Deploy to Convex Production

```bash
# From project root
cd E:\abo_gabal\chef-bakery-portfolio

# Push latest code and deploy to production
npx convex deploy
```

**Expected output:**
```
|  Deployed chef-bakery-portfolio to <deployment-name> (<production-url>)  
|  ✓ Production deployment ready: https://<your-project>.convex.cloud
```

**Capture the production URL** — you'll need it for `NEXT_PUBLIC_CONVEX_URL`.

### 1.2 Set Convex Production Environment Variables

Navigate to **Convex Dashboard → Settings → Environment Variables** and add these:

| Variable | Value | Notes |
|----------|-------|-------|
| `CLERK_SECRET_KEY` | `<YOUR_SK_LIVE_KEY>` | Production key from Clerk Dashboard **NOT the test key** |
| `ADMIN_EMAIL` | `al3tar66@gmail.com` | Must match the Clerk user email exactly |
| `BREVO_API_KEY` | `<YOUR_BREVO_KEY>` | From Brevo Dashboard → SMTP & API → API Keys |

You can also set them via CLI:

```bash
npx convex env set CLERK_SECRET_KEY <YOUR_PRODUCTION_SK_LIVE_KEY>
npx convex env set ADMIN_EMAIL al3tar66@gmail.com
npx convex env set BREVO_API_KEY <YOUR_BREVO_API_KEY>
```

Also ensure `CLERK_FRONTEND_API_URL` is set (it should already be from dev):

```bash
npx convex env set CLERK_FRONTEND_API_URL https://evolved-martin-67.clerk.accounts.dev
```

### 1.3 Run Seed Mutation in Production

```bash
npx convex run mutations:seedBakeryContent --prod
```

**Expected output:**
```json
{
  "siteSettings": "inserted",
  "menuItems": 2,
  "testimonials": 3,
  "gallery": "skipped (upload photos via admin)",
  "services": 9,
  "projects": 10,
  "locations": 2
}
```

If it shows `"siteSettings": "already exists"` — that's fine, it means seed was already run (idempotent).

### 1.4 Run Section Seed (if first deploy)

```bash
npx convex run mutations:seedSectionConfigs --prod
```

**Expected output:**
```json
{ "status": "inserted", "count": 12 }
```

### 1.5 Verify in Convex Dashboard

- Go to Convex Dashboard → **Data** tab
- Confirm `siteSettings`, `menuItems`, `services`, `projects`, `testimonials` tables have data
- Check `services` has 9 entries, `projects` has 10

---

## Step 2: Vercel Configuration

### 2.1 Import Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (`chef-bakery-portfolio`)
3. Select the team/project scope

### 2.2 Configure Project Settings

| Setting | Value | Notes |
|---------|-------|-------|
| Framework Preset | **Next.js** | Auto-detected but verify |
| Root Directory | **`./`** | Not a monorepo — root is correct |
| Build Command | **`npm run build`** | Maps to `next build` |
| Output Directory | **`.next`** | Default for Next.js |
| Install Command | **`npm install`** | Use npm, not yarn/pnpm |
| Node.js Version | **22.x** | Match local dev (use 22.x, not 20.x — fewer issues) |

### 2.3 Configure Build Override Settings (Important)

In Vercel project → **Settings → General → Build & Development Settings**:

- **Node.js Version**: Select `22.x`
- **Enable Incremental Static Regeneration (ISR)**: Leave **disabled** (not needed for this SSR app)
- **Enable Fluid Compute**: Leave **disabled** (not needed)

### 2.4 Deploy Preview (first deploy)

Click **Deploy**. This will fail on the first attempt because environment variables aren't set yet — that's normal. **Cancel the build** after it fails and proceed to Step 3.

---

## Step 3: Environment Variables

### 3.1 Vercel Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Value | Environment | Build-Time? | Notes |
|----------|-------|-------------|-------------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://<project>.convex.cloud` | All | ✅ Yes | From `npx convex deploy` output — **production URL, not dev** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `<YOUR_PK_LIVE_KEY>` | All | ✅ Yes | Clerk Dashboard → API Keys — **production key, NOT test key** |
| `CLERK_SECRET_KEY` | `<YOUR_SK_LIVE_KEY>` | All | ❌ No | Clerk Dashboard → API Keys — **production secret** |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/admin/login` | All | ✅ Yes | Must match proxy.ts route matcher |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/admin/dashboard` | All | ✅ Yes | Post-login redirect |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` | `/` | All | ✅ Yes | Post-logout redirect |
| `ADMIN_EMAIL` | `al3tar66@gmail.com` | All | ❌ No | Must match Clerk user email |
| `BREVO_API_KEY` | `<YOUR_BREVO_KEY>` | All | ❌ No | From Brevo dashboard |
| `NEXT_PUBLIC_SITE_URL` | `https://chefmohamed.com` | Production | ✅ Yes | **Use your actual domain, not vercel.app** |
| `NEXT_PUBLIC_SITE_URL` | `https://*.vercel.app` | Preview | ✅ Yes | Vercel auto-generated preview URL |
| `TESTSRITE_API_KEY` | `sk-user-...` | All | ❌ No | Optional — only needed for TestSprite |

### 3.2 ⚠️ CRITICAL: NEXT_PUBLIC_ Build-Time Behavior

**All `NEXT_PUBLIC_` variables are baked into the JavaScript bundle at build time.** This means:

1. **Changing `NEXT_PUBLIC_CONVEX_URL` after deployment requires a full redeploy** (not just an env var change)
2. Preview/Production branches need **separate builds** with their own env values
3. To switch: Vercel → Deployments → select last successful deploy → **Redeploy**

### 3.3 Add Vercel Preview URL to CSP

In `next.config.ts`, the Content-Security-Policy includes `connect-src` directives. The Vercel preview domain (`*.vercel.app`) is **not** in the current CSP. Before deploying, temporarily add it for preview branches, or update the CSP to include:

```
https://*.vercel.app
```

in the `connect-src` directive.

### 3.4 Add Domains to `next.config.ts` Image Remote Patterns

The current `next.config.ts` allows images from `*.convex.cloud` and `storage.googleapis.com`. If you upload images to Convex storage, this is sufficient. If you use an external image CDN, add it here:

```ts
remotePatterns: [
  { hostname: "*.convex.cloud" },
  { hostname: "storage.googleapis.com" },
  // Add your domain if needed:
  // { hostname: "chefmohamed.com" },
],
```

---

## Step 4: Clerk Production Setup

### 4.1 Switch Clerk to Production

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → select your application
2. In the sidebar, toggle from **"Development"** to **"Production"**
3. **You MUST add production instance URL first.** Clerk will prompt you to confirm.

### 4.2 Configure Allowed Origins

In Clerk Dashboard → **Sessions → Allowed Origins**, add:

```
https://chefmohamed.com          # Production domain
https://*.vercel.app              # All Vercel preview deployments
```

### 4.3 Generate Production API Keys

In Clerk Dashboard → **API Keys**:

- Copy **Publishable Key** (`<YOUR_PK_LIVE_KEY>`) → use for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Copy **Secret Key** (`<YOUR_SK_LIVE_KEY>`) → use for `CLERK_SECRET_KEY` (in both Vercel AND Convex env)

⚠️ **Verify the key prefix** — test keys will fail in production. Use the production keys from Clerk.

### 4.4 Verify Sign-In URL

In Clerk Dashboard → **Sessions → URLs**:
- **Sign-in URL**: `/admin/login` (matches `NEXT_PUBLIC_CLERK_SIGN_IN_URL`)
- **After sign-in**: `/admin/dashboard` (matches `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`)
- **After sign-out**: `/` (matches `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL`)

### 4.5 Add Convex JWT Template (if needed)

In Clerk Dashboard → **JWT Templates**:
- You should see a default "Convex" template (auto-created by the Convex Clerk integration)
- If missing, create one with the **Convex** template and Issuer matching `https://evolved-martin-67.clerk.accounts.dev`

---

## Step 5: Domain & DNS

### 5.1 Add Custom Domain in Vercel

1. Vercel Dashboard → Project → **Settings → Domains**
2. Enter your domain: `chefmohamed.com`
3. Vercel will show you the DNS records to add

### 5.2 DNS Records

At your DNS registrar (where you bought the domain), add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `www` | `cname.vercel-dns.com` | 600 |
| A | `@` | `76.76.21.21` | 600 |

Or use the exact records Vercel provides — they may differ slightly.

### 5.3 SSL Certificate

- Vercel **automatically provisions** an SSL certificate (via Let's Encrypt)
- Wait up to 5 minutes after adding the domain for issuance
- Status will show **"Valid"** in Vercel dashboard once ready

### 5.4 www vs non-www Redirect

In Vercel Project → **Settings → Domains**:

- Add both `chefmohamed.com` and `www.chefmohamed.com`
- Vercel auto-configures redirect from www to non-www (or vice versa based on which is primary)
- **Choose one as primary** — recommended: non-www (`chefmohamed.com`)

### 5.5 Bilingual URL Verification

This project uses `localePrefix: "always"` (see `src/i18n/routing.ts`), meaning every page has the locale prefix:

- ✅ `/en/about` — English
- ✅ `/ar/about` — Arabic (RTL)
- ✅ `/en/services`
- ✅ `/ar/services`

No additional configuration needed — this works automatically with next-intl.

---

## Step 6: Post-Deploy Verification

### 🔹 Pre-requisite: Trigger Final Build

After setting all environment variables:
1. Vercel Dashboard → **Deployments** → **Redeploy** the latest commit
2. Wait for build to complete (should take 2-4 minutes)

### 🔹 PUBLIC SITE

Check each item against the **Vercel production URL**:

- [ ] **Homepage loads** — Visit `/` and verify full page renders
- [ ] **LCP under 3s** — Use Chrome DevTools → Lighthouse for initial load timing
- [ ] **English page**: `/en` — heading says "Slow Bread, French Pastry"
- [ ] **Arabic page**: `/ar` — heading displays Arabic text correctly
- [ ] **RTL layout**: `/ar` — text flows right-to-left, layout flips
- [ ] **Dark/Light toggle**: Toggle persists across page navigation
- [ ] **Floating WhatsApp**: Visible on all public pages, not on `/admin`
- [ ] **WhatsApp link**: Clicking opens `wa.me` with pre-filled message based on current route
- [ ] **Trusted By strip**: Shows 7 workplace names below hero
- [ ] **Services**: All 9 seed services render with descriptions
- [ ] **Signature Creations** (menu): Sourdough + Croissant display as showcase items with "Custom Pricing" badge
- [ ] **Gallery**: No broken images (seed has no gallery images — upload one in admin)
- [ ] **Craft & Practice** (videos): Empty state renders correctly
- [ ] **Contact form**: Submit a test inquiry — verify no console errors
- [ ] **Brevo notification**: Check `al3tar66@gmail.com` — notification email arrives within 5 seconds
- [ ] **Auto-reply**: Check the email you used in the test form — auto-reply arrives
- [ ] **Navigation**: All links in header + footer work
- [ ] **Sitemap**: `/sitemap.xml` returns valid XML with all 7 page types in both locales
- [ ] **Robots.txt**: `/robots.txt` returns `Allow: /` + sitemap URL

### 🔹 ADMIN CMS

- [ ] **Login**: `/admin/login` redirects to Clerk sign-in page
- [ ] **Valid credentials**: Login with `al3tar66@gmail.com` → redirected to `/admin/dashboard`
- [ ] **Dashboard**: Stats load (menu: 2, testimonials: 3, gallery: 1)
- [ ] **Readiness widget**: Shows checklist — items with data show ✅, missing items show ❌
- [ ] **Invalid access**: Log out → visit `/admin/dashboard` → redirected to sign-in
- [ ] **Hero editor**: Loads and saves content
- [ ] **About editor**: Loads and saves content
- [ ] **Menu editor**: Shows both items with `isShowcase` flag
- [ ] **Image upload**: Upload an image in admin — verify it displays on the public site
- [ ] **Section reordering**: Drag sections in `/admin/sections` — order persists after refresh
- [ ] **Theme changes**: Change theme preset — public site reflects change instantly
- [ ] **SEO settings**: Save a title change — page source shows updated `<title>`
- [ ] **Inbox**: Submit a contact form → shows in inbox with "new" status
- [ ] **Status pipeline**: Change inquiry status in inbox → status badge updates
- [ ] **CSV export**: Click Export CSV → downloads correctly with all columns

### 🔹 BACKEND

- [ ] **Convex Dashboard**: Data tab shows all tables with seed data
- [ ] **Activity logs**: `activityLogs` table shows recent actions
- [ ] **Rate limiting**: Submit contact form twice with same email within 10 min → second request shows rate limit error
- [ ] **Storage**: Uploaded images appear in Convex Storage tab
- [ ] **Sitemap**: `curl https://chefmohamed.com/sitemap.xml` returns valid XML
- [ ] **Robots.txt**: `curl https://chefmohamed.com/robots.txt` returns correct directives

---

## Step 7: Monitoring & Maintenance

### 7.1 Vercel Analytics

1. Vercel Dashboard → Project → **Analytics** → Enable
2. Wait 24h for data collection
3. Monitor:
   - **LCP** (Largest Contentful Paint) — target < 2.5s
   - **CLS** (Cumulative Layout Shift) — target < 0.1
   - **INP** (Interaction to Next Paint) — target < 200ms

### 7.2 Error Monitoring

**Option A: Vercel Logs (free)**
- Vercel Dashboard → **Logs** → **Runtime Logs**
- Shows server-side errors, API route failures, build errors

**Option B: Sentry (free tier)**
- Create account at [sentry.io](https://sentry.io) (free 5k events/month)
- Install: `npm install @sentry/nextjs`
- Configure in `next.config.ts` + create `sentry.client.config.ts`
- Captures both client and server errors with stack traces

**Option C: Convex Logging (already configured)**
- Convex Dashboard → **Functions → Logs** tab
- Shows every function execution with errors and timing
- No additional setup needed

### 7.3 Backup Strategy

| Data | Backup Method | Frequency |
|------|--------------|-----------|
| Convex database | **Automatic** — Convex snapshots daily, retained 7 days | Daily |
| Media uploads | **Automatic** — Convex stores all files | Continuous |
| Source code | **Git + GitHub** | Every commit |
| Environment vars | **Manual** — export to `.env.production` file (never commit) | On each change |

To manually export Convex data:

```bash
npx convex export --prod
```

### 7.4 Monitoring Schedule

| Task | Frequency | Tool |
|------|-----------|------|
| Uptime check | Every 5 min | Vercel Status or uptimerobot.com (free) |
| Form submission test | Weekly | TestSprite or manual |
| Brevo email delivery | Weekly | Check activityLogs for `email_failed` events |
| SEO audit | Monthly | Google Search Console |
| Content freshness | Monthly | Manual review of all sections |

### 7.5 Rollback Procedure

If a deployment introduces critical issues:

1. **Vercel**: Go to Deployments → find the last known-good deployment → click "⋮" → **Promote to Production**
2. **Convex**: Convex deployments are versioned — `npx convex deploy --prod` deploys to the same production URL; previous code is not restored automatically
3. **To fully rollback Convex**: Use Convex Dashboard → **Data → Export** previous day's backup, then **Import** to restore data
4. **Domain**: DNS changes are immediate at Vercel — SSL reprovisions within minutes

### 7.6 Updating Content Without Redeploying

Since the project uses **Convex for all content** (not static files):

- ✅ **Text changes**: Edit in admin panel → instant update (no redeploy needed)
- ✅ **Images**: Upload via admin → instant update
- ✅ **Theme colors**: Change in admin → instant update
- ✅ **Section visibility**: Toggle in admin → instant update
- ❌ **Code changes**: Require `git commit` + `git push` → Vercel auto-redeploys

---

## Troubleshooting Common Issues

### Build fails with "Module not found"

```bash
# Clear Vercel build cache
Vercel Dashboard → Project → Settings → Build Cache → Clear Cache
# Then redeploy
```

### Clerk sign-in shows "Invalid client"

- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with the production prefix (not test)
- Verify Clerk Dashboard → Allowed Origins includes your Vercel domain
- Wait 2 minutes after changing Clerk settings for propagation

### Convex queries return null/empty

- Confirm `NEXT_PUBLIC_CONVEX_URL` points to **production** Convex URL, not dev
- Run `npx convex deploy --prod` to push latest schema + functions to production
- Check Convex Dashboard → **Functions** tab → verify functions are deployed

### Email notifications not sending

- Check Convex Dashboard → **Functions → Logs** for `email_failed` events
- Verify `BREVO_API_KEY` is set in **Convex environment variables** (not just Vercel)
- Confirm sender email is **verified** in Brevo Dashboard → Senders
- Confirm IP `216.235.222.6` is authorized in Brevo Dashboard → Security → Authorised IPs

### Arabic layout shows LTR

- Clear browser cache (Arabic locale is inferred from URL path, not Accept-Language header)
- Confirm URL starts with `/ar/` for Arabic pages
- Check browser console for CSP errors blocking Arabic fonts

### CSP blocks resources in production

The Content-Security-Policy in `next.config.ts` is strict. If something breaks:

```bash
# Check browser console for CSP violation errors
# Common fix: add the blocked domain to the relevant CSP directive
# Example: add 'https://yourdomain.com' to img-src or connect-src
```

### Images not loading after upload

- Verify `next.config.ts` `remotePatterns` includes the image host
- Convex storage URLs use `storage.googleapis.com` — this is already allowed
- If using a custom CDN, add its hostname to `remotePatterns`

### Sitemap returns 404

- The file is at `src/app/sitemap.ts` — Next.js 16 auto-routes this to `/sitemap.xml`
- If it 404s, verify there are no compilation errors in `sitemap.ts`
- Check Vercel Runtime Logs for server-side errors

### Preview deployment fails with Convex auth

- Preview deployments use a DIFFERENT Convex URL than production
- If you need Convex data in preview, set `NEXT_PUBLIC_CONVEX_URL` to point to production for preview too (not recommended for safety)
- Or deploy a separate Convex dev deployment for Vercel preview branches

---

## 🔴 Critical Pre-Deployment Fix: Missing Middleware

**Issue:** The Clerk + next-intl middleware is in `src/proxy.ts`, but Next.js requires it to be at `src/middleware.ts`. Without renaming, the production build will have:
- ❌ No admin route protection
- ❌ No i18n locale routing
- ❌ No request logging

**Fix:** Create `src/middleware.ts` that re-exports from `proxy.ts`:

```bash
echo "export { default } from \"./proxy\";
export const config = {
  matcher: [
    \"/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)\",
    \"/(api|trpc)(.*)\",
    \"/__clerk/(.*)\",
  ],
};" > src/middleware.ts
```

Verify the file exists:

```bash
ls src/middleware.ts
```
