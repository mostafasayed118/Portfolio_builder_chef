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
import { SortableItem } from "@/components/admin/SortableItem";
import { ServiceFormDialog } from "@/components/admin/ServiceFormDialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
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
import type { Id } from "@convex/_generated/dataModel";

const CATEGORIES = ["all", "artisanal", "consulting", "training"] as const;
const CATEGORY_EMOJIS: Record<string, string> = {
  artisanal: "\u{1F9C0}",
  consulting: "\u{1F4CB}",
  training: "\u{1F3EB}",
};

export default function AdminServicesPage() {
  const t = useTranslations("admin.services");
  const tFilters = useTranslations("admin.services.filters");
  const services = useQuery(api.queries.getAllServices);
  const createService = useMutation(api.mutations.createService);
  const updateService = useMutation(api.mutations.updateService);
  const deleteService = useMutation(api.mutations.deleteService);
  const reorderServices = useMutation(api.mutations.reorderServices);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [optimisticServices, setOptimisticToggle] = useOptimistic(
    services,
    (prev, id: Id<"services">) =>
      prev?.map((svc) =>
        svc._id === id ? { ...svc, isVisible: !svc.isVisible } : svc,
      ) ?? prev,
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function openEdit(item: any) {
    setEditingItem(item);
    setEditingId(item._id);
    setDialogOpen(true);
  }

  async function handleSave(data: any) {
    if (editingId) {
      await updateService({ id: editingId as Id<"services">, ...data });
      toast.success(t("saved"));
    } else {
      await createService({ ...data });
      toast.success(t("added"));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteService({ id: id as Id<"services"> });
      toast.success(t("deleted"));
    } catch { toast.error(t("deleteFailed")); }
    setDeleteId(null);
  }

  async function handleToggle(id: Id<"services">) {
    startTransition(() => {
      setOptimisticToggle(id);
    });
    try {
      await updateService({ id, isVisible: !services?.find((s) => s._id === id)?.isVisible });
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !optimisticServices) return;
    const oldIndex = optimisticServices.findIndex((s) => s._id === active.id);
    const newIndex = optimisticServices.findIndex((s) => s._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...optimisticServices];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    await reorderServices({ orderedIds: reordered.map((s) => s._id) });
  }

  const filtered = optimisticServices ? categoryFilter === "all" ? optimisticServices : optimisticServices.filter((s) => s.category === categoryFilter) : [];

  return (
    <SectionEditorShell title="Services" breadcrumb="Dashboard" onSave={() => {}} isSaving={false} hasUnsaved={false} viewSiteHref="/services">
      <div className="flex justify-end mb-4">
        <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => { setEditingId(null); setEditingItem(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 me-2" /> {t("addService")}
        </Button>
      </div>

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        editingItem={editingItem}
        onSave={handleSave}
      />

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-accent text-background" : "bg-surface-elevated text-muted-foreground hover:text-foreground"}`}>
            {cat === "all" ? tFilters("all") : tFilters(cat)}
          </button>
        ))}
      </div>

      {!optimisticServices ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : optimisticServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h3 className="font-heading text-xl text-foreground mb-2">{t("emptyTitle")}</h3>
          <p className="text-muted-foreground max-w-md mb-8">{t("emptyDesc")}</p>
          <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => { setEditingId(null); setEditingItem(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 me-2" /> {t("addFirst")}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t("noFilterMatch")}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((s) => s._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {filtered.map((item) => (
                <SortableItem key={item._id} id={item._id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-surface p-4 transition-colors hover:bg-surface-elevated"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-lg">
                    {item.icon || CATEGORY_EMOJIS[item.category] || "\u2728"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.name_en}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description_en}</p>
                  </div>
                  <Badge variant="outline" className="border-accent/20 text-accent/80 text-xs shrink-0">{tFilters(item.category)}</Badge>
                  <Switch checked={item.isVisible} onCheckedChange={() => handleToggle(item._id as Id<"services">)} />
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item._id)} className="h-8 w-8 text-error hover:text-error"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Delete Confirmation */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${deleteId ? "" : "hidden"}`}>
        <div className="bg-surface border border-border/50 rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
          <h3 className="text-foreground font-heading font-semibold mb-2">{t("deleteTitle")}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t("deleteDesc")}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>{t("deleteCancel")}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteId!)}>{t("deleteConfirm")}</Button>
          </div>
        </div>
      </div>
    </SectionEditorShell>
  );
}
