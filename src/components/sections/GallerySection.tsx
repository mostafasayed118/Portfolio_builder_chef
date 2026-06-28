"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import { Camera, ZoomIn } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getBilingualField } from "@/lib/bilingual";

export function GallerySection({ eagerFirst = false }: { eagerFirst?: boolean } = {}) {
  const gallery = useQuery(api.queries.getGallery);
  const t = useTranslations("gallery");
  const { locale } = useDirection();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const shouldReduce = useReducedMotion();

  return (
    <section className="py-24 relative" id="gallery">
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
        </motion.div>

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Camera className="h-10 w-10 text-accent/40" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">{t("emptyTitle")}</h3>
            <p className="text-muted-foreground max-w-md mb-8">{t("emptyDesc")}</p>
            <Link href="/admin/gallery">
              <Button className="bg-accent hover:bg-accent-hover text-background cursor-pointer">
                {t("emptyCta")}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {gallery.map((item, i) => {
              const caption = getBilingualField(locale, item.caption_ar, item.caption_en);
              return item.url ? (
                <motion.div
                  key={item._id}
                  initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="break-inside-avoid relative group rounded-xl overflow-hidden focus-visible:outline-2 focus-visible:outline-accent cursor-pointer"
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(item._id)}
                  onBlur={() => setHoveredId(null)}
                  tabIndex={0}
                  role="figure"
                >
                  <Image
                    src={item.url}
                    alt={caption}
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="w-full h-auto rounded-xl transition-transform duration-700 ease-out group-hover:scale-105"
                    loading={eagerFirst && i === 0 ? "eager" : "lazy"}
                  />
                  {/* Premium hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={shouldReduce ? { opacity: 1 } : { opacity: hoveredId === item._id ? 1 : 0 }}
                    transition={shouldReduce ? { duration: 0 } : { duration: 0.25 }}
                    className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent flex flex-col items-center justify-end p-5 rounded-xl"
                  >
                    {/* Zoom icon */}
                    <div className="absolute top-4 end-4 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn className="h-4 w-4 text-foreground" />
                    </div>
                    <p className="text-sm text-foreground font-medium line-clamp-2 text-center max-w-[90%]">
                      {caption}
                    </p>
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
