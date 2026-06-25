"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

export default function AdminAboutPage() {
  const about = useQuery(api.queries.getAboutContent);
  const updateAbout = useMutation(api.mutations.updateAboutContent);
  const t = useTranslations("admin.aboutEditor");
  const tLabels = useTranslations("admin.aboutEditor.labels");
  const tPlaceholders = useTranslations("admin.aboutEditor.placeholders");
  const tNav = useTranslations("admin.nav");

  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [headingEn, setHeadingEn] = useState("");
  const [headingAr, setHeadingAr] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [stats, setStats] = useState<string[]>([]);
  const [taglineEn, setTaglineEn] = useState("");
  const [taglineAr, setTaglineAr] = useState("");
  const [educationEn, setEducationEn] = useState("");
  const [educationAr, setEducationAr] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newStat, setNewStat] = useState("");

  useEffect(() => {
    if (about && !loaded) {
      setHeadingEn(about.heading_en ?? "");
      setHeadingAr(about.heading_ar ?? "");
      setBioEn(about.bio_en ?? "");
      setBioAr(about.bio_ar ?? "");
      setImageUrl(about.imageUrl ?? null);
      setSkills(about.skills ?? []);
      setStats(about.stats ?? []);
      setTaglineEn(about.tagline_en ?? "");
      setTaglineAr(about.tagline_ar ?? "");
      setEducationEn(about.education_en ?? "");
      setEducationAr(about.education_ar ?? "");
      setLoaded(true);
    }
  }, [about, loaded]);

  const hasUnsaved = loaded && (
    headingEn !== about?.heading_en ||
    headingAr !== about?.heading_ar ||
    bioEn !== about?.bio_en ||
    bioAr !== about?.bio_ar ||
    imageUrl !== (about?.imageUrl ?? null) ||
    JSON.stringify(skills) !== JSON.stringify(about?.skills ?? []) ||
    JSON.stringify(stats) !== JSON.stringify(about?.stats ?? []) ||
    taglineEn !== (about?.tagline_en ?? "") ||
    taglineAr !== (about?.tagline_ar ?? "") ||
    educationEn !== (about?.education_en ?? "") ||
    educationAr !== (about?.education_ar ?? "")
  );

  function handleUploadComplete({ url }: { url: string }) {
    setImageUrl(url);
  }

  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills([...skills, trimmed]);
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateAbout({
        heading_en: headingEn,
        heading_ar: headingAr,
        bio_en: bioEn,
        bio_ar: bioAr,
        imageUrl,
        skills,
        stats: stats.length > 0 ? stats : undefined,
        tagline_en: taglineEn || null,
        tagline_ar: taglineAr || null,
        education_en: educationEn || null,
        education_ar: educationAr || null,
      });
      toast.success(t("savedToast"));
    } catch {
      toast.error(t("saveFailedToast"));
    } finally {
      setSaving(false);
    }
  }

  if (!about && !loaded) {
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
      title={t("title")}
      breadcrumb={tNav("dashboard")}
      onSave={handleSave}
      isSaving={saving}
      hasUnsaved={!!hasUnsaved}
      viewSiteHref="/#about"
    >
      <Card className="bg-surface border-border/50">
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{t("titleEn")}</Label>
              <Input
                value={headingEn}
                onChange={(e) => setHeadingEn(e.target.value)}
                className="bg-surface-elevated border-border/50 focus:border-accent"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{t("titleAr")}</Label>
              <Input
                value={headingAr}
                onChange={(e) => setHeadingAr(e.target.value)}
                dir="rtl"
                className="bg-surface-elevated border-border/50 focus:border-accent text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">{t("storyEn")}</Label>
            <Textarea
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              rows={6}
              className="bg-surface-elevated border-border/50 focus:border-accent"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">{t("storyAr")}</Label>
            <Textarea
              value={bioAr}
              onChange={(e) => setBioAr(e.target.value)}
              rows={6}
              dir="rtl"
              className="bg-surface-elevated border-border/50 focus:border-accent text-right"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">{t("photoLabel")}</Label>
            <ImageUploadField
              currentUrl={imageUrl}
              onUpload={handleUploadComplete}
              onRemove={() => setImageUrl(null)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">{t("skillsLabel")}</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-accent/10 text-accent border border-accent/20 gap-1.5 ps-3 pe-1.5 py-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="rounded-full hover:bg-accent/20 p-0.5"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  {t("skillsEmpty")}
                </span>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder={t("skillsPlaceholder")}
                className="bg-surface-elevated border-border/50"
              />
              <Button
                type="button"
                onClick={addSkill}
                disabled={!newSkill.trim()}
                className="bg-accent hover:bg-accent-hover text-background shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("taglineEn")}</Label>
              <Input value={taglineEn} onChange={(e) => setTaglineEn(e.target.value)} placeholder={tPlaceholders("taglineEn")} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("taglineAr")}</Label>
              <Input value={taglineAr} onChange={(e) => setTaglineAr(e.target.value)} dir="rtl" placeholder="استشاري مخبوزات فرنسية" className="bg-surface-elevated border-border/50 text-right" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("educationEn")}</Label>
              <Input value={educationEn} onChange={(e) => setEducationEn(e.target.value)} placeholder={tPlaceholders("educationEn")} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{tLabels("educationAr")}</Label>
              <Input value={educationAr} onChange={(e) => setEducationAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">{tLabels("stats")}</Label>
            <div className="flex flex-wrap gap-2">
              {stats.map((stat) => (
                <Badge key={stat} variant="secondary" className="bg-accent/10 text-accent border border-accent/20 gap-1.5 ps-3 pe-1.5 py-1">
                  {stat}
                  <button type="button" onClick={() => setStats(stats.filter((s) => s !== stat))} className="rounded-full hover:bg-accent/20 p-0.5" aria-label={`Remove ${stat}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Input value={newStat} onChange={(e) => setNewStat(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const trimmed = newStat.trim(); if (trimmed && !stats.includes(trimmed)) { setStats([...stats, trimmed]); setNewStat(""); } } }} placeholder={tPlaceholders("stats")} className="bg-surface-elevated border-border/50" />
              <Button type="button" onClick={() => { const trimmed = newStat.trim(); if (trimmed && !stats.includes(trimmed)) { setStats([...stats, trimmed]); setNewStat(""); } }} disabled={!newStat.trim()} className="bg-accent hover:bg-accent-hover text-background shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SectionEditorShell>
  );
}
