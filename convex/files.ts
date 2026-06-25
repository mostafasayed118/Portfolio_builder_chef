import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveGalleryImageFromStorage = mutation({
  args: {
    storageId: v.id("_storage"),
    caption_en: v.string(),
    caption_ar: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Storage URL not found");

    return await ctx.db.insert("gallery", {
      url,
      storageId: args.storageId,
      caption_en: args.caption_en,
      caption_ar: args.caption_ar,
      order: args.order,
      createdAt: Date.now(),
    });
  },
});

export const deleteStorageImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.storage.delete(args.storageId);
  },
});

export const getStorageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Storage URL not found");
    return url;
  },
});
