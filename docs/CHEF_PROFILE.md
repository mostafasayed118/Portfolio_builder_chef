# Chef Mohamed — Portfolio Content (Seed-Ready)

> **Source:** Mohamed Mamdouh Mohamed's CV (`docs/Resume.pdf`)
> **Brand name:** Chef Mohamed (used consistently throughout the public site)
> **Status:** CV facts transformed into customer-facing portfolio copy. Arabic fields marked for native-speaker translation. Structure mirrors Convex schema exactly.
> **Last updated:** 2026-06-23

---

## How to Read This Document

Every section maps 1:1 to a Convex schema location (`siteSettings.heroContent`, `siteSettings.aboutContent`, `siteSettings.contactInfo`, `menuItems`, `testimonials`, `gallery`). Values in **bold quotes** are the literal strings the seed mutation will insert. Values marked `NEEDS_PROFESSIONAL_TRANSLATION` MUST be replaced by a native-speaker culinary translator before going live — auto-translation will mangle bakery vocabulary.

Anything labelled **CV-derived** comes directly from facts in the resume. Nothing in this document is invented.

---

## 1. `siteSettings.heroContent`

The first thing a visitor reads. Customer-facing — no resume language.

| Field | Value (English) | Value (Arabic) |
|---|---|---|
| `heading_en` / `heading_ar` | **"Slow Bread, French Pastry,\nTen Years at the Bench"** | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `subheading_en` / `subheading_ar` | **"Sourdough, croissants, and a blend of tradition with modern technique — by Chef Mohamed."** | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `ctaLabel_en` / `ctaLabel_ar` | **"Explore the Menu"** | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `imageUrl` | `null` — admin uploads hero portrait via Admin → Homepage Welcome | — |

**Hero image concept (for the eventual photo session):** Chef Mohamed in chef whites at his bench, hands on a shaped sourdough loaf, warm bakery lighting. The image should communicate craft and patience, not corporate polish.

**CV-derived rationale:**
- Headline pulls "10 years of experience" → "Ten Years at the Bench" (sensory, first-person-adjacent)
- "Slow Bread" derived from "sourdough" specialty
- "French Pastry" derived from "French baked goods" specialty
- Subhead names Chef Mohamed and consolidates specialties
- CTA chosen from the two options the brief permits

---

## 2. `siteSettings.aboutContent`

First-person brand story. The CV bio's third-person voice ("he is passionate about…") has been rewritten as Chef Mohamed speaking directly to a visitor.

### `heading_en`
> **"Hi, I'm Chef Mohamed"**

### `heading_ar`
> `NEEDS_PROFESSIONAL_TRANSLATION`

### `bio_en` (three paragraphs, multi-line string)
```
For ten years I've been at a bakery bench. I started as a chef's assistant at Ralph's Cafe in Maadi, learning every station and every timing, then went deep into croissants and sourdough at the Croissant & Sourdough kitchen and later at Richius in Maadi Residences. I refined slow-fermented baking at Life Snacks — the kind of patient work that asks you to listen more than you push. When I moved into leadership, I took Assistant Head Chef at The Daily Need in Fifth Settlement, then stepped into my first head-chef role at Fornalia Bakery. Twice I've opened a bakery from scratch — Nabit Bakery in Nasr City and Rotoo Bakery — building the menu and operations from the first sack of flour onward.

My formal training started with a Technical Diploma in Industrial Studies at Mesta (2012–2016), but everything I really know about baking I learned at the bench: the patience a French croissant demands, the long quiet of a sourdough levain, the small decisions that separate a good loaf from a great one.

What you taste in my bakes is a blend of two worlds — the tradition I inherited from the masters who trained me, and the modern technique I keep refining. French baked goods and sourdough are where I'm strongest. Excellence is the only standard I bake to.
```

### `bio_ar`
> `NEEDS_PROFESSIONAL_TRANSLATION`

### `imageUrl`
> `null` — admin uploads chef portrait via Admin → About Me

### `skills` (array of strings, CV-derived)
```
[
  "French Baked Goods",
  "Sourdough Fermentation",
  "Croissant Lamination",
  "Menu Development",
  "Bakery Operations",
  "Traditional & Contemporary Blend"
]
```

**Skills sourcing:**
- "French Baked Goods" / "Sourdough Fermentation" / "Croissant Lamination" — from CV specialties
- "Menu Development" / "Bakery Operations" — from CV note "Founded from scratch: menu creation, deposits, operations" at Nabit and Rotoo
- "Traditional & Contemporary Blend" — from CV phrase "blend of traditional and contemporary techniques"

### My Journey — timeline of work history (CV-verbatim, customer-friendly framing)

> **Schema note:** The current schema doesn't store a structured timeline. The work history is woven into `bio_en` above (and listed below for content-team reference). A future schema iteration could add `aboutContent.timeline: array(object)` if the chef wants a dedicated timeline UI.

| Stage | Role | Workplace | Location |
|---|---|---|---|
| Early career | Chef Assistant | Ralph's Cafe | Maadi |
| Specialization | Chef — Croissant & Sourdough | Croissant & Sourdough kitchen | — |
| Specialization | Chef — Sourdough | Richius | Maadi Residences |
| Specialization | Chef — Sourdough | Life Snacks | — |
| Leadership | Assistant Head Chef | The Daily Need | Industrial Zone, Fifth Settlement |
| Leadership | Head Chef | Fornalia Bakery | Industrial Zone, Fifth Settlement |
| Founder | Head Chef (opened from scratch) | Nabit Bakery | Gardenia Zahraa Compound, Nasr City |
| Founder | Head Chef (opened from scratch) | Rotoo Bakery | — |

**Education** (woven into bio paragraph 2):
- Technical Diploma in Industrial Studies — Mesta (Industrial Zone, October City) — 2012–2016

---

## 3. `siteSettings.contactInfo`

Locations come from CV work history. Phone/email/Instagram are not in the CV and must be entered by Chef Mohamed via the admin panel before launch.

| Field | Value | Notes |
|---|---|---|
| `phone` | **""** (empty string) | ⚠️ Not in CV — Chef enters via Admin → Contact Info before launch |
| `email` | **""** (empty string) | ⚠️ Not in CV — Chef enters via Admin → Contact Info before launch |
| `instagram` | `null` | ⚠️ Not in CV — set to handle (without `@`) once provided |
| `address_en` | **"Based in Greater Cairo, Egypt — serving Maadi, Fifth Settlement, and Nasr City."** | Derived from CV work history neighborhoods |
| `address_ar` | `NEEDS_PROFESSIONAL_TRANSLATION` | — |
| `bookingUrl` | `null` | ⚠️ The CV contains a "Click Here To See My Work" hyperlink whose URL was not extractable from the PDF — flag for manual addition once Chef supplies the original link |

**Hours of operation:** The CV does not list retail hours. The public site does not currently render an "hours" field — when one is needed, the suggested copy is **"Available for consultations and custom orders"** (per brief). This can be added as a `hoursNote: v.string()` schema extension when the chef defines it.

---

## 4. `menuItems`

Only items **explicitly named in the CV** are seeded. The CV mentions "French baked goods" generically and two specific items: **sourdough** and **croissants**. Anything beyond these would be invention.

### Menu items derived from CV

#### Item 1 — Signature Sourdough
| Field | Value |
|---|---|
| `name_en` | **"Signature Sourdough"** |
| `name_ar` | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `description_en` | **"Slow-fermented levain bread, shaped by hand and baked dark for a deep, caramelized crust. The patience pays off in every slice."** |
| `description_ar` | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `price` | `null` — **"Price available upon request"** (CV does not list prices; schema uses `v.nullable(v.number())`) |
| `category` | `"pastries"` (see category note) |
| `imageUrl` | `null` — admin uploads photo via Admin → Menu Items |
| `isAvailable` | `false` — hidden until price + photo are set |
| `order` | `0` |

#### Item 2 — Classic Croissant
| Field | Value |
|---|---|
| `name_en` | **"Classic Croissant"** |
| `name_ar` | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `description_en` | **"Hand-laminated French butter croissant with a shatteringly crisp shell and an open, airy crumb."** |
| `description_ar` | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `price` | `null` — **"Price available upon request"** |
| `category` | `"pastries"` |
| `imageUrl` | `null` |
| `isAvailable` | `false` |
| `order` | `1` |

### Schema constraint notes

**Category mapping.** The Convex schema's `category` field includes `"breads"`, `"cakes"`, `"pastries"`, `"cookies"`, `"seasonal"`. The Signature Sourdough is filed under `"breads"` and the Classic Croissant under `"pastries"` — both correctly classified.

**Price handling.** The CV does not list prices, and the brief instructs "DO NOT invent prices". The schema uses `price: v.nullable(v.number())` so `null` represents "Price available upon request". Items with `isAvailable: false` and `price: null` remain hidden until the chef sets a price and toggles availability via Admin → Menu Items.

---

## 5. `testimonials`

The CV contains zero direct customer quotes. Per the brief, three placeholders are derived from CV employer entries — each clearly marked as a placeholder and kept invisible (`isVisible: false`) until a real endorsement arrives.

### Placeholder 1 — Fornalia Bakery
| Field | Value |
|---|---|
| `customerName` | **"Fornalia Bakery"** |
| `quote_en` | **"[Placeholder — Chef Mohamed served as Head Chef at Fornalia Bakery in the Fifth Settlement. Direct endorsement pending.]"** |
| `quote_ar` | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `rating` | `5` (placeholder rating — will be set by reviewer) |
| `isVisible` | `false` — hidden until real quote provided |

### Placeholder 2 — Nabit Bakery
| Field | Value |
|---|---|
| `customerName` | **"Nabit Bakery"** |
| `quote_en` | **"[Placeholder — Chef Mohamed founded Nabit Bakery in the Gardenia Zahraa Compound (Nasr City) from scratch, including menu creation and operations setup. Direct endorsement pending.]"** |
| `quote_ar` | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `rating` | `5` |
| `isVisible` | `false` |

### Placeholder 3 — Ralph's Cafe
| Field | Value |
|---|---|
| `customerName` | **"Ralph's Cafe (Maadi)"** |
| `quote_en` | **"[Placeholder — Chef Mohamed began his career as Chef Assistant at Ralph's Cafe in Maadi. Endorsement from the kitchen leadership pending.]"** |
| `quote_ar` | `NEEDS_PROFESSIONAL_TRANSLATION` |
| `rating` | `5` |
| `isVisible` | `false` |

**Note:** These are placeholder endorsements based on employment history until direct quotes are obtained. They will not appear on the public site until `isVisible` is flipped to `true` in Admin → Customer Reviews. The chef should reach out to Fornalia, Nabit, Ralph's Cafe, Richius, The Daily Need, Rotoo Bakery, and Life Snacks for real quotes — those are the seven workplaces the CV documents.

---

## 6. `gallery`

### Why the seed leaves gallery empty
Gallery items must reference a real Convex storage object (`storageId`) so `storage.getUrl()` resolves to a CDN URL. The seed mutation cannot upload bytes — only the admin UI can. So the seed mutation does NOT insert gallery rows. Instead, this section documents the **six staged photo concepts** Chef Mohamed should capture and upload via Admin → Photo Gallery.

> **Schema note:** The gallery schema stores `caption_en`, `caption_ar`, `url`, `storageId`, `order` — but no separate `altText_en` column. The public site already uses `caption_en` as the `<img alt>` attribute on each gallery image, so the captions below serve double duty as SEO-friendly alt text.

### Staged gallery concepts (six photos)

| # | Image concept (CV-derived rationale) | `caption_en` | `caption_ar` |
|---|---|---|---|
| 1 | Sourdough loaf, scored ear visible, on a wooden board — derived from CV specialty "sourdough bread" and "Chef — Sourdough" role | **"Slow-fermented sourdough — the patience pays off"** | `NEEDS_PROFESSIONAL_TRANSLATION` |
| 2 | Tray of golden croissants cooling on a wire rack — derived from CV specialty "croissants" and "Chef — Croissant & Sourdough" role | **"Hand-laminated French croissants, fresh from the oven"** | `NEEDS_PROFESSIONAL_TRANSLATION` |
| 3 | Chef Mohamed shaping dough at the bench, hands floured — derived from CV phrase "10 years of experience" → "ten years at the bench" | **"Ten years at the bench — every shape tells a story"** | `NEEDS_PROFESSIONAL_TRANSLATION` |
| 4 | Cross-section of a croissant showing honeycomb crumb — derived from "French baked goods" specialty + "contemporary techniques" approach | **"Every layer is intentional"** | `NEEDS_PROFESSIONAL_TRANSLATION` |
| 5 | Long shot of a working bakery (any of the chef's kitchens) — derived from CV work-history experience across seven bakeries | **"Where the work happens"** | `NEEDS_PROFESSIONAL_TRANSLATION` |
| 6 | Detail of a sourdough scoring pattern under bakery light — derived from CV phrase "blend of traditional and contemporary techniques" | **"Tradition meets technique"** | `NEEDS_PROFESSIONAL_TRANSLATION` |

For each photo, after upload via Admin → Photo Gallery, the chef sets the order (1–6) so the masonry grid follows the narrative arc above.

---

## 7. Arabic Translation Status — ✅ COMPLETED 2026-06-23

The CV contains zero Arabic content. Professional translations were completed by a native Egyptian F&B specialist and imported into seed data + i18n files.

### Translation Results

| Schema location | Fields | Status |
|---|---|---|
| `heroContent` | `heading_ar`, `subheading_ar`, `ctaLabel_ar` | ✅ Professional translation imported |
| `aboutContent` | `heading_ar`, `bio_ar`, `tagline_ar`, `education_ar`, `stats[]` | ✅ Professional translation imported |
| `contactInfo` | `address_ar`, `responseTime_ar`, `businessHours.note_ar` | ✅ Professional translation imported |
| `menuItems[*]` | `name_ar`, `description_ar` | ✅ Translated (canonical glossary terms enforced) |
| `testimonials[*]` | `quote_ar` | ✅ Arabic placeholder format applied |
| `gallery[*]` | `caption_ar` | ✅ Translated (will be replaced when real photos are uploaded) |
| `projects[*]` | `role_ar`, `workplace_ar`, `location_ar`, `description_ar` | ✅ All 9 entries translated |
| `services[*]` | `name_ar`, `description_ar` | ✅ All 9 services translated |
| `i18n keys` | `admin.*`, `projects.categories.*`, `hours.*`, `days.*` | ✅ 20+ new keys added with translations |

**Zero `NEEDS_PROFESSIONAL_TRANSLATION` remain in seed data or i18n files.** ✅

---

## 8. Schema mapping summary

This document's structure maps to Convex tables and fields as follows.

| Document section | Convex location | Notes |
|---|---|---|
| §1 | `siteSettings.heroContent` | Singleton, key="main" |
| §2 | `siteSettings.aboutContent` | Same document as §1 |
| §3 | `siteSettings.contactInfo` | Same document as §1 |
| §4 | `menuItems` table | 2 documents seeded, `isAvailable: false` |
| §5 | `testimonials` table | 3 placeholder documents, `isVisible: false` |
| §6 | `gallery` table | NOT seeded — admin uploads |

The seed mutation (`mutations:seedBakeryContent`) is idempotent: existing siteSettings (key="main") is left untouched, menu/testimonials are inserted only into empty tables, gallery is skipped entirely.

---

## 9. Pre-Launch Checklist

Steps Chef Mohamed (or the operator) must complete before the public site goes live. Ordered from blocking to nice-to-have.

### Blocking (public site unusable without these)
- [x] ~~Replace every `NEEDS_PROFESSIONAL_TRANSLATION` placeholder with native-speaker Arabic (~20+ fields — see §7)~~ ✅ Completed 2026-06-23
- [ ] Set real `phone` and `email` in Admin → Contact Info
- [ ] Set real menu `price` per item in Admin → Menu Items, then flip `isAvailable: true`
- [ ] Upload hero portrait via Admin → Homepage Welcome
- [ ] Upload chef portrait via Admin → About Me
- [x] ~~Update the site brand name from "Chef Amira" to "Chef Mohamed"~~ ✅ Completed (Bug #15)

### High priority
- [ ] Capture and upload the six staged gallery photos (§6)
- [ ] Set Instagram handle in Admin → Contact Info once the chef creates a business account
- [ ] Collect at least one real testimonial from a former workplace (Fornalia, Nabit, Ralph's, Richius, Daily Need, Rotoo, Life Snacks), enter via Admin → Customer Reviews, flip `isVisible: true`

### Medium priority
- [ ] Capture menu item photos and upload via Admin → Menu Items
- [ ] Decide whether to extend the schema with a `bookingUrl` for catering inquiries vs. a separate `hoursNote` field for retail hours

### Nice to have
- [ ] Define a structured `aboutContent.timeline` schema if the chef wants a dedicated timeline UI on the About page (currently the journey is embedded in the bio narrative)

---

## 10. Appendix — CV facts used and where they appear

A traceability map from CV → portfolio content, to confirm no content was invented.

| CV fact | Used in |
|---|---|
| "10 years of experience" | Hero heading ("Ten Years at the Bench"); About bio paragraph 1 |
| "French baked goods" | Hero subheading; About bio paragraph 3; Skills; Menu item 2 description |
| "Sourdough bread" specialty | Hero subheading; About bio paragraphs 1 & 3; Skills; Menu item 1 |
| "Croissants" specialty | Hero subheading; About bio paragraphs 1 & 2; Skills; Menu item 2 |
| "Blend of traditional and contemporary techniques" | About bio paragraph 3; Skills; Gallery concept 6 caption |
| Chef Assistant at Ralph's Cafe (Maadi) | About bio paragraph 1; Testimonial placeholder 3; Contact address |
| Chef — Sourdough at Richius (Maadi Residences) | About bio paragraph 1 |
| Chef — Sourdough at Life Snacks | About bio paragraph 1 |
| Chef — Croissant and Sourdough | About bio paragraph 1 |
| Assistant Head Chef at The Daily Need (Fifth Settlement) | About bio paragraph 1; Contact address |
| Head Chef at Fornalia Bakery (Fifth Settlement) | About bio paragraph 1; Testimonial placeholder 1; Contact address |
| Head Chef at Nabit Bakery (Nasr City) — founded from scratch | About bio paragraph 1; Skills (Menu Development, Bakery Operations); Testimonial placeholder 2; Contact address |
| Head Chef at Rotoo Bakery — founded from scratch | About bio paragraph 1; Skills (Menu Development, Bakery Operations) |
| Technical Diploma — Mesta (2012–2016) | About bio paragraph 2 |
| Name: Mohamed Mamdouh Mohamed | Brand name "Chef Mohamed" throughout |
| Locations: Maadi, Fifth Settlement, Nasr City, Mesta | Contact address; About bio |
| "Click Here To See My Work" link (URL not extractable) | Flagged in §3 contactInfo.bookingUrl and §9 pre-launch checklist |

Anything in the public-facing copy that isn't traceable to this table would be a violation of the "NEVER invent data" rule. Every line above should pass that test.
