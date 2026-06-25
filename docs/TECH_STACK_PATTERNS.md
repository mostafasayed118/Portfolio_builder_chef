# TECH STACK PATTERNS

**Last Updated:** 2026-06-23 (Auth patterns rewritten for Clerk — iron-session section deleted)

Authoritative code patterns for every technology in the stack. Follow these exactly.

---

## Next.js 16

### Async Params Pattern
```tsx
// ✅ CORRECT — always await params (it's a Promise)
type Props = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  // ...
}
```

### App Configuration
```ts
// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const config: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.convex.cloud' },
      { hostname: 'storage.googleapis.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy',
          value:
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: blob: https://*.convex.cloud https://*.convex.site https://img.clerk.com; " +
            "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud https://*.clerk.com https://*.clerk.accounts.dev; " +
            "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev; " +
            "base-uri 'self'; form-action 'self'; frame-ancestors 'none';" },
      ],
    }]
  },
}

export default withNextIntl(config)
```

### Proxy (NOT middleware.ts)
```ts
// src/proxy.ts — Next.js 16 replacement for middleware.ts
import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

### Error Page
```tsx
// src/app/[locale]/error.tsx — 'use client' is REQUIRED
'use client'

export default function ErrorPage({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])
  return <Button onClick={reset}>Try Again</Button>
}
```

---

## Convex 1.41

### Schema Design
```ts
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  siteSettings: defineTable({
    key: v.string(),
    heroContent: v.object({
      heading_en: v.string(),
      heading_ar: v.string(),
      imageUrl: v.nullable(v.string()),  // ✅ v.nullable()
    }),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  gallery: defineTable({
    url: v.nullable(v.string()),          // ✅ nullable — required for storage uploads
    storageId: v.nullable(v.id('_storage')),  // ✅ nullable Convex storage ref
    caption_en: v.string(),
    caption_ar: v.string(),
    order: v.number(),
    createdAt: v.number(),
  }).index('by_order', ['order']),
})
```

### Query Functions
```ts
// convex/queries.ts
import { query } from './_generated/server'
import { v } from 'convex/values'

export const getMenuItems = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query('menuItems')
        .withIndex('by_category', (q) =>
          q.eq('category', args.category as any),
        )
        .collect()
        .then((items) =>
          items.filter((i) => i.isAvailable).sort((a, b) => a.order - b.order),
        )
    }
    return await ctx.db
      .query('menuItems')
      .withIndex('by_available', (q) => q.eq('isAvailable', true))
      .collect()
      .then((items) => items.sort((a, b) => a.order - b.order))
  },
})
```

### Mutation Functions
```ts
// convex/mutations.ts — use .partial() for updates
const itemValidator = v.object({
  name_en: v.string(),
  price: v.number(),
  category: v.union(v.literal('cakes'), v.literal('pastries')),
})

export const createItem = mutation({
  args: itemValidator,
  handler: async (ctx, args) => {
    return await ctx.db.insert('menuItems', { ...args, createdAt: Date.now() })
  },
})

export const updateItem = mutation({
  args: {
    id: v.id('menuItems'),
    // Use individual optional fields, NOT spread partial validator
    // (Validator spread causes type errors in build)
    name_en: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.union(v.literal('cakes'), v.literal('pastries'))),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})
```

### Storage Upload Flow
```ts
// convex/files.ts
import { mutation } from './_generated/server'

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl()
})

export const saveGalleryImageFromStorage = mutation({
  args: {
    storageId: v.id('_storage'),
    caption_en: v.string(),
    caption_ar: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId)
    if (!url) throw new Error('Storage URL not found')
    return await ctx.db.insert('gallery', {
      url,
      storageId: args.storageId,
      caption_en: args.caption_en,
      caption_ar: args.caption_ar,
      order: args.order,
      createdAt: Date.now(),
    })
  },
})
```

### Idempotent Content Seed
```ts
// convex/mutations.ts
/**
 * One-shot content seed for new deployments.
 * Safe to run multiple times — never overwrites existing edits.
 */
export const seedBakeryContent = mutation({
  args: {},
  handler: async (ctx) => {
    const summary = { siteSettings: 'skipped', menuItems: 0, testimonials: 0 }

    // 1. Insert siteSettings only when missing
    const existing = await ctx.db
      .query('siteSettings')
      .filter((q) => q.eq(q.field('key'), 'main'))
      .first()
    if (!existing) {
      await ctx.db.insert('siteSettings', { key: 'main', /* ... */ })
      summary.siteSettings = 'inserted'
    }

    // 2. Insert menu items only when table is empty (use take(1))
    const peek = await ctx.db.query('menuItems').take(1)
    if (peek.length === 0) {
      for (const item of items) await ctx.db.insert('menuItems', { ...item, createdAt: Date.now() })
      summary.menuItems = items.length
    }

    return summary
  },
})
```

**Idempotency rules:**
- `siteSettings` is a singleton — check for the existing `key="main"` document, insert only if missing
- For tables that hold many documents, use `await ctx.db.query('table').take(1)` to peek for any row, then insert seed batch only if empty
- NEVER call `await ctx.db.query('table').collect()` for the emptiness check — `collect()` reads the whole table; `take(1)` reads at most one row
- Storage-backed tables (e.g. `gallery`) should be skipped in seed — they require real uploads via the admin UI so `storage.getUrl()` resolves to a real CDN URL

Run via terminal `npx convex run mutations:seedBakeryContent` or the Convex Dashboard's Functions tab.

### Resolve a storageId to a URL (for reusable upload fields)
```ts
// convex/files.ts
export const getStorageUrl = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId)
    if (!url) throw new Error('Storage URL not found')
    return url
  },
})
```
Use this when an upload field needs to hand a real URL back to the caller (so the caller can store it on the parent record, e.g., `siteSettings.heroContent.imageUrl`). The gallery uses `saveGalleryImageFromStorage` instead because it both resolves the URL and inserts the record.

### Client-Side Upload with XHR Progress
```tsx
'use client'
import { useMutation } from 'convex/react'

function UploadField() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const saveImage = useMutation(api.files.saveGalleryImageFromStorage)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Get upload URL from Convex
    const uploadUrl = await generateUploadUrl()

    // 2. PUT file to Convex storage via XHR (for progress tracking)
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => { /* update progress */ }
    await new Promise<void>((resolve, reject) => {
      xhr.onload = () => {
        const storageId = xhr.responseText.trim()
        // 3. Save gallery entry with storageId
        saveImage({ storageId: storageId as Id<'_storage'>, ... })
        resolve()
      }
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  }

  return <input type="file" accept="image/*" onChange={handleFile} />
}
```

### Component Pattern with Convex
```tsx
'use client'

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Skeleton } from '@/components/ui/skeleton'

export function MySection() {
  const data = useQuery(api.queries.getData)  // no args

  if (!data) return <Skeleton className="h-20 w-full" />  // loading
  if (data.length === 0) return <EmptyState />               // empty

  return <div>{data.map(/* ... */)}</div>                     // data
}
```

---

## next-intl v4

### Request Config
```ts
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }
  return {
    locale: locale as 'en' | 'ar',
    messages: (await import(`../i18n/messages/${locale}.json`)).default,
  }
})
```

### Type Registration
```ts
// src/global.d.ts
import en from './i18n/messages/en.json'

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof en
    Locale: 'en' | 'ar'
  }
}
```

### RTL Layout
```tsx
// src/app/[locale]/layout.tsx
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  )
}
```

### Translation Usage
```tsx
// Client component — scoped namespace
const t = useTranslations('menu')
t('heading')                    // "Our Menu"
t('categories.cakes')           // "Cakes"

// Server component — explicit locale
const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'hero' })
t('heading')

// Root-level access (dot notation)
const t = useTranslations()
t('site.title')
t('admin.dashboard.welcome')
t('common.loading')
```

---

## Tailwind v4 — OKLCH Theme

### CSS Variable Setup
```css
/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

:root {
  --background: oklch(16.5% 0.018 52);
  --accent: oklch(68% 0.095 62);
  /* ... */
}

@theme inline {
  --color-background: var(--background);
  --color-accent: var(--accent);
  --font-heading: var(--font-playfair);
  --font-body: var(--font-inter);
  --shadow-card: 0 2px 12px oklch(16.5% 0.018 52 / 0.15);
}
```

### RTL-Safe Spacing
```tsx
// ✅ CORRECT
<div className="flex gap-3">
  <div className="ms-auto">   {/* margin-inline-start: auto */}
  <div className="pe-4">      {/* padding-inline-end */}
  <div className="border-s-2"> {/* border-inline-start */}
</div>

// ❌ WRONG
<div className="ml-auto">     {/* breaks in RTL */}
<div className="pr-4">        {/* breaks in RTL */}
<div className="border-l-2">  {/* breaks in RTL */}
```

---

## Auth — Clerk (v7, @clerk/nextjs)

The project uses Clerk for authentication. No iron-session files exist (`session.ts`, `login/actions.ts`, `logout/actions.ts` were deleted).

### Environment Variables Required
```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_FRONTEND_API_URL=https://<your-clerk-instance>.clerk.accounts.dev
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Convex (auto-generated)
NEXT_PUBLIC_CONVEX_URL=https://<project>.convex.cloud
```

### Middleware (proxy.ts)
```ts
// src/proxy.ts — Clerk + intl middleware
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isPublicAuthRoute = createRouteMatcher([
  "/admin/login(.*)", "/admin/signup(.*)", "/admin/unauthorized(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request) && !isPublicAuthRoute(request)) {
    await auth.protect();
    const authObj = await auth();
    const userEmail = authObj?.sessionClaims?.email as string | undefined;
    if (userEmail !== process.env.ADMIN_EMAIL) {
      return Response.redirect(new URL("/admin/unauthorized", request.url));
    }
  }
  return intlMiddleware(request);
});
```

### Root Layout — ClerkProvider
```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex-provider";

export default function RootLayout({ children }: Props) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}
```

### Convex Integration — ConvexProviderWithClerk
```tsx
// src/lib/convex-provider.tsx
"use client";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

### Layout Guard (defense-in-depth)
```tsx
// src/app/[locale]/admin/(protected)/layout.tsx
import { auth } from "@clerk/nextjs/server";

export default async function AdminProtectedLayout({ children, params }) {
  const { locale } = await params;
  const session = await auth();

  if (!session.userId) {
    redirect(`/${locale}/admin/login`);
  }

  const email = session.sessionClaims?.email as string | undefined;
  if (email !== process.env.ADMIN_EMAIL) {
    redirect(`/${locale}/admin/unauthorized`);
  }

  return <AdminShell>{children}</AdminShell>;
}
```

### Login Page — Clerk <SignIn />
```tsx
// src/app/[locale]/admin/(auth)/login/[[...rest]]/page.tsx
"use client";
import { SignIn } from "@clerk/nextjs";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

### Logout — useClerk().signOut()
```tsx
// src/components/admin/AdminSidebar.tsx
import { useClerk } from "@clerk/nextjs";

const { signOut } = useClerk();
<button onClick={() => signOut({ redirectUrl: "/" })}>Logout</button>
```

### Rate Limiting — Convex-persisted
```ts
// convex/mutations.ts — replaces in-memory Map
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export const checkAndIncrementLoginAttempt = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
    // Prune expired entries, count in-window, reject if >= 5
  },
});
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

---

## Sonner Toast

```tsx
// Root layout — add once
import { Toaster } from 'sonner'
<Toaster position="top-right" richColors closeButton />

// Any component
import { toast } from 'sonner'

toast.success('Changes saved')
toast.error('Failed to save')
toast('Copied to clipboard')
```

---

## i18n Label Mapping — Convex Schema → Display Labels

Admin editors map Convex schema field names to plain-language labels using the canonical table in `ADMIN_CMS_GUIDE.md`. The preferred implementation uses i18n translation keys under `admin.fields.*` so that labels are automatically bilingual.

### Pattern: i18n key per field

Add entries to `src/i18n/messages/en.json` and `ar.json`:

```json
{
  "admin": {
    "fields": {
      "heading_en": "Main Title (English)",
      "heading_ar": "العنوان الرئيسي (عربي)",
      "price": "Price",
      "price_ar": "السعر",
      "isAvailable": "Currently making this?",
      "isAvailable_ar": "متوفر الآن؟"
    }
  }
}
```

### Usage in admin editors

```tsx
'use client'
import { useTranslations } from 'next-intl'

function EditorField({ field }: { field: string }) {
  const t = useTranslations('admin.fields')
  return <Label>{t(field)}</Label>
}
```

The `useTranslations('admin.fields')` call scopes all lookups to that namespace, so `t('price')` resolves to `admin.fields.price`.

### When NOT to use the i18n pattern

For section-level nav labels (sidebar links), the canonical table in `ADMIN_CMS_GUIDE.md` uses plain text strings directly, not i18n keys. This is intentional — the sidebar is code-generated from a static `sidebarLinks` array and admin-only; translation is unnecessary for the bakery use case.

**See also:** `PROJECT_RULES.md` Rule 14d — every admin label must match the canonical table.

---

## Theme System — Light/Dark with next-themes

The project uses `next-themes` with class-based toggling and OKLCH semantic tokens.

### Root Layout Setup

```tsx
// src/app/layout.tsx
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
```

Add `suppressHydrationWarning` to `<html>` in `[locale]/layout.tsx`:
```tsx
<html lang={locale} dir={dir} className={fontClass} suppressHydrationWarning>
```

### Token Structure

All colors are defined in `src/app/globals.css` using OKLCH format. Two complete sets:

- `:root` — Dark mode (default, primary brand aesthetic)
- `.light` — Light mode (warm cream palette, opt-in only)

```css
/* Both :root and .light define identical token names with different values */
:root {
  --background: oklch(16.5% 0.018 52);   /* dark */
  --surface: oklch(20% 0.020 50);
  /* ... */
}

:root.light, .light {
  --background: oklch(96% 0.012 55);     /* warm cream */
  --surface: oklch(94% 0.010 55);
  /* ... */
}

@theme inline {
  --color-background: var(--background);  /* references CSS var, auto-switches */
}
```

### ThemeToggle Component

```tsx
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-5 w-5" />; // prevent hydration mismatch

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
```

**Critical patterns:**
- `mounted` state prevents hydration mismatch (SSR renders nothing, client fills in)
- `enableSystem={false}` prevents auto-flash from `prefers-color-scheme`
- `disableTransitionOnChange` prevents CSS transition flicker during theme swap
- Semantic tokens handle ALL color changes — no component modifications needed
- Zero hardcoded colors (`bg-white`, `text-black`) anywhere in the codebase

**See also:** `PROJECT_RULES.md` §17 (No Hardcoded Colors), §18 (Light Mode Opt-In)

---

## Convex Mutation Auth Pattern

All write mutations use `requireAdmin(ctx)` from `convex/auth.ts`. Reads are public.

### Setup (one-time)

```bash
# 1. Set ADMIN_EMAIL in both .env.local and Convex Dashboard → Environment Variables
ADMIN_EMAIL=your-email@example.com

# 2. Convex reads Clerk session tokens automatically via convex/auth.config.ts
# No extra env vars needed beyond CLERK_FRONTEND_API_URL
```

### convex/auth.ts

```ts
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

### Write mutation pattern

```ts
// convex/mutations.ts
import { requireAdmin } from "./auth";

export const updateHeroContent = mutation({
  args: heroContentFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);   // ← always first — uses Clerk identity via ctx.auth
    // ... db operations
  },
});
```

No admin token or client-side auth context is needed. `requireAdmin(ctx)` reads the Clerk session cookie automatically through Convex's built-in Clerk integration.

### contactInquiries table (public form, no auth)

```ts
// Public — visitors submit without authentication
export const submitContactInquiry = mutation({
  args: {
    name: v.string(), email: v.string(),
    requestType: v.union(v.literal("consulting"), v.literal("catering"),
      v.literal("training"), v.literal("partnerships"), v.literal("other")),
    message: v.string(), phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Rate limit: same email, max 1 per 10 min
    const recent = await ctx.db.query("contactInquiries")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => q.gte(q.field("createdAt"), Date.now() - 600_000))
      .first();
    if (recent) throw new ConvexError({ code: "RATE_LIMITED", message: "..." });
    return await ctx.db.insert("contactInquiries", { ...args, createdAt: Date.now(), isRead: false });
  },
});
```

---

## SEO — generateMetadata Pattern

```tsx
// src/app/[locale]/layout.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return {
    title: locale === 'ar' ? 'الشيف محمد | استشاري مخبوزات فرنسية' : 'Chef Mohamed | French Bakery Consultant',
    description: locale === 'ar' ? '... عربي ...' : '... English ...',
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: { en: `${siteUrl}/en`, ar: `${siteUrl}/ar` },
    },
    openGraph: { type: 'website', locale: locale === 'ar' ? 'ar_EG' : 'en_US' },
    robots: { index: true, follow: true },
  }
}
```

---

## Projects CRUD Pattern

### Schema
```ts
// convex/schema.ts
projects: defineTable({
  role_en: v.string(), role_ar: v.string(),
  workplace_en: v.string(), workplace_ar: v.string(),
  location_en: v.string(), location_ar: v.string(),
  description_en: v.optional(v.string()), description_ar: v.optional(v.string()),
  category: v.union(v.literal("early"), v.literal("specialization"), v.literal("leadership"), v.literal("founder"), v.literal("international")),
  imageUrl: v.nullable(v.id("_storage")),
  order: v.number(), isVisible: v.boolean(), isHighlight: v.optional(v.boolean()),
  createdAt: v.number(),
}).index("by_order", ["order"]).index("by_visible", ["isVisible"]).index("by_category", ["category"])
```

### Query
```ts
export const getVisibleProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects")
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
    return await ctx.db.insert("projects", { ...args, createdAt: Date.now() });
  },
});
```

### Mutation (delete with storage cleanup)
```ts
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Project not found");
    if (item.imageUrl) await ctx.storage.delete(item.imageUrl);  // Prevent storage leak
    await ctx.db.delete(args.id);
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
  if (projects.length === 0) return null
  return <ProjectCardGrid projects={projects} />
}
```

---

## Locations Pattern

### Schema
```ts
locations: defineTable({
  name_en: v.string(), name_ar: v.string(),
  region: v.union(v.literal("cairo"), v.literal("international")),
  neighborhoods: v.array(v.string()), neighborhoods_ar: v.array(v.string()),
  markerIcon: v.string(), order: v.number(), isVisible: v.boolean(), createdAt: v.number(),
}).index("by_order", ["order"])
```

---

## Contact Form Dynamic Request Types

The contact form dropdown reads from `contactInfo.requestTypes[]` in the schema.
Fallback to hardcoded list if schema has no data.

```tsx
// src/components/sections/ContactForm.tsx
const contactInfo = useQuery(api.queries.getContactInfo);
const requestTypes = contactInfo?.requestTypes ?? FALLBACK_REQUEST_TYPES;

function getLabel(rt: { value: string; label_en: string; label_ar: string }): string {
  return locale === "ar" ? (rt.label_ar || rt.label_en) : rt.label_en;
}
```

---

## SiteSettings Extensions

### Education (aboutContent)
```ts
aboutContent: v.object({
  // ... existing fields ...
  education_en: v.optional(v.nullable(v.string())),
  education_ar: v.optional(v.nullable(v.string())),
})
```

### Request Types + Business Hours (contactInfo)
```ts
contactInfo: v.object({
  // ... existing fields ...
  requestTypes: v.optional(v.array(v.object({
    value: v.string(), label_en: v.string(), label_ar: v.string(),
  }))),
  businessHours: v.optional(v.object({
    note_en: v.string(), note_ar: v.string(),
  })),
})
```
