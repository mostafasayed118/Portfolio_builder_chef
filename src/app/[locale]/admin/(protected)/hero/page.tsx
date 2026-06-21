"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { toast } from "sonner";

export default function AdminHeroPage() {
  const hero = useQuery(api.queries.getHeroContent);
  const updateHero = useMutation(api.mutations.updateHeroContent);
  const [saving, setSaving] = useState(false);

  const [headingEn, setHeadingEn] = useState("");
  const [headingAr, setHeadingAr] = useState("");
  const [subheadingEn, setSubheadingEn] = useState("");
  const [subheadingAr, setSubheadingAr] = useState("");
  const [ctaLabelEn, setCtaLabelEn] = useState("");
  const [ctaLabelAr, setCtaLabelAr] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (hero && !loaded) {
      setHeadingEn(hero.heading_en ?? "");
      setHeadingAr(hero.heading_ar ?? "");
      setSubheadingEn(hero.subheading_en ?? "");
      setSubheadingAr(hero.subheading_ar ?? "");
      setCtaLabelEn(hero.ctaLabel_en ?? "");
      setCtaLabelAr(hero.ctaLabel_ar ?? "");
      setLoaded(true);
    }
  }, [hero, loaded]);

  const hasUnsaved = loaded && (
    headingEn !== hero?.heading_en ||
    headingAr !== hero?.heading_ar ||
    subheadingEn !== hero?.subheading_en ||
    subheadingAr !== hero?.subheading_ar ||
    ctaLabelEn !== hero?.ctaLabel_en ||
    ctaLabelAr !== hero?.ctaLabel_ar
  );

  async function handleSave() {
    if (!hero) return;
    setSaving(true);
    try {
      await updateHero({
        heading_en: headingEn,
        heading_ar: headingAr,
        subheading_en: subheadingEn,
        subheading_ar: subheadingAr,
        ctaLabel_en: ctaLabelEn,
        ctaLabel_ar: ctaLabelAr,
        imageUrl: hero.imageUrl ?? null,
      });
      toast.success("Hero section saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!hero && !loaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="bg-surface border-border/50">
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SectionEditorShell
      title="Hero Section"
      breadcrumb="Dashboard"
      onSave={handleSave}
      isSaving={saving}
      hasUnsaved={!!hasUnsaved}
      viewSiteHref="/"
    >
      <Card className="bg-surface border-border/50">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground">Heading - English</Label>
            <Textarea value={headingEn} onChange={(e) => setHeadingEn(e.target.value)} rows={2} className="bg-surface-elevated border-border/50 focus:border-accent" />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">العنوان - العربية</Label>
            <Textarea value={headingAr} onChange={(e) => setHeadingAr(e.target.value)} rows={2} dir="rtl" className="bg-surface-elevated border-border/50 focus:border-accent text-right" />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Subheading - English</Label>
            <Textarea value={subheadingEn} onChange={(e) => setSubheadingEn(e.target.value)} rows={3} className="bg-surface-elevated border-border/50 focus:border-accent" />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">الوصف - العربية</Label>
            <Textarea value={subheadingAr} onChange={(e) => setSubheadingAr(e.target.value)} rows={3} dir="rtl" className="bg-surface-elevated border-border/50 focus:border-accent text-right" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">CTA Button - English</Label>
              <Input value={ctaLabelEn} onChange={(e) => setCtaLabelEn(e.target.value)} className="bg-surface-elevated border-border/50 focus:border-accent" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">الزر - العربية</Label>
              <Input value={ctaLabelAr} onChange={(e) => setCtaLabelAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 focus:border-accent text-right" />
            </div>
          </div>
        </CardContent>
      </Card>
    </SectionEditorShell>
  );
}
