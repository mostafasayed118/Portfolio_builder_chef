import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSection } from "@/components/sections/HeroSection";
import { MenuSection } from "@/components/sections/MenuSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { CTABanner } from "@/components/sections/CTABanner";

const TestimonialsSection = dynamic(
  () => import("@/components/sections/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  })),
  {
    loading: () => (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    ),
    ssr: true,
  },
);

const GallerySection = dynamic(
  () => import("@/components/sections/GallerySection").then((m) => ({
    default: m.GallerySection,
  })),
  {
    loading: () => (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`rounded-xl ${i % 3 === 0 ? "h-64" : i % 3 === 1 ? "h-48" : "h-80"}`}
              />
            ))}
          </div>
        </div>
      </section>
    ),
    ssr: true,
  },
);

const ContactSection = dynamic(
  () => import("@/components/sections/ContactSection").then((m) => ({
    default: m.ContactSection,
  })),
  {
    loading: () => (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    ),
    ssr: true,
  },
);

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الشيف محمد | استشاري مخبوزات فرنسية" : "Chef Mohamed | French Bakery Consultant",
    openGraph: {
      title: locale === "ar" ? "الشيف محمد" : "Chef Mohamed",
      description:
        locale === "ar"
          ? "استشارات مخبوزات فرنسية، خبز العجين المخمر والكرواسون"
          : "French bakery consulting — sourdough, croissants, and 10 years of expertise",
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  return (
    <>
      <Suspense fallback={
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Skeleton className="h-16 w-full max-w-md" />
                <Skeleton className="h-6 w-full max-w-lg" />
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-36" />
                  <Skeleton className="h-12 w-36" />
                </div>
              </div>
              <Skeleton className="aspect-square rounded-2xl" />
            </div>
          </div>
        </section>
      }>
        <HeroSection />
      </Suspense>
      <Suspense fallback={
        <section className="py-24">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-64 mx-auto mb-12" />
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          </div>
        </section>
      }>
        <MenuSection />
      </Suspense>
      <Suspense fallback={
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-full max-w-prose" />
                <Skeleton className="h-4 w-full max-w-prose" />
              </div>
            </div>
          </div>
        </section>
      }>
        <AboutSection />
      </Suspense>
      <Suspense fallback={
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-64 mx-auto mb-12" />
            <div className="grid md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            </div>
          </div>
        </section>
      }>
        <ServicesSection />
      </Suspense>
      <TestimonialsSection />
      <Suspense fallback={
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto mb-8" />
            <Skeleton className="h-12 w-40 mx-auto" />
          </div>
        </section>
      }>
        <CTABanner locale={locale} />
      </Suspense>
      <GallerySection />
      <ContactSection />
    </>
  );
}
