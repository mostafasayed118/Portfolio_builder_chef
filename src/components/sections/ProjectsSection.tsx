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
import { Briefcase, Star } from "lucide-react";
import { getBilingualField } from "@/lib/bilingual";

const CATEGORY_CONFIG: Record<string, { labelKey: string }> = {
  early: { labelKey: "categories.early" },
  specialization: { labelKey: "categories.specialization" },
  leadership: { labelKey: "categories.leadership" },
  founder: { labelKey: "categories.founder" },
  international: { labelKey: "categories.international" },
};

export function ProjectsSection() {
  const projects = useQuery(api.queries.getVisibleProjects);
  const t = useTranslations("projects");
  const { locale } = useDirection();
  const shouldReduce = useReducedMotion();

  if (projects === undefined) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-24" id="projects">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Briefcase className="h-10 w-10 text-accent/40" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">{t("emptyTitle")}</h3>
            <p className="text-muted-foreground max-w-md mb-8">{t("emptyDesc")}</p>
            <Link href="/admin/projects">
              <Button className="bg-accent hover:bg-accent-hover text-background cursor-pointer">{t("emptyCta")}</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative" id="projects">
      <div className="container mx-auto px-4">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const role = getBilingualField(locale, project.role_ar, project.role_en);
            const workplace = getBilingualField(locale, project.workplace_ar, project.workplace_en);
            const location = getBilingualField(locale, project.location_ar, project.location_en);
            const description = getBilingualField(locale, project.description_ar, project.description_en);
            const catConfig = CATEGORY_CONFIG[project.category];

            return (
              <motion.div
                key={project._id}
                initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`bg-surface rounded-2xl border border-border/40 p-6 h-full hover:border-accent/20 hover:shadow-card transition-all duration-400 group ${project.isHighlight ? "ring-1 ring-accent/20 border-accent/30" : ""}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors duration-200">
                        <Briefcase className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground group-hover:text-accent transition-colors duration-200">
                          {role}
                        </p>
                        <p className="text-xs text-muted-foreground">{workplace}</p>
                      </div>
                    </div>
                    {project.isHighlight && (
                      <Badge className="bg-accent/10 text-accent text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 border border-accent/20">
                        <Star className="h-3 w-3 me-1 fill-accent" />
                        {t("categories.founder")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-accent/40" />
                    {location}
                  </p>
                  {description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  )}
                  {catConfig && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <Badge variant="outline" className="text-xs bg-accent/5 text-accent/70 border-accent/15">
                        {t(catConfig.labelKey as unknown as Parameters<typeof t>[0])}
                      </Badge>
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
