import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chefmohamed.com";

  const pages = [
    { key: "home", path: "" },
    { key: "about", path: "/about" },
    { key: "services", path: "/services" },
    { key: "menu", path: "/menu" },
    { key: "gallery", path: "/gallery" },
    { key: "contact", path: "/contact" },
    { key: "craftPractice", path: "/craft-practice" },
  ];

  const noIndexPages: Set<string> = new Set();
  let seoUpdatedAt: number | undefined;

  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const allPageMeta = await client.query(api.queries.getAllPageMetadata);
    const seoData = await client.query(api.queries.getSeoSettings);

    if (seoData.seo?.noIndex) {
      return [];
    }

    seoUpdatedAt = seoData.seo?.updatedAt;

    for (const meta of allPageMeta) {
      if (meta.noIndex) {
        noIndexPages.add(meta.pageKey);
      }
    }
  } catch {
    // If query fails, include all pages
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    if (noIndexPages.has(page.key)) continue;

    entries.push({
      url: `${baseUrl}/en${page.path}`,
      lastModified: new Date(seoUpdatedAt ?? Date.now()),
      changeFrequency: page.key === "home" ? "weekly" : "monthly",
      priority: page.key === "home" ? 1 : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en${page.path}`,
          ar: `${baseUrl}/ar${page.path}`,
        },
      },
    });
  }

  return entries;
}
