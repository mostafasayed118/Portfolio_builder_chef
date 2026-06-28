"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion, useReducedMotion } from "motion/react";
import { getBilingualField } from "@/lib/bilingual";
import Image from "next/image";
import { ChefHat } from "lucide-react";

export function AboutSection() {
  const about = useQuery(api.queries.getAboutContent);
  const t = useTranslations("about");
  const tSite = useTranslations("site");
  const { isRTL, locale } = useDirection();
  const shouldReduce = useReducedMotion();

  // Loading state
  if (about === undefined) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-full max-w-prose" />
              <Skeleton className="h-4 w-full max-w-prose" />
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No siteSettings seeded yet
  if (about === null) {
    return (
      <section className="py-24" id="about">
        <div className="container mx-auto px-4 text-center py-16">
          <p className="text-muted-foreground text-sm">{tSite("setupInProgress")}</p>
        </div>
      </section>
    );
  }

  const heading = getBilingualField(locale, about.heading_ar, about.heading_en);
  const bio = getBilingualField(locale, about.bio_ar, about.bio_en);

  return (
    <section className="py-24 overflow-hidden relative" id="about">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, x: isRTL ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={isRTL ? "md:order-last" : ""}
          >
            <div className="relative group">
              {/* Decorative frame */}
              <div
                className="absolute -inset-3 rounded-3xl border border-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden="true"
              />
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-accent/12 to-surface-elevated flex items-center justify-center border border-border/50 shadow-card overflow-hidden transition-shadow duration-500 group-hover:shadow-float">
                {about.imageUrl ? (
                  <Image
                    src={about.imageUrl}
                    alt={heading}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 p-8 text-center border-2 border-dashed border-accent/20 rounded-2xl m-2">
                    <motion.div
                      className="h-24 w-24 rounded-full bg-accent/10 flex items-center justify-center"
                      animate={shouldReduce ? {} : { scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ChefHat className="h-12 w-12 text-accent/40" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground/70 max-w-[200px]">
                      {t("emptyState")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, x: isRTL ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={isRTL ? "md:order-first" : ""}
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {locale === "ar" ? (
                <>مرحبًا، أنا <span className="text-accent">الشيف محمد</span></>
              ) : (
                <>Hi, I&apos;m <span className="text-accent">Chef Mohamed</span></>
              )}
            </h2>
            <div className="space-y-4 mb-8 max-w-prose">
              {bio.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed text-base">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Skill badges with enhanced design */}
            {about.skills.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {isRTL ? "المهارات" : "Skills"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {about.skills.map((skill, i) => (
                    <motion.div
                      key={skill}
                      initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-accent/8 text-accent hover:bg-accent/15 border border-accent/15 transition-all duration-200 cursor-default text-sm px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced stats with icons */}
            {about.stats && about.stats.length > 0 && (
              <motion.div
                initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {isRTL ? "الإنجازات" : "Highlights"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {about.stats.map((stat) => (
                    <Badge
                      key={stat}
                      variant="outline"
                      className="bg-surface-elevated/60 text-muted-foreground border-border/40 text-xs px-3 py-1.5 hover:border-accent/20 transition-colors duration-200"
                    >
                      {stat}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
