"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { getBilingualField } from "@/lib/bilingual";
import { ChefHat, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

function FloatingDecor({ shouldReduce }: { shouldReduce: boolean | null }) {
  if (shouldReduce) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Top-right decorative blob */}
      <motion.div
        className="absolute -top-20 -end-20 w-72 h-72 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, var(--accent-glow), transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Bottom-left decorative blob */}
      <motion.div
        className="absolute -bottom-32 -start-32 w-96 h-96 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, var(--accent-glow), transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Floating accent dots */}
      <motion.div
        className="absolute top-1/4 end-1/4 w-2 h-2 rounded-full bg-accent/30"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 end-1/3 w-1.5 h-1.5 rounded-full bg-accent/20"
        animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-1/3 start-1/4 w-1 h-1 rounded-full bg-accent/25"
        animate={{ y: [0, -12, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

export function HeroSection() {
  const hero = useQuery(api.queries.getHeroContent);
  const about = useQuery(api.queries.getAboutContent);
  const t = useTranslations("hero");
  const tSite = useTranslations("site");
  const { isRTL, locale } = useDirection();
  const shouldReduce = useReducedMotion();

  // Loading
  if (hero === undefined) {
    return (
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
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
    );
  }

  // No siteSettings seeded yet
  if (hero === null) {
    return (
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <p className="text-muted-foreground text-sm">{tSite("setupInProgress")}</p>
      </section>
    );
  }

  const heading = getBilingualField(locale, hero.heading_ar, hero.heading_en);
  const subheading = getBilingualField(locale, hero.subheading_ar, hero.subheading_en);
  const ctaLabel = getBilingualField(locale, hero.ctaLabel_ar, hero.ctaLabel_en);
  const tagline = about ? getBilingualField(locale, about.tagline_ar, about.tagline_en) : null;

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(68%_0.095_62_/_0.06),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_oklch(68%_0.095_62_/_0.04),_transparent_50%)]" />
      </div>

      <FloatingDecor shouldReduce={shouldReduce} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, x: isRTL ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={isRTL ? "md:order-last" : ""}
          >
            {/* Decorative label */}
            <motion.div
              initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-accent tracking-wide uppercase">
                Artisan Bakery
              </span>
            </motion.div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] whitespace-pre-line mb-6">
              {heading}
            </h1>
            {tagline && (
              <motion.p
                initial={shouldReduce ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg text-accent font-medium mb-4"
              >
                {tagline}
              </motion.p>
            )}
            <p className="text-lg md:text-xl text-muted-foreground max-w-prose leading-relaxed mb-8">
              {subheading}
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="group bg-accent hover:bg-accent-hover text-background text-base px-8 shadow-accent cursor-pointer transition-all duration-300 hover:shadow-glow"
                >
                  {ctaLabel}
                  {isRTL ? (
                    <ArrowLeft className="h-4 w-4 ms-2 transition-transform duration-300 group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="h-4 w-4 ms-2 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base border-accent/30 text-accent hover:bg-accent/10 px-8 cursor-pointer transition-all duration-300"
                >
                  {t("ctaSecondary")}
                </Button>
              </Link>
            </div>
            {about?.stats && about.stats.length > 0 && (
              <motion.div
                initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-2 mt-8"
              >
                {about.stats.map((stat) => (
                  <Badge
                    key={stat}
                    variant="outline"
                    className="bg-accent/5 text-accent border-accent/20 text-sm px-3.5 py-1.5 hover:bg-accent/10 transition-colors duration-200"
                  >
                    {stat}
                  </Badge>
                ))}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={isRTL ? "md:order-first" : ""}
          >
            <div className="relative group">
              {/* Glow behind image */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                style={{ background: "var(--accent-glow)" }}
                aria-hidden="true"
              />
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/15 via-surface-elevated to-accent/5 flex items-center justify-center overflow-hidden border border-border/50 shadow-card relative transition-shadow duration-500 group-hover:shadow-float">
                {hero.imageUrl ? (
                  <Image
                    src={hero.imageUrl}
                    alt={heading}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 p-8 text-center border-2 border-dashed border-accent/20 rounded-2xl m-2">
                    <motion.div
                      className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center"
                      animate={shouldReduce ? {} : { scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ChefHat className="h-10 w-10 text-accent/40" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground/70 max-w-[200px]">
                      {t("emptyState")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
