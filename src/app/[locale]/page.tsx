import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { MenuSection } from "@/components/sections/MenuSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTABanner } from "@/components/sections/CTABanner";
import { GallerySection } from "@/components/sections/GallerySection";
import { ContactSection } from "@/components/sections/ContactSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الشيف أميرة | مخبز حرفي" : "Chef Amira | Artisan Bakery",
    openGraph: {
      title: locale === "ar" ? "الشيف أميرة" : "Chef Amira",
      description:
        locale === "ar"
          ? "مخبز حرفي يصنع أشهى أنواع الخبز والمعجنات"
          : "Artisan bakery crafting sourdough, croissants, and pastries",
    },
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MenuSection />
      <AboutSection />
      <TestimonialsSection />
      <CTABanner />
      <GallerySection />
      <ContactSection />
    </>
  );
}
