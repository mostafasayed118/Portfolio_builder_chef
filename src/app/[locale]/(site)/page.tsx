import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicSections, CTAVisibilityGate } from "@/components/sections/DynamicSections";
import { CTABanner } from "@/components/sections/CTABanner";
import { resolvePageMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return await resolvePageMetadata(locale, "home");
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  return (
    <Suspense
      fallback={
        <>
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
          <section className="py-24">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-64 mx-auto mb-12" />
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            </div>
          </section>
        </>
      }
    >
      <DynamicSections />
      <CTAVisibilityGate>
        <CTABanner locale={locale} />
      </CTAVisibilityGate>
    </Suspense>
  );
}
