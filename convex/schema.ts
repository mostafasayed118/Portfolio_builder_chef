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
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

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

  rateLimitEntries: defineTable({
    key: v.string(),
    attemptAt: v.number(),
  }).index("by_key_time", ["key", "attemptAt"]),

  contactInquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    requestType: v.union(
      v.literal("consulting"),
      v.literal("catering"),
      v.literal("training"),
      v.literal("partnerships"),
      v.literal("other"),
    ),
    message: v.string(),
    createdAt: v.number(),
    isRead: v.boolean(),
  })
    .index("by_created", ["createdAt"])
    .index("by_email", ["email"])
    .index("by_read", ["isRead"]),

  activityLogs: defineTable({
    action: v.string(),
    tableName: v.string(),
    documentId: v.optional(v.string()),
    actor: v.string(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});
