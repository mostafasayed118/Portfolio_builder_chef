# ARABIC TRANSLATION BRIEF — Chef Mohamed Mamdouh Portfolio

**Prepared:** 2026-06-22
**For:** Professional Arabic Translator (Native Egyptian Arabic, Bakery/F&B Industry Expertise)
**Project:** Chef Mohamed | French Bakery Consultant Portfolio CMS
**Source of Truth:** index-final.html (all English content below is extracted directly from this file)

---

## 1. PROJECT OVERVIEW

- **Client:** الشيف محمد ممدوح (Mohamed Mamdouh)
- **Business:** استشاري مخبوزات فرنسية (French Bakery Consultant) based in Cairo, Egypt
- **Audience:** أصحاب المخابز المصرية، مستثمري قطاع الأغذية، مديري التوظيف في الفنادق
- **Tone:** احترافي ودافئ، بصيغة المتكلم، واثق دون تكبر
- **Dialect:** عربية فصحى حديثة مع مصطلحات طهي مصرية شائعة (ليست لغة كلاسيكية أو عامية)
- **Source of Truth:** index-final.html (all English content below is extracted directly from this file)

**Key Brand Voice:** Chef Mohamed speaks directly to visitors. He's proud of his craft but humble. He references his 10 years of experience naturally, not as a sales pitch. The Arabic should sound like a real Egyptian chef talking to potential clients — not a corporate brochure.

---

## 2. BAKERY TERMINOLOGY GLOSSARY (CRITICAL)

**Translator MUST use these exact terms throughout. Do NOT deviate.**

| English | Approved Arabic | Notes |
|---------|----------------|-------|
| Sourdough | خبز العجين المخمر | NOT "الخبز الحامض" |
| Croissant | كرواسون | French loanword standard in Egypt |
| Laminated | مورّق / طبقات | Technical baking term |
| Levain | الخميرة الطبيعية | OR "البداية المخمرة" |
| Fermentation | تخمير | Standard term |
| Artisanal Baking | مخبوزات حرفية | NOT "صناعة يدوية" |
| Menu Development | تطوير قائمة الطعام | Industry standard |
| Production Optimization | تحسين خطوط الإنتاج | B2B consulting term |
| Quality Assurance | ضبط الجودة | Standard QA term |
| Head Chef | شيف رئيسي | NOT "رئيس الطهاة" |
| Assistant Head Chef | مساعد شيف رئيسي | |
| Founded from Scratch | تأسيس من الصفر | Key differentiator |
| Fifth Settlement | التجمع الخامس | Cairo neighborhood |
| Nasr City | مدينة نصر | Cairo neighborhood |
| Maadi | المعادي | Cairo neighborhood |
| Industrial Zone | المنطقة الصناعية | |
| Kingdom of Saudi Arabia | المملكة العربية السعودية | Formal country name |
| 24 hours guaranteed | نرد عليك خلال ٢٤ ساعة | Conversational Egyptian tone |
| Crafting excellence, one bake at a time | نصنع التميز في كل مخبوز 🥐 | Tagline — poetic but natural |
| French Bakery Consultant | استشاري مخبوزات فرنسية | Primary title |
| Master of French Artisanal Baking | خبير في فنون المخبوزات الفرنسية الحرفية | About heading |
| Award-Winning | حائز على جوائز | Stats badge |
| Team Training Programs | برامج تدريب الفرق | Service item |
| Technique Workshops | ورش عمل التقنيات | Service item |
| Specialized Coaching | إرشاد متخصص | Service item |

---

## 3. TRANSLATION TASKS BY SECTION

### PRIORITY LEGEND
- **P0** = Launch blocker — site looks broken without this
- **P1** = Important — affects core user experience
- **P2** = Nice-to-have — admin-only or cosmetic

---

### 3.1 HERO SECTION (P0 — Launch Blocker)

| Source English | Target Field | Context | Priority |
|---------------|-------------|---------|----------|
| Mohamed Mamdouh | `siteSettings.heroContent.heading_ar` | Main hero heading | P0 |
| 10 Years of Excellence in Artisanal Baking | `siteSettings.heroContent.subheading_ar` | Below heading | P0 |
| View My Portfolio | `siteSettings.heroContent.ctaLabel_ar` | CTA button | P0 |
| Crafting excellence, one bake at a time 🥐 | `siteSettings.aboutContent.tagline_ar` | Displayed in Hero below CTA | P0 |

---

### 3.2 ABOUT / BIO (P0)

| Source English | Target Field | Context | Priority |
|---------------|-------------|---------|----------|
| Master of French Artisanal Baking | `siteSettings.aboutContent.heading_ar` | About section heading | P0 |
| [Full 3-paragraph bio from index-final.html] | `siteSettings.aboutContent.bio_ar` | First-person narrative. Preserve paragraph breaks. Tone: warm professional. | P0 |
| Technical Diploma in Industrial Studies — Mesta (2012–2016) | `siteSettings.aboutContent.education_ar` | Education credential | P0 |
| Stats badges (6 items): 10+ Years Professional, French Specialist, Menu Development, Team Training, Sourdough Expert, Award-Winning | `siteSettings.aboutContent.stats[]` (array) | Displayed as badge chips in Hero. Each item translated separately. | P0 |

**Full Bio English Source (from index-final.html):**
```
Mohamed Mamdouh is a French bakery consultant with over 10 years of professional experience in crafting exceptional baked goods. Specializing in authentic sourdough, croissants, and traditional French-style pastries, he brings a unique blend of classical techniques and contemporary innovation to every creation.

With a passion for culinary excellence and a commitment to quality, Mohamed has dedicated his career to mastering the art of artisanal baking. His expertise spans from sourcing premium ingredients to perfecting fermentation techniques, ensuring each product meets the highest standards of taste and craftsmanship.

Having worked with renowned bakeries and founded successful ventures, Mohamed combines traditional French baking methods with modern business acumen. He specializes in menu development, production optimization, and training baking teams to achieve excellence.
```

---

### 3.3 PROJECTS / WORK EXPERIENCE (P0)

Translate ALL 6 verified entries from index-final.html:

| # | Role (EN) | Workplace (EN) | Location (EN) | Description (EN) | Target Fields | Notes |
|---|-----------|---------------|---------------|------------------|--------------|-------|
| 1 | Head Chef | Fornalia Bakery | Industrial Zone, Fifth Settlement | — | `role_ar`, `workplace_ar`, `location_ar`, `description_ar` | No description in source |
| 2 | Head Chef | Rotoo Bakery | — | Founded and developed menu with specialization in French pastries | Same | Highlight: founded from scratch |
| 3 | Head Chef | Life Snacks | — | Chef Sourdough specialist, menu development | Same | |
| 4 | Head Chef | Nabit Bakery | Gardenia Zahraa Compound, Nasr City | — | Same | |
| 5 | Head Chef | The Daily Need | Industrial Zone, Fifth Settlement | — | Same | |
| 6 | Consultant Bakery Chef | KUP | Kingdom of Saudi Arabia | — | Same | International experience |

**Category labels to translate:**

| English | i18n Key | Priority |
|---------|----------|----------|
| Early Career | `projects.categories.early` | P1 |
| Specialization | `projects.categories.specialization` | P1 |
| Leadership | `projects.categories.leadership` | P1 |
| Founded from Scratch | `projects.categories.founder` | P0 |
| International | `projects.categories.international` | P0 |

---

### 3.4 SERVICES (P0)

Translate ALL 9 services from index-final.html:

**Artisanal Baking:**

| English | Target Fields |
|---------|--------------|
| French Croissants | `services[0].name_ar`, `description_ar` |
| Authentic Sourdough | `services[1].name_ar`, `description_ar` |
| Premium Pastries | `services[2].name_ar`, `description_ar` |

**Consulting & Development:**

| English | Target Fields |
|---------|--------------|
| Menu Development | `services[3].name_ar`, `description_ar` |
| Production Optimization | `services[4].name_ar`, `description_ar` |
| Quality Assurance | `services[5].name_ar`, `description_ar` |

**Training & Expertise:**

| English | Target Fields |
|---------|--------------|
| Team Training Programs | `services[6].name_ar`, `description_ar` |
| Technique Workshops | `services[7].name_ar`, `description_ar` |
| Specialized Coaching | `services[8].name_ar`, `description_ar` |

Note: Descriptions in source are short phrases ("Buttery & Laminated", "Authentic Techniques", etc.). Translate these as concise descriptors, not full sentences.

---

### 3.5 CONTACT INFO (P0)

| Source English | Target Field | Context | Priority |
|---------------|-------------|---------|----------|
| Cairo, Egypt | `siteSettings.contactInfo.address_ar` | Location display | P0 |
| Response time: 24 hours guaranteed | `siteSettings.contactInfo.responseTime_ar` | Trust badge near WhatsApp CTA | P0 |
| Available for consultations and custom orders | `siteSettings.contactInfo.businessHours.note_ar` | Business hours note | P1 |

**Request Type dropdown options (already seeded but verify):**

| English | Target | Status |
|---------|--------|--------|
| Consulting | استشارات | ✅ Seeded |
| Catering | تموين حفلات | ✅ Seeded |
| Training | تدريب | ✅ Seeded |
| Partnerships | شراكات | ✅ Seeded |
| Other | أخرى | ✅ Seeded |

---

### 3.6 TESTIMONIALS (P1)

Placeholder quotes need Arabic placeholder format:

| English Placeholder | Arabic Placeholder |
|--------------------|--------------------|
| [Placeholder — Chef Mohamed served as Head Chef at Fornalia Bakery...] | [عنصر نائب — شغل الشيف محمد منصب الشيف الرئيسي في مخبز فورناليا...] |
| [Placeholder — Chef Mohamed founded Nabit Bakery...] | [عنصر نائب — أسس الشيف محمد مخبز نابيت...] |
| [Placeholder — Chef Mohamed began his career as Chef Assistant at Ralph's Cafe...] | [عنصر نائب — بدأ الشيف محمد مسيرته كمساعد شيف في رالفز كافيه...] |

---

### 3.7 ADMIN UI LABELS (P2)

Translate all `admin.nav.*` and `admin.fields.*` keys:

| English Key | English Value | Arabic Target |
|------------|---------------|---------------|
| `admin.nav.projects` | My Work Experience | خبراتي العملية |
| `admin.nav.locations` | Service Areas | مناطق الخدمة |
| `admin.fields.role_en` | Your Role (English) | دورك (إنجليزي) |
| `admin.fields.role_ar` | Your Role (Arabic) | دورك (عربي) |
| `admin.fields.workplace_en` | Workplace (English) | مكان العمل (إنجليزي) |
| `admin.fields.category` | Career Stage | مرحلة المسيرة |
| `admin.fields.isHighlight` | Featured (show badge) | مميز (إظهار شارة) |
| `admin.actions.dragReorder` | Drag to reorder | اسحب لإعادة الترتيب |
| `menu.priceOnRequest` | On request | عند الطلب |
| `contact.whatsappLabel` | WhatsApp | واتساب |
| `contact.responseLabel` | Response Time | وقت الاستجابة |
| `hours.closed` | Closed | مغلق |
| `days.monday` through `days.sunday` | Monday–Sunday | الإثنين – الأحد |

---

### 3.8 PUBLIC UI STRINGS (P1)

| String | Context | Target i18n Key |
|--------|---------|-----------------|
| Add your photo in Admin → Homepage Welcome | Hero empty state | `hero.emptyState` |
| Your bakery in photos | Gallery empty state heading | `gallery.emptyTitle` |
| Go to Admin → Gallery | Gallery empty state CTA | `gallery.emptyCta` |
| Setting up our bakery... | Unseeded state message | `site.setupInProgress` |

---

## 4. STYLE GUIDE

### Numbers
- **Body text:** Use Eastern Arabic numerals (١٢٣) for body text; Western (123) for prices/codes/phone numbers
- **Phone numbers:** Keep as-is (+20 111 876 8479, +20 102 029 5018)
- **Years/dates:** Eastern Arabic (٢٠١٢–٢٠١٦)

### Punctuation
- **Comma:** Arabic comma (،) not Latin (,)
- **Question mark:** Arabic question mark (؟) not Latin (?)
- **Period:** Use Arabic period (.) — same as Latin
- **Semicolon:** Use Arabic semicolon (؛) not Latin (;)
- **Dash:** Use em-dash (—) for breaks
- **Line breaks:** Preserve \n where they appear in English (e.g., hero heading)

### Gender
- Default to **masculine** when addressing general audience
- Use "أنتَ" (masculine you) in second-person address
- First-person is gender-neutral ("أنا" / "نحن")

### Formality
- **Semi-formal Egyptian F&B register** — NOT royal/formal (فصحى ملكية), NOT slang/street (عامية)
- Think: a professional chef talking to a business client at a networking event
- Contractions are OK in some contexts

### French Loanwords (Preserve These)
These are commonly used in Egyptian F&B industry:
- كرواسون (Croissant)
- باجيت (Baguette)
- تارت (Tart)
- جاتوه (Gâteau)
- سوردو (Sourdough) — also acceptable as خبز العجين المخمر

### Workplace Names
- **Transliterate** established names: فورناليا (Fornalia)، روتو (Rotoo)، نابيت (Nabit)
- **Keep English** for lesser-known: Life Snacks, The Daily Need, KUP
- Examples:
  - "Fornalia Bakery" → "فورناليا بيكري"
  - "Nabit Bakery" → "نبت بيكري" or "Nabit Bakery"
  - "Rotoo Bakery" → "روتو بيكري"
  - "KUP" → "KUP" (keep English — it's an acronym)
  - "Life Snacks" → "Life Snacks" (keep English)
  - "The Daily Need" → "The Daily Need" (keep English)

### DO NOT:
- Machine-translate (Google Translate output is unacceptable)
- Use classical/Quranic vocabulary (e.g., "يُبديع" instead of "يصنع")
- Over-formalize (e.g., "يُبدع فنون" instead of "يتعلم")
- Invent terms not in the glossary
- Leave any English word untranslated except proper nouns and accepted loanwords
- Use Egyptian dialect (عامية) — keep it MSA with Egyptian flavor

---

## 5. DELIVERY FORMAT

Translator should deliver results as a **single JSON file** (`arabic-translations.json`) with this exact structure:

```json
{
  "siteSettings": {
    "heroContent": {
      "heading_ar": "",
      "subheading_ar": "",
      "ctaLabel_ar": ""
    },
    "aboutContent": {
      "heading_ar": "",
      "bio_ar": "",
      "tagline_ar": "",
      "education_ar": "",
      "stats": []
    },
    "contactInfo": {
      "address_ar": "",
      "responseTime_ar": "",
      "businessHours": {
        "note_ar": ""
      }
    }
  },
  "projects": [
    {
      "workplace_en": "Fornalia Bakery",
      "role_ar": "",
      "workplace_ar": "",
      "location_ar": "",
      "description_ar": ""
    }
  ],
  "services": [
    {
      "name_en": "French Croissants",
      "name_ar": "",
      "description_ar": ""
    }
  ],
  "testimonials": [
    {
      "customerName": "Fornalia Bakery",
      "quote_ar": ""
    }
  ],
  "i18n": {
    "admin.nav.projects": "",
    "projects.categories.founder": "",
    "menu.priceOnRequest": "",
    "contact.whatsappLabel": "",
    "days.monday": ""
  }
}
```

---

## 6. QUALITY CHECKLIST

Before delivery, translator must verify:

- [ ] All glossary terms used consistently throughout
- [ ] Read-aloud test: sounds like real Egyptian chef, not machine translation
- [ ] French loanwords preserved correctly (كرواسون، باجيت، تارت، جاتوه، سوردو)
- [ ] Cairo neighborhoods match common usage (التجمع الخامس، المعادي، مدينة نصر)
- [ ] Tone consistent: professional-warm, first-person where appropriate
- [ ] No untranslated English except proper nouns and accepted loanwords
- [ ] Valid JSON structure
- [ ] Arabic text ~20-30% longer than English (expected)
- [ ] Line breaks preserved where they appear in English (e.g., hero heading)
- [ ] First-person voice maintained in bio and tagline
- [ ] "Founded from Scratch" translated consistently as "تأسيس من الصفر" everywhere
- [ ] Phone numbers, dates, and prices left unchanged
- [ ] All 6 project entries translated (not just a sample)
- [ ] All 9 services translated
- [ ] All 3 testimonial placeholders translated
- [ ] Stats badges (6 items) translated as short phrases

---

## 7. POST-DELIVERY INTEGRATION — COMPLETED 2026-06-23

All translations from the delivery file (`arabic-translations.json`) have been imported:

1. ✅ **Seed data:** `convex/mutations.ts` — all `NEEDS_PROFESSIONAL_TRANSLATION` placeholders replaced with professional translations. 3 glossary-compliance fixes + 10 description_ar updates applied.
2. ✅ **i18n keys:** `src/i18n/messages/ar.json` — 8 targeted changes made (updated existing, added 20+ new keys for Projects, Locations, admin fields, BusinessHours).
3. ✅ **Run seed:** Seed mutation idempotent — no data overwritten.
4. ✅ **Verify:** Zero `NEEDS_PROFESSIONAL_TRANSLATION` remaining. Glossary spot-check passed (8 required terms).
5. ✅ **Admin:** All 11 admin editors show correct Arabic labels (nav, fields, actions).

**Delivery artifact:** `arabic-translations.json` deleted from project root on 2026-06-23 after verification.

---

## 8. CONTACT FOR QUESTIONS

If the translator has questions about:
- **Baking terminology:** Refer to the glossary (Section 2). If a term isn't listed, ask the project lead.
- **Cairo geography:** Neighborhood names are fixed (Section 2). Do NOT transliterate differently.
- **Workplace names:** See workplace name guidance in Section 4.
- **Tone/formality:** When in doubt, use the "professional chef at a networking event" test.

---

*End of Translation Brief*
