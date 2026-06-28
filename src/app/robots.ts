import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chefmohamed.com";

  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const seoData = await client.query(api.queries.getSeoSettings);

    if (seoData.seo?.noIndex) {
      return {
        rules: [
          {
            userAgent: "*",
            disallow: "/",
          },
        ],
      };
    }

    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  } catch {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }
}
