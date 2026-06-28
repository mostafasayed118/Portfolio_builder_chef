import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  siteSettings: defineTable({
    key: v.string(),
    heroContent: v.object({
      heading_en: v.string(),
      heading_ar: v.string(),
      subheading_en: v.string(),
      subheading_ar: v.string(),
      ctaLabel_en: v.string(),
      ctaLabel_ar: v.string(),
      imageUrl: v.nullable(v.string()),
    }),
    aboutContent: v.object({
      heading_en: v.string(),
      heading_ar: v.string(),
      bio_en: v.string(),
      bio_ar: v.string(),
      imageUrl: v.nullable(v.string()),
      skills: v.array(v.string()),
      stats: v.optional(v.array(v.string())),
      tagline_en: v.optional(v.nullable(v.string())),
      tagline_ar: v.optional(v.nullable(v.string())),
      education_en: v.optional(v.nullable(v.string())),
      education_ar: v.optional(v.nullable(v.string())),
    }),
    contactInfo: v.object({
      phone: v.string(),
      email: v.string(),
      instagram: v.nullable(v.string()),
      address_en: v.string(),
      address_ar: v.string(),
      bookingUrl: v.nullable(v.string()),
      whatsapp: v.optional(v.nullable(v.string())),
      responseTime_en: v.optional(v.nullable(v.string())),
      responseTime_ar: v.optional(v.nullable(v.string())),
      secondaryPhone: v.optional(v.nullable(v.string())),
      requestTypes: v.optional(
        v.array(
          v.object({
            value: v.string(),
            label_en: v.string(),
            label_ar: v.string(),
          }),
        ),
      ),
      businessHours: v.optional(
        v.object({
          note_en: v.string(),
          note_ar: v.string(),
        }),
      ),
    }),
    theme: v.optional(v.object({
      preset: v.optional(v.string()),
      light: v.object({
        background: v.string(),
        foreground: v.string(),
        accent: v.string(),
        accentForeground: v.string(),
        muted: v.string(),
        mutedForeground: v.string(),
        border: v.string(),
        card: v.string(),
        destructive: v.string(),
      }),
      dark: v.optional(v.object({
        background: v.string(),
        foreground: v.string(),
        accent: v.string(),
        accentForeground: v.string(),
        muted: v.string(),
        mutedForeground: v.string(),
        border: v.string(),
        card: v.string(),
        destructive: v.string(),
      })),
      updatedAt: v.number(),
    })),
    seo: v.optional(v.object({
      defaultTitle_en: v.string(),
      defaultTitle_ar: v.string(),
      titleTemplate: v.optional(v.string()),
      defaultDescription_en: v.string(),
      defaultDescription_ar: v.string(),
      businessName_en: v.string(),
      businessName_ar: v.string(),
      businessType: v.optional(v.string()),
      sameAs: v.optional(v.array(v.string())),
      logoStorageId: v.optional(v.id("_storage")),
      googleAnalyticsId: v.optional(v.string()),
      googleSiteVerification: v.optional(v.string()),
      facebookPixelId: v.optional(v.string()),
      robotsTxt: v.optional(v.string()),
      noIndex: v.optional(v.boolean()),
      updatedAt: v.number(),
    })),
    openGraph: v.optional(v.object({
      defaultImageStorageId: v.optional(v.id("_storage")),
      twitterHandle: v.optional(v.string()),
      locale: v.optional(v.string()),
      siteName_en: v.optional(v.string()),
      siteName_ar: v.optional(v.string()),
    })),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  pageMetadata: defineTable({
    pageKey: v.string(),
    title_en: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    description_en: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    ogImageStorageId: v.optional(v.id("_storage")),
    canonicalUrl: v.optional(v.string()),
    noIndex: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_pageKey", ["pageKey"]),

  menuItems: defineTable({
    name_en: v.string(),
    name_ar: v.string(),
    description_en: v.string(),
    description_ar: v.string(),
    price: v.nullable(v.number()),
    category: v.union(
      v.literal("cakes"),
      v.literal("pastries"),
      v.literal("cookies"),
      v.literal("seasonal"),
      v.literal("breads"),
    ),
    imageUrl: v.nullable(v.string()),
    isAvailable: v.boolean(),
    isShowcase: v.optional(v.boolean()),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_order", ["order"])
    .index("by_available", ["isAvailable"]),

  services: defineTable({
    category: v.union(
      v.literal("artisanal"),
      v.literal("consulting"),
      v.literal("training"),
    ),
    name_en: v.string(),
    name_ar: v.string(),
    description_en: v.string(),
    description_ar: v.string(),
    icon: v.nullable(v.string()),
    order: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  testimonials: defineTable({
    quote_en: v.string(),
    quote_ar: v.string(),
    customerName: v.string(),
    rating: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
  }).index("by_visible", ["isVisible"]),

  gallery: defineTable({
    url: v.nullable(v.string()),
    storageId: v.nullable(v.id("_storage")),
    caption_en: v.string(),
    caption_ar: v.string(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),

  // "Craft & Practice" video section — adaptive streaming (HLS) with MP4 fallback.
  // URL resolution follows the gallery pattern: videoUrl/posterUrl are resolved
  // once at write-time via ctx.storage.getUrl() and stored alongside the
  // storageIds (used for cleanup on delete). hlsUrl holds an external CDN
  // manifest when HLS transcoding is configured; when absent the public player
  // falls back to progressive MP4 via videoUrl + preload="metadata".
  videos: defineTable({
    title_en: v.string(),
    title_ar: v.string(),
    description_en: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    category: v.union(
      v.literal("product"),
      v.literal("training"),
      v.literal("bts"),
    ),
    storageId: v.id("_storage"),
    videoUrl: v.nullable(v.string()),
    hlsUrl: v.optional(v.string()),
    posterStorageId: v.optional(v.id("_storage")),
    posterUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_visible", ["isVisible"])
    .index("by_category", ["category"]),

  projects: defineTable({
    role_en: v.string(),
    role_ar: v.string(),
    workplace_en: v.string(),
    workplace_ar: v.string(),
    location_en: v.string(),
    location_ar: v.string(),
    description_en: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    category: v.union(
      v.literal("early"),
      v.literal("specialization"),
      v.literal("leadership"),
      v.literal("founder"),
      v.literal("international"),
    ),
    imageUrl: v.nullable(v.id("_storage")),
    order: v.number(),
    isVisible: v.boolean(),
    isHighlight: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_visible", ["isVisible"])
    .index("by_category", ["category"]),

  locations: defineTable({
    name_en: v.string(),
    name_ar: v.string(),
    region: v.union(v.literal("cairo"), v.literal("international")),
    neighborhoods: v.array(v.string()),
    neighborhoods_ar: v.array(v.string()),
    markerIcon: v.string(),
    order: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),

  sectionConfigs: defineTable({
    sectionKey: v.string(),
    label_en: v.string(),
    label_ar: v.string(),
    isVisible: v.boolean(),
    order: v.number(),
    isRequired: v.optional(v.boolean()),
    updatedAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_sectionKey", ["sectionKey"]),

  rateLimitEntries: defineTable({
    key: v.string(),
    attemptAt: v.number(),
  }).index("by_key_time", ["key", "attemptAt"]),

  contactInquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    requestType: v.string(),
    message: v.string(),
    createdAt: v.number(),
    isRead: v.boolean(),
    archived: v.optional(v.boolean()),
    archivedAt: v.optional(v.number()),
    // Lead qualification fields (backward compatible — all optional)
    businessType: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    governorate: v.optional(v.string()),
    challengeType: v.optional(v.string()),
    budgetRange: v.optional(v.string()),
    preferredMode: v.optional(v.string()),
    preferredSlot: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("quoted"),
      v.literal("won"),
      v.literal("lost"),
    )),
    notes: v.optional(v.string()),
    sourcePage: v.optional(v.string()),
    quotedValue: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
  })
    .index("by_created", ["createdAt"])
    .index("by_email", ["email"])
    .index("by_read", ["isRead"])
    .index("by_archived", ["archived"])
    .index("by_status", ["status"]),

  activityLogs: defineTable({
    action: v.string(),
    tableName: v.string(),
    documentId: v.optional(v.string()),
    actor: v.string(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});
