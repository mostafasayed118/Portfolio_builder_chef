import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSiteSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
  },
});

export const getHeroContent = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    return settings?.heroContent ?? null;
  },
});

export const getAboutContent = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    return settings?.aboutContent ?? null;
  },
});

export const getContactInfo = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
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
          q.eq("category", args.category as "breads" | "cakes" | "pastries" | "cookies" | "seasonal"),
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
    const inquiries = await ctx.db.query("contactInquiries").collect();
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    return {
      menuCount: menuItems.length,
      testimonialCount: testimonials.length,
      galleryCount: galleryImages.length,
      inquiryCount: inquiries.length,
      unreadInquiryCount: inquiries.filter((i) => !i.isRead).length,
      lastUpdated: settings?.updatedAt ?? null,
    };
  },
});

export const getContactInquiries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contactInquiries")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

export const getServices = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("services")
        .withIndex("by_category", (q) =>
          q.eq("category", args.category as "artisanal" | "consulting" | "training"),
        )
        .collect()
        .then((items) => items.filter((i) => i.isVisible).sort((a, b) => a.order - b.order));
    }
    return await ctx.db
      .query("services")
      .collect()
      .then((items) => items.filter((i) => i.isVisible).sort((a, b) => a.order - b.order));
  },
});

export const getAllServices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});

// ─── Projects queries ───────────────────────────────────────────────────────

export const getVisibleProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .collect()
      .then((items) => items.sort((a, b) => a.order - b.order));
  },
});

export const getAllProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_order")
      .order("asc")
      .collect();
  },
});

// ─── Locations queries ──────────────────────────────────────────────────────

export const getVisibleLocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_order")
      .order("asc")
      .collect()
      .then((items) => items.filter((i) => i.isVisible));
  },
});

export const getAllLocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_order")
      .order("asc")
      .collect();
  },
});

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export const getRecentActivityLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_created")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const checkLoginRateLimit = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recent = await ctx.db
      .query("rateLimitEntries")
      .withIndex("by_key_time", (q) =>
        q.eq("key", args.key).gte("attemptAt", windowStart),
      )
      .collect();
    return { allowed: recent.length < RATE_LIMIT_MAX_ATTEMPTS };
  },
});
