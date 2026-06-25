# BUG FIXES REGISTRY

**Last Updated:** 2026-06-23 (Bug #37 status updated to ABANDONED; Bugs #44-#45 added)

Documented resolved bugs with BEFORE/AFTER patterns. Each entry includes a PREVENTION RULE that future code must follow.

---

## Bug #1: Gallery Upload — Empty Image URL

**Severity:** Critical (images would not display after upload)

**Root Cause:** The gallery page called `addGalleryImage({ url: "", ... })` which stored an empty string as the image URL. The `url` field in the schema was non-nullable `v.string()`, so no type error was raised — but images rendered as broken.

### BEFORE (Buggy Code)
```tsx
// gallery/page.tsx — upload handler
const addImage = useMutation(api.mutations.addGalleryImage)

// ...
const storageId = xhr.responseText.trim()
addImage({
  url: "",                              // ❌ Empty string — no actual URL
  storageId: storageId as Id<"_storage">,
  caption_en: caption,
  order: (gallery?.length ?? 0),
})
```

```ts
// convex/schema.ts
gallery: defineTable({
  url: v.string(),                      // ❌ Non-nullable — accepts ""
  storageId: v.nullable(v.id("_storage")),
  // ...
})
```

### AFTER (Fixed Code)
```tsx
// gallery/page.tsx — upload handler
const saveImage = useMutation(api.files.saveGalleryImageFromStorage)

// ...
const storageId = xhr.responseText.trim()
saveImage({
  storageId: storageId as Id<"_storage">,  // ✅ Uses storage mutation
  caption_en: caption,
  caption_ar: captionAr,
  order: (gallery?.length ?? 0),
})
```

```ts
// convex/files.ts — resolves URL from storageId
export const saveGalleryImageFromStorage = mutation({
  args: {
    storageId: v.id("_storage"),           // ✅ Required
    caption_en: v.string(),
    caption_ar: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId)  // ✅ Resolves real URL
    if (!url) throw new Error("Storage URL not found")
    return await ctx.db.insert("gallery", {
      url,                                  // ✅ Stores actual URL
      storageId: args.storageId,
      // ...
    })
  },
})
```

```ts
// convex/schema.ts
gallery: defineTable({
  url: v.nullable(v.string()),            // ✅ Nullable — allows storage-only entries
  storageId: v.nullable(v.id("_storage")),
  // ...
})
```

### PREVENTION RULE
> **When uploading images to Convex storage:**
> 1. Generate upload URL via `useMutation(api.files.generateUploadUrl)`
> 2. PUT file to Convex storage
> 3. Capture `storageId` from response text
> 4. Call `saveGalleryImageFromStorage({ storageId, caption_en, caption_ar, order })`
> 5. NEVER call `addGalleryImage({ url: "", ... })` — that bypasses URL resolution
>
> See `convex/files.ts` for the storage mutation pattern.

---

## Bug #2: Gallery Schema — Non-Nullable url Field

**Severity:** High (type error when saving gallery entries after upload)

**Root Cause:** The `gallery` table schema defined `url: v.string()` (required), but gallery entries created via storage upload don't have a URL until `storage.getUrl()` resolves it. The `saveGalleryImageFromStorage` mutation sets `url` after resolution, but the schema should allow entries without a `url` (e.g., during processing or for direct-URL uploads).

### BEFORE (Buggy Schema)
```ts
gallery: defineTable({
  url: v.string(),                    // ❌ Required — blocks nullable entries
  storageId: v.nullable(v.id("_storage")),
})
```

### AFTER (Fixed Schema)
```ts
gallery: defineTable({
  url: v.nullable(v.string()),        // ✅ Nullable — supports both storage and direct URL
  storageId: v.nullable(v.id("_storage")),
})
```

### PREVENTION RULE
> **When a table entry can be created before its URL is known (e.g., during async upload):**
> - Make the `url` field `v.nullable(v.string())` in the schema
> - Always check `item.url !== null` before rendering an `<img>` tag
> - Show a placeholder when `url` is null

---

## Bug #3: Public GallerySection — Unconditional img src

**Severity:** High (TypeScript error after schema change)

**Root Cause:** The public `GallerySection` rendered `<img src={item.url} />` without checking for null. After Bug #2 made `url` nullable, TypeScript flagged this.

### BEFORE (Buggy Rendering)
```tsx
<img src={item.url} alt={caption} />    // ❌ url could be null
```

### AFTER (Fixed Rendering)
```tsx
{item.url && (
  <motion.div key={item._id}>
    <img src={item.url} alt={caption} loading="lazy" />
    {/* ... */}
  </motion.div>
)}
```

### PREVENTION RULE
> **When rendering fields from nullable schema fields:**
> - Use `{field && <Component prop={field} />}` or ternary
> - NEVER render `<img src={nullableField}>` directly
> - The schema type tells you what's nullable — trust it

---

## Bug #4: Admin Gallery — Missing Null URL Placeholder

**Severity:** Low (visual — broken image would show)

**Root Cause:** The admin gallery `SortableImage` component rendered `<img src={item.url}>` unconditionally. After Bug #2, `url` could be null.

### BEFORE (Buggy Rendering)
```tsx
<CardContent className="p-0 h-full">
  <img src={item.url} alt={item.caption_en} className="w-full h-full object-cover" />
  {/* ... */}
</CardContent>
```

### AFTER (Fixed Rendering)
```tsx
<CardContent className="p-0 h-full">
  {item.url ? (
    <img src={item.url} alt={item.caption_en} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-muted-foreground text-sm">
      Processing...
    </div>
  )}
  {/* ... */}
</CardContent>
```

### PREVENTION RULE
> **When rendering images that may be null (e.g., during upload processing):**
> - Provide a visual placeholder state
> - Use a ternary: `{item.url ? <img src={item.url} /> : <Placeholder />}`
> - Do NOT render a broken `<img>` tag

---

## Bug #5: Public Sections Ignored Stored `imageUrl`

**Severity:** High (admin uploads worked, but the public site never displayed them)

**Root Cause:** `HeroSection` and `AboutSection` always rendered a placeholder span ("Hero image" / "Chef photo") even when `hero.imageUrl` / `about.imageUrl` were populated. Uploading via the admin had no visible effect on the public page.

### BEFORE (Buggy Rendering)
```tsx
<div className="aspect-square ...">
  <span className="text-muted-foreground font-heading text-lg">Hero image</span>
</div>
```

### AFTER (Fixed Rendering)
```tsx
<div className="aspect-square ... overflow-hidden">
  {hero.imageUrl ? (
    <img src={hero.imageUrl} alt={heading} className="w-full h-full object-cover" />
  ) : (
    <span className="text-muted-foreground font-heading text-lg">
      {t("imagePlaceholder")}
    </span>
  )}
</div>
```

### PREVENTION RULE
> **Whenever the schema defines a nullable `imageUrl` on a content object:**
> - The renderer MUST consume it via `{obj.imageUrl ? <img /> : <Placeholder />}`
> - Don't render a fixed placeholder when real data is available
> - Wrap the container with `overflow-hidden` so the image respects rounded corners

---

## Bug #6: Duplicate `SESSION_OPTIONS` in constants.ts

**Severity:** High (latent — would silently break auth if any caller imported it)

**Root Cause:** `src/lib/constants.ts` exported a second `SESSION_OPTIONS` constant with a different `cookieName` (`bakery-admin-session`) and no `maxAge`. The canonical config lives in `src/lib/session.ts` (cookie `chef_admin_session`, 7-day expiry). Any code that imported the constants.ts version would write to a different cookie name and break the session round-trip.

### BEFORE
```ts
// src/lib/constants.ts
export const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET!,
  cookieName: "bakery-admin-session",   // ❌ Wrong cookie name
  cookieOptions: { ... },               // ❌ No maxAge
};
```

### AFTER
```ts
// src/lib/constants.ts — removed entirely
// src/lib/session.ts is the single source of truth
```

### PREVENTION RULE
> **Session configuration lives ONLY in `src/lib/session.ts`.**
> - Never re-declare `sessionOptions` / `SESSION_OPTIONS` anywhere else
> - Never import session config from a constants file
> - The cookie name is `chef_admin_session` — anything else is wrong

---

## Bug #7: Admin About Page Was a Disconnected Stub

**Severity:** Critical (admins could not edit the About section at all)

**Root Cause:** `src/app/[locale]/admin/(protected)/about/page.tsx` rendered placeholder `<Input placeholder="About title" />` and `<Textarea placeholder="About content" />` with no state, no `useQuery`, no `useMutation`, no bilingual inputs, no skills editor, no image upload. The "save" handler `await new Promise((r) => setTimeout(r, 500))` was fake — clicks produced a success toast but nothing persisted.

### BEFORE
```tsx
async function handleSave(e: React.FormEvent) {
  e.preventDefault();
  setSaving(true);
  await new Promise((r) => setTimeout(r, 500));  // ❌ Fake save
  toast.success(tEdit("successMsg"));
  setSaving(false);
}
// ...
<Input placeholder="About title" />              // ❌ Not wired to state
<Textarea rows={8} placeholder="About content" /> // ❌ Not wired
```

### AFTER
Full editor mirroring the Hero editor pattern: `useQuery(api.queries.getAboutContent)` + `useMutation(api.mutations.updateAboutContent)`, bilingual fields (English plus Arabic with `dir="rtl"`), skills badge editor with add/remove, `ImageUploadField` for the chef photo, wrapped in `SectionEditorShell`.

### PREVENTION RULE
> **Every admin editor page MUST:**
> 1. Wire to a Convex query for current data and a mutation for saves
> 2. Use `SectionEditorShell` for the save/cancel chrome
> 3. Render bilingual inputs (English + Arabic with `dir="rtl"` and `text-right`)
> 4. Match the schema — every nullable/array field has a UI control
> 5. Never use `setTimeout` as a fake save handler

---

## Bug #8: Public Header/Footer Leaking Into Admin Routes

**Severity:** High (admin pages rendered the customer-facing nav above the admin sidebar)

**Root Cause:** `src/app/[locale]/layout.tsx` rendered `<Header />` and `<Footer />` around `{children}`. Since the admin routes live under `[locale]/admin/...`, they inherited that public chrome — producing a double-header experience on admin pages.

### BEFORE
```
src/app/[locale]/
  layout.tsx         ← renders <Header/> and <Footer/> around all children
  page.tsx           ← home (public)
  menu/page.tsx
  admin/...          ← inherits Header/Footer (wrong!)
```

### AFTER
```
src/app/[locale]/
  layout.tsx         ← html/body, NextIntlClientProvider, Toaster only
  (site)/
    layout.tsx       ← <Header/> + <Footer/> + <main> (public chrome)
    page.tsx
    menu/page.tsx
    about/page.tsx
    contact/page.tsx
  admin/
    (auth)/login/page.tsx
    (protected)/layout.tsx  ← admin sidebar + topbar
```

### PREVENTION RULE
> **When adding a new chrome layer (header/footer/nav):**
> - Place it in a route group layout, NOT in `[locale]/layout.tsx`
> - `[locale]/layout.tsx` is for cross-cutting concerns only (`<html>`, providers, fonts)
> - Public-only chrome lives under `(site)/layout.tsx`
> - Admin-only chrome lives under `admin/(protected)/layout.tsx`

---

## Bug #9: Category Type Lie — Sourdough Filed Under "pastries"

**Severity:** High (silently corrupted admin filters and public category tabs)

**Root Cause:** The `menuItems.category` validator in `convex/schema.ts` was a closed union of `"cakes" | "pastries" | "cookies" | "seasonal"` — with no `"breads"` literal. When CHEF_PROFILE.md called for a sourdough item, the only way to satisfy the validator was to file it under `"pastries"` and add a comment apologising for the misclassification. That cast is a type lie: any admin filtering "Pastries" would see sourdough loaves mixed in, and any future "Breads" filter the chef adds in admin UI would silently match nothing — because nothing was ever stored under `"breads"`.

### BEFORE (Buggy Schema)
```ts
// convex/schema.ts
menuItems: defineTable({
  // ...
  category: v.union(
    v.literal("cakes"),
    v.literal("pastries"),    // ❌ Sourdough forced here
    v.literal("cookies"),
    v.literal("seasonal"),
  ),
})
```

```ts
// Seed mutation had to lie about the type
{
  name_en: "Signature Sourdough",
  category: "pastries" as const,  // ❌ Type lie — it's bread, not pastry
}
```

### AFTER (Fixed Schema)
```ts
// convex/schema.ts
menuItems: defineTable({
  // ...
  category: v.union(
    v.literal("breads"),       // ✅ New — for sourdough and any future loaves
    v.literal("cakes"),
    v.literal("pastries"),
    v.literal("cookies"),
    v.literal("seasonal"),
  ),
})
```

```ts
// Seed mutation tells the truth
{
  name_en: "Signature Sourdough",
  category: "breads",  // ✅ Honest
}
```

**Touched files when extending the category union:**
- `convex/schema.ts` — table validator
- `convex/mutations.ts` — `menuItemValidator` AND `updateMenuItem` args
- `convex/queries.ts` — inline cast in `getMenuItems` (`as "breads" | "cakes" | ...`)
- `src/types/index.ts` — `MenuCategory` type alias
- `src/lib/constants.ts` — `MENU_CATEGORIES` array (drives admin UI)
- `src/components/sections/MenuSection.tsx` — `CATEGORIES` filter tabs constant
- `src/app/[locale]/admin/(protected)/menu/page.tsx` — `CATEGORIES` select options
- `src/i18n/messages/en.json` and `ar.json` — `menu.categories.breads`

### PREVENTION RULE
> **The `menuItems.category` union is the source of truth.** Treat it like a single-source enum:
> - Whenever you add a literal to `convex/schema.ts`, propagate it to ALL eight touch-points listed above in the same change
> - Never use `as "pastries"` (or `as any`) to force-fit a value that doesn't belong — extend the union instead
> - Adding a literal is a low-risk operation; misclassifying data is a high-risk operation that silently corrupts filters

---

## Bug #10: Sentinel Price `0` Instead of Nullable

**Severity:** Medium (UX — passive empty state left users with no next step)

**Root Cause:** The gallery's empty-state message was a dead-end `<p className="text-center text-muted-foreground">{t("emptyState")}</p>` with no instructions or link to the admin upload flow. A non-technical chef seeing "No photos yet" has no idea where to go.

### BEFORE
```tsx
<p className="text-center text-muted-foreground">{t("emptyState")}</p>
```

### AFTER
```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <Camera className="h-16 w-16 text-muted-foreground/30 mb-6" />
  <h3 className="font-heading text-xl text-foreground mb-2">Your bakery in photos</h3>
  <p className="text-muted-foreground max-w-md mb-8">
    Show off your sourdough, croissants, and cakes. Log in to the admin panel and add your first photos.
  </p>
  <Link href="/admin/gallery">
    <Button className="bg-accent hover:bg-accent-hover text-background">
      Go to Admin → Gallery
    </Button>
  </Link>
</div>
```

**Files:** `src/components/sections/GallerySection.tsx`

### PREVENTION RULE
> **ALL empty states in admin-linked sections MUST include direct navigation to the relevant admin editor.** Never show a passive "No data" message without a next-step action. Every empty state is an opportunity to teach the chef how to add content.

---

## Bug #11: Gallery Empty State Dead-End

**Severity:** Medium (UX — passive empty state left users with no next step)

**Root Cause:** The gallery's empty-state message was a dead-end `<p>` with no instructions or link to the admin upload flow. A non-technical chef seeing "No photos yet" had no idea where to go.

### BEFORE
```tsx
<p className="text-center text-muted-foreground">{t("emptyState")}</p>
```

### AFTER
```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <Camera className="h-16 w-16 text-muted-foreground/30 mb-6" />
  <h3 className="font-heading text-xl text-foreground mb-2">Your bakery in photos</h3>
  <p className="text-muted-foreground max-w-md mb-8">
    Show off your sourdough, croissants, and cakes. Log in to the admin panel and add your first photos.
  </p>
  <Link href="/admin/gallery">
    <Button className="bg-accent hover:bg-accent-hover text-background">
      Go to Admin → Gallery
    </Button>
  </Link>
</div>
```

**Files:** `src/components/sections/GallerySection.tsx`

### PREVENTION RULE
> **ALL empty states in admin-linked sections MUST include direct navigation to the relevant admin editor.** Never show a passive "No data" message without a next-step action. Every empty state is an opportunity to teach the chef how to add content.

---

## Bug #12: Menu Filter Schema Drift ("breads" Category)

**Severity:** High (silently corrupted admin filters and public category tabs)

**Root Cause:** The `menuItems.category` validator in `convex/schema.ts` was a closed union of `"cakes" | "pastries" | "cookies" | "seasonal"` with no `"breads"` literal. The frontend `CATEGORIES` constant included "breads" but the schema rejected it — filtering by "breads" returned zero results. Sourdough was miscategorized as "pastries" with a type-lie cast.

**Files:** `convex/schema.ts`, `convex/mutations.ts`, `convex/queries.ts`, `src/types/index.ts`, `src/lib/constants.ts`, `src/components/sections/MenuSection.tsx`, `src/i18n/messages/en.json` + `ar.json`

### PREVENTION RULE
> **When extending ANY Convex literal union type, update ALL 7 touchpoints in a single change:**
> 1. `convex/schema.ts` — table validator
> 2. `convex/mutations.ts` — create + update validators
> 3. `convex/queries.ts` — inline cast in `withIndex`
> 4. `src/types/index.ts` — TypeScript type alias
> 5. `src/lib/constants.ts` — drives admin UI selects
> 6. Public component filter constant (e.g. `CATEGORIES` in MenuSection)
> 7. `src/i18n/messages/{en,ar}.json` — category labels
>
> Never use `as "pastries"` or `as any` to force-fit a mismatched value — extend the union instead.

---

## Bug #13: Consulting Model Schema Gap

**Severity:** High (product-only schema couldn't represent B2B services)

**Root Cause:** The original Convex schema was designed exclusively for retail bakery products (menuItems table, price, category). Analysis of `index-final.html` revealed Chef Mohamed's business also includes consulting (menu development, QA systems) and training (team workshops, one-on-one coaching). The `siteSettings.contactInfo` also lacked fields for WhatsApp, secondary phone, and response time.

### BEFORE
```ts
contactInfo: v.object({
  phone: v.string(), email: v.string(),
  instagram: v.nullable(v.string()),
  address_en: v.string(), address_ar: v.string(),
  bookingUrl: v.nullable(v.string()),
})
```

### AFTER
```ts
services: defineTable({
  category: v.union(v.literal("artisanal"), v.literal("consulting"), v.literal("training")),
  name_en: v.string(), name_ar: v.string(),
  description_en: v.string(), description_ar: v.string(),
  icon: v.nullable(v.string()), order: v.number(), isVisible: v.boolean(),
  createdAt: v.number(),
})
// contactInfo extended with whatsapp, secondaryPhone, responseTime_en/ar
// aboutContent extended with stats, tagline_en/ar
```

**Files:** `convex/schema.ts`, `convex/mutations.ts`, `docs/CHEF_PROFILE.md`

### PREVENTION RULE
> **Before building portfolio schemas, analyze ALL existing client content** (CVs, static sites, social media bios, business cards) for business model signals beyond the primary product catalog. Services ≠ Menu Items — always use separate tables with appropriate category unions. Never shoehorn services into a product schema.

---

## Bug #15: Brand Name "Chef Amira" Throughout Production Code

**Severity:** Critical (wrong chef's name displayed everywhere on the live site)

**Root Cause:** The project was bootstrapped from a template built for "Chef Amira." The template chef's name was never replaced in the i18n message files, constants.ts, page metadata, or layout.tsx. Every visitor, both EN and AR, saw "Chef Amira" in the browser tab, navbar, footer, SEO metadata, social sharing previews, and the admin login page. The `KNOWN_WARNINGS.md` file even contained a misleading warning saying NOT to change the name.

### BEFORE
```json
// en.json + ar.json
"site": { "title": "Chef Amira" }
"admin.login": { "quoteAuthor": "— Chef Amira", "userPlaceholder": "chef_amira" }
```
```ts
// constants.ts
export const SITE_NAME = "Chef Amira";
```
```tsx
// layout.tsx metadata
title: '...Chef Amira | Artisan Bakery'
siteName: "Chef Amira"
```

### AFTER
```json
"site": { "title": "Chef Mohamed" }
"admin.login": { "quoteAuthor": "— Chef Mohamed", "userPlaceholder": "chef_mohamed" }
```
All page metadata, openGraph titles, and siteName updated to "Chef Mohamed | French Bakery Consultant".

**Files:** `src/i18n/messages/en.json`, `src/i18n/messages/ar.json`, `src/lib/constants.ts`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/(site)/page.tsx`, `docs/TECH_STACK_PATTERNS.md`

### PREVENTION RULE
> **After every project scaffold or template clone, immediately grep for template author names** before writing a single line of business logic. Run:
> `grep -rn "Chef Amira\|chef_amira\|الشيف أميرة" src/ docs/`
> Any match is a blocker. Update i18n files, constants, metadata, and all docs before the first commit.

---

## Bug #16: ContactForm Was a Fake (No Data Delivered)

**Severity:** Critical (all contact form submissions silently discarded)

**Root Cause:** `ContactForm.tsx` had a submit handler that called `await new Promise(r => setTimeout(r, 1000))` then showed a success toast. No data was stored, no email was sent, no Convex mutation was called. Chef Mohamed received zero inquiries from the live site despite visitors submitting the form.

### BEFORE
```tsx
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setLoading(true);
  await new Promise((r) => setTimeout(r, 1000)); // ❌ Fake — discards all data
  toast.success(t("success"));
  setLoading(false);
}
```

### AFTER
```tsx
const submitInquiry = useMutation(api.mutations.submitContactInquiry);

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  try {
    await submitInquiry({ name, email, requestType, message }); // ✅ Persists to Convex
    toast.success(t("success"));
    // reset fields
  } catch (err) {
    toast.error(isRateLimit ? "Wait a few minutes..." : t("error"));
  } finally { setLoading(false); }
}
```

New schema: `contactInquiries` table with `name`, `email`, `phone`, `requestType`, `message`, `createdAt`, `isRead`.
New mutation: `submitContactInquiry` (public, rate-limited by email/10 min).
New query: `getContactInquiries` (admin-visible).
New dropdown: `requestType` Select with options Consulting / Catering / Training / Partnerships / Other.

**Files:** `convex/schema.ts`, `convex/mutations.ts`, `convex/queries.ts`, `src/components/sections/ContactForm.tsx`, `src/i18n/messages/en.json`, `src/i18n/messages/ar.json`

### PREVENTION RULE
> **A contact form MUST call a real mutation or API route before showing a success toast.** Never use `setTimeout` as a stand-in for a mutation call. The test: disconnect from the internet and submit the form — if the toast still appears, the form is fake.

---

## Bug #17: All Convex Write Mutations Publicly Callable Without Auth

**Severity:** Critical (anyone who discovers the Convex deployment URL can modify all site content)

**Root Cause:** All mutations in `convex/mutations.ts` and `convex/files.ts` were exported with no authentication checks. The Next.js admin layout guard (iron-session cookie check) only protects the UI routes. Convex mutations are exposed via a separate HTTP WebSocket endpoint that completely bypasses the Next.js session. An attacker who discovered `NEXT_PUBLIC_CONVEX_URL` could call `updateHeroContent`, `deleteService`, `deleteGalleryImage`, or any other write mutation directly without logging in.

### BEFORE
```ts
export const updateHeroContent = mutation({
  args: heroContentValidator,
  handler: async (ctx, args) => {
    // No auth check — anyone can call this
    const settings = await ctx.db.query("siteSettings")...;
    await ctx.db.patch(settings._id, { heroContent: args });
  },
});
```

### AFTER
```ts
// convex/auth.ts
export function requireAdmin(adminKey: string | undefined): void {
  const expected = process.env.ADMIN_SECRET; // Convex env var
  if (!expected || adminKey !== expected) throw new ConvexError("Unauthorized");
}

// All write mutations:
export const updateHeroContent = mutation({
  args: { ...heroContentFields, adminKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(args.adminKey); // ✅ First line — blocks unauthenticated callers
    // ...
  },
});
```

**Auth flow:**
1. Admin logs in via Next.js `/api/admin/login` → iron-session cookie set
2. Admin UI fetches token from `/api/admin/convex-token` (requires iron-session) → returns `ADMIN_CONVEX_SECRET`
3. `AdminTokenProvider` (in protected layout) provides token via React context
4. Every admin page calls `useAdminToken()` and includes it in mutation args
5. Convex mutation validates against `ADMIN_SECRET` env var — rejects if missing or wrong

**Files:** `convex/auth.ts` (new), `convex/mutations.ts`, `convex/files.ts`, `src/app/api/admin/convex-token/route.ts` (new), `src/lib/admin-token-context.tsx` (new), `src/app/[locale]/admin/(protected)/layout.tsx`, all admin page files, `src/components/admin/ImageUploadField.tsx`

### PREVENTION RULE
> **Every Convex write mutation MUST start with `requireAdmin(args.adminKey)`** before touching the database. `ctx.db.patch`, `ctx.db.insert`, `ctx.db.delete`, and `ctx.storage.*` are only safe AFTER this guard. Read queries remain public. Public forms (submitContactInquiry) intentionally omit the guard.

---

## Bug #37: Login Used API Route Instead of Server Action (Auth Flow Rewrite) — ⚠️ ABANDONED

**Severity:** High (architectural — login worked but used wrong pattern for Next.js 16)

**Status:** ⚠️ **ABANDONED.** The codebase migrated to Clerk for authentication instead. The iron-session Server Action migration documented here was never completed. All iron-session files (`session.ts`, `login/actions.ts`, `logout/actions.ts`) were deleted during the Clerk migration.

**Root Cause:** The original login flow used a traditional Next.js API Route Handler (`/api/admin/login`) with client-side `fetch()` + `e.preventDefault()`.

### What exists now (Clerk)
- **Middleware:** `src/proxy.ts` uses `clerkMiddleware` with route matchers — protects all `/admin(.*)` routes
- **Login page:** `src/app/[locale]/admin/(auth)/login/[[...rest]]/page.tsx` renders Clerk's `<SignIn />` component
- **Layout guard:** `src/app/[locale]/admin/(protected)/layout.tsx` uses `auth()` from `@clerk/nextjs/server` for defense-in-depth
- **Convex auth:** `convex/auth.ts` `requireAdmin(ctx)` verifies Clerk identity via `ctx.auth.getUserIdentity()` + `ADMIN_EMAIL` enforcement
- **Logout:** `useClerk().signOut()` in the admin sidebar

### PREVENTION RULE
> **Auth documentation MUST be updated whenever the auth provider changes.**
> - After migrating to a new auth provider, update ALL Memory Bank docs in a single pass
> - Search for stale terms: `iron-session`, `getSession`, `sessionOptions`, `ADMIN_PASSWORD_HASH`
> - The "AFTER" code in a bug fix must reflect what's actually deployed, not what was planned

---

## Bug #40: Projects Not in Schema (Experience Woven Into Bio)

**Severity:** High (no CRUD control over work history)

**Root Cause:** Work experience was embedded as narrative text in `aboutContent.bio_en`. No structured data, no admin editor, no public component for project cards.

### BEFORE
Work history only existed as paragraphs in the bio text. Admin had no way to add, edit, reorder, or hide individual work experiences.

### AFTER
`projects` table with 5 category types (early, specialization, leadership, founder, international), full CRUD admin editor, public card grid component, drag-to-reorder.

### PREVENTION RULE
> Work experience MUST be stored in the `projects` table. The bio can reference it narratively, but structured CRUD requires a dedicated table. Any future "experience" or "portfolio" content goes in `projects`, not in text fields.

---

## Bug #41: Contact Request Types Hardcoded

**Severity:** Medium (admin cannot customize dropdown options)

**Root Cause:** The Request Type dropdown in ContactForm used a hardcoded list. The schema's `contactInfo` had no `requestTypes` field.

### BEFORE
```tsx
const REQUEST_TYPES: RequestType[] = ["consulting", "catering", "training", "partnerships", "other"];
```

### AFTER
```tsx
// Schema stores configurable options
contactInfo: v.object({
  // ...
  requestTypes: v.optional(v.array(v.object({
    value: v.string(), label_en: v.string(), label_ar: v.string(),
  }))),
})
// Form reads from schema with fallback
const requestTypes = contactInfo?.requestTypes ?? FALLBACK_REQUEST_TYPES;
```

### PREVENTION RULE
> Contact form dropdown options MUST be stored in `contactInfo.requestTypes[]`. The form reads from the schema, not from hardcoded constants. Admin can add/remove/reorder request types via the Contact Info editor.

---

## Bug #42: Storage Leak on Project Delete

**Severity:** Medium (orphaned storage objects accumulate)

**Root Cause:** The `deleteProject` mutation called `ctx.db.delete()` without first cleaning up the associated `imageUrl` storage object. Deleted projects left orphaned files in Convex storage.

### BEFORE
```ts
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);  // ❌ Storage object orphaned
  },
});
```

### AFTER
```ts
export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Project not found");
    if (item.imageUrl) await ctx.storage.delete(item.imageUrl);  // ✅ Cleanup
    await ctx.db.delete(args.id);
  },
});
```

### PREVENTION RULE
> When a table references `v.id("_storage")`, the delete mutation MUST call `ctx.storage.delete()` before `ctx.db.delete()`. Check for the storage ID, delete if present, then delete the row.

---

## Translation Import — 2026-06-23

**Type:** Localization / Content Quality
**Severity:** ✅ RESOLVED (was: Blocking before `/ar` route launch)
**Files:** `convex/mutations.ts`, `src/i18n/messages/ar.json`
**Ref:** `docs/KNOWN_WARNINGS.md` Warning #11 → now RESOLVED

### Problem
The `/ar` route was blocked for production by two issues:
1. **`convex/mutations.ts`** service entries had non-canonical `name_ar` values violating the glossary in `docs/ARABIC_TRANSLATION_BRIEF.md` (sourdough, quality assurance, specialized coaching labels).
2. **`src/i18n/messages/ar.json`** was missing 8 key groups needed by new admin sections (Projects editor, Locations nav, field labels, drag-reorder tooltip, BusinessHours hours/days keys).

### Fix Applied
1. **`convex/mutations.ts`** — 3 `name_ar` glossary-compliance fixes + 10 `description_ar` updates with professional translator-delivery values:
   - `خبز سوردو أصيل` → `خبز العجين المخمر الأصيل` (canonical sourdough term)
   - `ضمان الجودة` → `ضبط الجودة` (quality assurance)
   - `تدريب متخصص` → `إرشاد متخصص` (specialized coaching)
2. **`src/i18n/messages/ar.json`** — 8 targeted changes:
   - Updated: `site.setupInProgress`, `menu.priceOnRequest`, `contact.requestTypes.catering`
   - Added: `hero.emptyState`, `admin.actions.dragReorder`, `admin.fields` (10 keys), `hours.closed`, `days.*` (7 keys)

### Verification
- `NEEDS_PROFESSIONAL_TRANSLATION` occurrences remaining: **0** ✅
- Glossary spot-check (8 required terms): all present ✅
- `ar.json` valid JSON, no orphaned keys ✅
- Source: `arabic-translations.json` (professional translator delivery), Brief: `docs/ARABIC_TRANSLATION_BRIEF.md`

### Post-Import Cleanup Notes
- `arabic-translations.json` had trailing spaces in several keys and values; cleaned automatically during import. No data loss.
- Seed mutation truncation incident resolved via restore (Convex dashboard rollback to pre-mutation state).
- Delivery artifact `arabic-translations.json` deleted from project root on 2026-06-23 after verification that all data was successfully imported into seed + i18n.

---

## Bug #44: Admin Layout Missing Auth Guard

**Severity:** 🔴 Critical (any visitor could browse any admin page)

**Root Cause:** `src/app/[locale]/admin/(protected)/layout.tsx` rendered `<AdminSidebar />` and `<AdminTopbar />` with zero authentication checks. The proxy.ts middleware did have `clerkMiddleware` protecting routes, but the layout itself had no defense-in-depth guard.

### BEFORE (No Guard)
```tsx
export default async function AdminProtectedLayout({ children, params }) {
  const { locale } = await params;
  // No auth check — rendered admin chrome unconditionally
  return (
    <div className="flex h-screen ...">
      <AdminSidebar />
      <AdminTopbar />
      <main>{children}</main>
    </div>
  );
}
```

### AFTER (Clerk auth + email enforcement)
```tsx
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

**Files:** `src/app/[locale]/admin/(protected)/layout.tsx`
**Auth layers now:** Middleware (`proxy.ts`) → Layout guard → Convex mutations (`convex/auth.ts`)

### PREVENTION RULE
> **Every route group that renders admin or sensitive chrome MUST have a Server Component auth guard.**
> - Do NOT rely on middleware alone — middleware can be bypassed by misconfigured matchers
> - Use `auth()` from `@clerk/nextjs/server` for Server Component guards
> - Always enforce `ADMIN_EMAIL` at both the middleware and layout levels

---

## Bug #45: deleteGalleryImage Storage Leak

**Severity:** 🟠 High (orphaned storage objects accumulate — unbounded storage cost)

**Root Cause:** `deleteGalleryImage` mutation called `ctx.db.delete(args.id)` without first fetching the document and calling `ctx.storage.delete()` on `item.storageId`. Gallery images stored in Convex storage were never cleaned up when the gallery entry was deleted from the database.

### BEFORE (Leaking)
```ts
export const deleteGalleryImage = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id); // ❌ Orphaned storage objects left behind
  },
});
```

### AFTER (Atomic Cleanup)
```ts
export const deleteGalleryImage = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) throw new ConvexError("Gallery item not found");

    if (item.storageId) {
      try {
        await ctx.storage.delete(item.storageId);
      } catch (e) {
        console.warn(`Failed to delete storage for gallery ${args.id}:`, e);
      }
    }

    await ctx.db.delete(args.id);
  },
});
```

**Files:** `convex/mutations.ts`

### PREVENTION RULE
> **When a table references `v.id("_storage")`, the delete mutation MUST:**
> 1. Fetch the document BEFORE deleting (`const item = await ctx.db.get(args.id)`)
> 2. Check if the storage field is non-null
> 3. Call `ctx.storage.delete(storageId)` BEFORE `ctx.db.delete(args.id)`
> 4. Wrap storage delete in try/catch so DB cleanup still proceeds on storage failure
>
> See also: `deleteProject` mutation for the same pattern, Rule 39 in PROJECT_RULES.md.
