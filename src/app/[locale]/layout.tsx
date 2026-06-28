import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { getFontClass } from "@/lib/fonts";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { resolvePageMetadata, generateStructuredData } from "@/lib/metadata";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { ThemeTokens } from "@/lib/theme-presets";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return await resolvePageMetadata(locale, "home");
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "ar")) notFound();

  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass = getFontClass();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chefmohamed.com";

  // Fetch SEO data for structured data + analytics + theme
  let structuredData = null;
  let analyticsId: string | null = null;
  let pixelId: string | null = null;
  let themeData: { light: ThemeTokens; dark?: ThemeTokens | null } | null = null;
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const seoData = await client.query(api.queries.getSeoSettings);
    const contactData = await client.query(api.queries.getContactInfo);
    const themeResult = await client.query(api.queries.getTheme);
    const seo = seoData.seo;
    analyticsId = seo?.googleAnalyticsId ?? null;
    pixelId = seo?.facebookPixelId ?? null;
    if (themeResult) {
      themeData = { light: themeResult.light, dark: themeResult.dark ?? null };
    }
    structuredData = generateStructuredData(
      locale,
      seo
        ? {
            businessName: locale === "ar" ? seo.businessName_ar : seo.businessName_en,
            description: locale === "ar" ? seo.defaultDescription_ar : seo.defaultDescription_en,
            sameAs: seo.sameAs,
          }
        : null,
      contactData
        ? {
            phone: contactData.phone,
            email: contactData.email,
            address: locale === "ar" ? contactData.address_ar : contactData.address_en,
            whatsapp: contactData.whatsapp ?? undefined,
          }
        : null,
      baseUrl,
    );
  } catch {
    // Structured data is optional — don't break the page
  }

  return (
    <html lang={locale} dir={dir} className={fontClass} suppressHydrationWarning>
      <head>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
        {analyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${analyticsId}');
                `,
              }}
            />
          </>
        )}
        {pixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider>
          <ThemeProvider theme={themeData}>
            {children}
          </ThemeProvider>
          <Toaster position={dir === "rtl" ? "top-left" : "top-right"} richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
