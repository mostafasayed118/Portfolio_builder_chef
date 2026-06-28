"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useReducedMotion } from "motion/react";
import { ShoppingBag, Eye, Sparkles } from "lucide-react";
import Image from "next/image";
import { getBilingualField } from "@/lib/bilingual";
import type { Id } from "@convex/_generated/dataModel";

function formatPrice(price: number | null, locale: string): string {
  if (price === null) return "";
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(price);
}

const CATEGORIES = ["all", "cakes", "pastries", "breads", "cookies", "seasonal"] as const;

function MenuItemCard({
  item,
  index,
}: {
  item: {
    _id: Id<"menuItems">;
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    price: number | null;
    category: string;
    imageUrl: string | null;
    isAvailable: boolean;
    isShowcase?: boolean | null | undefined;
  };
  index: number;
}) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const shouldReduce = useReducedMotion();
  const name = getBilingualField(locale, item.name_ar, item.name_en);
  const description = getBilingualField(locale, item.description_ar, item.description_en);

  const isShowcase = item.isShowcase && !item.isAvailable;
  const priceLabel = isShowcase
    ? t("customPricing")
    : item.price === null
      ? t("priceOnRequest")
      : formatPrice(item.price, locale);

  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group h-full overflow-hidden border-border/40 bg-surface hover:border-accent/25 transition-all duration-400 hover:shadow-card cursor-pointer">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-accent/8 to-surface-elevated flex items-center justify-center overflow-hidden">
          {item.imageUrl ? (
            <>
              <Image
                src={item.imageUrl}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-accent/90 hover:bg-accent text-backdrop backdrop-blur-sm cursor-pointer h-8 px-3 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 me-1.5" />
                    {t("orderBtn")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground/40 font-heading text-sm">{t("photoPlaceholder")}</span>
          )}

          {/* Showcase badge — visible when isShowcase and unavailable */}
          {isShowcase && (
            <div className="absolute top-3 start-3">
              <Badge className="bg-accent/90 text-backdrop text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                {t("customPricing")}
              </Badge>
            </div>
          )}

          {/* Sold Out overlay — only for unavailable non-showcase items */}
          {!item.isAvailable && !isShowcase && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="secondary" className="bg-surface-elevated/90 text-muted-foreground text-xs">
                Sold Out
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-heading font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
              {name}
            </h3>
            <span className={`whitespace-nowrap text-sm tabular-nums ${isShowcase ? "text-accent font-medium" : "text-accent font-bold"}`}>
              {priceLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 max-w-prose">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="border-accent/15 text-accent/70 text-xs bg-accent/5 hover:bg-accent/10 transition-colors duration-200"
            >
              {item.category}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("orderBtn")}
              className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 cursor-pointer transition-all duration-200"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MenuSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const menuItems = useQuery(
    api.queries.getMenuItems,
    selectedCategory === "all" ? {} : { category: selectedCategory },
  );
  const t = useTranslations("menu");
  const shouldReduce = useReducedMotion();

  return (
    <section className="py-24 relative" id="menu">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(68%_0.095_62_/_0.03),_transparent_70%)]" aria-hidden="true" />

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
          <p className="text-muted-foreground max-w-lg mx-auto">{t("subheading")}</p>
        </motion.div>

        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center gap-2 mb-12 flex-wrap"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-accent text-background shadow-accent"
                  : "bg-surface-elevated/80 text-muted-foreground hover:text-foreground hover:bg-surface-elevated border border-border/30 hover:border-accent/20"
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </motion.div>

        {!menuItems ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border/40 bg-surface overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">{t("emptyState")}</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item, i) => (
              <MenuItemCard key={item._id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
