import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const DEFAULTS = {
  en: {
    title: "Chef Mohamed | French Bakery Consultant",
    description:
      "French bakery consulting — sourdough, croissants, menu development, and team training by Chef Mohamed",
    siteName: "Chef Mohamed",
    locale: "en_US",
  },
  ar: {
    title: "الشيف محمد | استشاري مخبوزات فرنسية",
    description:
      "استشارات مخبوزات فرنسية متخصصة — خبز العجين المخمر، الكرواسون، وتطوير القوائم بخبرة عشر سنوات",
    siteName: "الشيف محمد",
    locale: "ar_EG",
  },
} as const;

export async function resolvePageMetadata(
  locale: string,
  pageKey: string,
): Promise<Metadata> {
  const isAr = locale === "ar";
  const defaults = isAr ? DEFAULTS.ar : DEFAULTS.en;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chefmohamed.com";

  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const resolved = await client.query(api.queries.getResolvedMetadata, {
      pageKey,
      locale,
    });

    const ogImageUrl = resolved.openGraph.imageStorageId
      ? `${baseUrl}/api/og/${pageKey}`
      : `${baseUrl}/og-default.png`;

    const languages: Record<string, string> = {
      en: `${baseUrl}/en`,
      ar: `${baseUrl}/ar`,
    };

    const metadata: Metadata = {
      title: resolved.title,
      description: resolved.description,
      alternates: {
        canonical: resolved.canonical,
        languages,
      },
      openGraph: {
        title: resolved.openGraph.title,
        description: resolved.openGraph.description,
        siteName: resolved.openGraph.siteName,
        locale: resolved.openGraph.locale,
        type: resolved.openGraph.type,
        url: resolved.openGraph.url,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: resolved.openGraph.title,
          },
        ],
      },
      twitter: {
        card: resolved.twitter.card,
        title: resolved.title,
        description: resolved.description,
        images: [ogImageUrl],
        ...(resolved.twitter.handle ? { creator: resolved.twitter.handle } : {}),
      },
      robots: {
        index: !resolved.noIndex,
        follow: !resolved.noIndex,
      },
    };

    if (resolved.googleSiteVerification) {
      metadata.verification = {
        google: resolved.googleSiteVerification,
      };
    }

    return metadata;
  } catch {
    // Graceful fallback to hardcoded defaults
    return {
      title: defaults.title,
      description: defaults.description,
      alternates: {
        canonical: `${baseUrl}/${locale}`,
        languages: {
          en: `${baseUrl}/en`,
          ar: `${baseUrl}/ar`,
        },
      },
      openGraph: {
        type: "website",
        locale: defaults.locale,
        siteName: defaults.siteName,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export function generateStructuredData(
  locale: string,
  seo: {
    businessName?: string;
    description?: string;
    sameAs?: string[];
    logoUrl?: string;
  } | null,
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
  } | null,
  baseUrl: string,
) {
  const isAr = locale === "ar";

  const organization = {
    "@type": "Organization",
    name: seo?.businessName ?? (isAr ? "محمد ممدوح" : "Mohamed Mamdouh"),
    url: baseUrl,
    description:
      seo?.description ??
      (isAr
        ? "استشاري مخبوزات فرنسية — خبز العجين المخمر والكرواسون بخبرة عشر سنوات"
        : "French bakery consultant — sourdough, croissants, and 10 years of expertise"),
    ...(seo?.logoUrl ? { logo: seo.logoUrl } : {}),
    ...(contact?.phone ? { telephone: contact.phone } : {}),
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.address
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: isAr ? "القاهرة" : "Cairo",
            addressCountry: "EG",
            streetAddress: contact.address,
          },
        }
      : {}),
    sameAs: seo?.sameAs ?? [],
  };

  const person = {
    "@type": "Person",
    name: isAr ? "محمد ممدوح" : "Mohamed Mamdouh",
    jobTitle: isAr ? "استشاري مخبوزات فرنسية" : "French Bakery Consultant",
    url: baseUrl,
    sameAs: seo?.sameAs ?? [],
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isAr ? "الرئيسية" : "Home",
        item: `${baseUrl}/${locale}`,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, person, breadcrumb],
  };
}
