"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useDirection } from "@/hooks/useDirection";
import { motion, useReducedMotion } from "motion/react";
import { getBilingualField } from "@/lib/bilingual";
import { MapPin } from "lucide-react";

export function LocationsSection() {
  const locations = useQuery(api.queries.getVisibleLocations);
  const t = useTranslations("locations");
  const { locale } = useDirection();
  const shouldReduce = useReducedMotion();

  if (locations === undefined) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="flex justify-center gap-6 flex-wrap">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (locations.length === 0) {
    return (
      <section className="py-24 bg-muted/30" id="locations">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <MapPin className="h-10 w-10 text-accent/40" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">{t("emptyTitle")}</h3>
            <p className="text-muted-foreground max-w-md mb-8">{t("emptyDesc")}</p>
            <Link href="/admin/locations">
              <Button className="bg-accent hover:bg-accent-hover text-background cursor-pointer">{t("emptyCta")}</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative" id="locations">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-muted/30 to-accent/[0.02]" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("heading")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subheading")}
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 flex-wrap max-w-4xl mx-auto">
          {locations.map((location, i) => {
            const name = getBilingualField(locale, location.name_ar, location.name_en);
            const neighborhoods = (locale === "ar" && location.neighborhoods_ar.length > 0)
              ? location.neighborhoods_ar
              : location.neighborhoods;

            return (
              <motion.div
                key={location._id}
                initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 min-w-[280px] max-w-md"
              >
                <div className="bg-surface rounded-2xl border border-border/40 p-6 h-full hover:border-accent/20 hover:shadow-card transition-all duration-400 text-center group">
                  <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/15 transition-colors duration-300">
                    <MapPin className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {name}
                  </h3>
                  <Badge variant="outline" className="border-accent/15 text-accent/70 text-xs mb-4 bg-accent/5">
                    {t(`regions.${location.region}`)}
                  </Badge>
                  {neighborhoods.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {neighborhoods.map((hood) => (
                        <Badge
                          key={hood}
                          variant="secondary"
                          className="bg-surface-elevated/60 text-muted-foreground text-xs hover:bg-surface-elevated transition-colors duration-200"
                        >
                          {hood}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
