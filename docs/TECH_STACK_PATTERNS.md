# TECH STACK PATTERNS

**Last Updated:** 2026-06-21

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

## Auth — iron-session v8

### Session Setup
```ts
// src/lib/session.ts
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'chef_admin_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,  // 7 days
  },
}

export async function getSession() {
  const cookieStore = await cookies()  // ✅ MUST await
  return getIronSession(cookieStore, sessionOptions)
}
```

### Layout Guard
```tsx
// src/app/[locale]/admin/(protected)/layout.tsx
import { redirect } from '@/i18n/navigation'
import { getSession } from '@/lib/session'

export default async function AdminProtectedLayout({ children, params }) {
  const { locale } = await params
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect({ href: '/admin/login', locale: locale as 'en' | 'ar' })
  }

  return <div className="flex">{children}</div>
}
```

### Login Route (with Rate Limiting)
```ts
// src/app/api/admin/login/route.ts
const rateLimitMap = new Map<string, { attempts: number; firstAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  // Rate limit check
  const record = rateLimitMap.get(ip)
  if (record && (Date.now() - record.firstAttempt) < WINDOW_MS && record.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }

  const { username, password } = await request.json()
  const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!)

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const session = await getSession()
  session.isLoggedIn = true
  session.username = username
  await session.save()

  rateLimitMap.delete(ip)  // Reset on success
  return NextResponse.json({ success: true })
}
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

## SEO — generateMetadata Pattern

```tsx
// src/app/[locale]/layout.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return {
    title: locale === 'ar' ? 'الشيف أميرة | مخبز حرفي' : 'Chef Amira | Artisan Bakery',
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
