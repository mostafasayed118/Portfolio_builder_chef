"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Trash2, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadProgress, type UploadStatus } from "@/components/admin/UploadProgress";

// Videos can be large (100MB+). Convex storage supports this, but we warn.
const MAX_SIZE = 200 * 1024 * 1024; // 200 MB hard cap
const WARN_SIZE = 50 * 1024 * 1024; // 50 MB — show optimization warning
const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

type Props = {
  currentUrl?: string | null;
  fileName?: string | null;
  onUpload: (result: { storageId: string; url: string; duration?: number }) => void;
  onRemove?: () => void;
};

/**
 * Video upload field — mirrors ImageUploadField but accepts video files
 * (mp4/mov/webm) with a much higher size ceiling and a 50MB streaming warning.
 * Upload goes through the same Convex generateUploadUrl + storage pipeline.
 */
export function VideoUploadField({ currentUrl, fileName, onUpload, onRemove }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("uploading");
  const [name, setName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getStorageUrl = useMutation(api.files.getStorageUrl);
  const t = useTranslations("admin.videoUpload");

  // Read duration from a video file via a temporary <video> element.
  function readDuration(file: File): Promise<number | undefined> {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          const d = video.duration;
          URL.revokeObjectURL(url);
          resolve(Number.isFinite(d) ? Math.round(d) : undefined);
        };
        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(undefined);
        };
        video.src = url;
      } catch {
        resolve(undefined);
      }
    });
  }

  async function uploadFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("invalidFormat"));
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(t("tooLarge"));
      return;
    }

    if (file.size > WARN_SIZE) {
      // Non-blocking warning — large files will be optimized for streaming.
      toast.info(t("largeFileWarning"));
    }

    setUploading(true);
    setName(file.name);
    setUploadStatus("uploading");
    setProgress(0);

    let wasError = false;
    try {
      setProgress(5);
      const uploadUrl = await generateUploadUrl({});
      setProgress(15);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          // Upload phase: 15% → 85%
          setProgress(15 + Math.round((e.loaded / e.total) * 70));
        }
      };

      const storageId = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const raw = xhr.responseText.trim();
            try {
              const parsed = JSON.parse(raw) as { storageId?: string };
              resolve(parsed.storageId ?? raw);
            } catch {
              resolve(raw);
            }
            setProgress(90);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setUploadStatus("processing");
      setProgress(95);
      const url = await getStorageUrl({ storageId: storageId as never });

      // Try to auto-detect duration (non-blocking — manual fallback exists).
      const duration = await readDuration(file);

      onUpload({ storageId, url, duration });
      setProgress(100);
      setUploadStatus("done");
      toast.success(t("uploaded"));
    } catch (err) {
      console.error("VideoUploadField error:", err);
      setUploadStatus("error");
      wasError = true;
      toast.error(t("uploadFailed"));
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setName("");
        setUploadStatus("uploading");
        if (inputRef.current) inputRef.current.value = "";
      }, wasError ? 3000 : 1200);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (!uploading) setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-3">
      {currentUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-surface-elevated">
          <video
            src={currentUrl}
            className="w-full h-full object-contain"
            preload="metadata"
            controls
          />
          {fileName && (
            <p className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm px-3 py-1.5 text-xs text-foreground truncate">
              {fileName}
            </p>
          )}
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              onClick={onRemove}
              aria-label={t("remove")}
              className="absolute top-2 end-2 h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {uploading ? (
        <div className="rounded-lg border border-border/50 bg-surface-elevated/50 p-4">
          <UploadProgress progress={progress} status={uploadStatus} fileName={name} />
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={handleFile}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 w-full min-h-[120px] px-4 py-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
              isDragOver
                ? "border-accent bg-accent/5 text-foreground"
                : "border-border/50 hover:border-accent/50 bg-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Film className="h-6 w-6 mb-1" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4" />
              {currentUrl ? t("changeBtn") : t("uploadBtn")}
            </div>
            <span className="text-xs text-muted-foreground/80">{t("dropHint")}</span>
            <span className="text-[11px] text-muted-foreground/60">{t("helper")}</span>
          </label>
        </>
      )}
    </div>
  );
}
