import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GallerySection } from "@/components/sections/GallerySection";
import { resolvePageMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return await resolvePageMetadata(locale, "gallery");
}

export default function GalleryPage() {
  return (
    <div className="pt-24">
      <Suspense fallback={
        <section className="py-24">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-64 mx-auto mb-12" />
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={`rounded-xl ${
                    i % 3 === 0 ? "h-64" : i % 3 === 1 ? "h-48" : "h-80"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      }>
        <GallerySection eagerFirst />
      </Suspense>
    </div>
  );
}
