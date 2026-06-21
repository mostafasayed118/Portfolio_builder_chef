"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";

const CATEGORIES = ["all", "cakes", "pastries", "cookies", "seasonal"] as const;

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
    price: number;
    category: string;
    imageUrl: string | null;
    isAvailable: boolean;
  };
  index: number;
}) {
  const { isRTL } = useDirection();
  const name = isRTL ? item.name_ar : item.name_en;
  const description = isRTL ? item.description_ar : item.description_en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group h-full overflow-hidden border-border/50 bg-surface hover:bg-surface-elevated transition-all duration-300 hover:shadow-card">
        <div className="aspect-[4/3] bg-gradient-to-br from-accent/5 to-surface-elevated flex items-center justify-center overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-muted-foreground/50 font-heading text-sm">Photo</span>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-heading font-semibold text-foreground">{name}</h3>
            <span className="text-accent font-bold whitespace-nowrap">${item.price.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-accent/20 text-accent/80 text-xs">
              {item.category}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
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

  return (
    <section className="py-24" id="menu">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            {t("heading")}
          </h2>
          <p className="text-muted-foreground">{t("subheading")}</p>
        </div>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-accent text-background"
                  : "bg-surface-elevated text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>

        {!menuItems ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border/50 bg-surface">
                <Skeleton className="aspect-[4/3] rounded-none" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No items available</p>
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
