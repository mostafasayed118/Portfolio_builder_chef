"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion } from "motion/react";

export function AboutSection() {
  const about = useQuery(api.queries.getAboutContent);
  const t = useTranslations("about");
  const { isRTL } = useDirection();

  if (!about) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
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

  const heading = isRTL ? about.heading_ar : about.heading_en;
  const bio = isRTL ? about.bio_ar : about.bio_en;

  return (
    <section className="py-24" id="about">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={isRTL ? "md:order-last" : ""}
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/10 to-surface-elevated flex items-center justify-center border border-border/50 shadow-card">
              <span className="text-muted-foreground font-heading">Chef photo</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className={isRTL ? "md:order-first" : ""}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              {heading}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
              {bio}
            </p>
            <div className="flex flex-wrap gap-2">
              {about.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
