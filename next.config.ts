import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const devScriptSrc = process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : "";

const config: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "*.convex.cloud" },
      { hostname: "storage.googleapis.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              `script-src 'self' 'unsafe-inline'${devScriptSrc} https://*.clerk.com https://*.clerk.accounts.dev; ` +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: blob: https://*.convex.cloud https://*.convex.site https://img.clerk.com; " +
              "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud https://*.clerk.com https://*.clerk.accounts.dev; " +
              "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "worker-src 'self' blob:; " +
              "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(config);
