import { mutation } from "./_generated/server";
import { v } from "convex/values";

const heroContentValidator = v.object({
  heading_en: v.string(),
  heading_ar: v.string(),
  subheading_en: v.string(),
  subheading_ar: v.string(),
  ctaLabel_en: v.string(),
  ctaLabel_ar: v.string(),
  imageUrl: v.nullable(v.string()),
});

const aboutContentValidator = v.object({
  heading_en: v.string(),
  heading_ar: v.string(),
  bio_en: v.string(),
  bio_ar: v.string(),
  imageUrl: v.nullable(v.string()),
  skills: v.array(v.string()),
});

const contactInfoValidator = v.object({
  phone: v.string(),
  email: v.string(),
  instagram: v.nullable(v.string()),
  address_en: v.string(),
  address_ar: v.string(),
  bookingUrl: v.nullable(v.string()),
});

const menuItemValidator = v.object({
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
});

const testimonialValidator = v.object({
  quote_en: v.string(),
  quote_ar: v.string(),
  customerName: v.string(),
  rating: v.number(),
  isVisible: v.boolean(),
});

export const initializeSiteSettings = mutation({
  args: {
    heroContent: heroContentValidator,
    aboutContent: aboutContentValidator,
    contactInfo: contactInfoValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("siteSettings", {
      key: "main",
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const updateHeroContent = mutation({
  args: heroContentValidator,
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!settings) return null;

    await ctx.db.patch(settings._id, {
      heroContent: args,
      updatedAt: Date.now(),
    });
    return settings._id;
  },
});

export const updateAboutContent = mutation({
  args: aboutContentValidator,
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!settings) return null;

    await ctx.db.patch(settings._id, {
      aboutContent: args,
      updatedAt: Date.now(),
    });
    return settings._id;
  },
});

export const updateContactInfo = mutation({
  args: contactInfoValidator,
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!settings) return null;

    await ctx.db.patch(settings._id, {
      contactInfo: args,
      updatedAt: Date.now(),
    });
    return settings._id;
  },
});

export const createMenuItem = mutation({
  args: menuItemValidator,
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    name_en: v.optional(v.string()),
    name_ar: v.optional(v.string()),
    description_en: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(
      v.union(
        v.literal("cakes"),
        v.literal("pastries"),
        v.literal("cookies"),
        v.literal("seasonal"),
      ),
    ),
    imageUrl: v.optional(v.nullable(v.string())),
    isAvailable: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const toggleMenuItemAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");
    await ctx.db.patch(args.id, { isAvailable: !item.isAvailable });
  },
});

export const reorderMenuItems = mutation({
  args: { orderedIds: v.array(v.id("menuItems")) },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});

export const createTestimonial = mutation({
  args: testimonialValidator,
  handler: async (ctx, args) => {
    return await ctx.db.insert("testimonials", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateTestimonial = mutation({
  args: {
    id: v.id("testimonials"),
    quote_en: v.optional(v.string()),
    quote_ar: v.optional(v.string()),
    customerName: v.optional(v.string()),
    rating: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteTestimonial = mutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const toggleTestimonialVisibility = mutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Testimonial not found");
    await ctx.db.patch(args.id, { isVisible: !item.isVisible });
  },
});

export const addGalleryImage = mutation({
  args: {
    url: v.nullable(v.string()),
    storageId: v.nullable(v.id("_storage")),
    caption_en: v.string(),
    caption_ar: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("gallery", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const deleteGalleryImage = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const reorderGallery = mutation({
  args: { orderedIds: v.array(v.id("gallery")) },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});
