import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { resolvePageMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return await resolvePageMetadata(locale, "services");
}

export default function ServicesPage() {
  return (
    <div className="pt-24">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        </div>
      }>
        <ServicesSection />
      </Suspense>
    </div>
  );
}
