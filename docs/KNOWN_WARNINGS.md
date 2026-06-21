# KNOWN WARNINGS

**Last Updated:** 2026-06-21

Accepted trade-offs and intentional design decisions. These are NOT bugs — do NOT attempt to "fix" them without understanding the reasoning.

---

## Warning #1: `<img>` Used Instead of `<Image>` in Gallery

**Status:** ✅ Intentional — DO NOT "fix"

### The Warning
The gallery components (`public GallerySection` and `admin gallery`) use native `<img>` tags instead of Next.js `<Image>` component.

### Why This Is Acceptable
- Gallery images come from Convex storage with dynamic URLs that match `*.convex.cloud` (already in `remotePatterns`)
- Using `<Image>` would require:
  - Specifying `width` and `height` for every image (not feasible for masonry layout with unknown dimensions)
  - Adding `unoptimized` prop for external dynamic images (negates the benefit)
- The gallery uses `loading="lazy"` natively via `<img loading="lazy">`
- The admin uses `<img>` inside sortable DnD cards where `<Image>`'s wrapper div would interfere with drag transforms

### When To Use `<Image>`
- Use `<Image>` for static, known-dimension images (logos, hero images with fixed aspect ratios)
- Use `<img>` for dynamic gallery/masonry layouts with unknown dimensions

---

## Warning #2: No Suspense Boundaries Around Convex Sections

**Status:** ✅ Intentional — DO NOT "fix"

### The Warning
Public-facing section components (HeroSection, MenuSection, etc.) use `useQuery()` from Convex without being wrapped in `<Suspense>` boundaries.

### Why This Is Acceptable
- `useQuery()` from Convex does NOT trigger React Suspense — it returns `undefined` while loading
- Each component handles loading internally via `if (!data) return <Skeleton />`
- This is the standard Convex pattern documented at docs.convex.dev
- Adding `<Suspense>` would not improve UX because Convex queries don't suspend rendering

### The Pattern
```tsx
function Section() {
  const data = useQuery(api.queries.getData)

  if (!data) return <Skeleton />    // ← Loading handled here, not via Suspense
  return <div>{data}</div>
}
```

---

## Warning #3: Hardcoded "Admin" Title in AdminTopbar

**Status:** ✅ Intentional — Low priority, DO NOT "fix" without reason

### The Warning
```tsx
// src/app/[locale]/admin/(protected)/layout.tsx
<AdminTopbar title="Admin" />  // Not translated
```

### Why This Is Acceptable
- The AdminTopbar only shows on mobile (hidden on desktop via `lg:hidden`)
- The `title` prop is overridden by each page's own `<h1>` heading in the content area
- This is a minor cosmetic issue with no functional impact
- Translating "Admin" to Arabic ("لوحة التحكم") would be trivial but unnecessary since this is an admin-only view

### What To Do Instead of Hardcoding
If the hardcoded title bothers you, use the translated key from the admin namespace:
```tsx
// Get translations from the parent — but requires converting layout to understand locale
```

**Recommendation:** Leave as-is unless a user specifically requests translation.

---

## Warning #4: SESSION_SECRET Validation

**Status:** ✅ Documented — Setup-time concern, NOT a code fix

### The Warning
The `SESSION_SECRET` environment variable must be at least 32 characters. There is no runtime validation in the code.

### Why This Is Acceptable
- This is a well-known requirement of `iron-session` (will throw at startup if too short)
- Documented in both `.env.local.example` and the setup guide
- Runtime validation would add unnecessary complexity for a setup-time error
- The `npm run generate-password` script could be extended to generate a random secret, but that's a feature enhancement, not a fix

### What To Do
When setting up the project:
```bash
# Generate a random 32+ char string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste into SESSION_SECRET in .env.local
```

---

## Warning #5: Space in Chef's Name "Chef Amira"

**Status:** ✅ Intentional — DO NOT "fix"

The project uses "Chef Amira" consistently as the brand name. Note that the name contains a space that appears in URLs and file paths. This is intentional brand identity — do not replace with "Chef_Amira" or "ChefAmira" unless explicitly requested.

---

## Warning #6: Rate Limiting Uses In-Memory Map

**Status:** ✅ Intentional — Acceptable for single-instance deployment

### The Warning
Login rate limiting uses a JavaScript `Map<string, { attempts, firstAttempt }>` stored in memory.

### Why This Is Acceptable
- This is a single-instance Next.js application (no horizontal scaling)
- Rate limit state resets on server restart (which is acceptable for a bakery portfolio)
- For production with multiple instances, replace with a Convex mutation/database-backed rate limiter
- The current implementation correctly handles the 5-attempts-per-15-minutes window

---

## Warning #7: Next.js 16 `turbopackFileSystemCacheForDev` is Experimental

**Status:** ✅ Intentional — Stable in Next.js 16.1+

This flag is enabled in `next.config.ts`:
```ts
experimental: { turbopackFileSystemCacheForDev: true }
```

While the property lives under `experimental`, it has been production-stable since Next.js 16.1. It provides persistent Turbopack cache across dev server restarts. If a future Next.js version deprecates or removes this, simply delete the line.
