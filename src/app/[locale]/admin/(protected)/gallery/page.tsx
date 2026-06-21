"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, ImageIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Id } from "@convex/_generated/dataModel";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function SortableImage({
  item,
  onDelete,
}: {
  item: any;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square overflow-hidden bg-surface border-border/50"
    >
      <CardContent className="p-0 h-full">
        {item.url ? (
          <img
            src={item.url}
            alt={item.caption_en}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-muted-foreground text-sm">
            Processing...
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-3">
          <p className="text-xs text-foreground truncate">{item.caption_en}</p>
        </div>
        <div className="absolute top-2 start-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="h-8 w-8 rounded-lg bg-background/80 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-foreground" />
          </button>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={onDelete}
          className="absolute top-2 end-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminGalleryPage() {
  const gallery = useQuery(api.queries.getGallery);
  const saveImage = useMutation(api.files.saveGalleryImageFromStorage);
  const deleteImage = useMutation(api.mutations.deleteGalleryImage);
  const reorderGallery = useMutation(api.mutations.reorderGallery);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [captionEn, setCaptionEn] = useState("");
  const [captionAr, setCaptionAr] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const valid = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: unsupported format`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name}: exceeds 5 MB limit`);
        return false;
      }
      return true;
    });

    if (valid.length === 0) return;

    setUploading(true);

    try {
      for (const file of valid) {
        const uploadUrl = await generateUploadUrl();
        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const storageId = xhr.responseText.trim();
              saveImage({
                storageId: storageId as Id<"_storage">,
                caption_en: captionEn || file.name,
                caption_ar: captionAr || file.name,
                order: (gallery?.length ?? 0),
              }).then(() => {
                resolve();
              });
            } else {
              reject(new Error("Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      }

      toast.success(`${valid.length} image(s) uploaded`);
      setDialogOpen(false);
      setCaptionEn("");
      setCaptionAr("");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteImage({ id: id as Id<"gallery"> });
      toast.success("Image removed");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !gallery) return;

    const oldIndex = gallery.findIndex((i) => i._id === active.id);
    const newIndex = gallery.findIndex((i) => i._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...gallery];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    await reorderGallery({ orderedIds: reordered.map((i) => i._id) });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-heading font-bold text-foreground">Gallery</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) {
              setCaptionEn("");
              setCaptionAr("");
            }
          }}
        >
          <Button
            className="bg-accent hover:bg-accent-hover text-background"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4 me-2" />
            Add Photos
          </Button>
          <DialogContent className="bg-surface border-border/50 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground font-heading">
                Upload Photos
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Caption - English</Label>
                <Input
                  value={captionEn}
                  onChange={(e) => setCaptionEn(e.target.value)}
                  placeholder="Optional - applies to all"
                  className="bg-surface-elevated border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">التعليق - العربية</Label>
                <Input
                  value={captionAr}
                  onChange={(e) => setCaptionAr(e.target.value)}
                  placeholder="اختياري"
                  dir="rtl"
                  className="bg-surface-elevated border-border/50 text-right"
                />
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="flex items-center justify-center gap-2 w-full h-20 px-4 rounded-lg border-2 border-dashed border-border/50 hover:border-accent/50 bg-transparent text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    <span>Click to choose images</span>
                  </>
                )}
              </label>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!gallery ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : gallery.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">No photos yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Click &quot;Add Photos&quot; to upload your first image
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={gallery.map((i) => i._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <SortableImage
                  key={item._id}
                  item={item}
                  onDelete={() => handleDelete(item._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
