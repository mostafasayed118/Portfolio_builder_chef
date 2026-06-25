import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";
import { MenuSection } from "@/components/sections/MenuSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "metadata.menu" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function MenuPage() {
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
        <MenuSection />
      </Suspense>
    </div>
  );
}
