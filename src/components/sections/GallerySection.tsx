"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion } from "motion/react";
import { useState } from "react";

export function GallerySection() {
  const gallery = useQuery(api.queries.getGallery);
  const t = useTranslations("gallery");
  const { isRTL } = useDirection();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-24" id="gallery">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
          {t("heading")}
        </h2>

        {!gallery ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`rounded-xl ${
                  i % 3 === 0 ? "h-64" : i % 3 === 1 ? "h-48" : "h-80"
                }`}
              />
            ))}
          </div>
        ) : gallery.length === 0 ? (
          <p className="text-center text-muted-foreground">Gallery coming soon</p>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {gallery.map((item) => {
              const caption = isRTL ? item.caption_ar : item.caption_en;
              return item.url ? (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="break-inside-avoid relative group rounded-xl overflow-hidden"
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <img
                    src={item.url}
                    alt={caption}
                    className="w-full rounded-xl"
                    loading="lazy"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === item._id ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent flex items-end p-4 rounded-xl"
                  >
                    <p className="text-sm text-foreground font-medium">{caption}</p>
                  </motion.div>
                </motion.div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </section>
  );
}
