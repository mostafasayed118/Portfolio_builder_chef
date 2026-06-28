"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

const WORKPLACES = [
  { en: "Fornalia", ar: "فورناليا" },
  { en: "Nabit", ar: "نابيت" },
  { en: "Rotoo", ar: "روتو" },
  { en: "KUP", ar: "كيو بي" },
  { en: "The Daily Need", ar: "ذا ديلي نيد" },
  { en: "Life Snacks", ar: "لايف سناكس" },
  { en: "Ralph's Cafe", ar: "كافيه رالفز" },
] as const;

export function TrustedBySection() {
  const t = useTranslations("trustedBy");
  const shouldReduce = useReducedMotion();

  return (
    <section className="py-12 border-b border-border/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.p
          initial={shouldReduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mb-8"
        >
          {t("heading")}
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 md:gap-x-6 lg:gap-x-10">
          {WORKPLACES.map((wp, i) => (
            <div key={wp.en} className="flex items-center gap-4 md:gap-6 lg:gap-10">
              <motion.span
                initial={shouldReduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="font-heading text-lg md:text-xl text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors duration-300 whitespace-nowrap select-none"
              >
                {wp.ar}
              </motion.span>
              {i < WORKPLACES.length - 1 && (
                <span className="hidden md:block w-1 h-1 rounded-full bg-border/60" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
