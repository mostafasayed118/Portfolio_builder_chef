"use client";

import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadStatus = "uploading" | "processing" | "done" | "error";

type Props = {
  /** 0–100 */
  progress: number;
  status: UploadStatus;
  /** Optional file name shown above the bar */
  fileName?: string;
  /** Compact mode hides the label row */
  compact?: boolean;
  className?: string;
};

const STATUS_LABELS: Record<UploadStatus, string> = {
  uploading: "Uploading",
  processing: "Processing",
  done: "Done",
  error: "Failed",
};

/**
 * Fancy upload progress bar — Dark Bakery Atelier design.
 *
 * Features:
 * - Animated gradient fill with shimmer sweep
 * - Accent glow that intensifies as progress nears 100%
 * - Status icon (spinner → check → alert) with smooth transitions
 * - Respects prefers-reduced-motion
 * - Pure presentational — caller controls progress + status
 */
export function UploadProgress({
  progress,
  status,
  fileName,
  compact = false,
  className,
}: Props) {
  const shouldReduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  const isComplete = status === "done";
  const isError = status === "error";
  const isActive = status === "uploading" || status === "processing";

  return (
    <div className={cn("space-y-2", className)} role="status" aria-live="polite">
      {!compact && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Status icon */}
            <motion.div
              initial={false}
              animate={{ scale: [0.8, 1], opacity: [0.5, 1] }}
              transition={{ duration: 0.3 }}
              className="shrink-0"
            >
              {isError ? (
                <AlertCircle className="h-4 w-4 text-error" />
              ) : isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Loader2
                  className={cn(
                    "h-4 w-4 text-accent",
                    !shouldReduce && "animate-spin",
                  )}
                />
              )}
            </motion.div>
            <span className="text-sm font-medium text-foreground truncate">
              {fileName ?? STATUS_LABELS[status]}
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-medium tabular-nums shrink-0 transition-colors duration-200",
              isError
                ? "text-error"
                : isComplete
                  ? "text-success"
                  : "text-accent",
            )}
          >
            {isError ? "!" : isComplete ? "✓" : `${clamped}%`}
          </span>
        </div>
      )}

      {/* Track */}
      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated border border-border/30"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Fill */}
        <motion.div
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={
            shouldReduce
              ? { duration: 0 }
              : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
          }
          className={cn(
            "relative h-full rounded-full transition-colors duration-300",
            isError
              ? "bg-error"
              : isComplete
                ? "bg-success"
                : "bg-gradient-to-r from-accent/80 via-accent to-accent-hover",
          )}
          style={
            isActive
              ? { boxShadow: "var(--shadow-accent)" }
              : isComplete
                ? { boxShadow: "0 0 12px oklch(68% 0.140 162 / 0.3)" }
                : undefined
          }
        >
          {/* Shimmer sweep — only while actively uploading */}
          {isActive && !shouldReduce && (
            <div
              className="absolute inset-0 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <motion.div
                className="absolute inset-y-0 -start-full w-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(100% 0 0 / 0.25), transparent)",
                }}
                animate={{ x: ["0%", "300%"] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          )}

          {/* Glow pulse on the leading edge */}
          {isActive && !shouldReduce && (
            <motion.div
              className="absolute top-1/2 -end-1 h-4 w-4 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, oklch(68% 0.095 62 / 0.5), transparent 70%)",
              }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
          )}
        </motion.div>

        {/* Stripe overlay for visual texture while uploading */}
        {isActive && !shouldReduce && !isError && (
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 6px, currentColor 6px, currentColor 8px)",
              color: "var(--text-primary)",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {!compact && (
        <p className="text-xs text-muted-foreground">
          {isError
            ? "Upload failed — check your connection and try again."
            : isComplete
              ? "Upload complete."
              : status === "processing"
                ? "Saving to gallery…"
                : `${STATUS_LABELS[status]}… ${clamped}%`}
        </p>
      )}
    </div>
  );
}
