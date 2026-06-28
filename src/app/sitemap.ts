import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const STATIC_PAGES = [
  { key: "home", path: "" },
  { key: "about", path: "/about" },
  { key: "services", path: "/services" },
  { key: "menu", path: "/menu" },
  { key: "gallery", path: "/gallery" },
  { key: "contact", path: "/contact" },
  { key: "craftPractice", path: "/craft-practice" },
] as const;

function entry(
  baseUrl: string,
  path: string,
  lastmod: Date,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}/en${path}`,
    lastModified: lastmod,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: `${baseUrl}/en${path}`,
        ar: `${baseUrl}/ar${path}`,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://chefmohamed.com").replace(/\/+$/, "");

  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    const [seoData, allPageMeta, services, projects] = await Promise.all([
      client.query(api.queries.getSeoSettings),
      client.query(api.queries.getAllPageMetadata),
      client.query(api.queries.getServices, {}),
      client.query(api.queries.getVisibleProjects),
    ]);

    // Global noIndex → empty sitemap
    if (seoData.seo?.noIndex) {
      return [];
    }

    // Build lookup: pageKey → { noIndex, updatedAt }
    const metaMap = new Map<string, { noIndex: boolean; updatedAt: number }>();
    for (const meta of allPageMeta) {
      metaMap.set(meta.pageKey, {
        noIndex: meta.noIndex ?? false,
        updatedAt: meta.updatedAt,
      });
    }

    const now = new Date();
    const entries: MetadataRoute.Sitemap = [];

    for (const page of STATIC_PAGES) {
      const meta = metaMap.get(page.key);
      if (meta?.noIndex) continue;

      const lastmod = meta?.updatedAt ? new Date(meta.updatedAt) : now;
      const priority = page.key === "home" ? 1 : 0.8;
      const changeFreq = page.key === "home" ? "weekly" : "monthly";

      entries.push(entry(baseUrl, page.path, lastmod, priority, changeFreq));
    }

    // Dynamic service detail pages: /services/[slug]
    // Services don't have individual routes — skip to avoid 404s.
    // But update /services lastmod if any service is newer than page metadata.
    if (services.length > 0) {
      const latestService = services.reduce((max, s) =>
        s.createdAt > max.createdAt ? s : max,
      );
      const servicesEntry = entries.find((e) => e.url === `${baseUrl}/en/services`);
      if (servicesEntry) {
        const currentLastmod = servicesEntry.lastModified instanceof Date
          ? servicesEntry.lastModified.getTime()
          : new Date(servicesEntry.lastModified ?? 0).getTime();
        if (latestService.createdAt > currentLastmod) {
          servicesEntry.lastModified = new Date(latestService.createdAt);
        }
      }
    }

    // Dynamic project entries: projects are rendered on /craft-practice or dedicated pages.
    // If visible projects exist, bump /craft-practice lastmod.
    if (projects.length > 0) {
      const latestProject = projects.reduce((max, p) =>
        p.createdAt > max.createdAt ? p : max,
      );
      const craftEntry = entries.find((e) => e.url === `${baseUrl}/en/craft-practice`);
      if (craftEntry) {
        const currentLastmod = craftEntry.lastModified instanceof Date
          ? craftEntry.lastModified.getTime()
          : new Date(craftEntry.lastModified ?? 0).getTime();
        if (latestProject.createdAt > currentLastmod) {
          craftEntry.lastModified = new Date(latestProject.createdAt);
        }
      }
    }

    return entries;
  } catch {
    // Convex unreachable → return minimal sitemap with static pages only
    const fallbackDate = new Date();
    return STATIC_PAGES.map((page) =>
      entry(
        baseUrl,
        page.path,
        fallbackDate,
        page.key === "home" ? 1 : 0.8,
        page.key === "home" ? "weekly" : "monthly",
      ),
    );
  }
}
