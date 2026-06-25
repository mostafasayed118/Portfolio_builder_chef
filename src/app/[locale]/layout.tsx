import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { getFontClass } from "@/lib/fonts";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    title: locale === "ar" ? "الشيف محمد | استشاري مخبوزات فرنسية" : "Chef Mohamed | French Bakery Consultant",
    description:
      locale === "ar"
        ? "استشارات مخبوزات فرنسية متخصصة — خبز العجين المخمر، الكرواسون، وتطوير القوائم بخبرة عشر سنوات"
        : "French bakery consulting — sourdough, croissants, menu development, and team training by Chef Mohamed",
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        en: `${siteUrl}/en`,
        ar: `${siteUrl}/ar`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      siteName: "Chef Mohamed",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "ar")) notFound();

  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass = getFontClass(locale);

  return (
      <html lang={locale} dir={dir} className={fontClass} suppressHydrationWarning>
        <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
          <NextIntlClientProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </NextIntlClientProvider>
        </body>
      </html>
  );
}
