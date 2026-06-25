"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const CATEGORY_EMOJIS: Record<string, string> = {
  artisanal: "\u{1F9C0}",
  consulting: "\u{1F4CB}",
  training: "\u{1F3EB}",
};

const EMOJI_PICKER = ["\u{1F950}", "\u{1F35E}", "\u{1F967}", "\u{1F9C1}", "\u{1F36A}", "\u{1F956}", "\u{1F4CB}", "\u2705", "\u{1F468}\u200D\u{1F373}", "\u{1F3AF}", "\u{1F4CA}", "\u2B50"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  editingItem?: any;
  onSave: (data: {
    category: "artisanal" | "consulting" | "training";
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    icon: string | null;
    isVisible: boolean;
    order: number;
  }) => Promise<void>;
};

export function ServiceFormDialog({ open, onOpenChange, editingId, editingItem, onSave }: Props) {
  const t = useTranslations("admin.services");
  const tLabels = useTranslations("admin.services.labels");
  const tPlaceholders = useTranslations("admin.services.placeholders");
  const tCategories = useTranslations("admin.services.filters");
  const [category, setCategory] = useState("artisanal");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [icon, setIcon] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setCategory(editingItem.category);
      setNameEn(editingItem.name_en);
      setNameAr(editingItem.name_ar);
      setDescEn(editingItem.description_en);
      setDescAr(editingItem.description_ar);
      setIcon(editingItem.icon ?? "");
      setIsVisible(editingItem.isVisible);
    } else if (open) {
      setCategory("artisanal");
      setNameEn("");
      setNameAr("");
      setDescEn("");
      setDescAr("");
      setIcon("");
      setIsVisible(true);
    }
  }, [open, editingItem]);

  async function handleSave() {
    if (!nameEn.trim() || !descEn.trim()) {
      toast.error(t("validationRequired"));
      return;
    }
    setSaving(true);
    try {
      await onSave({
        category: category as "artisanal" | "consulting" | "training",
        name_en: nameEn,
        name_ar: nameAr,
        description_en: descEn,
        description_ar: descAr,
        icon: icon || null,
        isVisible,
        order: 0,
      });
      onOpenChange(false);
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setNameEn(""); setNameAr(""); setDescEn(""); setDescAr(""); setIcon(""); setIsVisible(true); } }}>
      <DialogContent className="bg-surface border-border/50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground font-heading">
            {editingId ? t("editTitle") : t("newTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">{tLabels("serviceType")}</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger className="bg-surface-elevated border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border/50">
                <SelectItem value="artisanal" className="text-foreground">{tCategories("artisanal")}</SelectItem>
                <SelectItem value="consulting" className="text-foreground">{tCategories("consulting")}</SelectItem>
                <SelectItem value="training" className="text-foreground">{tCategories("training")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("nameEn")}</Label>
              <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder={tPlaceholders("nameEn")} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("nameAr")}</Label>
              <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" placeholder={tPlaceholders("nameAr")} className="bg-surface-elevated border-border/50 text-right" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("descEn")}</Label>
              <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} maxLength={500} placeholder={tPlaceholders("descEn")} className="bg-surface-elevated border-border/50" />
              <p className="text-xs text-muted-foreground text-end">{descEn.length}/500</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("descAr")}</Label>
              <Textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={3} maxLength={500} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
              <p className="text-xs text-muted-foreground text-end">{descAr.length}/500</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">{tLabels("icon")}</Label>
            <div className="flex gap-2">
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder={tPlaceholders("icon")} maxLength={2} className="bg-surface-elevated border-border/50 font-arabic flex-1" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xl">
                {icon || CATEGORY_EMOJIS[category] || "✨"}
              </div>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {EMOJI_PICKER.map((e) => (
                <button key={e} type="button" onClick={() => setIcon(e)} className="h-8 w-8 rounded-md bg-surface-elevated hover:bg-accent/20 text-base flex items-center justify-center transition-colors">
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
            <Label className="text-foreground text-sm">{t("showOnSite")}</Label>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !nameEn.trim() || !descEn.trim()}
            className="w-full bg-accent hover:bg-accent-hover text-background"
          >
            {saving ? t("saving") : editingId ? t("update") : t("add")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
