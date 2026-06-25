import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AboutSection } from "@/components/sections/AboutSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { LocationsSection } from "@/components/sections/LocationsSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "metadata.about" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AboutPage() {
  return (
    <div className="pt-24">
      <Suspense fallback={
        <div className="grid md:grid-cols-2 gap-12 items-center py-24">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-full max-w-prose" />
            <Skeleton className="h-4 w-full max-w-prose" />
          </div>
        </div>
      }>
        <AboutSection />
      </Suspense>
      <Suspense fallback={
        <section className="py-24">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-64 mx-auto mb-12" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          </div>
        </section>
      }>
        <ProjectsSection />
      </Suspense>
      <Suspense fallback={
        <section className="py-24">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-64 mx-auto mb-12" />
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          </div>
        </section>
      }>
        <LocationsSection />
      </Suspense>
    </div>
  );
}
