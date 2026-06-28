import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VideosSection } from "@/components/sections/VideosSection";
import { resolvePageMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return await resolvePageMetadata(locale, "craftPractice");
}

export default function CraftPracticePage() {
  return (
    <div className="pt-24">
      <Suspense
        fallback={
          <section className="py-24">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-64 mx-auto mb-12" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        }
      >
        <VideosSection />
      </Suspense>
    </div>
  );
}
