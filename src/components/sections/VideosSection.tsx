"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { motion, useReducedMotion } from "motion/react";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Video, Play, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getBilingualField } from "@/lib/bilingual";
import type { Doc } from "@convex/_generated/dataModel";

const CATEGORIES = ["all", "product", "training", "bts"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + s.toString().padStart(2, "0");
}

function LazyVideoCard({
  video,
  index,
  onPlay,
}: {
  video: Doc<"videos">;
  index: number;
  onPlay: (video: Doc<"videos">) => void;
}) {
  const t = useTranslations("videos");
  const tCats = useTranslations("videos.categories");
  const { locale } = useDirection();
  const shouldReduce = useReducedMotion();
  const [observed, setObserved] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const title = getBilingualField(locale, video.title_ar, video.title_en);

  // Reduced-motion users get immediate loading (no deferred fetch).
  const inView = shouldReduce || observed;

  useEffect(() => {
    // Skip the Intersection Observer entirely when reduced motion is on.
    if (shouldReduce) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setObserved(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldReduce]);

  return (
    <motion.div
      ref={cardRef}
      initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => onPlay(video)}
        aria-label={t("playLabel") + ": " + title}
        className="group block w-full text-start rounded-2xl overflow-hidden border border-border/40 bg-surface hover:border-accent/20 hover:shadow-card transition-all duration-400 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <div className="relative aspect-video overflow-hidden bg-surface-elevated">
          {!posterLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
          {inView && video.posterUrl ? (
            <Image
              src={video.posterUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
              onLoad={() => setPosterLoaded(true)}
            />
          ) : inView ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-10 w-10 text-muted-foreground/30" />
            </div>
          ) : null}

          <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-14 w-14 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="h-6 w-6 text-foreground ms-0.5" fill="currentColor" />
            </div>
          </div>

          {video.duration ? (
            <span className="absolute bottom-2 end-2 rounded-md bg-background/80 backdrop-blur-sm px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
              {formatDuration(video.duration)}
            </span>
          ) : null}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-accent transition-colors duration-200">
              {title}
            </p>
          </div>
          <span className="inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            {tCats(video.category)}
          </span>
        </div>
      </button>
    </motion.div>
  );
}

function VideoPlayerModal({
  video,
  onClose,
}: {
  video: Doc<"videos"> | null;
  onClose: () => void;
}) {
  const t = useTranslations("videos");
  const { locale } = useDirection();
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const title = video
    ? getBilingualField(locale, video.title_ar, video.title_en)
    : "";

  useEffect(() => {
    if (!video) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], video, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  useEffect(() => {
    if (!video?.hlsUrl || !videoRef.current) return;
    const videoEl = videoRef.current;

    if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.src = video.hlsUrl;
      return () => {
        videoEl.removeAttribute("src");
        videoEl.load();
      };
    }

    let hls: import("hls.js").default | null = null;
    let cancelled = false;
    import("hls.js")
      .then(({ default: Hls }) => {
        if (cancelled || !videoRef.current) return;
        if (Hls.isSupported()) {
          hls = new Hls({ maxBufferLength: 30 });
          hls.loadSource(video.hlsUrl as string);
          hls.attachMedia(videoRef.current);
        }
      })
      .catch(() => {
        if (videoRef.current && video.videoUrl) {
          videoRef.current.src = video.videoUrl;
        }
      });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [video]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          preload={video.hlsUrl ? "none" : "metadata"}
          poster={video.posterUrl ?? undefined}
          {...(!video.hlsUrl && video.videoUrl ? { src: video.videoUrl } : {})}
        >
          Your browser does not support the video tag.
        </video>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("closePlayer")}
          className="absolute top-3 end-3 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function VideosSection() {
  const videos = useQuery(api.queries.getVisibleVideos);
  const t = useTranslations("videos");
  const tCats = useTranslations("videos.categories");
  const shouldReduce = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [playingVideo, setPlayingVideo] = useState<Doc<"videos"> | null>(null);

  const filtered =
    videos && activeCategory !== "all"
      ? videos.filter((v) => v.category === activeCategory)
      : videos;

  const handleCloseVideo = useCallback(() => setPlayingVideo(null), []);

  return (
    <section className="py-24 relative" id="videos">
      <div className="container mx-auto px-4">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("sectionTitle")}
          </h2>
        </motion.div>

        {!videos ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Video className="h-10 w-10 text-accent/40" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">
              {t("emptyTitle")}
            </h3>
            <p className="text-muted-foreground max-w-md mb-8">
              {t("emptyDescription")}
            </p>
            <Link href="/admin/videos">
              <Button className="bg-accent hover:bg-accent-hover text-background cursor-pointer">
                {t("emptyDescription")}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <div
              className="flex justify-center gap-2 mb-10 flex-wrap"
              role="tablist"
              aria-label={t("sectionTitle")}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(cat)}
                    className={"relative px-4 py-2 text-sm font-medium transition-colors rounded-lg " + (isActive ? "text-accent" : "text-muted-foreground hover:text-foreground")}
                  >
                    {tCats(cat)}
                    {isActive && (
                      <motion.span
                        layoutId="video-tab-underline"
                        className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-accent"
                        transition={shouldReduce ? { duration: 0 } : { duration: 0.25 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {filtered && filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {t("emptyTitle")}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered?.map((video, i) => (
                  <LazyVideoCard
                    key={video._id}
                    video={video}
                    index={i}
                    onPlay={setPlayingVideo}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <VideoPlayerModal video={playingVideo} onClose={handleCloseVideo} />
    </section>
  );
}
