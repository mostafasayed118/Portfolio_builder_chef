import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_ATTEMPTS } from "./lib/rateLimit";

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
    const allItems = await ctx.db
      .query("menuItems")
      .withIndex("by_order")
      .order("asc")
      .collect();

    const filtered = allItems.filter((i) => i.isAvailable || i.isShowcase);

    if (args.category) {
      return filtered
        .filter((i) => i.category === args.category)
        .sort((a, b) => a.order - b.order);
    }

    return filtered.sort((a, b) => a.order - b.order);
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

// ─── Videos ("Craft & Practice") queries ─────────────────────────────────────

export const getVisibleVideos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .collect()
      .then((items) => items.sort((a, b) => a.order - b.order));
  },
});

export const getAllVideos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("videos")
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

export const getContentReadiness = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    // Existence checks with take(1) for efficiency
    const hasHeroImage = !!settings?.heroContent?.imageUrl;
    const hasAboutImage = !!settings?.aboutContent?.imageUrl;
    const hasEmail = !!settings?.contactInfo?.email;
    const hasInstagram = !!settings?.contactInfo?.instagram;

    const galleryExists =
      (await ctx.db.query("gallery").take(1)).length > 0;

    const visibleTestimonialExists =
      (await ctx.db
        .query("testimonials")
        .withIndex("by_visible", (q) => q.eq("isVisible", true))
        .take(1)).length > 0;

    const hasVisibleMenuItems =
      (await ctx.db
        .query("menuItems")
        .filter((q) =>
          q.or(q.eq(q.field("isAvailable"), true), q.eq(q.field("isShowcase"), true)),
        )
        .take(1)).length > 0;

    const hasCaseStudies =
      (await ctx.db
        .query("projects")
        .withIndex("by_visible", (q) => q.eq("isVisible", true))
        .take(1)).length > 0;

    return {
      hasHeroImage,
      hasAboutImage,
      hasGalleryImages: galleryExists,
      hasEmail,
      hasInstagram,
      hasVisibleTestimonials: visibleTestimonialExists,
      hasVisibleMenuItems,
      hasCaseStudies,
    };
  },
});

export const getContactInquiries = query({
  args: { showArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const showArchived = args.showArchived ?? false;
    const all = await ctx.db
      .query("contactInquiries")
      .withIndex("by_created")
      .order("desc")
      .collect();
    return all.filter((item) => {
      const isArchived = item.archived === true;
      return showArchived ? isArchived : !isArchived;
    });
  },
});

export const getStaleInquiryCount = query({
  args: {},
  handler: async (ctx) => {
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    return await ctx.db
      .query("contactInquiries")
      .filter((q) =>
        q.and(
          q.neq(q.field("archived"), true),
          q.or(
            q.eq(q.field("status"), "new"),
            q.eq(q.field("status"), undefined),
            q.eq(q.field("status"), null),
          ),
          q.lt(q.field("createdAt"), fortyEightHoursAgo),
        ),
      )
      .collect()
      .then((items) => items.length);
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

// ─── Section Config queries ──────────────────────────────────────────────────

export const getVisibleSections = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sectionConfigs")
      .withIndex("by_order")
      .order("asc")
      .collect()
      .then((items) =>
        items
          .filter((i) => i.isVisible)
          .map((i) => ({
            sectionKey: i.sectionKey,
            label_en: i.label_en,
            label_ar: i.label_ar,
            order: i.order,
          })),
      );
  },
});

export const getAllSectionConfigs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sectionConfigs")
      .withIndex("by_order")
      .order("asc")
      .collect();
  },
});

// ─── Theme queries ───────────────────────────────────────────────────────────

export const getTheme = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    return settings?.theme ?? null;
  },
});

// ─── SEO queries ─────────────────────────────────────────────────────────────

export const getSeoSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    return {
      seo: settings?.seo ?? null,
      openGraph: settings?.openGraph ?? null,
    };
  },
});

export const getPageMetadata = query({
  args: { pageKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pageMetadata")
      .withIndex("by_pageKey", (q) => q.eq("pageKey", args.pageKey))
      .first();
  },
});

export const getAllPageMetadata = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pageMetadata").collect();
  },
});

export const getResolvedMetadata = query({
  args: { pageKey: v.string(), locale: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    const seo = settings?.seo;
    const og = settings?.openGraph;

    const pageMeta = await ctx.db
      .query("pageMetadata")
      .withIndex("by_pageKey", (q) => q.eq("pageKey", args.pageKey))
      .first();

    const isAr = args.locale === "ar";

    // Resolution chain: page-specific → global SEO → hardcoded defaults
    const title = (isAr ? pageMeta?.title_ar : pageMeta?.title_en)
      ?? (isAr ? seo?.defaultTitle_ar : seo?.defaultTitle_en)
      ?? (isAr ? "الشيف محمد | استشاري مخبوزات فرنسية" : "Chef Mohamed | French Bakery Consultant");

    const description = (isAr ? pageMeta?.description_ar : pageMeta?.description_en)
      ?? (isAr ? seo?.defaultDescription_ar : seo?.defaultDescription_en)
      ?? (isAr
        ? "استشارات مخبوزات فرنسية متخصصة — خبز العجين المخمر، الكرواسون، وتطوير القوائم بخبرة عشر سنوات"
        : "French bakery consulting — sourdough, croissants, menu development, and team training by Chef Mohamed");

    // Apply title template if page-specific title exists
    let resolvedTitle = title;
    const hasPageTitle = isAr ? pageMeta?.title_ar : pageMeta?.title_en;
    if (hasPageTitle && seo?.titleTemplate) {
      resolvedTitle = seo.titleTemplate.replace("%s", title);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chefmohamed.com";

    return {
      title: resolvedTitle,
      description,
      openGraph: {
        title: resolvedTitle,
        description,
        siteName: isAr ? (og?.siteName_ar ?? "الشيف محمد") : (og?.siteName_en ?? "Chef Mohamed"),
        locale: og?.locale ?? (isAr ? "ar_EG" : "en_US"),
        imageStorageId: pageMeta?.ogImageStorageId ?? og?.defaultImageStorageId,
        type: "website" as const,
        url: pageMeta?.canonicalUrl ?? `${baseUrl}/${args.locale}`,
      },
      twitter: {
        handle: og?.twitterHandle ?? null,
        card: "summary_large_image" as const,
      },
      canonical: pageMeta?.canonicalUrl ?? `${baseUrl}/${args.locale}`,
      noIndex: pageMeta?.noIndex ?? seo?.noIndex ?? false,
      googleAnalyticsId: seo?.googleAnalyticsId ?? null,
      googleSiteVerification: seo?.googleSiteVerification ?? null,
      facebookPixelId: seo?.facebookPixelId ?? null,
      businessName: isAr ? seo?.businessName_ar : seo?.businessName_en,
      sameAs: seo?.sameAs ?? [],
    };
  },
});

// ─── Internal queries (for actions, no admin auth) ──────────────────────────

export const getInquiryById = internalQuery({
  args: { id: v.id("contactInquiries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getSiteSettingsForEmail = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (!settings) return null;
    return {
      contactInfo: {
        email: settings.contactInfo.email,
        whatsapp: settings.contactInfo.whatsapp ?? null,
      },
    };
  },
});
