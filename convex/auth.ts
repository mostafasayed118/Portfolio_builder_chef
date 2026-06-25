import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";

/**
 * Guard for all admin write mutations.
 *
 * Uses Convex's native authentication — when Clerk is configured as the
 * auth provider (via convex/auth.config.ts), ctx.auth.getUserIdentity()
 * automatically verifies the Clerk session token.
 *
 * ENFORCES SINGLE ADMIN EMAIL: Only the designated admin email
 * (set as ADMIN_EMAIL in .env.local and Convex env) can write.
 */
export async function requireAdmin(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("Unauthorized: Not authenticated");
  }

  // Enforce single admin email at Convex level
  const email = identity.email;
  if (email !== process.env.ADMIN_EMAIL) {
    throw new ConvexError("Unauthorized: Not the designated admin");
  }

  return { userId: identity.subject, email };
}
