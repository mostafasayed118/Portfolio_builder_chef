"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { SortableItem } from "@/components/admin/SortableItem";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function AdminLocationsPage() {
  const t = useTranslations("admin.locations");
  const tLabels = useTranslations("admin.locations.labels");
  const tPlaceholders = useTranslations("admin.locations.placeholders");
  const tRegions = useTranslations("admin.locations.regions");
  const tNav = useTranslations("admin.nav");
  const locations = useQuery(api.queries.getAllLocations);
  const createLocation = useMutation(api.mutations.createLocation);
  const updateLocation = useMutation(api.mutations.updateLocation);
  const deleteLocation = useMutation(api.mutations.deleteLocation);
  const reorderLocations = useMutation(api.mutations.reorderLocations);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [region, setRegion] = useState<string>("cairo");
  const [neighborhoods, setNeighborhoods] = useState("");
  const [neighborhoodsAr, setNeighborhoodsAr] = useState("");
  const [markerIcon, setMarkerIcon] = useState("📍");
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function resetForm() {
    setNameEn(""); setNameAr(""); setRegion("cairo");
    setNeighborhoods(""); setNeighborhoodsAr(""); setMarkerIcon("📍");
    setIsVisible(true); setEditingId(null);
  }

  function openEdit(item: Doc<"locations">) {
    setNameEn(item.name_en); setNameAr(item.name_ar); setRegion(item.region);
    setNeighborhoods(item.neighborhoods.join(", "));
    setNeighborhoodsAr(item.neighborhoods_ar.join(", "));
    setMarkerIcon(item.markerIcon); setIsVisible(item.isVisible);
    setEditingId(item._id); setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const hoodEn = neighborhoods.split(",").map((s) => s.trim()).filter(Boolean);
      const hoodAr = neighborhoodsAr.split(",").map((s) => s.trim()).filter(Boolean);
      const data = {
        name_en: nameEn, name_ar: nameAr || "",
        region: region as "cairo" | "international",
        neighborhoods: hoodEn, neighborhoods_ar: hoodAr,
        markerIcon: markerIcon || "📍", isVisible,
        order: editingId ? (locations?.find(l => l._id === editingId)?.order ?? 0) : (locations?.length ?? 0),
      };
      if (editingId) {
        await updateLocation({ id: editingId as Id<"locations">, ...data });
        toast.success(t("saved"));
      } else {
        await createLocation({ ...data });
        toast.success(t("added"));
      }
      setDialogOpen(false); resetForm();
    } catch { toast.error(t("saveFailed")); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteLocation({ id: id as Id<"locations"> }); toast.success(t("deleted")); }
    catch { toast.error(t("deleteFailed")); }
    setDeleteId(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !locations) return;
    const oldIndex = locations.findIndex((l) => l._id === active.id);
    const newIndex = locations.findIndex((l) => l._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...locations]; const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    await reorderLocations({ orderedIds: reordered.map((l) => l._id) });
  }

  return (
    <SectionEditorShell title={tNav("locations")} breadcrumb={tNav("dashboard")} onSave={() => {}} isSaving={false} hasUnsaved={false} viewSiteHref="/contact">
      <div className="flex justify-end mb-4">
        <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 me-2" /> {t("addLocation")}
        </Button>
      </div>

      {!locations ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MapPin className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h3 className="font-heading text-xl text-foreground mb-2">{t("emptyTitle")}</h3>
          <p className="text-muted-foreground max-w-md mb-8">{t("emptyDesc")}</p>
          <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 me-2" /> {t("addFirst")}
          </Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={locations.map((l) => l._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {locations.map((item) => (
                <SortableItem key={item._id} id={item._id}
                  className="flex items-center gap-3 overflow-hidden rounded-lg border border-border/50 bg-surface p-4 transition-colors hover:bg-surface-elevated">
                  <span className="text-2xl shrink-0">{item.markerIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.name_en}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {item.neighborhoods.length > 0 ? item.neighborhoods.join(", ") : item.region}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-accent/20 text-accent/80 text-xs shrink-0">{tRegions(item.region)}</Badge>
                  <Switch checked={item.isVisible} onCheckedChange={async () => {
                    try { await updateLocation({ id: item._id, isVisible: !item.isVisible }); }
                    catch { toast.error(t("updateFailed")); }
                  }} />
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label={t("editTitle")} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item._id)} aria-label={t("deleteTitle")} className="h-8 w-8 text-error hover:text-error"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="bg-surface border-border/50 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading">{editingId ? t("editTitle") : t("newTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("nameEn")}</Label>
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder={tPlaceholders("nameEn")} className="bg-surface-elevated border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("nameAr")}</Label>
                <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("region")}</Label>
                <Select value={region} onValueChange={(v) => v && setRegion(v)}>
                  <SelectTrigger className="bg-surface-elevated border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border/50">
                    <SelectItem value="cairo" className="text-foreground">{tRegions("cairo")}</SelectItem>
                    <SelectItem value="international" className="text-foreground">{tRegions("international")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("icon")}</Label>
                <Input value={markerIcon} onChange={(e) => setMarkerIcon(e.target.value)} placeholder="📍" className="bg-surface-elevated border-border/50" />
              </div>
            </div>
            <div className="space-y-2">
                <Label className="text-foreground">{tLabels("neighborhoodsEn")}</Label>
                <Input value={neighborhoods} onChange={(e) => setNeighborhoods(e.target.value)} placeholder={tPlaceholders("neighborhoodsEn")} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
                <Label className="text-foreground">{tLabels("neighborhoodsAr")}</Label>
              <Input value={neighborhoodsAr} onChange={(e) => setNeighborhoodsAr(e.target.value)} dir="rtl" placeholder="المعادي، التجمع الخامس، مدينة نصر" className="bg-surface-elevated border-border/50 text-right" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isVisible} onCheckedChange={setIsVisible} />
              <Label className="text-foreground text-sm">{t("showOnSite")}</Label>
            </div>
            <Button onClick={handleSave} disabled={saving || !nameEn.trim()}
              className="w-full bg-accent hover:bg-accent-hover text-background">
              {saving ? t("saving") : editingId ? t("update") : t("add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-surface border-border/50 sm:max-w-sm">
          <DialogHeader>          <DialogTitle className="text-foreground font-heading">{t("deleteTitle")}</DialogTitle></DialogHeader>
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
