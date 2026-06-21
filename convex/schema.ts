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
    }),
    contactInfo: v.object({
      phone: v.string(),
      email: v.string(),
      instagram: v.nullable(v.string()),
      address_en: v.string(),
      address_ar: v.string(),
      bookingUrl: v.nullable(v.string()),
    }),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  menuItems: defineTable({
    name_en: v.string(),
    name_ar: v.string(),
    description_en: v.string(),
    description_ar: v.string(),
    price: v.number(),
    category: v.union(
      v.literal("cakes"),
      v.literal("pastries"),
      v.literal("cookies"),
      v.literal("seasonal"),
    ),
    imageUrl: v.nullable(v.string()),
    isAvailable: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_order", ["order"])
    .index("by_available", ["isAvailable"]),

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
});
