"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { SortableItem } from "@/components/admin/SortableItem";
import { toast } from "sonner";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Id } from "@convex/_generated/dataModel";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function AdminGalleryPage() {
  const t = useTranslations("admin.gallery");
  const tLabels = useTranslations("admin.gallery.labels");
  const tPlaceholders = useTranslations("admin.gallery.placeholders");
  const gallery = useQuery(api.queries.getGallery);
  const saveImage = useMutation(api.files.saveGalleryImageFromStorage);
  const deleteImage = useMutation(api.mutations.deleteGalleryImage);
  const deleteStorageFile = useMutation(api.files.deleteStorageImage);
  const reorderGallery = useMutation(api.mutations.reorderGallery);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [captionEn, setCaptionEn] = useState("");
  const [captionAr, setCaptionAr] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const valid = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) { toast.error(`${f.name}: unsupported format`); return false; }
      if (f.size > MAX_SIZE) { toast.error(`${f.name}: exceeds 5 MB limit`); return false; }
      return true;
    });
    if (valid.length === 0) return;
    setUploading(true);
    try {
      for (const file of valid) {
        const uploadUrl = await generateUploadUrl({});
        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const storageId = xhr.responseText.trim();
              saveImage({ storageId: storageId as Id<"_storage">, caption_en: captionEn || file.name, caption_ar: captionAr || file.name, order: (gallery?.length ?? 0) })
                .then(() => resolve())
                .catch((err) => reject(err));
            } else { reject(new Error(`Upload failed with status ${xhr.status}`)); }
          };
          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.ontimeout = () => reject(new Error("Upload timed out"));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      }
      toast.success(`${valid.length} ${t("uploadSuccess")}`);
      setDialogOpen(false); setCaptionEn(""); setCaptionAr("");
    } catch (err) { console.error("Gallery upload error:", err); toast.error(t("uploadFailed")); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  async function handleDelete(id: string) {
    const item = gallery?.find((i) => i._id === id);
    try {
      await deleteImage({ id: id as Id<"gallery"> });
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveFailed"));
      return;
    }
    // Clean up the storage file after the DB row is gone
    if (item?.storageId) {
      try {
        await deleteStorageFile({ storageId: item.storageId });
      } catch {
        toast.warning(t("storageWarning"));
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !gallery) return;
    const oldIndex = gallery.findIndex((i) => i._id === active.id);
    const newIndex = gallery.findIndex((i) => i._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...gallery]; const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    await reorderGallery({ orderedIds: reordered.map((i) => i._id) });
  }

  return (
    <SectionEditorShell title="Gallery" breadcrumb="Dashboard" onSave={() => {}} isSaving={false} hasUnsaved={false}>
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setCaptionEn(""); setCaptionAr(""); } }}>
          <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 me-2" /> {t("addPhotos")}
          </Button>
          <DialogContent className="bg-surface border-border/50 sm:max-w-md">
            <DialogHeader><DialogTitle className="text-foreground font-heading">{t("uploadTitle")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label className="text-foreground">{tLabels("captionEn")}</Label>
                <Input value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} placeholder={tPlaceholders("captionEn")} className="bg-surface-elevated border-border/50" /></div>
              <div className="space-y-2"><Label className="text-foreground">{tLabels("captionAr")}</Label>
                <Input value={captionAr} onChange={(e) => setCaptionAr(e.target.value)} placeholder={tPlaceholders("captionAr")} dir="rtl" className="bg-surface-elevated border-border/50 text-right" /></div>
              <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" id="gallery-upload" />
              <label htmlFor="gallery-upload" className="flex items-center justify-center gap-2 w-full h-20 px-4 rounded-lg border-2 border-dashed border-border/50 hover:border-accent/50 bg-transparent text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                {uploading ? <span>{t("uploading")}</span> : <><ImageIcon className="h-5 w-5" /><span>{t("clickToChoose")}</span></>}
              </label>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!gallery ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : gallery.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">{t("noPhotos")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">{t("emptyDesc")}</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={gallery.map((i) => i._id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <SortableItem key={item._id} id={item._id}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-surface border border-border/50"
                >
                  <div className="w-full h-full">
                    {item.url ? (
                      <img src={item.url} alt={item.caption_en} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-muted-foreground text-sm">{t("processing")}</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-3">
                      <p className="text-xs text-foreground truncate">{item.caption_en}</p>
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item._id)}
                      className="absolute top-2 end-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </SectionEditorShell>
  );
}
