# PROJECT RULES

**Last Updated:** 2026-06-21

## Global Non-Negotiable Rules

These rules are derived from the QA audit. Violations will cause build failures or runtime bugs.

---

## 1. Next.js 16 — Middleware-to-Proxy Migration

**✅ DO:**
- File is `src/proxy.ts` (NOT `middleware.ts`)
- Function is named `proxy` and uses `export default`
- proxy.ts ONLY does routing — NO auth, NO database calls

```ts
export default function proxy(request: NextRequest) {
  return intlMiddleware(request);
}
```

**❌ DON'T:**
- Do NOT create a file named `middleware.ts`
- Do NOT export a function named `middleware`
- Do NOT perform auth checks inside proxy.ts

**Rationale:** Next.js 16 renamed middleware to proxy. Auth must use layout guards (`(protected)/layout.tsx`) per CVE-2025-29927 mitigation.

---

## 2. React 19.2 — No forwardRef

React 19 passes refs as regular props. The `forwardRef` API is deprecated.

**✅ DO:**
- Ref is just a regular prop named `ref`
- Components receive `ref` directly in props

**❌ DON'T:**
- Do NOT use `React.forwardRef()` or `forwardRef()` anywhere
- Do NOT wrap components with `forwardRef`

---

## 3. motion — Import from 'motion/react'

The package is `motion` (NOT `framer-motion`).

**✅ DO:**
```ts
import { motion } from 'motion/react'
```

**❌ DON'T:**
```ts
import { motion } from 'framer-motion'  // WRONG — package renamed
```

---

## 4. Toast Notifications — Sonner ONLY

**✅ DO:**
```ts
import { toast } from 'sonner'
toast.success('Saved')
toast.error('Failed')
```
- `<Toaster position="top-right" richColors closeButton />` in root layout

**❌ DON'T:**
- Do NOT use `import { toast } from '@/components/ui/toast'` — shadcn toast component is NOT installed
- Do NOT use `import { useToast } from ...` — does not exist in this project

---

## 5. shadcn/ui v4 — No asChild, Use render

This version uses `@base-ui/react` which uses a `render` prop instead of `asChild`.

**✅ DO:**
```tsx
<SheetTrigger render={<Button variant="ghost" />}>
  <Menu className="h-5 w-5" />
</SheetTrigger>
```

**❌ DON'T:**
```tsx
<SheetTrigger asChild>      // WRONG — asChild does NOT exist
  <Button variant="ghost" />
</SheetTrigger>
```

Same applies to `DialogTrigger`.

---

## 6. RTL Spacing — Logical Properties Only

**✅ DO:**
- `ms-*` (margin-inline-start) instead of `ml-*`
- `me-*` (margin-inline-end) instead of `mr-*`
- `ps-*` (padding-inline-start) instead of `pl-*`
- `pe-*` (padding-inline-end) instead of `pr-*`
- `start-*` / `end-*` instead of `left-*` / `right-*`
- `border-s-*` / `border-e-*` instead of `border-l-*` / `border-r-*`

**❌ DON'T:**
- Do NOT use `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-` in custom code

**Note:** Auto-generated shadcn UI files may still contain `pr-`/`pl-`. Do NOT modify those files.

---

## 7. Auth — Layout Guard Pattern

Auth lives in Server Component layout files, NOT in proxy.ts.

**✅ DO:**
```tsx
// src/app/[locale]/admin/(protected)/layout.tsx
const session = await getSession()
if (!session.isLoggedIn) {
  redirect({ href: '/admin/login', locale })
}
```

**❌ DON'T:**
- Do NOT put auth checks in `proxy.ts`
- Do NOT use client-side checks as the primary auth mechanism

---

## 8. Async Params and cookies

All `params` and `searchParams` are Promises in Next.js 16.

**✅ DO:**
```tsx
type Props = { params: Promise<{ locale: string }> }
export default async function Page({ params }: Props) {
  const { locale } = await params
```

**✅ DO:**
```ts
const cookieStore = await cookies()
const session = await getIronSession(cookieStore, options)
```

**❌ DON'T:**
```tsx
function Page({ params: { locale } }: { params: { locale: string } }) {  // WRONG
```
```ts
const session = await getIronSession(cookies(), options)  // WRONG — cookies() not awaited
```

---

## 9. Convex — v.nullable() for Optional Fields

Convex 1.29+ provides `v.nullable()`.

**✅ DO:**
```ts
imageUrl: v.nullable(v.string())
storageId: v.nullable(v.id('_storage'))
```

**❌ DON'T:**
```ts
imageUrl: v.union(v.string(), v.null())  // WRONG — old pattern
imageUrl: v.optional(v.string())         // WRONG — creates implicit undefined
```

---

## 10. File Structure Conventions

```
src/
  app/[locale]/            ← All routes under locale
    admin/
      (auth)/login/        ← Public login (no guard)
      (protected)/         ← All guarded admin pages
        layout.tsx         ← Auth guard + sidebar layout
  proxy.ts                 ← NOT middleware.ts
  i18n/request.ts          ← NOT i18n.ts at root
  lib/convex-provider.tsx  ← 'use client' wrapping ConvexReactClient
  types/index.ts           ← All shared types
```

---

## 11. next-intl v4 API

**✅ DO:**
- File is `src/i18n/request.ts`
- Use `defineRouting()` from `next-intl/routing`
- Use `createNavigation()` from `next-intl/navigation`
- `NextIntlClientProvider` has NO `messages` or `locale` props (auto-inherited)
- `getMessages()` called with NO arguments
- `global.d.ts` uses `AppConfig` interface pattern

**❌ DON'T:**
- Do NOT use old `createLocalizedPathnamesNavigation`
- Do NOT use the old `declare module 'next-intl'` pattern without `AppConfig`
- Do NOT pass `messages` or `locale` to `NextIntlClientProvider`

---

## 12. Suspense and Loading State Pattern

Convex `useQuery` loading is handled via `if (!data)` checks with Skeletons. This is an intentional pattern choice.

**✅ DO:**
```tsx
if (!data) return <Skeleton className="..." />
if (data.length === 0) return <EmptyState />
return <DataView data={data} />
```

**❌ DON'T:**
- Do NOT add `<Suspense>` boundaries around Convex sections (will not work with client-side useQuery)
- Do NOT remove the `if (!data)` loading checks
