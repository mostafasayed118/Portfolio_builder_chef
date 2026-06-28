"use client";

import { useState, useOptimistic, startTransition } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { VideoUploadField } from "@/components/admin/VideoUploadField";
import { SortableItem } from "@/components/admin/SortableItem";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Video, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Id, Doc } from "@convex/_generated/dataModel";

const CATEGORIES = ["all", "product", "training", "bts"] as const;
const CATEGORY_VALUES = ["product", "training", "bts"] as const;

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AdminVideosPage() {
  const t = useTranslations("admin.videos");
  const tLabels = useTranslations("admin.videos.labels");
  const tFilters = useTranslations("admin.videos.filters");
  const tNav = useTranslations("admin.nav");
  const videos = useQuery(api.queries.getAllVideos);
  const createVideo = useMutation(api.mutations.createVideo);
  const updateVideo = useMutation(api.mutations.updateVideo);
  const deleteVideo = useMutation(api.mutations.deleteVideo);
  const reorderVideos = useMutation(api.mutations.reorderVideos);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form state
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [category, setCategory] = useState<string>("product");
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterStorageId, setPosterStorageId] = useState<Id<"_storage"> | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  const [optimisticVideos, setOptimisticToggle] = useOptimistic(
    videos,
    (prev, id: Id<"videos">) =>
      prev?.map((v) =>
        v._id === id ? { ...v, isVisible: !v.isVisible } : v,
      ) ?? prev,
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function resetForm() {
    setTitleEn(""); setTitleAr(""); setDescEn(""); setDescAr("");
    setCategory("product");
    setStorageId(null); setVideoUrl(null);
    setPosterStorageId(null); setPosterUrl(null);
    setDuration(undefined); setIsVisible(true);
    setEditingId(null);
  }

  function openEdit(item: Doc<"videos">) {
    setTitleEn(item.title_en); setTitleAr(item.title_ar);
    setDescEn(item.description_en ?? ""); setDescAr(item.description_ar ?? "");
    setCategory(item.category);
    setStorageId(item.storageId);
    setVideoUrl(item.videoUrl ?? null);
    setPosterStorageId(item.posterStorageId ?? null);
    setPosterUrl(item.posterUrl ?? null);
    setDuration(item.duration);
    setIsVisible(item.isVisible);
    setEditingId(item._id);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (!storageId) {
        toast.error(tLabels("videoRequired"));
        setSaving(false);
        return;
      }
      if (!posterStorageId) {
        toast.error(tLabels("posterRequired"));
        setSaving(false);
        return;
      }

      const data = {
        title_en: titleEn,
        title_ar: titleAr || "",
        description_en: descEn || undefined,
        description_ar: descAr || undefined,
        category: category as "product" | "training" | "bts",
        storageId,
        videoUrl: videoUrl ?? null,
        posterStorageId,
        posterUrl: posterUrl ?? undefined,
        duration,
        isVisible,
        order: editingId ? (videos?.find(v => v._id === editingId)?.order ?? 0) : (videos?.length ?? 0),
      };

      if (editingId) {
        await updateVideo({ id: editingId as Id<"videos">, ...data });
        toast.success(t("saved"));
      } else {
        await createVideo({ ...data, hlsUrl: undefined });
        toast.success(t("added"));
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteVideo({ id: id as Id<"videos"> });
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteFailed"));
    }
    setDeleteId(null);
  }

  async function handleToggle(id: Id<"videos">) {
    const item = videos?.find((v) => v._id === id);
    if (!item) return;
    startTransition(() => {
      setOptimisticToggle(id);
    });
    try {
      await updateVideo({ id, isVisible: !item.isVisible });
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !optimisticVideos) return;
    const oldIndex = optimisticVideos.findIndex((v) => v._id === active.id);
    const newIndex = optimisticVideos.findIndex((v) => v._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...optimisticVideos];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    await reorderVideos({ orderedIds: reordered.map((v) => v._id) });
  }

  const filtered = optimisticVideos
    ? categoryFilter === "all"
      ? optimisticVideos
      : optimisticVideos.filter((v) => v.category === categoryFilter)
    : [];

  return (
    <SectionEditorShell
      title={tNav("videos")}
      breadcrumb={tNav("dashboard")}
      onSave={() => {}}
      isSaving={false}
      hasUnsaved={false}
      viewSiteHref="/craft-practice"
    >
      {/* File size warning banner */}
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
        <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">{t("fileSizeWarning")}</p>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          className="bg-accent hover:bg-accent-hover text-background"
          onClick={() => { resetForm(); setDialogOpen(true); }}
        >
          <Plus className="h-4 w-4 me-2" /> {t("addVideo")}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-accent text-background" : "bg-surface-elevated text-muted-foreground hover:text-foreground"}`}
          >
            {tFilters(cat)}
          </button>
        ))}
      </div>

      {!optimisticVideos ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : optimisticVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Video className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h3 className="font-heading text-xl text-foreground mb-2">{t("emptyTitle")}</h3>
          <p className="text-muted-foreground max-w-md mb-8">{t("emptyDesc")}</p>
          <Button
            className="bg-accent hover:bg-accent-hover text-background"
            onClick={() => { resetForm(); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 me-2" /> {t("addFirst")}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t("noFilterMatch")}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((v) => v._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {filtered.map((item) => (
                <SortableItem
                  key={item._id}
                  id={item._id}
                  className="flex items-center gap-3 overflow-hidden rounded-lg border border-border/50 bg-surface p-4 transition-colors hover:bg-surface-elevated"
                >
                  {/* Thumbnail */}
                  <div className="h-12 w-20 rounded-md overflow-hidden bg-surface-elevated shrink-0 flex items-center justify-center">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.posterUrl}
                        alt={item.title_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Video className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.title_en}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="border-accent/20 text-accent/80 text-xs shrink-0">
                        {tFilters(item.category)}
                      </Badge>
                      {item.duration ? (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatDuration(item.duration)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <Switch
                    checked={item.isVisible}
                    onCheckedChange={() => handleToggle(item._id as Id<"videos">)}
                  />
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                      aria-label={t("editTitle")}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(item._id)}
                      aria-label={t("deleteTitle")}
                      className="h-8 w-8 text-error hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="bg-surface border-border/50 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading">
              {editingId ? t("editTitle") : t("newTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("titleEn")}</Label>
                <Input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="bg-surface-elevated border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("titleAr")}</Label>
                <Input
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  dir="rtl"
                  className="bg-surface-elevated border-border/50 text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("descEn")}</Label>
              <Textarea
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={2}
                className="bg-surface-elevated border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("descAr")}</Label>
              <Textarea
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                rows={2}
                dir="rtl"
                className="bg-surface-elevated border-border/50 text-right"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("category")}</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger className="bg-surface-elevated border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border/50">
                    {CATEGORY_VALUES.map((c) => (
                      <SelectItem key={c} value={c} className="text-foreground">
                        {tFilters(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("duration")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={duration ?? ""}
                  onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 154"
                  className="bg-surface-elevated border-border/50"
                />
                <p className="text-[11px] text-muted-foreground/70">{tLabels("durationHint")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("uploadVideo")}</Label>
              <VideoUploadField
                currentUrl={videoUrl}
                onUpload={({ storageId: sid, url, duration: d }) => {
                  setStorageId(sid as Id<"_storage">);
                  setVideoUrl(url);
                  if (d) setDuration(d);
                }}
                onRemove={() => { setStorageId(null); setVideoUrl(null); }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("uploadPoster")}</Label>
              <ImageUploadField
                currentUrl={posterUrl}
                onUpload={({ storageId: sid, url }) => {
                  setPosterStorageId(sid as Id<"_storage">);
                  setPosterUrl(url);
                }}
                onRemove={() => { setPosterStorageId(null); setPosterUrl(null); }}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch checked={isVisible} onCheckedChange={setIsVisible} />
              <Label className="text-foreground text-sm">{t("showOnSite")}</Label>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !titleEn.trim() || !storageId || !posterStorageId}
              className="w-full bg-accent hover:bg-accent-hover text-background"
            >
              {saving ? t("saving") : editingId ? t("update") : t("add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-surface border-border/50 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading">{t("deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("deleteDesc")}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t("deleteCancel")}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteId!)}>{t("deleteConfirm")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SectionEditorShell>
  );
}
