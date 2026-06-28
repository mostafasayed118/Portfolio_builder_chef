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
import { SortableItem } from "@/components/admin/SortableItem";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
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

const CATEGORIES = ["all", "early", "specialization", "leadership", "founder", "international"] as const;

export default function AdminProjectsPage() {
  const t = useTranslations("admin.projects");
  const tLabels = useTranslations("admin.projects.labels");
  const tPlaceholders = useTranslations("admin.projects.placeholders");
  const tFilters = useTranslations("admin.projects.filters");
  const tNav = useTranslations("admin.nav");
  const projects = useQuery(api.queries.getAllProjects);
  const createProject = useMutation(api.mutations.createProject);
  const updateProject = useMutation(api.mutations.updateProject);
  const deleteProject = useMutation(api.mutations.deleteProject);
  const reorderProjects = useMutation(api.mutations.reorderProjects);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [roleEn, setRoleEn] = useState("");
  const [roleAr, setRoleAr] = useState("");
  const [workplaceEn, setWorkplaceEn] = useState("");
  const [workplaceAr, setWorkplaceAr] = useState("");
  const [locationEn, setLocationEn] = useState("");
  const [locationAr, setLocationAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [imageUrl, setImageUrl] = useState<Id<"_storage"> | null>(null);
  const [imageUrlDisplay, setImageUrlDisplay] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("early");
  const [isVisible, setIsVisible] = useState(true);
  const [isHighlight, setIsHighlight] = useState(false);
  const [saving, setSaving] = useState(false);

  const [optimisticProjects, setOptimisticToggle] = useOptimistic(
    projects,
    (prev, id: Id<"projects">) =>
      prev?.map((p) =>
        p._id === id ? { ...p, isVisible: !p.isVisible } : p,
      ) ?? prev,
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function resetForm() {
    setRoleEn(""); setRoleAr(""); setWorkplaceEn(""); setWorkplaceAr("");
    setLocationEn(""); setLocationAr(""); setDescEn(""); setDescAr("");
    setImageUrl(null); setImageUrlDisplay(null);
    setCategory("early"); setIsVisible(true); setIsHighlight(false);
    setEditingId(null);
  }

  function openEdit(item: Doc<"projects">) {
    setRoleEn(item.role_en); setRoleAr(item.role_ar);
    setWorkplaceEn(item.workplace_en); setWorkplaceAr(item.workplace_ar);
    setLocationEn(item.location_en); setLocationAr(item.location_ar);
    setDescEn(item.description_en ?? ""); setDescAr(item.description_ar ?? "");
    setImageUrl(item.imageUrl as Id<"_storage"> | null);
    setImageUrlDisplay(item.imageUrl ? `/api/storage/${item.imageUrl}` : null);
    setCategory(item.category); setIsVisible(item.isVisible);
    setIsHighlight(item.isHighlight ?? false); setEditingId(item._id);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = {
        role_en: roleEn, role_ar: roleAr || "",
        workplace_en: workplaceEn, workplace_ar: workplaceAr || "",
        location_en: locationEn, location_ar: locationAr || "",
        description_en: descEn || undefined, description_ar: descAr || undefined,
        category: category as "early" | "specialization" | "leadership" | "founder" | "international", isVisible, isHighlight,
        imageUrl, order: editingId ? (projects?.find(p => p._id === editingId)?.order ?? 0) : (projects?.length ?? 0),
      };
      if (editingId) {
        await updateProject({ id: editingId as Id<"projects">, ...data });
        toast.success(t("saved"));
      } else {
        await createProject({ ...data });
        toast.success(t("added"));
      }
      setDialogOpen(false); resetForm();
    } catch { toast.error(t("saveFailed")); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteProject({ id: id as Id<"projects"> }); toast.success(t("deleted")); }
    catch { toast.error(t("deleteFailed")); }
    setDeleteId(null);
  }

  async function handleToggle(id: Id<"projects">) {
    const item = projects?.find((p) => p._id === id);
    if (!item) return;
    startTransition(() => {
      setOptimisticToggle(id);
    });
    try {
      await updateProject({ id, isVisible: !item.isVisible });
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !optimisticProjects) return;
    const oldIndex = optimisticProjects.findIndex((p) => p._id === active.id);
    const newIndex = optimisticProjects.findIndex((p) => p._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...optimisticProjects]; const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    await reorderProjects({ orderedIds: reordered.map((p) => p._id) });
  }

  const filtered = optimisticProjects ? categoryFilter === "all" ? optimisticProjects : optimisticProjects.filter((p) => p.category === categoryFilter) : [];

  return (
    <SectionEditorShell title={tNav("projects")} breadcrumb={tNav("dashboard")} onSave={() => {}} isSaving={false} hasUnsaved={false} viewSiteHref="/about">
      <div className="flex justify-end mb-4">
        <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 me-2" /> {t("addExperience")}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-accent text-background" : "bg-surface-elevated text-muted-foreground hover:text-foreground"}`}>
            {tFilters(cat)}
          </button>
        ))}
      </div>

      {!optimisticProjects ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : optimisticProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h3 className="font-heading text-xl text-foreground mb-2">{t("emptyTitle")}</h3>
          <p className="text-muted-foreground max-w-md mb-8">{t("emptyDesc")}</p>
          <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 me-2" /> {t("addFirst")}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t("noFilterMatch")}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((p) => p._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {filtered.map((item) => (
                <SortableItem key={item._id} id={item._id}
                  className="flex items-center gap-3 overflow-hidden rounded-lg border border-border/50 bg-surface p-4 transition-colors hover:bg-surface-elevated">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground truncate">{item.role_en}</p>
                      {item.isHighlight && <Badge variant="outline" className="border-accent/40 text-accent text-xs">{t("featured")}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.workplace_en} — {item.location_en}</p>
                  </div>
                  <Badge variant="outline" className="border-accent/20 text-accent/80 text-xs shrink-0">{tFilters(item.category)}</Badge>
                  <Switch checked={item.isVisible} onCheckedChange={() => handleToggle(item._id as Id<"projects">)} />
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
        <DialogContent className="bg-surface border-border/50 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading">{editingId ? t("editTitle") : t("newTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("roleEn")}</Label>
                <Input value={roleEn} onChange={(e) => setRoleEn(e.target.value)} placeholder={tPlaceholders("role")} className="bg-surface-elevated border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("roleAr")}</Label>
                <Input value={roleAr} onChange={(e) => setRoleAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("workplaceEn")}</Label>
                <Input value={workplaceEn} onChange={(e) => setWorkplaceEn(e.target.value)} placeholder={tPlaceholders("workplace")} className="bg-surface-elevated border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("workplaceAr")}</Label>
                <Input value={workplaceAr} onChange={(e) => setWorkplaceAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("locationEn")}</Label>
                <Input value={locationEn} onChange={(e) => setLocationEn(e.target.value)} placeholder={tPlaceholders("location")} className="bg-surface-elevated border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("locationAr")}</Label>
                <Input value={locationAr} onChange={(e) => setLocationAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("descEn")}</Label>
              <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("descAr")}</Label>
              <Textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={2} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Photo</Label>
              <ImageUploadField
                currentUrl={imageUrlDisplay}
                onUpload={({ storageId, url }) => { setImageUrl(storageId as Id<"_storage">); setImageUrlDisplay(url); }}
                onRemove={() => { setImageUrl(null); setImageUrlDisplay(null); }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{t("careerStage")}</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger className="bg-surface-elevated border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border/50">
                    {(["early", "specialization", "leadership", "founder", "international"] as const).map((c) => (
                      <SelectItem key={c} value={c} className="text-foreground">{tFilters(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <Switch checked={isVisible} onCheckedChange={setIsVisible} />
                  <Label className="text-foreground text-sm">{t("showOnSite")}</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isHighlight} onCheckedChange={setIsHighlight} />
                  <Label className="text-foreground text-sm">{t("featured")}</Label>
                </div>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving || !roleEn.trim() || !workplaceEn.trim() || !locationEn.trim()}
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
