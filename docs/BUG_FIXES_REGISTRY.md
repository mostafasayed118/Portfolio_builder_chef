# BUG FIXES REGISTRY

**Last Updated:** 2026-06-21

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
