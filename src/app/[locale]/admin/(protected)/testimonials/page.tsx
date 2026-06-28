"use client";

import { useState, useOptimistic, startTransition } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import type { Id, Doc } from "@convex/_generated/dataModel";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)} className="p-0.5">
          <Star className={`h-6 w-6 transition-colors ${i < value ? "fill-accent text-accent" : "text-border hover:text-accent/50"}`} />
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const t = useTranslations("admin.testimonials");
  const tLabels = useTranslations("admin.testimonials.labels");
  const tHeaders = useTranslations("admin.testimonials.tableHeaders");
  const tNav = useTranslations("admin.nav");
  const testimonials = useQuery(api.queries.getAllTestimonials);
  const createItem = useMutation(api.mutations.createTestimonial);
  const updateItem = useMutation(api.mutations.updateTestimonial);
  const deleteItem = useMutation(api.mutations.deleteTestimonial);
  const toggleItem = useMutation(api.mutations.toggleTestimonialVisibility);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [quoteEn, setQuoteEn] = useState("");
  const [quoteAr, setQuoteAr] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  const [optimisticTestimonials, setOptimisticToggle] = useOptimistic(
    testimonials,
    (prev, id: Id<"testimonials">) =>
      prev?.map((item) =>
        item._id === id ? { ...item, isVisible: !item.isVisible } : item,
      ) ?? prev,
  );

  function resetForm() {
    setQuoteEn("");
    setQuoteAr("");
    setCustomerName("");
    setRating(5);
    setVisible(true);
    setEditingId(null);
  }

  function openEdit(item: Doc<"testimonials">) {
    setQuoteEn(item.quote_en);
    setQuoteAr(item.quote_ar);
    setCustomerName(item.customerName);
    setRating(item.rating);
    setVisible(item.isVisible);
    setEditingId(item._id);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        await updateItem({
          id: editingId as Id<"testimonials">,
          quote_en: quoteEn,
          quote_ar: quoteAr,
          customerName,
          rating,
          isVisible: visible,
        });
      } else {
        await createItem({ quote_en: quoteEn, quote_ar: quoteAr, customerName, rating, isVisible: visible });
      }
      toast.success(editingId ? t("savedUpdated") : t("savedAdded"));
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
      await deleteItem({ id: id as Id<"testimonials"> });
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteFailed"));
    }
    setDeleteId(null);
  }

  async function handleToggle(id: Id<"testimonials">) {
    startTransition(() => {
      setOptimisticToggle(id);
    });
    try {
      await toggleItem({ id });
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  return (
    <SectionEditorShell title={tNav("testimonials")} breadcrumb={tNav("dashboard")} onSave={() => {}} isSaving={false} hasUnsaved={false}>
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t("addTestimonial")}
          </Button>
          <DialogContent className="bg-surface border-border/50 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground font-heading">
                {editingId ? t("editTitle") : t("newTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("customerName")}</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="bg-surface-elevated border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{tLabels("rating")}</Label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground">{tLabels("quoteEn")}</Label>
                  <Textarea value={quoteEn} onChange={(e) => setQuoteEn(e.target.value)} rows={3} className="bg-surface-elevated border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">{tLabels("quoteAr")}</Label>
                  <Textarea value={quoteAr} onChange={(e) => setQuoteAr(e.target.value)} rows={3} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={visible} onCheckedChange={setVisible} />
                <Label className="text-foreground text-sm">{t("showOnSite")}</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-accent hover:bg-accent-hover text-background">
                {saving ? t("saving") : editingId ? t("update") : t("add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-surface border-border/50">
        <CardContent className="p-0">
          {!optimisticTestimonials ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-foreground">{tHeaders("customer")}</TableHead>
                  <TableHead className="text-foreground">{tHeaders("rating")}</TableHead>
                  <TableHead className="text-foreground">{tHeaders("visible")}</TableHead>
                  <TableHead className="w-[100px] text-foreground">{tHeaders("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optimisticTestimonials.map((item) => (
                  <TableRow key={item._id} className="bg-surface">
                    <TableCell className="font-medium text-foreground">{item.customerName}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5" dir="ltr">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < item.rating ? "fill-accent text-accent" : "text-border"}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch checked={item.isVisible} onCheckedChange={() => handleToggle(item._id as Id<"testimonials">)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label={t("editTitle")} className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(item._id)} aria-label={t("deleteTitle")} className="h-8 w-8 text-error hover:text-error">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {optimisticTestimonials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {t("noTestimonials")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
