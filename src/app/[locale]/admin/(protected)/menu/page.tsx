"use client";

import { useState, useOptimistic, startTransition } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SortableItem } from "@/components/admin/SortableItem";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Id } from "@convex/_generated/dataModel";

const CATEGORIES = ["breads", "cakes", "pastries", "cookies", "seasonal"] as const;

export default function AdminMenuPage() {
  const t = useTranslations("admin.menu");
  const tLabels = useTranslations("admin.menu.labels");
  const tPlaceholders = useTranslations("admin.menu.placeholders");
  const tHeaders = useTranslations("admin.menu.tableHeaders");
  const tCat = useTranslations("menu.categories");
  const menuItems = useQuery(api.queries.getAllMenuItems);
  const locale = useLocale();
  const createItem = useMutation(api.mutations.createMenuItem);
  const updateItem = useMutation(api.mutations.updateMenuItem);
  const deleteItem = useMutation(api.mutations.deleteMenuItem);
  const toggleItem = useMutation(api.mutations.toggleMenuItemAvailability);
  const reorderItems = useMutation(api.mutations.reorderMenuItems);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState(""); const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState(""); const [descAr, setDescAr] = useState("");
  const [price, setPrice] = useState(""); const [category, setCategory] = useState<string>("cakes");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [available, setAvailable] = useState(true); const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const [optimisticMenuItems, setOptimisticToggle] = useOptimistic(
    menuItems,
    (prev, id: Id<"menuItems">) =>
      prev?.map((item) =>
        item._id === id ? { ...item, isAvailable: !item.isAvailable } : item,
      ) ?? prev,
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function resetForm() { setNameEn(""); setNameAr(""); setDescEn(""); setDescAr(""); setPrice(""); setCategory("cakes"); setImageUrl(null); setAvailable(true); setEditingId(null); }
  function openEdit(item: any) {
    setNameEn(item.name_en); setNameAr(item.name_ar); setDescEn(item.description_en); setDescAr(item.description_ar);
    setPrice(item.price === null ? "" : String(item.price)); setCategory(item.category); setImageUrl(item.imageUrl ?? null); setAvailable(item.isAvailable);
    setEditingId(item._id); setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const trimmedPrice = price.trim();
      const data = { name_en: nameEn, name_ar: nameAr, description_en: descEn, description_ar: descAr,
        price: trimmedPrice === "" ? null : parseFloat(trimmedPrice),
        category: category as "breads" | "cakes" | "pastries" | "cookies" | "seasonal",
        imageUrl, isAvailable: available, order: editingId ? 0 : (menuItems?.length ?? 0) };
      if (editingId) { await updateItem({ id: editingId as Id<"menuItems">, ...data }); } else { await createItem(data); }
      toast.success(editingId ? t("savedUpdated") : t("savedAdded"));
      setDialogOpen(false); resetForm();
    } catch { toast.error(t("saveFailed")); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteItem({ id: id as Id<"menuItems"> }); toast.success(t("deleted")); }
    catch { toast.error(t("deleteFailed")); }
    setDeleteDialog(null);
  }

  async function handleToggle(id: Id<"menuItems">) {
    startTransition(() => {
      setOptimisticToggle(id);
    });
    try {
      await toggleItem({ id });
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = menuItems ?? [];
    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...items]; const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    await reorderItems({ orderedIds: reordered.map((i) => i._id) });
  }

  const filtered = optimisticMenuItems
    ? filter === "all" ? optimisticMenuItems : optimisticMenuItems.filter((i) => i.category === filter)
    : [];

  return (
    <SectionEditorShell title="Menu Items" breadcrumb="Dashboard" onSave={() => {}} isSaving={false} hasUnsaved={false} viewSiteHref="/menu">
      <div className="flex justify-end mb-4">
        <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 me-2" /> {t("addItem")}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === cat ? "bg-accent text-background" : "bg-surface-elevated text-muted-foreground hover:text-foreground"}`}>
            {tCat(cat === "all" ? "all" : cat as "breads" | "cakes" | "pastries" | "cookies" | "seasonal")}
          </button>
        ))}
      </div>

      <Card className="bg-surface border-border/50">
        <CardContent className="p-0">
          {!menuItems ? (
            <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map((i) => i._id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="w-10" />
                      <TableHead className="text-foreground">{tHeaders("name")}</TableHead>
                      <TableHead className="text-foreground">{tHeaders("category")}</TableHead>
                      <TableHead className="text-foreground">{tHeaders("price")}</TableHead>
                      <TableHead className="text-foreground">{tHeaders("available")}</TableHead>
                      <TableHead className="w-[100px] text-foreground">{tHeaders("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <SortableItem key={item._id} id={item._id} asTableRow className="bg-surface">
                        <TableCell className="font-medium text-foreground">{item.name_en}</TableCell>
                        <TableCell><Badge variant="outline" className="border-accent/20 text-accent/80">{tCat(item.category)}</Badge></TableCell>
                        <TableCell className="text-accent font-medium">{item.price === null ? t("priceOnRequest") : new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 2 }).format(item.price)}</TableCell>
                        <TableCell><Switch checked={item.isAvailable} onCheckedChange={() => handleToggle(item._id as Id<"menuItems">)} /></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteDialog(item._id)} className="h-8 w-8 text-error hover:text-error"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </SortableItem>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("noItems")}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="bg-surface border-border/50 sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-foreground font-heading">{editingId ? t("editTitle") : t("newTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label className="text-foreground">{tLabels("nameEn")}</Label><Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="bg-surface-elevated border-border/50" /></div>
              <div className="space-y-2"><Label className="text-foreground">{tLabels("nameAr")}</Label><Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label className="text-foreground">{tLabels("descEn")}</Label><Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} className="bg-surface-elevated border-border/50" /></div>
              <div className="space-y-2"><Label className="text-foreground">{tLabels("descAr")}</Label><Textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={2} dir="rtl" className="bg-surface-elevated border-border/50 text-right" /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Photo</Label>
              <ImageUploadField
                currentUrl={imageUrl}
                onUpload={({ url }) => setImageUrl(url)}
                onRemove={() => setImageUrl(null)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label className="text-foreground">{tLabels("price")}</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={tPlaceholders("price")} className="bg-surface-elevated border-border/50" /></div>
              <div className="space-y-2"><Label className="text-foreground">{tLabels("category")}</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger className="bg-surface-elevated border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface border-border/50">
                    {CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat} className="text-foreground capitalize">{tCat(cat)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <div className="flex items-center gap-3"><Switch checked={available} onCheckedChange={setAvailable} /><Label className="text-foreground text-sm">{tLabels("available")}</Label></div>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-accent hover:bg-accent-hover text-background">{saving ? t("saving") : editingId ? t("update") : t("add")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="bg-surface border-border/50 sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground font-heading">{t("deleteTitle")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("deleteDesc")}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>{t("deleteCancel")}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog!)}>{t("deleteConfirm")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SectionEditorShell>
  );
}
