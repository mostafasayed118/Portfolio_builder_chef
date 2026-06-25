"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type Props = {
  currentUrl?: string | null;
  onUpload: (result: { storageId: string; url: string }) => void;
  onRemove?: () => void;
};

export function ImageUploadField({ currentUrl, onUpload, onRemove }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getStorageUrl = useMutation(api.files.getStorageUrl);
  const t = useTranslations("admin.image");

  async function uploadFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("invalidFormat"));
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(t("tooLarge"));
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const uploadUrl = await generateUploadUrl({});
      setProgress(40);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(40 + Math.round((e.loaded / e.total) * 50));
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
            setProgress(95);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      const url = await getStorageUrl({ storageId: storageId as never });
      onUpload({ storageId, url });
      setProgress(100);
      toast.success(t("uploaded"));
    } catch (err) {
      console.error("ImageUploadField error:", err);
      toast.error(t("uploadFailed"));
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
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
          <img
            src={currentUrl}
            alt={t("currentAlt")}
            className="w-full h-full object-cover"
          />
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              onClick={onRemove}
              className="absolute top-2 end-2 h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {uploading ? (
        <div className="space-y-2">
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {t("uploadingPrefix")} {progress}%
          </p>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFile}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 w-full min-h-[88px] px-4 py-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
              isDragOver
                ? "border-accent bg-accent/5 text-foreground"
                : "border-border/50 hover:border-accent/50 bg-transparent text-muted-foreground hover:text-foreground",
            )}
          >
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
