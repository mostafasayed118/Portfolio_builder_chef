"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { formatEgyptFullDate, formatEgyptTime } from "@convex/lib/timezone";
import { ContentReadinessCard } from "./ContentReadinessCard";
import {
  BookOpen,
  User,
  Utensils,
  Briefcase,
  Wrench,
  MessageSquare,
  Image,
  MapPin,
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const actionCards = [
  { href: "/admin/hero", key: "hero", icon: BookOpen },
  { href: "/admin/about", key: "about", icon: User },
  { href: "/admin/projects", key: "projects", icon: Briefcase },
  { href: "/admin/menu", key: "menu", icon: Utensils },
  { href: "/admin/services", key: "services", icon: Wrench },
  { href: "/admin/testimonials", key: "testimonials", icon: MessageSquare },
  { href: "/admin/gallery", key: "gallery", icon: Image },
  { href: "/admin/locations", key: "locations", icon: MapPin },
  { href: "/admin/contact", key: "contact", icon: Mail },
] as const;

export default function AdminDashboardPage() {
  const stats = useQuery(api.queries.getDashboardStats);
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("admin.dashboard");

  const [now] = useState(Date.now);
  const dateStr = formatEgyptFullDate(now, locale as "en" | "ar");
  const lastUpdated = stats?.lastUpdated
    ? formatEgyptTime(stats.lastUpdated, locale as "en" | "ar")
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {t("welcome")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("lastUpdated")}: {lastUpdated}
          </p>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ContentReadinessCard />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 content-start">
          <Card className="bg-surface border-border/50">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{t("menuItems")}</p>
              {stats ? (
                <p className="text-3xl font-bold text-foreground">{stats.menuCount}</p>
              ) : (
                <Skeleton className="h-9 w-16" />
              )}
            </CardContent>
          </Card>
          <Card className="bg-surface border-border/50">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{t("testimonials")}</p>
              {stats ? (
                <p className="text-3xl font-bold text-foreground">{stats.testimonialCount}</p>
              ) : (
                <Skeleton className="h-9 w-16" />
              )}
            </CardContent>
          </Card>
          <Card className="bg-surface border-border/50">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{t("galleryPhotos")}</p>
              {stats ? (
                <p className="text-3xl font-bold text-foreground">{stats.galleryCount}</p>
              ) : (
                <Skeleton className="h-9 w-16" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("quickActions")}
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="bg-surface border-border/50 hover:border-accent/30 hover:bg-surface-elevated transition-all cursor-pointer group h-full">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {t(`cards.${card.key}.label`)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t(`cards.${card.key}.desc`)}
                      </p>
                    </div>
                    {isRTL ? (
                      <ArrowLeft className="h-4 w-4 text-muted-foreground mt-1 shrink-0 group-hover:text-accent transition-colors" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0 group-hover:text-accent transition-colors" />
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
