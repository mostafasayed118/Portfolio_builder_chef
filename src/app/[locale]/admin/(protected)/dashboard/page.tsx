"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  User,
  Utensils,
  MessageSquare,
  Image,
  Mail,
  ArrowRight,
} from "lucide-react";

const actionCards = [
  { href: "/admin/hero", label: "Hero Section", desc: "Edit your homepage hero", icon: BookOpen },
  { href: "/admin/about", label: "About Me", desc: "Update your story and skills", icon: User },
  { href: "/admin/menu", label: "Menu Items", desc: "Add or change menu items", icon: Utensils },
  { href: "/admin/testimonials", label: "Testimonials", desc: "Manage customer reviews", icon: MessageSquare },
  { href: "/admin/gallery", label: "Gallery", desc: "Upload and organize photos", icon: Image },
  { href: "/admin/contact", label: "Contact Info", desc: "Update contact details", icon: Mail },
];

export default function AdminDashboardPage() {
  const stats = useQuery(api.queries.getDashboardStats);
  const locale = useLocale();
  const t = useTranslations();

  const now = new Date();
  const dateStr = now.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-surface border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Menu Items</p>
            {stats ? (
              <p className="text-3xl font-bold text-foreground">{stats.menuCount}</p>
            ) : (
              <Skeleton className="h-9 w-16" />
            )}
          </CardContent>
        </Card>
        <Card className="bg-surface border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Testimonials</p>
            {stats ? (
              <p className="text-3xl font-bold text-foreground">{stats.testimonialCount}</p>
            ) : (
              <Skeleton className="h-9 w-16" />
            )}
          </CardContent>
        </Card>
        <Card className="bg-surface border-border/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Gallery Photos</p>
            {stats ? (
              <p className="text-3xl font-bold text-foreground">{stats.galleryCount}</p>
            ) : (
              <Skeleton className="h-9 w-16" />
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
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
                      <p className="font-medium text-foreground text-sm">{card.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0 group-hover:text-accent transition-colors" />
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
