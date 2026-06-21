"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type Props = {
  currentUrl?: string | null;
  onUpload: (storageId: string) => void;
  onRemove?: () => void;
};

export function ImageUploadField({ currentUrl, onUpload, onRemove }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or AVIF image");
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("File is too large. Maximum size is 5 MB");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const uploadUrl = await generateUploadUrl();
      setProgress(40);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(40 + Math.round((e.loaded / e.total) * 50));
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const storageId = xhr.responseText.trim();
            onUpload(storageId);
            setProgress(100);
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {currentUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-surface-elevated">
          <img
            src={currentUrl}
            alt="Current image"
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
            Uploading... {progress}%
          </p>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-lg border border-dashed border-border/50 hover:border-accent/50 bg-transparent text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4" />
            {currentUrl ? "Change Image" : "Upload Image"}
          </label>
        </>
      )}
    </div>
  );
}
