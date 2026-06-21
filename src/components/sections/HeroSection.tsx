"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion } from "motion/react";

export function HeroSection() {
  const hero = useQuery(api.queries.getHeroContent);
  const t = useTranslations("hero");
  const { isRTL } = useDirection();

  if (!hero) {
    return (
      <section className="relative min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-36" />
                <Skeleton className="h-12 w-36" />
              </div>
            </div>
            <Skeleton className="aspect-square rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  const heading = isRTL ? hero.heading_ar : hero.heading_en;
  const subheading = isRTL ? hero.subheading_ar : hero.subheading_en;
  const ctaLabel = isRTL ? hero.ctaLabel_ar : hero.ctaLabel_en;

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={isRTL ? "md:order-last" : ""}
          >
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight whitespace-pre-line mb-6">
              {heading}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed mb-8">
              {subheading}
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/menu">
                <Button size="lg" className="bg-accent hover:bg-accent-hover text-background text-base px-8">
                  {ctaLabel}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-base border-accent/50 text-accent hover:bg-accent/10 px-8">
                  {t("ctaSecondary")}
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className={isRTL ? "md:order-first" : ""}
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/20 to-surface-elevated flex items-center justify-center overflow-hidden border border-border/50 shadow-card">
              <span className="text-muted-foreground font-heading text-lg">Hero image</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
