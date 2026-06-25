# PROJECT RULES

**Last Updated:** 2026-06-23 (Auth docs reconciled with Clerk — Rules 7, 26 rewritten; Rule 32 removed)

## Global Non-Negotiable Rules

These rules are derived from the QA audit. Violations will cause build failures or runtime bugs.

---

## 1. Next.js 16 — Proxy (NOT middleware.ts)

**✅ DO:**
- File is `src/proxy.ts` (NOT `middleware.ts`)
- Function is named `proxy` and uses `export default`
- proxy.ts is the first auth layer — uses `clerkMiddleware` to protect `/admin(.*)` routes and enforces `ADMIN_EMAIL`

```ts
export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request) && !isPublicAuthRoute(request)) {
    await auth.protect();
    // Enforce single admin email
    const authObj = await auth();
    if (authObj?.sessionClaims?.email !== process.env.ADMIN_EMAIL) {
      return Response.redirect(new URL("/admin/unauthorized", request.url));
    }
  }
  return intlMiddleware(request);
});
```

**❌ DON'T:**
- Do NOT create a file named `middleware.ts`
- Do NOT export a function named `middleware`
- Do NOT put auth checks solely in client-side code — middleware is the first of three auth layers

**Rationale:** Next.js 16 renamed middleware to proxy. Auth uses three layers: proxy.ts (Clerk) → layout guard (`(protected)/layout.tsx`) → Convex mutations (`requireAdmin()`). This is defense-in-depth against CVE-2025-29927.

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

## 7. Auth — Three-Layer Pattern (Clerk)

Auth uses Clerk for all three layers. No iron-session files exist.

**Layer 1 — Middleware:** `src/proxy.ts` uses `clerkMiddleware` to protect `/admin(.*)` routes via `auth.protect()` + email enforcement against `ADMIN_EMAIL`.

**Layer 2 — Layout Guard:** `admin/(protected)/layout.tsx` uses `auth()` from `@clerk/nextjs/server` + email check as defense-in-depth.

**Layer 3 — Convex Mutations:** `convex/auth.ts` `requireAdmin(ctx)` verifies Clerk identity via `ctx.auth.getUserIdentity()` + `ADMIN_EMAIL` enforcement.

**✅ DO:**
```tsx
// src/app/[locale]/admin/(protected)/layout.tsx
import { auth } from "@clerk/nextjs/server";

const session = await auth();
if (!session.userId) {
  redirect(`/${locale}/admin/login`);
}
const email = session.sessionClaims?.email as string | undefined;
if (email !== process.env.ADMIN_EMAIL) {
  redirect(`/${locale}/admin/unauthorized`);
}
```

**❌ DON'T:**
- Do NOT use iron-session (`getSession`, `getIronSession`, `SESSION_SECRET`) — none of these exist
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

**❌ DON'T:**
```tsx
function Page({ params: { locale } }: { params: { locale: string } }) {  // WRONG
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

---

## 13. Route Group Chrome Boundaries

Public chrome (Header/Footer) and admin chrome (Sidebar/Topbar) must live in their own route group layouts, NOT in `[locale]/layout.tsx`.

**✅ DO:**
```
src/app/[locale]/
  layout.tsx                         ← <html>, providers, fonts ONLY
  (site)/
    layout.tsx                       ← <Header/> + <Footer/>
    page.tsx, menu/, about/, contact/
  admin/
    (auth)/login/page.tsx            ← no chrome
    (protected)/
      layout.tsx                     ← <AdminSidebar/> + <AdminTopbar/>
```

**❌ DON'T:**
- Do NOT render `<Header/>` or `<Footer/>` directly inside `[locale]/layout.tsx` — admin pages will inherit them
- Do NOT duplicate chrome — one site layout, one admin layout

**Rationale:** Without this separation, admin routes get the customer-facing navbar stacked above the admin sidebar — double header.

---

## 14. Admin Editor Checklist

Every page under `admin/(protected)/<section>/page.tsx` that edits content MUST:

1. `useQuery` the source data, `useMutation` the updater
2. Wrap form chrome in `<SectionEditorShell>` (provides save/cancel bar, unsaved-change guard, view-on-site link)
3. Render bilingual fields — English input + Arabic input with `dir="rtl"` and `text-right`
4. Cover every editable schema field (don't skip nullable fields or arrays)
5. Use `<ImageUploadField>` for any nullable `imageUrl` field
6. Use the `loaded`-flag pattern to seed form state once when the query resolves
7. Compute a `hasUnsaved` boolean by comparing local state to the query result, and pass to `SectionEditorShell`
8. Show `toast.success` / `toast.error` from `sonner` after the mutation resolves

**❌ DON'T:**
- Do NOT use `await new Promise(r => setTimeout(r, 500))` as a fake save — every editor must actually persist via Convex
- Do NOT skip the Arabic counterpart of a bilingual field
- Do NOT render the chrome (back button, save bar) manually — always use `SectionEditorShell`

### 14a. Plain-Language Labels (Non-Technical User Rule)

The admin is used by a baker, not a developer. Every user-visible string in admin must pass the **"would my grandmother understand this?"** test.

**✅ DO:**
- "Homepage Welcome" / "Big welcome message" — not "Hero Section" / "Heading"
- "Your Story" — not "Bio"
- "What you do best" — not "Skills" (though "Skills" passes too)
- "Photo Gallery" / "Customer Reviews" — not "Gallery" / "Testimonials" alone
- "Upload a photo" / "Change photo" — not "Upload Image" / "Change Image"
- Username — not "Email" (unless the field actually validates an email)
- Errors that suggest a next action: "Couldn't save. Check your internet and try again." — not "Failed to save"
- File size limits surfaced **upfront** in helper text: "Max 5 MB · JPG or PNG works best"
- Error messages naming the actual file types they accept: "JPG or PNG" — not "JPEG, PNG, WebP, AVIF"
- Empty states that **teach**, not just announce: "Tell visitors what you do best — e.g. Sourdough, Wedding Cakes" — not "No skills yet"
- Input placeholders that hint at non-obvious interactions: "Type a specialty and press Enter" — not "Add a skill"

**❌ DON'T:**
- Do NOT use words like "Hero", "CTA", "slug", "nullable", "schema", "field", "Section"
- Do NOT abbreviate ("Bio", "Tx", "Img") — write the full word
- Do NOT show technical file-type names (WebP, AVIF) in user-facing errors
- Do NOT surface a size or format limit only in the failure message — surface it before the user tries
- Do NOT write error messages that just describe what failed — describe what to do next

### 14b. Save/Cancel Safety

The "Cancel" button and the breadcrumb back arrow both call the same handler. When `hasUnsaved` is true:

**✅ DO:**
```ts
const handleCancel = useCallback(() => {
  if (hasUnsaved) {
    const proceed = window.confirm(t("unsavedConfirm"));
    if (!proceed) return;
  }
  // ... navigate
}, [hasUnsaved, ...]);
```

**❌ DON'T:**
- Do NOT rely on `beforeunload` alone — it only fires on full-page reload, not in-app navigation
- Do NOT navigate without confirming when there are unsaved changes

### 14d. Admin Labels MUST Come From CHEF_PROFILE.md

All admin-facing labels (field labels, section nav names, button text, empty-state text) MUST use the canonical label table in `ADMIN_CMS_GUIDE.md` → "Canonical Chef-Friendly Field Labels". That table is derived from `CHEF_PROFILE.md` Section 7 and has been reviewed by the chef.

**✅ DO:**
```tsx
<Label>Price</Label>                          // matches canonical table
<Label>Stars (1 to 5)</Label>                 // matches canonical table
<Label>Item Name (English)</Label>            // matches canonical table
```

**❌ DON'T:**
```tsx
<Label>menuItems.price</Label>               // dev field name, not user-facing
<Label>Rating Value</Label>                  // invented label, not in canonical table
<Label>cost</Label>                          // colloquial term, not canonical
```

- Every `Label` in an admin editor must have a 1:1 match in the canonical table
- If a field doesn't exist in the table, add it to both `ADMIN_CMS_GUIDE.md` and the `CHEF_PROFILE.md` Section 7 before writing code
- The canonical table IS the contract between developer and chef — changes must be agreed with the chef

### 14c. Image Upload Affordances

`ImageUploadField` should accept both click-to-upload AND drag-to-drop:
- A baker on a desktop expects to drag a photo from Finder/Explorer
- A baker on a phone taps to open the photo picker
- Both work; both target the same `handleFile` flow

**✅ DO:**
- Wire `onDragOver`, `onDragLeave`, `onDrop` on the drop-zone `<label>`
- Show a hint line ("or drop a photo here") below the upload button
- Show size/format hint ("Max 5 MB · JPG or PNG") as small helper text on the drop zone

---

## 15. Motion Accessibility (prefers-reduced-motion)

Every component using `motion/react` MUST respect user motion preferences.

**✅ DO:**
```tsx
import { motion, useReducedMotion } from 'motion/react'

const shouldReduce = useReducedMotion()

<motion.div
  initial={shouldReduce ? {} : { opacity: 0, x: -40 }}
  animate={{ opacity: 1, x: 0 }}
/>
```

**✅ DO in globals.css:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**❌ DON'T:**
- Do NOT animate without checking `useReducedMotion()` first
- Do NOT rely on CSS alone — the hook prevents initial render flicker for users who change settings mid-session

---

## 16. Skeleton Dimension Parity

Every skeleton placeholder must have the **exact same dimensions** (width, height, border-radius, margin, padding) as the real content it represents.

**✅ DO:**
```tsx
// Loading skeleton — matches the two-column grid of the loaded state
<section className="relative min-h-[80vh] flex items-center">
  <div className="container mx-auto px-4">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <Skeleton className="h-16 w-full max-w-md" />
      </div>
      <Skeleton className="aspect-square rounded-2xl" />
    </div>
  </div>
</section>
```

**❌ DON'T:**
- Do NOT use different grid layouts for skeleton vs. loaded state
- Do NOT use `rounded-none` on skeleton images when the real images have rounded corners
- Do NOT use varying skeleton bar widths that don't correspond to the real text dimensions

---

## 17. No Hardcoded Colors — Semantic Tokens Only

All colors must use OKLCH semantic tokens defined in `globals.css`. Never hardcode hex, rgb, or Tailwind literal colors.

**✅ DO:**
```tsx
<div className="bg-surface text-foreground border-border" />
<div className="text-accent hover:text-accent-hover" />
<div className="bg-muted text-muted-foreground" />
```

**❌ DON'T:**
```tsx
<div className="bg-white text-black" />      // breaks in dark mode
<div className="bg-gray-100 text-blue-600" /> // breaks in light mode
<div className="text-[#333]" />               // no RTL-aware variant
```

**Rationale:** The project supports both dark and light themes via `next-themes` class-based toggling. Hardcoded colors ignore the theme context and will be invisible in one of the two themes. All 30+ semantic tokens in `globals.css` are defined in OKLCH for both `:root` (dark) and `.light`.

---

## 18. Light Mode Is Opt-In, Dark Mode Is Default

The theme system uses `next-themes` with `attribute="class"` and `defaultTheme="dark"`.

**✅ DO:**
- Use `<ThemeToggle />` component for user-facing theme switch
- Set `defaultTheme="dark"` to preserve original brand aesthetic
- Use `suppressHydrationWarning` on `<html>` for SSR compatibility

**❌ DON'T:**
- Do NOT add `@media (prefers-color-scheme)` queries — use class-based toggling only
- Do NOT import `next-themes` `useTheme` in server components — only in `"use client"` components
- Do NOT add theme-specific component variants — semantic tokens handle everything

---

## 26. All Convex Write Mutations Require an Auth Guard

Uses `requireAdmin(ctx)` from `convex/auth.ts` which verifies Clerk identity via `ctx.auth.getUserIdentity()` and enforces single admin email against `ADMIN_EMAIL`.

**✅ DO:**
```ts
// convex/mutations.ts
import { requireAdmin } from "./auth";

export const updateHeroContent = mutation({
  args: { ...heroContentFields },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);   // ← MUST be the first line — uses Clerk identity
    // ... db operations
  },
});
```

**❌ DON'T:**
```ts
export const updateHeroContent = mutation({
  args: heroContentValidator,
  handler: async (ctx, args) => {
    // No requireAdmin() — WRONG: anyone with the Convex URL can call this
    await ctx.db.patch(...)
  },
});
```

**Setup required (one-time):**
1. Set `ADMIN_EMAIL` in both `.env.local` and Convex Dashboard → Settings → Environment Variables
2. Convex reads Clerk session tokens automatically via `convex/auth.config.ts` — no extra setup needed

**Rationale:** The Next.js admin layout guard (Clerk auth) only protects UI routes. Convex mutations are exposed via a separate HTTP/WebSocket endpoint that completely bypasses Next.js. See Bug #17 for the full incident.

**Exceptions:**
- Read queries: always public (portfolio content is public)
- `submitContactInquiry`: intentionally public (visitors submit without login)
- `patchServiceTranslations`, `patchSiteSettingsTranslations`: one-off scripts — require admin before production use

---

## 27. Contact Forms Must Deliver Data

**✅ DO:**
```tsx
const submitInquiry = useMutation(api.mutations.submitContactInquiry);

async function handleSubmit(e) {
  e.preventDefault();
  try {
    await submitInquiry({ name, email, requestType, message }); // persist first
    toast.success(t("success"));                                  // then confirm
  } catch { toast.error(t("error")); }
}
```

**❌ DON'T:**
```tsx
async function handleSubmit(e) {
  e.preventDefault();
  await new Promise(r => setTimeout(r, 1000)); // ← NEVER: fake delay = silent data loss
  toast.success("Message sent!");              // lie — nothing was sent
}
```

**Test:** Submit the form while offline (DevTools → Network → Offline). If the success toast appears, the form is fake.

**Rationale:** `ContactForm.tsx` originally discarded all submissions. Chef Mohamed received zero inquiries from the live site. See Bug #16.

---

---

## 32. Work Experience Must Be Structured Data

Work experience MUST be stored in the `projects` table, NOT woven into the bio text. The bio can reference projects narrative-style, but structured data lives in `projects`.

**✅ DO:**
- Display projects via `useQuery(api.queries.getVisibleProjects)`
- Each project card shows: role, workplace, location, description, category badge

**❌ DON'T:**
- Do NOT hardcode work history in AboutSection.tsx
- Do NOT create a separate "Experience" component that bypasses the schema

---

## 33. Contact Request Types Come From Schema

The Request Type dropdown in the contact form MUST read from `contactInfo.requestTypes[]`. Fallback to hardcoded list only if requestTypes is empty or missing.

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

---

## 34. Locations Table for Geographic Display

Geographic information (Cairo base, international experience) MUST be stored in the `locations` table. The contact address field is for the business address, not a list of service areas.

**✅ DO:**
- Use `locations` table for service area display
- Use `contactInfo.address_en/ar` for the business address only

**❌ DON'T:**
- Do NOT put neighborhood lists in the contact address field
- Do NOT hardcode locations in the public components

---

## 35. Stats Badges Belong in Hero, Not About

`aboutContent.stats[]` is displayed in the Hero section, not buried in the About page. The About page shows bio + skills + education. Stats are Hero-level visual elements.

**✅ DO:**
- Render `stats[]` in `HeroSection.tsx` as badge chips below the CTA
- Keep `skills[]` in `AboutSection.tsx` as a separate list

**❌ DON'T:**
- Do NOT duplicate stats in both Hero and About
- Do NOT remove stats from aboutContent schema (they're stored there for admin simplicity)

---

## 36. CMS Content Boundaries

The admin CMS controls ONLY content displayed on the public site. It does NOT control:
- Navigation structure (hardcoded in code)
- Route structure (file-system based)
- Theme/colors (OKLCH tokens in globals.css)
- Authentication method (Clerk config via Clerk Dashboard)

**❌ DON'T:**
- Do NOT add "navigation editor" or "theme editor" to the admin
- Do NOT make route structure configurable via database

---

## 37. Single-Admin Enforcement

Only ONE admin account exists. There is no user management, no role system, no multi-tenant support. The admin identity is enforced at three layers (cookie, Server Action, Convex mutation).

**❌ DON'T:**
- Do NOT add a "users" table or "roles" field
- Do NOT implement invitation flows or admin registration
- Do NOT create middleware that checks for multiple admin emails

---

## 38. i18n Key Sync — ar.json and en.json Must Be Identical

Both locale files (`src/i18n/messages/en.json` and `ar.json`) MUST have identical key structures at all times. Any key added to one file must be added to the other.

**✅ DO:**
- After adding/removing any i18n key in one file, immediately mirror it in the other
- Verify with: `node -e "const a=require('./src/i18n/messages/ar.json'),b=require('./src/i18n/messages/en.json');console.log(Object.keys(a).length===Object.keys(b).length?'OK':'MISMATCH')"`
- Run `npx tsc --noEmit` after any i18n change to catch structural issues

**❌ DON'T:**
- Do NOT add a key to only one locale file
- Do NOT commit i18n changes without verifying both files are in sync

**Rationale:** As of 2026-06-23, both files have 215 keys each. Differences cause runtime errors on the Arabic site (`t()` call returns undefined). See BUG_FIXES_REGISTRY.md Translation Import entry.

---

## 39. Delete Mutations Must Clean Up Storage

When a table references `v.id("_storage")`, the delete mutation MUST call `ctx.storage.delete()` before `ctx.db.delete()` to prevent orphaned storage objects.

**✅ DO:**
```ts
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Project not found");
    if (item.imageUrl) await ctx.storage.delete(item.imageUrl);
    await ctx.db.delete(args.id);
  },
});
```

**❌ DON'T:**
- Do NOT delete rows without checking for associated storage objects
- Do NOT assume storage cleanup happens automatically

---

## 40. Auth Documentation Must Reflect Reality

All auth documentation in the Memory Bank MUST match the actual auth provider in use. When the auth provider changes (e.g., iron-session → Clerk), ALL auth references across all docs must be updated in the same change.

**✅ DO:**
- Before writing any auth-related docs, verify which provider is actually in use
- Update every Memory Bank file that references auth in a single pass
- Search for stale terms (`iron-session`, `getSession`, `ADMIN_PASSWORD_HASH`) after migration

**❌ DON'T:**
- Do NOT leave stale auth docs behind after a migration
- Do NOT document patterns that don't exist in the codebase


