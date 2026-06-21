import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSiteSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();
  },
});

export const getHeroContent = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();
    return settings?.heroContent ?? null;
  },
});

export const getAboutContent = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();
    return settings?.aboutContent ?? null;
  },
});

export const getContactInfo = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();
    return settings?.contactInfo ?? null;
  },
});

export const getMenuItems = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("menuItems")
        .withIndex("by_category", (q) =>
          q.eq("category", args.category as "cakes" | "pastries" | "cookies" | "seasonal"),
        )
        .collect()
        .then((items) =>
          items.filter((i) => i.isAvailable).sort((a, b) => a.order - b.order),
        );
    }
    return await ctx.db
      .query("menuItems")
      .withIndex("by_available", (q) => q.eq("isAvailable", true))
      .collect()
      .then((items) => items.sort((a, b) => a.order - b.order));
  },
});

export const getVisibleTestimonials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("testimonials")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .collect()
      .then((items) => items.sort((a, b) => b.createdAt - a.createdAt));
  },
});

export const getGallery = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gallery")
      .withIndex("by_order")
      .order("asc")
      .collect();
  },
});

export const getAllMenuItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_order")
      .order("asc")
      .collect();
  },
});

export const getAllTestimonials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("testimonials").order("desc").collect();
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const menuItems = await ctx.db.query("menuItems").collect();
    const testimonials = await ctx.db.query("testimonials").collect();
    const galleryImages = await ctx.db.query("gallery").collect();

    return {
      menuCount: menuItems.length,
      testimonialCount: testimonials.length,
      galleryCount: galleryImages.length,
    };
  },
});
