"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion, useReducedMotion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { getBilingualField } from "@/lib/bilingual";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 transition-colors duration-200 ${
            i < rating ? "fill-accent text-accent" : "text-border"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const testimonials = useQuery(api.queries.getVisibleTestimonials);
  const t = useTranslations("testimonials");
  const { locale } = useDirection();
  const shouldReduce = useReducedMotion();

  return (
    <section className="py-24 relative" id="testimonials">
      {/* Subtle background pattern */}
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
        </motion.div>

        {!testimonials ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-12"
          >
            {t("emptyState")}
          </motion.p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item, i) => {
              const quote = getBilingualField(locale, item.quote_ar, item.quote_en);
              return (
                <motion.div
                  key={item._id}
                  initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="h-full border-border/40 bg-surface hover:border-accent/20 hover:shadow-card transition-all duration-400 group cursor-default">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Decorative quote icon */}
                      <div className="mb-4 flex items-center justify-between">
                        <Stars rating={item.rating} />
                        <Quote className="h-5 w-5 text-accent/20 group-hover:text-accent/40 transition-colors duration-300" />
                      </div>
                      <p className="text-muted-foreground mb-6 leading-relaxed flex-1 text-base">
                        &ldquo;{quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                        <Avatar className="h-10 w-10 border border-border/40">
                          <AvatarFallback className="bg-accent/10 text-accent text-sm font-medium">
                            {item.customerName?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {item.customerName}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
