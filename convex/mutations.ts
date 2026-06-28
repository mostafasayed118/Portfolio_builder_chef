import { mutation, internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./auth";
import { internal } from "./_generated/api";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_ATTEMPTS } from "./lib/rateLimit";

// ─── Field definitions ───────────────────────────────────────────────────────

const heroContentFields = {
  heading_en: v.string(),
  heading_ar: v.string(),
  subheading_en: v.string(),
  subheading_ar: v.string(),
  ctaLabel_en: v.string(),
  ctaLabel_ar: v.string(),
  imageUrl: v.nullable(v.string()),
};

const heroContentValidator = v.object(heroContentFields);

const aboutContentFields = {
  heading_en: v.string(),
  heading_ar: v.string(),
  bio_en: v.string(),
  bio_ar: v.string(),
  imageUrl: v.nullable(v.string()),
  skills: v.array(v.string()),
  stats: v.optional(v.array(v.string())),
  tagline_en: v.nullable(v.string()),
  tagline_ar: v.nullable(v.string()),
  education_en: v.optional(v.nullable(v.string())),
  education_ar: v.optional(v.nullable(v.string())),
};

const aboutContentValidator = v.object(aboutContentFields);

const contactInfoFields = {
  phone: v.string(),
  email: v.string(),
  instagram: v.nullable(v.string()),
  address_en: v.string(),
  address_ar: v.string(),
  bookingUrl: v.nullable(v.string()),
  whatsapp: v.nullable(v.string()),
  responseTime_en: v.nullable(v.string()),
  responseTime_ar: v.nullable(v.string()),
  secondaryPhone: v.nullable(v.string()),
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
};

const contactInfoValidator = v.object(contactInfoFields);

const menuItemFields = {
  name_en: v.string(),
  name_ar: v.string(),
  description_en: v.string(),
  description_ar: v.string(),
  // null = "Price available upon request" — never use 0 as sentinel (see BUG #10)
  price: v.nullable(v.number()),
  category: v.union(
    v.literal("breads"),
    v.literal("cakes"),
    v.literal("pastries"),
    v.literal("cookies"),
    v.literal("seasonal"),
  ),
  imageUrl: v.nullable(v.string()),
  isAvailable: v.boolean(),
  isShowcase: v.optional(v.boolean()),
  order: v.number(),
};

const testimonialFields = {
  quote_en: v.string(),
  quote_ar: v.string(),
  customerName: v.string(),
  rating: v.number(),
  isVisible: v.boolean(),
};

const serviceFields = {
  name_en: v.string(),
  name_ar: v.string(),
  description_en: v.string(),
  description_ar: v.string(),
  icon: v.nullable(v.string()),
  order: v.number(),
  isVisible: v.boolean(),
  category: v.union(
    v.literal("artisanal"),
    v.literal("consulting"),
    v.literal("training"),
  ),
};

const projectFields = {
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
};

const locationFields = {
  name_en: v.string(),
  name_ar: v.string(),
  region: v.union(v.literal("cairo"), v.literal("international")),
  neighborhoods: v.array(v.string()),
  neighborhoods_ar: v.array(v.string()),
  markerIcon: v.string(),
  order: v.number(),
  isVisible: v.boolean(),
};

// ─── Activity log helper ─────────────────────────────────────────────────────
async function logActivityInternal(ctx: MutationCtx, action: string,
  tableName: string,
  actor: string | undefined,
  details?: string,
) {
  await ctx.db.insert("activityLogs", {
    action,
    tableName,
    actor: actor ?? "unknown",
    details: details ?? undefined,
    createdAt: Date.now(),
  });
}

// ─── siteSettings mutations ───────────────────────────────────────────────────

export const initializeSiteSettings = mutation({
  args: {
    heroContent: heroContentValidator,
    aboutContent: aboutContentValidator,
    contactInfo: contactInfoValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
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
  args: heroContentFields,
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!settings) return null;

    await ctx.db.patch(settings._id, {
      heroContent: args,
      updatedAt: Date.now(),
    });
    await logActivityInternal(ctx, "update", "siteSettings", admin.email, "Updated hero content");
    return settings._id;
  },
});

export const updateAboutContent = mutation({
  args: aboutContentFields,
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!settings) return null;

    await ctx.db.patch(settings._id, {
      aboutContent: args,
      updatedAt: Date.now(),
    });
    await logActivityInternal(ctx, "update", "siteSettings", admin.email, "Updated about content");
    return settings._id;
  },
});

export const updateContactInfo = mutation({
  args: contactInfoFields,
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!settings) return null;

    await ctx.db.patch(settings._id, {
      contactInfo: args,
      updatedAt: Date.now(),
    });
    await logActivityInternal(ctx, "update", "siteSettings", admin.email, "Updated contact info");
    return settings._id;
  },
});

// ─── Menu mutations ───────────────────────────────────────────────────────────

export const createMenuItem = mutation({
  args: menuItemFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
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
    price: v.optional(v.nullable(v.number())),
    category: v.optional(
      v.union(
        v.literal("breads"),
        v.literal("cakes"),
        v.literal("pastries"),
        v.literal("cookies"),
        v.literal("seasonal"),
      ),
    ),
    imageUrl: v.optional(v.nullable(v.string())),
    isAvailable: v.optional(v.boolean()),
    isShowcase: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const toggleMenuItemAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");
    await ctx.db.patch(args.id, { isAvailable: !item.isAvailable });
  },
});

export const reorderMenuItems = mutation({
  args: { orderedIds: v.array(v.id("menuItems")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});

// ─── Testimonial mutations ────────────────────────────────────────────────────

export const createTestimonial = mutation({
  args: testimonialFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteTestimonial = mutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const toggleTestimonialVisibility = mutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Testimonial not found");
    await ctx.db.patch(args.id, { isVisible: !item.isVisible });
  },
});

// ─── Gallery mutations ────────────────────────────────────────────────────────

export const deleteGalleryImage = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) throw new ConvexError("Gallery item not found");

    // Clean up storage before deleting the DB record
    if (item.storageId) {
      try {
        await ctx.storage.delete(item.storageId);
      } catch (e) {
        console.warn(`Failed to delete storage for gallery ${args.id}:`, e);
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const reorderGallery = mutation({
  args: { orderedIds: v.array(v.id("gallery")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});

// ─── Videos ("Craft & Practice") mutations ───────────────────────────────────

const videoFields = {
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
};

export const createVideo = mutation({
  args: videoFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Resolve the video URL once at write-time (gallery pattern).
    const videoUrl = await ctx.storage.getUrl(args.storageId);
    let posterUrl: string | undefined;
    if (args.posterStorageId) {
      posterUrl = await ctx.storage.getUrl(args.posterStorageId) ?? undefined;
    }

    return await ctx.db.insert("videos", {
      title_en: args.title_en,
      title_ar: args.title_ar,
      description_en: args.description_en,
      description_ar: args.description_ar,
      category: args.category,
      storageId: args.storageId,
      videoUrl: videoUrl ?? null,
      hlsUrl: args.hlsUrl,
      posterStorageId: args.posterStorageId,
      posterUrl,
      duration: args.duration,
      order: args.order,
      isVisible: args.isVisible,
      createdAt: Date.now(),
    });
  },
});

export const updateVideo = mutation({
  args: {
    id: v.id("videos"),
    title_en: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    description_en: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("product"),
        v.literal("training"),
        v.literal("bts"),
      ),
    ),
    storageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.nullable(v.string())),
    hlsUrl: v.optional(v.string()),
    posterStorageId: v.optional(v.id("_storage")),
    posterUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const { id, ...fields } = args;

    // If the video file changed, resolve the new URL at write-time.
    if (fields.storageId) {
      const url = await ctx.storage.getUrl(fields.storageId);
      fields.videoUrl = url ?? null;
    }
    // If the poster changed, resolve its URL too.
    if (fields.posterStorageId !== undefined) {
      if (fields.posterStorageId === null) {
        fields.posterUrl = undefined;
      } else {
        fields.posterUrl =
          (await ctx.storage.getUrl(fields.posterStorageId)) ?? undefined;
      }
    }

    await ctx.db.patch(id, fields);
    await logActivityInternal(ctx, "update", "videos", admin.email, `Updated video ${id}`);
  },
});

export const deleteVideo = mutation({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new ConvexError("Video not found");

    // Clean up BOTH the video and poster storage before deleting the DB record.
    // try/catch each independently — a missing file should not block deletion.
    try {
      await ctx.storage.delete(item.storageId);
    } catch (e) {
      console.warn(`Failed to delete video storage ${args.id}:`, e);
    }
    if (item.posterStorageId) {
      try {
        await ctx.storage.delete(item.posterStorageId);
      } catch (e) {
        console.warn(`Failed to delete poster storage ${args.id}:`, e);
      }
    }

    await ctx.db.delete(args.id);
    await logActivityInternal(ctx, "delete", "videos", admin.email, `Deleted video ${args.id}`);
  },
});

export const toggleVideoVisibility = mutation({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Video not found");
    await ctx.db.patch(args.id, { isVisible: !item.isVisible });
  },
});

export const reorderVideos = mutation({
  args: { orderedIds: v.array(v.id("videos")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});

// ─── Services mutations ───────────────────────────────────────────────────────

export const createService = mutation({
  args: serviceFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("services", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateService = mutation({
  args: {
    id: v.id("services"),
    name_en: v.optional(v.string()),
    name_ar: v.optional(v.string()),
    description_en: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    icon: v.optional(v.nullable(v.string())),
    order: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    category: v.optional(
      v.union(
        v.literal("artisanal"),
        v.literal("consulting"),
        v.literal("training"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const reorderServices = mutation({
  args: { orderedIds: v.array(v.id("services")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});

// ─── Projects mutations ──────────────────────────────────────────────────────

export const createProject = mutation({
  args: projectFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("projects", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    role_en: v.optional(v.string()),
    role_ar: v.optional(v.string()),
    workplace_en: v.optional(v.string()),
    workplace_ar: v.optional(v.string()),
    location_en: v.optional(v.string()),
    location_ar: v.optional(v.string()),
    description_en: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("early"),
        v.literal("specialization"),
        v.literal("leadership"),
        v.literal("founder"),
        v.literal("international"),
      ),
    ),
    imageUrl: v.optional(v.nullable(v.id("_storage"))),
    order: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    isHighlight: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Project not found");
    if (item.imageUrl) {
      try {
        await ctx.storage.delete(item.imageUrl);
      } catch (e) {
        console.warn(`Failed to delete storage for project ${args.id}:`, e);
      }
    }
    await ctx.db.delete(args.id);
  },
});

export const toggleProjectVisibility = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Project not found");
    await ctx.db.patch(args.id, { isVisible: !item.isVisible });
  },
});

export const reorderProjects = mutation({
  args: { orderedIds: v.array(v.id("projects")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});

// ─── Locations mutations ─────────────────────────────────────────────────────

export const createLocation = mutation({
  args: locationFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("locations", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateLocation = mutation({
  args: {
    id: v.id("locations"),
    name_en: v.optional(v.string()),
    name_ar: v.optional(v.string()),
    region: v.optional(v.union(v.literal("cairo"), v.literal("international"))),
    neighborhoods: v.optional(v.array(v.string())),
    neighborhoods_ar: v.optional(v.array(v.string())),
    markerIcon: v.optional(v.string()),
    order: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteLocation = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const reorderLocations = mutation({
  args: { orderedIds: v.array(v.id("locations")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});

/**
 * Patch Arabic translations on existing services.
 * Run once after adding real Arabic translations to the seed data:
 *   npx convex run mutations:patchServiceTranslations
 */
export const patchServiceTranslations = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const services = await ctx.db.query("services").collect();
    const patches: Record<string, { name_ar: string; description_ar: string }> = {
      "French Croissants": { name_ar: "كرواسون فرنسي", description_ar: "معجنات فرنسية بالزبدة محضرة يدويًا — كلاسيكية وشوكولاتة" },
      "Authentic Sourdough": { name_ar: "خبز سوردو أصيل", description_ar: "خبز عجين مخمر ببطء باستخدام تقنيات تقليدية" },
      "Premium Pastries": { name_ar: "معجنات فاخرة", description_ar: "معجنات فرنسية كلاسيكية وحديثة لكل المناسبات" },
      "Menu Development": { name_ar: "تطوير القوائم", description_ar: "تحسين الإنتاج وتصميم القوائم للمخابز والمقاهي" },
      "Quality Assurance": { name_ar: "ضمان الجودة", description_ar: "تنفيذ أنظمة ضمان الجودة ومعايير إنتاج متسقة" },
      "Production Optimization": { name_ar: "تحسين الإنتاج", description_ar: "تبسيط عمليات المخبز لتحسين الكفاءة والجودة" },
      "Team Training Programs": { name_ar: "برامج تدريب الفرق", description_ar: "ورش عمل عملية للمهارات لفرق المخبز بمستوياتها المختلفة" },
      "Specialized Coaching": { name_ar: "تدريب متخصص", description_ar: "خبرة فردية في الخبز المخمر والتجهيز والأنظمة الإنتاجية" },
      "Workshop Programs": { name_ar: "برامج ورش عمل", description_ar: "ورش عمل خبز عملية للفرق والأفراد" },
    };
    let count = 0;
    for (const svc of services) {
      const patch = patches[svc.name_en];
      if (patch && (svc.name_ar === "NEEDS_PROFESSIONAL_TRANSLATION" || !svc.name_ar)) {
        await ctx.db.patch(svc._id, patch);
        count++;
      }
    }
    return { updated: count };
  },
});

/**
 * Patch Arabic translations on existing siteSettings.
 * Run once: npx convex run mutations:patchSiteSettingsTranslations
 */
export const patchSiteSettingsTranslations = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!settings) return { updated: false };

    await ctx.db.patch(settings._id, {
      contactInfo: {
        ...settings.contactInfo,
        responseTime_ar: "ضمان الرد خلال ٢٤ ساعة",
      },
    });
    return { updated: true };
  },
});

/**
 * One-time migration: fix stale seed data in live Convex DB.
 * The seed mutation is idempotent (only inserts when empty), so stale data
 * from earlier seed runs is never overwritten. This patches specific fields.
 *
 * Run once: npx convex run mutations:migrateFixStaleSeedData
 *
 * SECURITY NOTE: This mutation requires admin authentication.
 * It only patches specific fields and is safe to leave in place — calling it again is a no-op.
 */
export const migrateFixStaleSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!settings) return { updated: false, reason: "No siteSettings found" };

    const patches: Record<string, unknown> = {};

    // Fix aboutContent — heading or bio may contain stale "Chef Amira"
    const hasAmira =
      settings.aboutContent?.heading_en?.includes("Amira") ||
      settings.aboutContent?.bio_en?.includes("Amira") ||
      settings.aboutContent?.heading_ar?.includes("أميرة");

    if (hasAmira) {
      patches.aboutContent = {
        ...settings.aboutContent,
        heading_en: "Hi, I'm Chef Mohamed",
        heading_ar: "خبير في فنون المخبوزات الفرنسية الحرفية",
        bio_en:
          "For ten years, I've built my career one bakery at a time — from assistant to head chef, from employee to founder.\n\nI started at Ralph's Cafe in Maadi, learning every station. Then specialized in croissants and sourdough at Croissant & Sourdough Kitchen and Richius. At Life Snacks, I mastered slow-fermented baking — the patient art of listening to dough.\n\nLeadership came at The Daily Need as Assistant Head Chef, then my first head-chef role at Fornalia Bakery. I've since founded two bakeries from scratch — Nabit and Rotoo — building menus and operations from the first sack of flour.\n\nInternationally, I served as Consultant Bakery Chef at KUP in Saudi Arabia, adapting French techniques to Middle Eastern markets.\n\nWhat I've learned: excellence isn't a destination — it's the only standard I bake to.",
        bio_ar: "على مدى عشر سنوات، بنيت مسيرتي مخبزًا تلو الآخر — من مساعد إلى شيف رئيسي، ومن موظف إلى مؤسس.\n\n بدأت في رالفز كافيه بالمعادي، تعلمت كل محطة. ثم تخصصت في الكرواسون والخبز المخمر في مطبخ الكرواسون والخبز المخمر وريشيوس. في لايف سناكس، أتقنت فن التخمير البطيء — فن الصبر والاستماع للعجين.\n\nجاءت القيادة في ذا ديلي نيد كمساعد شيف رئيسي، ثم أول دور كشيف رئيسي في فورناليا بيكري. أسست منذ ذلك مبخزين من الصفر — نابيت وروتو — بنت القائمة والعمليات من أول كيس دقيق.\n\n دوليًا، شغلت منصب مستشار مخبوزات في KUP بالمملكة العربية السعودية، وكيّفت التقنيات الفرنسية لأسواق الشرق الأوسط.\n\n ما تعلمته: التميز ليس وجهة — بل هو المعيار الوحيد الذي أخبز به.",
        skills: [
          "French Baked Goods",
          "Sourdough Fermentation",
          "Croissant Lamination",
          "Menu Development",
          "Bakery Operations",
          "Traditional & Contemporary Blend",
        ],
        tagline_en: "French Bakery Consultant — Crafting excellence, one bake at a time.",
        tagline_ar: "استشاري مخبوزات فرنسية — نصنع التميز في كل مخبوز 🥐",
        stats: [
          "10+ Years Professional",
          "French Specialist",
          "Menu Development",
          "Team Training",
          "Sourdough Expert",
          "Award-Winning",
        ],
        education_en:
          "Technical Diploma in Industrial Studies — Mesta (Industrial Zone, October City) — 2012–2016",
        education_ar: "الدبلوم التقني في الدراسات الصناعية — مسطى (المنطقة الصناعية، مدينة أكتوبر) — ٢٠١٢–٢٠١٦",
      };
    }

    // Ensure whatsapp is set
    if (!settings.contactInfo?.whatsapp) {
      patches.contactInfo = {
        ...settings.contactInfo,
        whatsapp: "https://wa.me/201020295018",
      };
    }

    if (Object.keys(patches).length === 0) {
      return { updated: false, reason: "Data already correct" };
    }

    // Fix heroContent — subheading may contain "Chef Amira"
    if (settings.heroContent?.subheading_en?.includes("Amira")) {
      patches.heroContent = {
        ...settings.heroContent,
        heading_en: "Slow Bread, French Pastry,\nTen Years at the Bench",
        heading_ar: "خبز بطيء، معجنات فرنسية،\nعشر سنوات على طاولة العمل",
        subheading_en:
          "Sourdough, croissants, and a blend of tradition with modern technique — by Chef Mohamed.",
        subheading_ar: "١٠ سنوات من التميز في المخبوزات الحرفية",
        ctaLabel_en: "Book a Free Consultation",
        ctaLabel_ar: "احجز استشارة مجانية",
      };
    }

    // Fix contactInfo — stale email, instagram, phone, address, whatsapp
    if (settings.contactInfo?.email?.includes("amira") || settings.contactInfo?.whatsapp === "safsaf") {
      patches.contactInfo = {
        ...settings.contactInfo,
        phone: "+20 111 876 8479",
        email: "",
        instagram: null,
        address_en: "Based in Greater Cairo, Egypt — serving Maadi, Fifth Settlement, and Nasr City.",
        address_ar: "المقر الرئيسي في القاهرة الكبرى، مصر — نخدم المعادي، التجمع الخامس، ومدينة نصر.",
        whatsapp: "https://wa.me/201020295018",
        responseTime_en: "24 hours guaranteed",
        responseTime_ar: "ضمان الرد خلال ٢٤ ساعة",
        secondaryPhone: null,
        bookingUrl: null,
        requestTypes: [
          { value: "consulting", label_en: "Bakery Consulting", label_ar: "استشارات مخبوزات" },
          { value: "catering", label_en: "Catering", label_ar: "تموين حفلات" },
          { value: "training", label_en: "Training & Workshops", label_ar: "تدريب" },
          { value: "partnerships", label_en: "Partnership", label_ar: "شراكات" },
          { value: "other", label_en: "Other", label_ar: "أخرى" },
        ],
        businessHours: {
          note_en: "Available for consultations and custom orders",
          note_ar: "متاح للاستشارات والطلبات الخاصة",
        },
      };
    }

    if (Object.keys(patches).length === 0) {
      return { updated: false, reason: "Data already correct" };
    }

    await ctx.db.patch(settings._id, patches);
    return { updated: true, fields: Object.keys(patches) };
  },
});

// ─── Contact inquiry mutations (PUBLIC — no admin key required) ───────────────

export const submitContactInquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    requestType: v.string(),
    message: v.string(),
    // Lead qualification fields (all optional, backward compatible)
    businessType: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    governorate: v.optional(v.string()),
    challengeType: v.optional(v.string()),
    budgetRange: v.optional(v.string()),
    preferredMode: v.optional(v.string()),
    preferredSlot: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Rate limit: same email may not submit more than once per 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recent = await ctx.db
      .query("contactInquiries")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.gte(q.field("createdAt"), tenMinutesAgo))
      .first();

    if (recent) {
      throw new ConvexError({
        code: "RATE_LIMITED",
        message: "Please wait a few minutes before submitting again.",
      });
    }

    const { businessType, teamSize, governorate, challengeType, budgetRange, preferredMode, preferredSlot, ...coreArgs } = args;

    const inquiryId = await ctx.db.insert("contactInquiries", {
      ...coreArgs,
      businessType: businessType ?? undefined,
      teamSize: teamSize ?? undefined,
      governorate: governorate ?? undefined,
      challengeType: challengeType ?? undefined,
      budgetRange: budgetRange ?? undefined,
      preferredMode: preferredMode ?? undefined,
      preferredSlot: preferredSlot ?? undefined,
      status: "new",
      createdAt: Date.now(),
      isRead: false,
    });

    // Fire-and-forget: schedule email notification via Brevo
    ctx.scheduler.runAfter(0, internal.actions.sendInquiryNotification, {
      inquiryId,
    });

    return inquiryId;
  },
});

export const markInquiryRead = mutation({
  args: { id: v.id("contactInquiries") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const unmarkInquiryRead = mutation({
  args: { id: v.id("contactInquiries") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isRead: false });
  },
});

// ─── Archive / Unarchive mutations ────────────────────────────────────────────

export const archiveInquiries = mutation({
  args: { ids: v.array(v.id("contactInquiries")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let count = 0;
    for (const id of args.ids) {
      const item = await ctx.db.get(id);
      if (!item || item.archived) continue;
      await ctx.db.patch(id, { archived: true, archivedAt: Date.now() });
      count++;
    }
    return { archived: count };
  },
});

export const unarchiveInquiries = mutation({
  args: { ids: v.array(v.id("contactInquiries")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let count = 0;
    for (const id of args.ids) {
      const item = await ctx.db.get(id);
      if (!item || !item.archived) continue;
      await ctx.db.patch(id, { archived: false, archivedAt: undefined });
      count++;
    }
    return { unarchived: count };
  },
});

export const batchMarkInquiriesRead = mutation({
  args: { ids: v.array(v.id("contactInquiries")), isRead: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let count = 0;
    for (const id of args.ids) {
      const item = await ctx.db.get(id);
      if (!item) continue;
      if (item.isRead !== args.isRead) {
        await ctx.db.patch(id, { isRead: args.isRead });
        count++;
      }
    }
    return { updated: count };
  },
});

// ─── Lead pipeline mutations ──────────────────────────────────────────────────

export const updateInquiryStatus = mutation({
  args: {
    id: v.id("contactInquiries"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const inquiry = await ctx.db.get(args.id);
    if (!inquiry) throw new ConvexError("Inquiry not found");

    const patches: Record<string, unknown> = {
      status: args.status,
    };

    // Auto-set respondedAt when moving from "new" → "contacted"
    if (inquiry.status === "new" || !inquiry.status) {
      if (args.status === "contacted") {
        patches.respondedAt = Date.now();
      }
    }

    await ctx.db.patch(args.id, patches);

    await logActivityInternal(ctx, "update", "contactInquiries", "admin", `Status changed: ${args.status}`);
  },
});

export const updateInquiryNotes = mutation({
  args: {
    id: v.id("contactInquiries"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { notes: args.notes });
  },
});

export const getInquiriesExport = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("contactInquiries")
      .order("desc")
      .collect();
  },
});

// ─── Activity log ─────────────────────────────────────────────────────────────

export const logActivity = mutation({
  args: {
    action: v.string(),
    tableName: v.string(),
    documentId: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await ctx.db.insert("activityLogs", {
      action: args.action,
      tableName: args.tableName,
      documentId: args.documentId ?? undefined,
      actor: admin.email ?? "unknown",
      details: args.details ?? undefined,
      createdAt: Date.now(),
    });
  },
});

// ─── Internal email activity log (called by actions, no admin auth) ──────────

export const logEmailActivity = internalMutation({
  args: {
    action: v.string(),
    inquiryId: v.id("contactInquiries"),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLogs", {
      action: args.action,
      tableName: "contactInquiries",
      documentId: args.inquiryId,
      actor: "system:email",
      details: args.details ?? undefined,
      createdAt: Date.now(),
    });
  },
});

// ─── Seed (PUBLIC — safe because idempotent) ──────────────────────────────────

/**
 * Chef Mohamed Bakery — Portfolio Seed
 *
 * Source: docs/CHEF_PROFILE.md (transformed from Mohamed Mamdouh Mohamed's CV).
 * Every English string here is traceable to a CV fact; nothing is invented.
 *
 * Idempotency: safe to call repeatedly.
 *   - siteSettings (key="main"): inserted only if absent — existing edits NEVER overwritten
 *   - menuItems: inserted only if the table is empty (peek with `.take(1)`)
 *   - testimonials: inserted only if the table is empty
 *   - services: inserted only if the table is empty
 *   - gallery: NOT seeded — storage uploads must go through the admin so
 *     `ctx.storage.getUrl()` resolves to a real CDN URL (see BUG #1)
 *
 * ⚠️ BEFORE PRODUCTION RUN:
 *   1. Replace every "NEEDS_PROFESSIONAL_TRANSLATION" with native-speaker Arabic
 *      (do NOT auto-translate culinary vocabulary)
 *   2. Fill email / instagram in contactInfo via admin
 *   3. Flip menuItems[*].isAvailable to true after setting real prices in admin
 *   4. Flip testimonials[*].isVisible to true after replacing placeholder quotes
 *
 * Trigger from terminal:  npx convex run mutations:seedBakeryContent
 * Or from the Convex Dashboard's Functions tab.
 */
export const seedBakeryContent = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const summary = {
      siteSettings: "skipped" as "skipped" | "inserted" | "already exists",
      menuItems: 0,
      testimonials: 0,
      gallery: "skipped (upload photos via admin)" as const,
      services: 0,
      projects: 0,
      locations: 0,
    };

    // ─── siteSettings (singleton, key="main") ───────────────────────────────
    const existingSettings = await ctx.db
      .query("siteSettings")
      .filter((q) => q.eq(q.field("key"), "main"))
      .first();

    if (!existingSettings) {
      await ctx.db.insert("siteSettings", {
        key: "main",

        heroContent: {
          heading_en: "Slow Bread, French Pastry,\nTen Years at the Bench",
          heading_ar: "خبز بطيء، معجنات فرنسية،\nعشر سنوات على طاولة العمل",
          subheading_en:
            "Sourdough, croissants, and a blend of tradition with modern technique — by Chef Mohamed.",
          subheading_ar: "١٠ سنوات من التميز في المخبوزات الحرفية",
          ctaLabel_en: "Book a Free Consultation",
          ctaLabel_ar: "احجز استشارة مجانية",
          imageUrl: null,
        },

        aboutContent: {
          heading_en: "Hi, I'm Chef Mohamed",
          heading_ar: "خبير في فنون المخبوزات الفرنسية الحرفية",
          bio_en:
            "For ten years, I've built my career one bakery at a time — from assistant to head chef, from employee to founder.\n\nI started at Ralph's Cafe in Maadi, learning every station. Then specialized in croissants and sourdough at Croissant & Sourdough Kitchen and Richius. At Life Snacks, I mastered slow-fermented baking — the patient art of listening to dough.\n\nLeadership came at The Daily Need as Assistant Head Chef, then my first head-chef role at Fornalia Bakery. I've since founded two bakeries from scratch — Nabit and Rotoo — building menus and operations from the first sack of flour.\n\nInternationally, I served as Consultant Bakery Chef at KUP in Saudi Arabia, adapting French techniques to Middle Eastern markets.\n\nWhat I've learned: excellence isn't a destination — it's the only standard I bake to.",
          bio_ar: "على مدى عشر سنوات، بنيت مسيرتي مخبزًا تلو الآخر — من مساعد إلى شيف رئيسي، ومن موظف إلى مؤسس.\n\n بدأت في رالفز كافيه بالمعادي، تعلمت كل محطة. ثم تخصصت في الكرواسون والخبز المخمر في مطبخ الكرواسون والخبز المخمر وريشيوس. في لايف سناكس، أتقنت فن التخمير البطيء — فن الصبر والاستماع للعجين.\n\nجاءت القيادة في ذا ديلي نيد كمساعد شيف رئيسي، ثم أول دور كشيف رئيسي في فورناليا بيكري. أسست منذ ذلك مبخزين من الصفر — نابيت وروتو — بنت القائمة والعمليات من أول كيس دقيق.\n\n دوليًا، شغلت منصب مستشار مخبوزات في KUP بالمملكة العربية السعودية، وكيّفت التقنيات الفرنسية لأسواق الشرق الأوسط.\n\n ما تعلمته: التميز ليس وجهة — بل هو المعيار الوحيد الذي أخبز به.",
          imageUrl: null,
          skills: [
            "French Baked Goods",
            "Sourdough Fermentation",
            "Croissant Lamination",
            "Menu Development",
            "Bakery Operations",
            "Traditional & Contemporary Blend",
          ],
          tagline_en: "French Bakery Consultant — Crafting excellence, one bake at a time.",
          tagline_ar: "استشاري مخبوزات فرنسية — نصنع التميز في كل مخبوز 🥐",
          stats: [
            "10+ Years Professional",
            "French Specialist",
            "Menu Development",
            "Team Training",
            "Sourdough Expert",
            "Award-Winning",
          ],
          education_en:
            "Technical Diploma in Industrial Studies — Mesta (Industrial Zone, October City) — 2012–2016",
          education_ar: "الدبلوم التقني في الدراسات الصناعية — مسطى (المنطقة الصناعية، مدينة أكتوبر) — ٢٠١٢–٢٠١٦",
        },

        contactInfo: {
          phone: "+20 111 876 8479",
          email: "",
          instagram: null,
          address_en:
            "Based in Greater Cairo, Egypt — serving Maadi, Fifth Settlement, and Nasr City.",
          address_ar: "المقر الرئيسي في القاهرة الكبرى، مصر — نخدم المعادي، التجمع الخامس، ومدينة نصر.",
          bookingUrl: null,
          whatsapp: "https://wa.me/201020295018",
          responseTime_en: "24 hours guaranteed",
          responseTime_ar: "نرد عليك خلال ٢٤ ساعة",
          secondaryPhone: "+20 102 029 5018",
          requestTypes: [
            { value: "consulting", label_en: "Bakery Consulting", label_ar: "استشارات مخبوزات" },
            { value: "catering", label_en: "Catering", label_ar: "تموين حفلات" },
            { value: "training", label_en: "Training & Workshops", label_ar: "تدريب وورش عمل" },
            { value: "partnerships", label_en: "Partnership", label_ar: "شراكة" },
            { value: "other", label_en: "Other", label_ar: "أخرى" },
          ],
          businessHours: {
            note_en: "Available for consultations and custom orders",
            note_ar: "متاحون للاستشارات والطلبات الخاصة",
          },
        },

        updatedAt: Date.now(),
      });
      summary.siteSettings = "inserted";
    } else {
      summary.siteSettings = "already exists";
    }

    // ─── services ────────────────────────────────────────────────────────────
    const existingServices = await ctx.db.query("services").take(1);
    if (existingServices.length === 0) {
      const now = Date.now();
      const serviceData = [
        { category: "artisanal" as const, name_en: "French Croissants", name_ar: "كرواسون فرنسي", description_en: "Buttery, hand-laminated French croissants — classic and chocolate.", description_ar: "معجنات فرنسية بالزبدة محضرة يدويًا — كلاسيكية وشوكولاتة", icon: null, order: 0, isVisible: true },
        { category: "artisanal" as const, name_en: "Authentic Sourdough", name_ar: "خبز سوردو أصيل", description_en: "Slow-fermented levain bread using traditional techniques.", description_ar: "خبز عجين مخمر ببطء باستخدام تقنيات تقليدية", icon: null, order: 1, isVisible: true },
        { category: "artisanal" as const, name_en: "Premium Pastries", name_ar: "معجنات فاخرة", description_en: "Classic and modern French pastries for every occasion.", description_ar: "معجنات فرنسية كلاسيكية وحديثة لكل المناسبات", icon: null, order: 2, isVisible: true },
        { category: "consulting" as const, name_en: "Menu Development", name_ar: "تطوير القوائم", description_en: "Production optimization and menu engineering for bakeries and cafes.", description_ar: "تحسين الإنتاج وتصميم القوائم للمخابز والمقاهي", icon: null, order: 3, isVisible: true },
        { category: "consulting" as const, name_en: "Quality Assurance", name_ar: "ضمان الجودة", description_en: "Implement QA systems and consistent production standards.", description_ar: "تنفيذ أنظمة ضمان الجودة ومعايير إنتاج متسقة", icon: null, order: 4, isVisible: true },
        { category: "consulting" as const, name_en: "Production Optimization", name_ar: "تحسين الإنتاج", description_en: "Streamline bakery operations for efficiency and quality.", description_ar: "تبسيط عمليات المخبز لتحسين الكفاءة والجودة", icon: null, order: 5, isVisible: true },
        { category: "training" as const, name_en: "Team Training Programs", name_ar: "برامج تدريب الفرق", description_en: "Hands-on technique workshops for bakery teams of all levels.", description_ar: "ورش عمل عملية للمهارات لفرق المخبز بمستوياتها المختلفة", icon: null, order: 6, isVisible: true },
        { category: "training" as const, name_en: "Specialized Coaching", name_ar: "تدريب متخصص", description_en: "One-on-one expertise in sourdough, lamination, and production systems.", description_ar: "خبرة فردية في الخبز المخمر والتجهيز والأنظمة الإنتاجية", icon: null, order: 7, isVisible: true },
        { category: "training" as const, name_en: "Workshop Programs", name_ar: "برامج ورش عمل", description_en: "Hands-on baking workshops for teams and individuals.", description_ar: "ورش عمل خبز عملية للفرق والأفراد", icon: null, order: 8, isVisible: true },
      ];
      for (const svc of serviceData) {
        await ctx.db.insert("services", { ...svc, createdAt: now });
      }
      summary.services = serviceData.length;
    }

    // ─── menuItems ────────────────────────────────────────────────────────────
    const existingMenu = await ctx.db.query("menuItems").take(1);
    if (existingMenu.length === 0) {
      const now = Date.now();
      const items = [
        { name_en: "Signature Sourdough", name_ar: "الخبز المخمر المميز", description_en: "Slow-fermented levain bread, shaped by hand and baked dark for a deep, caramelized crust. The patience pays off in every slice.", description_ar: "خبز عجين مخمر ببطء، مشكل يدويًا ومخبوز بعمق للحصول على قشرة كراميلية عميقة. الصبر يعود في كل شريحة.", price: null, category: "breads" as const, isAvailable: false, isShowcase: true, order: 0 },
        { name_en: "Classic Croissant", name_ar: "كرواسون كلاسيكي", description_en: "Hand-laminated French butter croissant with a shatteringly crisp shell and an open, airy crumb.", description_ar: "كرواسون فرنسي بالزبدة محضر يدويًا بقشرة مقرمشة بشكل مذهل ونسيج مفتوح بالهواء.", price: null, category: "pastries" as const, isAvailable: false, isShowcase: true, order: 1 },
      ];
      for (const item of items) {
        await ctx.db.insert("menuItems", { ...item, imageUrl: null, createdAt: now });
      }
      summary.menuItems = items.length;
    }

    // ─── testimonials ─────────────────────────────────────────────────────────
    const existingTestimonials = await ctx.db.query("testimonials").take(1);
    if (existingTestimonials.length === 0) {
      const now = Date.now();
      const placeholders = [
        { customerName: "Fornalia Bakery", quote_en: "[Placeholder — Chef Mohamed served as Head Chef at Fornalia Bakery in the Fifth Settlement. Direct endorsement pending.]", quote_ar: "الشيف محمد شغل منصب الشيف الرئيسي في مخبز فورناليا بالمنطقة الصناعية في التجمع الخامس.", rating: 5, isVisible: false, createdAt: now },
        { customerName: "Nabit Bakery", quote_en: "[Placeholder — Chef Mohamed founded Nabit Bakery in the Gardenia Zahraa Compound (Nasr City) from scratch, including menu creation and operations setup. Direct endorsement pending.]", quote_ar: "أسس الشيف محمد مخبز نابيت في compound جاردينا زهراء بمدينة نصر من الصفر.", rating: 5, isVisible: false, createdAt: now },
        { customerName: "Ralph's Cafe (Maadi)", quote_en: "[Placeholder — Chef Mohamed began his career as Chef Assistant at Ralph's Cafe in Maadi. Endorsement from the kitchen leadership pending.]", quote_ar: "بدأ الشيف محمد مسيرته المهنية كمساعد شيف في رالفز كافيه بالمعادي.", rating: 5, isVisible: false, createdAt: now },
      ];
      for (const p of placeholders) await ctx.db.insert("testimonials", p);
      summary.testimonials = placeholders.length;
    }

    // ─── projects (work experience cards) ────────────────────────────────────
    const existingProjects = await ctx.db.query("projects").take(1);
    if (existingProjects.length === 0) {
      const now = Date.now();
      const projectData = [
        {
          role_en: "Chef Assistant",
          role_ar: "مساعد شيف",
          workplace_en: "Ralph's Cafe",
          workplace_ar: "رافلز كافيه",
          location_en: "Maadi, Cairo",
          location_ar: "المعادي، القاهرة",
          description_en:
            "Learned every station and every timing. Foundation of culinary career.",
          description_ar: "تعلّمت كل محطة وكل توقيت. أساس المسيرة المهنية.",
          category: "early" as const,
          imageUrl: null,
          order: 0,
          isVisible: true,
          isHighlight: false,
        },
        {
          role_en: "Chef — Croissant & Sourdough",
          role_ar: "شيف — كرواسون وخبز مخمر",
          workplace_en: "Croissant & Sourdough Kitchen",
          workplace_ar: "مطبخ الكرواسون والخبز المخمر",
          location_en: "Cairo",
          location_ar: "القاهرة",
          description_en:
            "Specialized in French croissant lamination and sourdough fermentation.",
          description_ar: "متخصص في طبقات الكرواسون الفرنسي والتخمير للمخبز المخمر.",
          category: "specialization" as const,
          imageUrl: null,
          order: 1,
          isVisible: true,
          isHighlight: false,
        },
        {
          role_en: "Chef — Sourdough",
          role_ar: "شيف — خبز مخمر",
          workplace_en: "Richius",
          workplace_ar: "ريشيوس",
          location_en: "Maadi Residences, Cairo",
          location_ar: "residences المعادي، القاهرة",
          description_en:
            "Deepened sourdough expertise at Maadi Residences location.",
          description_ar: "عمّق الخبرة في الخبز المخمر في فرع المعادي.",
          category: "specialization" as const,
          imageUrl: null,
          order: 2,
          isVisible: true,
          isHighlight: false,
        },
        {
          role_en: "Chef — Sourdough Specialist",
          role_ar: "شيف متخصص في الخبز المخمر",
          workplace_en: "Life Snacks",
          workplace_ar: "Life Snacks",
          location_en: "Cairo",
          location_ar: "القاهرة",
          description_en:
            "Chef Sourdough specialist, menu development. Refined slow-fermented baking.",
          description_ar: "شيف متخصص في الخبز المخمر وتطوير القوائم. تتقين التخمير البطيء.",
          category: "specialization" as const,
          imageUrl: null,
          order: 3,
          isVisible: true,
          isHighlight: false,
        },
        {
          role_en: "Assistant Head Chef",
          role_ar: "مساعد شيف رئيسي",
          workplace_en: "The Daily Need",
          workplace_ar: "The Daily Need",
          location_en: "Industrial Zone, Fifth Settlement",
          location_ar: "المنطقة الصناعية، التجمع الخامس",
          description_en:
            "First leadership role. Stepped into kitchen management.",
          description_ar: "أول دور قيادي. دخلت إدارة المطبخ.",
          category: "leadership" as const,
          imageUrl: null,
          order: 4,
          isVisible: true,
          isHighlight: false,
        },
        {
          role_en: "Head Chef",
          role_ar: "شيف رئيسي",
          workplace_en: "Fornalia Bakery",
          workplace_ar: "فورناليا بيكري",
          location_en: "Industrial Zone, Fifth Settlement",
          location_ar: "المنطقة الصناعية، التجمع الخامس",
          description_en:
            "First head-chef role. Led bakery operations and team.",
          description_ar: "أول دور كشيف رئيسي. قاد عمليات المخبز والفريق.",
          category: "leadership" as const,
          imageUrl: null,
          order: 5,
          isVisible: true,
          isHighlight: false,
        },
        {
          role_en: "Head Chef (Founded from Scratch)",
          role_ar: "شيف رئيسي (تأسيس من الصفر)",
          workplace_en: "Nabit Bakery",
          workplace_ar: "نبت بيكري",
          location_en: "Gardenia Zahraa Compound, Nasr City",
          location_ar: "compound جاردينا زهراء، مدينة نصر",
          description_en:
            "Founded and built from scratch — menu creation, deposits, operations. From the first sack of flour onward.",
          description_ar: "أسست وبنيناه من الصفر — تطوير القائمة، الإيداعات، العمليات. من أول كيس دقيق إلى ما بعد.",
          category: "founder" as const,
          imageUrl: null,
          order: 6,
          isVisible: true,
          isHighlight: true,
        },
        {
          role_en: "Head Chef (Founded from Scratch)",
          role_ar: "شيف رئيسي (تأسيس من الصفر)",
          workplace_en: "Rotoo Bakery",
          workplace_ar: "روتو بيكري",
          location_en: "Cairo",
          location_ar: "القاهرة",
          description_en:
            "Founded and developed menu with specialization in French pastries. Second bakery opened from scratch.",
          description_ar: "أسست وطورت القائمة مع التخصص في المعجنات الفرنسية. ثاني مخبز تأسس من الصفر.",
          category: "founder" as const,
          imageUrl: null,
          order: 7,
          isVisible: true,
          isHighlight: true,
        },
        {
          role_en: "Consultant Bakery Chef",
          role_ar: "مستشار مخبوزات",
          workplace_en: "KUP",
          workplace_ar: "KUP",
          location_en: "Kingdom of Saudi Arabia",
          location_ar: "المملكة العربية السعودية",
          description_en:
            "International consulting — adapting French techniques to Middle Eastern markets.",
          description_ar: "استشارات دولية — تكييف التقنيات الفرنسية لأسواق الشرق الأوسط.",
          category: "international" as const,
          imageUrl: null,
          order: 8,
          isVisible: true,
          isHighlight: true,
        },
      ];
      for (const project of projectData) {
        await ctx.db.insert("projects", { ...project, createdAt: now });
      }
      summary.projects = projectData.length;
    }

    // ─── locations ───────────────────────────────────────────────────────────
    const existingLocations = await ctx.db.query("locations").take(1);
    if (existingLocations.length === 0) {
      const now = Date.now();
      const locationData = [
        {
          name_en: "Greater Cairo",
          name_ar: "القاهرة الكبرى",
          region: "cairo" as const,
          neighborhoods: ["Maadi", "Fifth Settlement", "Nasr City", "October City"],
          neighborhoods_ar: ["المعادي", "التجمع الخامس", "مدينة نصر", "مدينة أكتوبر"],
          markerIcon: "📍",
          order: 0,
          isVisible: true,
          createdAt: now,
        },
        {
          name_en: "Kingdom of Saudi Arabia",
          name_ar: "المملكة العربية السعودية",
          region: "international" as const,
          neighborhoods: [],
          neighborhoods_ar: [],
          markerIcon: "🌍",
          order: 1,
          isVisible: true,
          createdAt: now,
        },
      ];
      for (const loc of locationData) {
        await ctx.db.insert("locations", loc);
      }
      summary.locations = locationData.length;
    }

    return summary;
  },
});

// ─── Login rate limiting (Convex-persisted, survives serverless cold starts) ──
// These replace the in-memory Map in src/app/api/admin/login/route.ts.
//
// Setup: no extra env vars needed — these run entirely in Convex.
// Called server-side from the Next.js login API via ConvexHttpClient.
// Constants are imported from ./lib/rateLimit to stay in sync with queries.ts.

/** Check and increment the attempt counter for the given key (e.g. "login:<ip>").
 *  Returns { allowed: true } if the request may proceed, { allowed: false } if blocked.
 *  This mutation is intentionally public — it is called BEFORE credentials are checked. */
export const checkAndIncrementLoginAttempt = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;

    // Prune expired entries for this key
    const expired = await ctx.db
      .query("rateLimitEntries")
      .withIndex("by_key_time", (q) =>
        q.eq("key", args.key).lt("attemptAt", windowStart),
      )
      .collect();
    await Promise.all(expired.map((e) => ctx.db.delete(e._id)));

    // Count remaining in-window entries
    const recent = await ctx.db
      .query("rateLimitEntries")
      .withIndex("by_key_time", (q) =>
        q.eq("key", args.key).gte("attemptAt", windowStart),
      )
      .collect();

    if (recent.length >= RATE_LIMIT_MAX_ATTEMPTS) {
      return { allowed: false };
    }

    await ctx.db.insert("rateLimitEntries", { key: args.key, attemptAt: Date.now() });
    return { allowed: true };
  },
});

/** Clear all rate-limit entries for the given key (called after successful login).
 *  Protected with requireAdmin so anonymous callers cannot reset their own counters. */
export const clearLoginAttempts = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const entries = await ctx.db
      .query("rateLimitEntries")
      .withIndex("by_key_time", (q) => q.eq("key", args.key))
      .collect();
    await Promise.all(entries.map((e) => ctx.db.delete(e._id)));
  },
});

/** Record one failed login attempt for the given key. Public — no auth needed,
 *  but validates key format and enforces a per-key write cap to prevent flooding. */
export const incrementLoginAttempt = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const key = args.key.trim();
    if (key.length === 0 || key.length > 200) return;

    // Enforce a hard cap: no more than 50 entries per key total.
    // This prevents a single attacker from flooding the table with junk.
    const existing = await ctx.db
      .query("rateLimitEntries")
      .withIndex("by_key_time", (q) => q.eq("key", key))
      .collect();
    if (existing.length >= 50) return;

    await ctx.db.insert("rateLimitEntries", { key, attemptAt: Date.now() });
  },
});

/** Clear ALL rate-limit entries (dev/emergency reset). */
export const clearAllRateLimits = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("rateLimitEntries").collect();
    await Promise.all(all.map((e) => ctx.db.delete(e._id)));
  },
});

export const clearOldActivityLogs = mutation({
  args: { olderThanDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const cutoff = Date.now() - (args.olderThanDays ?? 90) * 86400_000;
    const old = await ctx.db
      .query("activityLogs")
      .withIndex("by_created")
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();
    await Promise.all(old.map((e) => ctx.db.delete(e._id)));
    await logActivityInternal(ctx, "cleanup", "activityLogs", admin.email, `Cleared ${old.length} old logs`);
    return { deleted: old.length };
  },
});

// ─── Section Config mutations ────────────────────────────────────────────────

export const updateSectionVisibility = mutation({
  args: {
    sectionKey: v.string(),
    isVisible: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const section = await ctx.db
      .query("sectionConfigs")
      .withIndex("by_sectionKey", (q) => q.eq("sectionKey", args.sectionKey))
      .first();

    if (!section) throw new ConvexError("Section config not found");

    if (section.isRequired === true && !args.isVisible) {
      throw new ConvexError("Cannot hide a required section");
    }

    await ctx.db.patch(section._id, {
      isVisible: args.isVisible,
      updatedAt: Date.now(),
    });

    await logActivityInternal(
      ctx,
      "update",
      "sectionConfigs",
      admin.email,
      `${args.isVisible ? "Shown" : "Hidden"} section: ${args.sectionKey}`,
    );
  },
});

export const reorderSections = mutation({
  args: {
    orderedKeys: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    for (let i = 0; i < args.orderedKeys.length; i++) {
      const section = await ctx.db
        .query("sectionConfigs")
        .withIndex("by_sectionKey", (q) => q.eq("sectionKey", args.orderedKeys[i]))
        .first();

      if (section) {
        await ctx.db.patch(section._id, { order: i, updatedAt: Date.now() });
      }
    }

    await logActivityInternal(
      ctx,
      "reorder",
      "sectionConfigs",
      admin.email,
      `Reordered ${args.orderedKeys.length} sections`,
    );
  },
});

export const seedSectionConfigs = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("sectionConfigs").take(1);
    if (existing.length > 0) return { status: "already seeded" };

    const now = Date.now();
    const sections = [
      { sectionKey: "hero", label_en: "Hero", label_ar: "الواجهة الرئيسية", isVisible: true, order: 0, isRequired: true },
      { sectionKey: "trustedBy", label_en: "Trusted By", label_ar: "موثوق من قِبل", isVisible: true, order: 1, isRequired: false },
      { sectionKey: "menu", label_en: "Menu", label_ar: "القائمة", isVisible: true, order: 2, isRequired: false },
      { sectionKey: "about", label_en: "About", label_ar: "عن الشيف", isVisible: true, order: 3, isRequired: false },
      { sectionKey: "services", label_en: "Services", label_ar: "الخدمات", isVisible: true, order: 4, isRequired: false },
      { sectionKey: "testimonials", label_en: "Testimonials", label_ar: "التوصيات", isVisible: true, order: 5, isRequired: false },
      { sectionKey: "ctaBanner", label_en: "CTA Banner", label_ar: "شريط الدعوة", isVisible: true, order: 6, isRequired: false },
      { sectionKey: "gallery", label_en: "Gallery", label_ar: "المعرض", isVisible: true, order: 7, isRequired: false },
      { sectionKey: "contact", label_en: "Contact", label_ar: "تواصل معنا", isVisible: true, order: 8, isRequired: false },
      { sectionKey: "projects", label_en: "Work Experience", label_ar: "الخبرات العملية", isVisible: true, order: 9, isRequired: false },
      { sectionKey: "craftPractice", label_en: "Craft & Practice", label_ar: "حرفة وخبرة", isVisible: true, order: 10, isRequired: false },
      { sectionKey: "locations", label_en: "Service Areas", label_ar: "مناطق الخدمة", isVisible: true, order: 11, isRequired: false },
    ];

    for (const section of sections) {
      await ctx.db.insert("sectionConfigs", { ...section, updatedAt: now });
    }

    return { status: "inserted", count: sections.length };
  },
});

// ─── Theme mutations ─────────────────────────────────────────────────────────

const themeTokensFields = {
  background: v.string(),
  foreground: v.string(),
  accent: v.string(),
  accentForeground: v.string(),
  muted: v.string(),
  mutedForeground: v.string(),
  border: v.string(),
  card: v.string(),
  destructive: v.string(),
};

const OKLCH_PATTERN = /^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s*(\/\s*\d+(\.\d+)?)?\)$/;

function validateOklch(value: string): boolean {
  return OKLCH_PATTERN.test(value);
}

export const updateTheme = mutation({
  args: {
    theme: v.object({
      preset: v.optional(v.string()),
      light: v.object(themeTokensFields),
      dark: v.optional(v.object(themeTokensFields)),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const allTokens = [
      ...Object.values(args.theme.light),
      ...(args.theme.dark ? Object.values(args.theme.dark) : []),
    ];
    for (const token of allTokens) {
      if (!validateOklch(token)) {
        throw new ConvexError(`Invalid OKLCH value: ${token}`);
      }
    }

    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    if (!settings) throw new ConvexError("Site settings not found");

    await ctx.db.patch(settings._id, {
      theme: { ...args.theme, updatedAt: Date.now() },
      updatedAt: Date.now(),
    });

    await logActivityInternal(ctx, "update", "siteSettings", admin.email, "Updated theme");
    return { success: true };
  },
});

export const resetTheme = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);

    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    if (!settings) throw new ConvexError("Site settings not found");

    await ctx.db.patch(settings._id, {
      theme: undefined,
      updatedAt: Date.now(),
    });

    await logActivityInternal(ctx, "update", "siteSettings", admin.email, "Reset theme to default");
    return { success: true };
  },
});

// ─── SEO mutations ───────────────────────────────────────────────────────────

export const updateSeoSettings = mutation({
  args: {
    seo: v.object({
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
    }),
    openGraph: v.optional(v.object({
      defaultImageStorageId: v.optional(v.id("_storage")),
      twitterHandle: v.optional(v.string()),
      locale: v.optional(v.string()),
      siteName_en: v.optional(v.string()),
      siteName_ar: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    // Validate title lengths
    if (args.seo.defaultTitle_en.length > 70) {
      throw new ConvexError("English title must be 70 characters or less");
    }
    if (args.seo.defaultTitle_ar.length > 70) {
      throw new ConvexError("Arabic title must be 70 characters or less");
    }
    if (args.seo.defaultDescription_en.length > 170) {
      throw new ConvexError("English description must be 170 characters or less");
    }
    if (args.seo.defaultDescription_ar.length > 170) {
      throw new ConvexError("Arabic description must be 170 characters or less");
    }

    // Validate URL formats in sameAs
    if (args.seo.sameAs) {
      for (const url of args.seo.sameAs) {
        try {
          new URL(url);
        } catch {
          throw new ConvexError(`Invalid URL in social profiles: ${url}`);
        }
      }
    }

    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    if (!settings) throw new ConvexError("Site settings not found");

    const updateData: Record<string, unknown> = {
      seo: { ...args.seo, updatedAt: Date.now() },
      updatedAt: Date.now(),
    };
    if (args.openGraph) {
      updateData.openGraph = args.openGraph;
    }

    await ctx.db.patch(settings._id, updateData);
    await logActivityInternal(ctx, "update", "siteSettings", admin.email, "Updated SEO settings");
    return { success: true };
  },
});

export const updatePageMetadata = mutation({
  args: {
    pageKey: v.string(),
    title_en: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    description_en: v.optional(v.string()),
    description_ar: v.optional(v.string()),
    ogImageStorageId: v.optional(v.id("_storage")),
    canonicalUrl: v.optional(v.string()),
    noIndex: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    // Validate lengths
    if (args.title_en && args.title_en.length > 70) {
      throw new ConvexError("Title must be 70 characters or less");
    }
    if (args.title_ar && args.title_ar.length > 70) {
      throw new ConvexError("Arabic title must be 70 characters or less");
    }
    if (args.description_en && args.description_en.length > 170) {
      throw new ConvexError("Description must be 170 characters or less");
    }
    if (args.description_ar && args.description_ar.length > 170) {
      throw new ConvexError("Arabic description must be 170 characters or less");
    }

    // Validate canonical URL format
    if (args.canonicalUrl) {
      try {
        new URL(args.canonicalUrl);
      } catch {
        throw new ConvexError("Invalid canonical URL format");
      }
    }

    const existing = await ctx.db
      .query("pageMetadata")
      .withIndex("by_pageKey", (q) => q.eq("pageKey", args.pageKey))
      .first();

    const { pageKey, ...fields } = args;

    if (existing) {
      await ctx.db.patch(existing._id, { ...fields, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("pageMetadata", { pageKey, ...fields, updatedAt: Date.now() });
    }

    await logActivityInternal(ctx, "update", "pageMetadata", admin.email, `Updated metadata for ${args.pageKey}`);
    return { success: true };
  },
});