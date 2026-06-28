/**
 * Convex auth configuration for Clerk integration.
 *
 * This file tells Convex how to verify Clerk session tokens.
 * CLERK_FRONTEND_API_URL must be set in the Convex environment:
 *   npx convex env set CLERK_FRONTEND_API_URL=https://evolved-martin-67.clerk.accounts.dev
 */
const authConfig = {
  providers: [
    {
      domain: "evolved-martin-67.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
