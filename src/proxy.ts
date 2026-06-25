import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// ── Route matchers ──────────────────────────────────────────────────────────
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isPublicAuthRoute = createRouteMatcher([
  "/admin/login(.*)",
  "/admin/signup(.*)",
  "/admin/unauthorized(.*)",
]);

// ── Intl middleware ─────────────────────────────────────────────────────────
const intlMiddleware = createIntlMiddleware(routing);

// ── Request logger ────────────────────────────────────────────────────────────
function logRequest(request: Request, status: number, startMs: number) {
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;
  const elapsed = Date.now() - startMs;
  const level = status >= 400 ? "warn" : status >= 500 ? "error" : "info";
  const emoji = level === "error" ? "❌" : level === "warn" ? "⚠️" : "→";
  console.log(`${emoji} ${method} ${path} ${status} ${elapsed}ms`);
}

// ── Clerk + Intl ─────────────────────────────────────────────────────────────
export default clerkMiddleware(async (auth, request) => {
  const start = Date.now();

  // Protect admin routes — SKIP login/signup/unauthorized (public auth pages)
  if (isAdminRoute(request) && !isPublicAuthRoute(request)) {
    try {
      await auth.protect();
      // Note: Email enforcement happens in admin/(protected)/layout.tsx
      // using currentUser() which provides full user profile including emails.
      // Clerk's default JWT template doesn't include email in sessionClaims,
      // so the check cannot be done reliably at the middleware level.
    } catch {
      logRequest(request, 401, start);
      throw new Error("Unauthorized");
    }
  }

  // Run intl middleware for all routes
  const response = intlMiddleware(request);
  logRequest(request, response.status, start);
  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
