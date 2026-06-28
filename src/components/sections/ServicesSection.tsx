"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useDirection } from "@/hooks/useDirection";
import { motion, useReducedMotion } from "motion/react";
import { getBilingualField } from "@/lib/bilingual";
import { UtensilsCrossed, ChefHat, ClipboardList, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_CONFIG: Record<string, { labelKey: string; icon: LucideIcon }> = {
  artisanal: { labelKey: "categories.artisanal", icon: ChefHat },
  consulting: { labelKey: "categories.consulting", icon: ClipboardList },
  training: { labelKey: "categories.training", icon: GraduationCap },
};

export function ServicesSection() {
  const allServices = useQuery(api.queries.getServices, {});
  const t = useTranslations("services");
  const { locale } = useDirection();
  const shouldReduce = useReducedMotion();

  if (allServices === undefined) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (allServices === null || allServices.length === 0) {
    return (
      <section className="py-24 bg-muted/30" id="services">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <UtensilsCrossed className="h-10 w-10 text-accent/40" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">{t("emptyTitle")}</h3>
            <p className="text-muted-foreground max-w-md mb-8">{t("emptyDesc")}</p>
            <Link href="/admin/services">
              <Button className="bg-accent hover:bg-accent-hover text-background cursor-pointer">
                {t("emptyCta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const grouped = Object.keys(CATEGORY_CONFIG).reduce(
    (acc, cat) => {
      const items = allServices.filter((s) => s.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {} as Record<string, typeof allServices>,
  );

  return (
    <section className="py-24 relative" id="services">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-muted/30 to-accent/[0.02]" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t("title")}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(grouped).map(([cat, items], i) => {
            const config = CATEGORY_CONFIG[cat];
            return (
              <motion.div
                key={cat}
                initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="bg-surface rounded-2xl border border-border/40 p-8 h-full hover:border-accent/20 hover:shadow-card transition-all duration-400 group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors duration-300">
                      <config.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground">
                      {t(config.labelKey as Parameters<typeof t>[0])}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {items.map((service) => {
                      const name = getBilingualField(locale, service.name_ar, service.name_en);
                      const desc = getBilingualField(locale, service.description_ar, service.description_en);
                      return (
                        <li key={service._id} className="flex gap-3 group/item">
                          <span className="text-accent mt-1 text-xs shrink-0">&#9670;</span>
                          <div>
                            <p className="font-medium text-sm text-foreground group-hover/item:text-accent transition-colors duration-200">
                              {name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
