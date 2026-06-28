"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Circle, ArrowRight, ArrowLeft } from "lucide-react";

type ReadinessData = {
  hasHeroImage: boolean;
  hasAboutImage: boolean;
  hasGalleryImages: boolean;
  hasEmail: boolean;
  hasInstagram: boolean;
  hasVisibleTestimonials: boolean;
  hasVisibleMenuItems: boolean;
  hasCaseStudies: boolean;
};

const READINESS_ITEMS: { key: string; adminPath: string; flag: keyof ReadinessData }[] = [
  { key: "heroImage", adminPath: "/admin/hero", flag: "hasHeroImage" },
  { key: "aboutImage", adminPath: "/admin/about", flag: "hasAboutImage" },
  { key: "galleryImages", adminPath: "/admin/gallery", flag: "hasGalleryImages" },
  { key: "email", adminPath: "/admin/contact", flag: "hasEmail" },
  { key: "instagram", adminPath: "/admin/contact", flag: "hasInstagram" },
  { key: "testimonials", adminPath: "/admin/testimonials", flag: "hasVisibleTestimonials" },
  { key: "menuItems", adminPath: "/admin/menu", flag: "hasVisibleMenuItems" },
  { key: "caseStudies", adminPath: "/admin/projects", flag: "hasCaseStudies" },
];

export function ContentReadinessCard() {
  const readiness = useQuery(api.queries.getContentReadiness);
  const t = useTranslations("admin.dashboard");
  const tReadiness = useTranslations("admin.dashboard.readiness");
  const locale = useLocale();
  const isRTL = locale === "ar";

  if (readiness === undefined) {
    return (
      <Card className="bg-surface border-border/50">
        <CardContent className="p-5">
          <Skeleton className="h-5 w-48 mb-4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const allFlags = READINESS_ITEMS.map((item) => readiness[item.flag] ?? false);
  const completed = allFlags.filter(Boolean).length;
  const total = allFlags.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Color coding: red if < 50%, amber if < 100%, green if 100%
  const barColor =
    pct === 100
      ? "bg-green-500"
      : pct >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  const cardBorder =
    pct === 100
      ? "border-green-500/30"
      : pct >= 50
        ? "border-amber-500/30"
        : "border-red-500/30";

  return (
    <Card className={`bg-surface border-border/50 ${cardBorder} transition-colors`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            {tReadiness("title")}
          </h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            pct === 100
              ? "bg-green-500/10 text-green-600"
              : pct >= 50
                ? "bg-amber-500/10 text-amber-600"
                : "bg-red-500/10 text-red-600"
          }`}>
            {completed}/{total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-border/50 mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {READINESS_ITEMS.map((item) => {
            const done = readiness[item.flag] ?? false;
            return (
              <Link
                key={item.key}
                href={item.adminPath}
                className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors ${
                  done
                    ? "text-muted-foreground/60 hover:text-muted-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/50"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}
                <span className="flex-1">{tReadiness(`items.${item.key}` as never)}</span>
                {!done && (
                  isRTL ? (
                    <ArrowLeft className="h-3 w-3 text-accent shrink-0" />
                  ) : (
                    <ArrowRight className="h-3 w-3 text-accent shrink-0" />
                  )
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
