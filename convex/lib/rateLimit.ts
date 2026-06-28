/**
 * Shared rate-limit constants.
 *
 * Used by both:
 *   - convex/mutations.ts (checkAndIncrementLoginAttempt — writes)
 *   - convex/queries.ts (checkLoginRateLimit — reads)
 *
 * Keeping these in one place prevents the check-and-increment logic from
 * drifting from the check-only query.
 */

/** Rate-limiting window in milliseconds (15 minutes). */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/** Maximum attempts allowed within the window. */
export const RATE_LIMIT_MAX_ATTEMPTS = 5;
