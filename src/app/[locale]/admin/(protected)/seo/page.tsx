"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Globe,
  FileText,
  Code,
  Save,
  AlertTriangle,
  ExternalLink,
  Copy,
  Plus,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SeoForm = {
  defaultTitle_en: string;
  defaultTitle_ar: string;
  titleTemplate: string;
  defaultDescription_en: string;
  defaultDescription_ar: string;
  businessName_en: string;
  businessName_ar: string;
  businessType: string;
  sameAs: string[];
  googleAnalyticsId: string;
  googleSiteVerification: string;
  facebookPixelId: string;
  noIndex: boolean;
};

type OgForm = {
  twitterHandle: string;
  locale: string;
  siteName_en: string;
  siteName_ar: string;
};

type PageMetaForm = {
  pageKey: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  canonicalUrl: string;
  noIndex: boolean;
};

const PAGE_KEYS = [
  { key: "home", en: "Home", ar: "الرئيسية" },
  { key: "about", en: "About", ar: "عني" },
  { key: "services", en: "Services", ar: "الخدمات" },
  { key: "menu", en: "Menu", ar: "القائمة" },
  { key: "gallery", en: "Gallery", ar: "المعرض" },
  { key: "contact", en: "Contact", ar: "اتصل بنا" },
  { key: "craftPractice", en: "Craft & Practice", ar: "الحرفة والممارسة" },
  { key: "projects", en: "Projects", ar: "المشاريع" },
];

// ─── Character Counter ───────────────────────────────────────────────────────

function CharCounter({ current, max, warnAt }: { current: number; max: number; warnAt?: number }) {
  const t = useTranslations("admin.seo");
  const isOver = current > max;
  const isWarning = warnAt ? current >= warnAt && current <= max : false;

  return (
    <div className="flex items-center gap-2 mt-1">
      <span
        className={cn(
          "text-xs tabular-nums",
          isOver ? "text-red-500 font-medium" : isWarning ? "text-amber-500" : "text-muted-foreground",
        )}
      >
        {t("charCount", { current, max })}
      </span>
      {isOver && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t("charWarning")}
        </span>
      )}
    </div>
  );
}

// ─── SERP Preview ────────────────────────────────────────────────────────────

function SerpPreview({
  title,
  description,
  url,
  locale,
}: {
  title: string;
  description: string;
  url: string;
  locale: string;
}) {
  const t = useTranslations("admin.seo");
  const displayTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const displayDesc = description.length > 160 ? description.slice(0, 157) + "..." : description;

  return (
    <Card className="bg-surface border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{t("serpPreview")}</span>
        </div>
        <div className="space-y-1" dir={locale === "ar" ? "rtl" : "ltr"}>
          <p className="text-sm text-green-700 dark:text-green-400 truncate">{url}</p>
          <p className="text-lg font-medium text-blue-700 dark:text-blue-400 leading-snug line-clamp-1">
            {displayTitle || "Page Title"}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {displayDesc || "Page description will appear here..."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OG Preview ──────────────────────────────────────────────────────────────

function OgPreview({
  title,
  description,
  siteName,
  locale,
}: {
  title: string;
  description: string;
  siteName: string;
  locale: string;
}) {
  const t = useTranslations("admin.seo");
  return (
    <Card className="bg-surface border-border/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 h-32 flex items-center justify-center">
          <Globe className="h-12 w-12 text-accent/40" />
        </div>
        <div className="p-4 space-y-2" dir={locale === "ar" ? "rtl" : "ltr"}>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{t("ogPreview")}</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{siteName || "Site Name"}</p>
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {title || "Open Graph Title"}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {description || "Open Graph description..."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminSeoPage() {
  const t = useTranslations("admin.seo");
  const locale = useLocale();
  const isAr = locale === "ar";

  const seoData = useQuery(api.queries.getSeoSettings);
  const allPageMeta = useQuery(api.queries.getAllPageMetadata);
  const updateSeo = useMutation(api.mutations.updateSeoSettings);
  const updatePageMeta = useMutation(api.mutations.updatePageMetadata);

  const [activeTab, setActiveTab] = useState<"global" | "og" | "pages" | "structured">("global");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [seoForm, setSeoForm] = useState<SeoForm>({
    defaultTitle_en: "",
    defaultTitle_ar: "",
    titleTemplate: "%s | Chef Mohamed",
    defaultDescription_en: "",
    defaultDescription_ar: "",
    businessName_en: "Mohamed Mamdouh",
    businessName_ar: "محمد ممدوح",
    businessType: "BakeryConsultant",
    sameAs: [],
    googleAnalyticsId: "",
    googleSiteVerification: "",
    facebookPixelId: "",
    noIndex: false,
  });

  const [ogForm, setOgForm] = useState<OgForm>({
    twitterHandle: "",
    locale: "en_US",
    siteName_en: "Chef Mohamed",
    siteName_ar: "الشيف محمد",
  });

  const [pageForms, setPageForms] = useState<Record<string, PageMetaForm>>({});
  const [newSameAsUrl, setNewSameAsUrl] = useState("");

  // Initialize forms from data
  useEffect(() => {
    if (seoData?.seo) {
      const s = seoData.seo;
      setSeoForm({
        defaultTitle_en: s.defaultTitle_en ?? "",
        defaultTitle_ar: s.defaultTitle_ar ?? "",
        titleTemplate: s.titleTemplate ?? "%s | Chef Mohamed",
        defaultDescription_en: s.defaultDescription_en ?? "",
        defaultDescription_ar: s.defaultDescription_ar ?? "",
        businessName_en: s.businessName_en ?? "",
        businessName_ar: s.businessName_ar ?? "",
        businessType: s.businessType ?? "",
        sameAs: s.sameAs ?? [],
        googleAnalyticsId: s.googleAnalyticsId ?? "",
        googleSiteVerification: s.googleSiteVerification ?? "",
        facebookPixelId: s.facebookPixelId ?? "",
        noIndex: s.noIndex ?? false,
      });
    }
    if (seoData?.openGraph) {
      const og = seoData.openGraph;
      setOgForm({
        twitterHandle: og.twitterHandle ?? "",
        locale: og.locale ?? "en_US",
        siteName_en: og.siteName_en ?? "",
        siteName_ar: og.siteName_ar ?? "",
      });
    }
  }, [seoData]);

  useEffect(() => {
    if (allPageMeta) {
      const forms: Record<string, PageMetaForm> = {};
      for (const meta of allPageMeta) {
        forms[meta.pageKey] = {
          pageKey: meta.pageKey,
          title_en: meta.title_en ?? "",
          title_ar: meta.title_ar ?? "",
          description_en: meta.description_en ?? "",
          description_ar: meta.description_ar ?? "",
          canonicalUrl: meta.canonicalUrl ?? "",
          noIndex: meta.noIndex ?? false,
        };
      }
      setPageForms(forms);
    }
  }, [allPageMeta]);

  const updateSeoField = useCallback(
    <K extends keyof SeoForm>(key: K, value: SeoForm[K]) => {
      setSeoForm((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    [],
  );

  const updateOgField = useCallback(
    <K extends keyof OgForm>(key: K, value: OgForm[K]) => {
      setOgForm((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    [],
  );

  const updatePageField = useCallback(
    (pageKey: string, field: keyof PageMetaForm, value: string | boolean) => {
      setPageForms((prev) => ({
        ...prev,
        [pageKey]: {
          ...(prev[pageKey] ?? {
            pageKey,
            title_en: "",
            title_ar: "",
            description_en: "",
            description_ar: "",
            canonicalUrl: "",
            noIndex: false,
          }),
          [field]: value,
        },
      }));
      setHasChanges(true);
    },
    [],
  );

  const addSameAsUrl = useCallback(() => {
    if (!newSameAsUrl.trim()) return;
    try {
      new URL(newSameAsUrl);
      setSeoForm((prev) => ({ ...prev, sameAs: [...prev.sameAs, newSameAsUrl.trim()] }));
      setNewSameAsUrl("");
      setHasChanges(true);
    } catch {
      toast.error("Invalid URL format");
    }
  }, [newSameAsUrl]);

  const removeSameAsUrl = useCallback((index: number) => {
    setSeoForm((prev) => ({
      ...prev,
      sameAs: prev.sameAs.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  }, []);

  const handleSaveSeo = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateSeo({
        seo: {
          ...seoForm,
          updatedAt: Date.now(),
        },
        openGraph: ogForm,
      });
      toast.success(t("saved"));
      setHasChanges(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("saveFailed");
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [seoForm, ogForm, updateSeo, t]);

  const handleSavePageMeta = useCallback(
    async (pageKey: string) => {
      const form = pageForms[pageKey];
      if (!form) return;
      try {
        await updatePageMeta(form);
        toast.success(t("pageSaved"));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("saveFailed");
        toast.error(message);
      }
    },
    [pageForms, updatePageMeta, t],
  );

  const tabs = [
    { key: "global" as const, icon: Search, label: t("tabs.global") },
    { key: "og" as const, icon: Globe, label: t("tabs.og") },
    { key: "pages" as const, icon: FileText, label: t("tabs.pages") },
    { key: "structured" as const, icon: Code, label: t("tabs.structured") },
  ];

  if (seoData === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chefmohamed.com";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Search className="h-6 w-6 text-accent" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Button
          onClick={handleSaveSeo}
          disabled={isSaving || !hasChanges}
          className="bg-accent text-background hover:bg-accent/90"
        >
          <Save className="h-4 w-4 me-2" />
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>

      {/* NoIndex Warning */}
      {seoForm.noIndex && (
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-400">{t("noIndexWarning")}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border/50 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-accent text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Global SEO Tab */}
          {activeTab === "global" && (
            <div className="space-y-6">
              <Card className="bg-surface border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">{t("fields.defaultTitle")}</h3>
                  <div className="space-y-2">
                    <Label>{t("fields.defaultTitle")} (EN)</Label>
                    <Input
                      value={seoForm.defaultTitle_en}
                      onChange={(e) => updateSeoField("defaultTitle_en", e.target.value)}
                      placeholder="Chef Mohamed | French Bakery Consultant"
                    />
                    <CharCounter current={seoForm.defaultTitle_en.length} max={60} warnAt={50} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fields.defaultTitle")} (AR)</Label>
                    <Input
                      value={seoForm.defaultTitle_ar}
                      onChange={(e) => updateSeoField("defaultTitle_ar", e.target.value)}
                      dir="rtl"
                      placeholder="الشيف محمد | استشاري مخبوزات فرنسية"
                    />
                    <CharCounter current={seoForm.defaultTitle_ar.length} max={60} warnAt={50} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">{t("fields.titleTemplate")}</h3>
                  <div className="space-y-2">
                    <Label>{t("fields.titleTemplate")}</Label>
                    <Input
                      value={seoForm.titleTemplate}
                      onChange={(e) => updateSeoField("titleTemplate", e.target.value)}
                      placeholder="%s | Chef Mohamed"
                    />
                    <p className="text-xs text-muted-foreground">{t("templateHelp")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">{t("fields.defaultDescription")}</h3>
                  <div className="space-y-2">
                    <Label>{t("fields.defaultDescription")} (EN)</Label>
                    <textarea
                      value={seoForm.defaultDescription_en}
                      onChange={(e) => updateSeoField("defaultDescription_en", e.target.value)}
                      className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                      rows={3}
                    />
                    <CharCounter current={seoForm.defaultDescription_en.length} max={160} warnAt={140} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fields.defaultDescription")} (AR)</Label>
                    <textarea
                      value={seoForm.defaultDescription_ar}
                      onChange={(e) => updateSeoField("defaultDescription_ar", e.target.value)}
                      className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                      dir="rtl"
                      rows={3}
                    />
                    <CharCounter current={seoForm.defaultDescription_ar.length} max={160} warnAt={140} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">{t("fields.businessName")}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("fields.businessName")} (EN)</Label>
                      <Input
                        value={seoForm.businessName_en}
                        onChange={(e) => updateSeoField("businessName_en", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("fields.businessName")} (AR)</Label>
                      <Input
                        value={seoForm.businessName_ar}
                        onChange={(e) => updateSeoField("businessName_ar", e.target.value)}
                        dir="rtl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">{t("fields.sameAs")}</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newSameAsUrl}
                      onChange={(e) => setNewSameAsUrl(e.target.value)}
                      placeholder="https://instagram.com/chefmohamed"
                      onKeyDown={(e) => e.key === "Enter" && addSameAsUrl()}
                    />
                    <Button type="button" variant="outline" onClick={addSameAsUrl}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {seoForm.sameAs.map((url, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-surface-elevated">
                        <span className="flex-1 text-sm truncate">{url}</span>
                        <button onClick={() => removeSameAsUrl(i)} className="text-muted-foreground hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">{t("fields.googleAnalytics")}</h3>
                  <div className="space-y-2">
                    <Input
                      value={seoForm.googleAnalyticsId}
                      onChange={(e) => updateSeoField("googleAnalyticsId", e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Site Verification</Label>
                    <Input
                      value={seoForm.googleSiteVerification}
                      onChange={(e) => updateSeoField("googleSiteVerification", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook Pixel ID</Label>
                    <Input
                      value={seoForm.facebookPixelId}
                      onChange={(e) => updateSeoField("facebookPixelId", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">NoIndex</h3>
                      <p className="text-sm text-muted-foreground">{t("noIndexWarning")}</p>
                    </div>
                    <Switch
                      checked={seoForm.noIndex}
                      onCheckedChange={(checked) => updateSeoField("noIndex", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Open Graph Tab */}
          {activeTab === "og" && (
            <div className="space-y-6">
              <Card className="bg-surface border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">{t("fields.twitterHandle")}</h3>
                  <div className="space-y-2">
                    <Input
                      value={ogForm.twitterHandle}
                      onChange={(e) => updateOgField("twitterHandle", e.target.value)}
                      placeholder="@chefmohamed"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">{t("fields.ogImage")}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Site Name (EN)</Label>
                      <Input
                        value={ogForm.siteName_en}
                        onChange={(e) => updateOgField("siteName_en", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Site Name (AR)</Label>
                      <Input
                        value={ogForm.siteName_ar}
                        onChange={(e) => updateOgField("siteName_ar", e.target.value)}
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Locale</Label>
                    <select
                      value={ogForm.locale}
                      onChange={(e) => updateOgField("locale", e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="en_US">English (US)</option>
                      <option value="ar_EG">Arabic (Egypt)</option>
                      <option value="fr_FR">French (France)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Page Metadata Tab */}
          {activeTab === "pages" && (
            <div className="space-y-4">
              {PAGE_KEYS.map((page) => {
                const form = pageForms[page.key];
                return (
                  <Card key={page.key} className="bg-surface border-border/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {isAr ? page.ar : page.en}
                          <span className="text-xs text-muted-foreground ms-2">/{page.key}</span>
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">NoIndex</Label>
                            <Switch
                              checked={form?.noIndex ?? false}
                              onCheckedChange={(checked) => updatePageField(page.key, "noIndex", checked)}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSavePageMeta(page.key)}
                          >
                            {t("pageSave")}
                          </Button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title (EN)</Label>
                          <Input
                            value={form?.title_en ?? ""}
                            onChange={(e) => updatePageField(page.key, "title_en", e.target.value)}
                            placeholder={isAr ? page.ar : page.en}
                          />
                          <CharCounter current={(form?.title_en ?? "").length} max={60} warnAt={50} />
                        </div>
                        <div className="space-y-2">
                          <Label>Title (AR)</Label>
                          <Input
                            value={form?.title_ar ?? ""}
                            onChange={(e) => updatePageField(page.key, "title_ar", e.target.value)}
                            dir="rtl"
                            placeholder={page.ar}
                          />
                          <CharCounter current={(form?.title_ar ?? "").length} max={60} warnAt={50} />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Description (EN)</Label>
                          <textarea
                            value={form?.description_en ?? ""}
                            onChange={(e) => updatePageField(page.key, "description_en", e.target.value)}
                            className="w-full min-h-[60px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                            rows={2}
                          />
                          <CharCounter current={(form?.description_en ?? "").length} max={160} warnAt={140} />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (AR)</Label>
                          <textarea
                            value={form?.description_ar ?? ""}
                            onChange={(e) => updatePageField(page.key, "description_ar", e.target.value)}
                            className="w-full min-h-[60px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                            dir="rtl"
                            rows={2}
                          />
                          <CharCounter current={(form?.description_ar ?? "").length} max={160} warnAt={140} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Canonical URL</Label>
                        <Input
                          value={form?.canonicalUrl ?? ""}
                          onChange={(e) => updatePageField(page.key, "canonicalUrl", e.target.value)}
                          placeholder={`${baseUrl}/${locale}/${page.key === "home" ? "" : page.key}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Structured Data Tab */}
          {activeTab === "structured" && (
            <Card className="bg-surface border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{t("tabs.structured")}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const data = {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: seoForm.businessName_en,
                        url: baseUrl,
                        description: seoForm.defaultDescription_en,
                        sameAs: seoForm.sameAs,
                      };
                      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Copy className="h-4 w-4 me-2" />
                    Copy
                  </Button>
                </div>
                <pre className="p-4 rounded-lg bg-surface-elevated text-xs overflow-x-auto font-mono">
                  {JSON.stringify(
                    {
                      "@context": "https://schema.org",
                      "@graph": [
                        {
                          "@type": "Organization",
                          name: seoForm.businessName_en || "Mohamed Mamdouh",
                          url: baseUrl,
                          description: seoForm.defaultDescription_en || "French Bakery Consultant",
                          sameAs: seoForm.sameAs,
                        },
                        {
                          "@type": "Person",
                          name: seoForm.businessName_en || "Mohamed Mamdouh",
                          jobTitle: "French Bakery Consultant",
                          url: baseUrl,
                          sameAs: seoForm.sameAs,
                        },
                      ],
                    },
                    null,
                    2,
                  )}
                </pre>
                <a
                  href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(baseUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Google Rich Results Test
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Previews */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <SerpPreview
            title={isAr ? seoForm.defaultTitle_ar : seoForm.defaultTitle_en}
            description={isAr ? seoForm.defaultDescription_ar : seoForm.defaultDescription_en}
            url={`${baseUrl}/${locale}`}
            locale={locale}
          />
          <OgPreview
            title={isAr ? seoForm.defaultTitle_ar : seoForm.defaultTitle_en}
            description={isAr ? seoForm.defaultDescription_ar : seoForm.defaultDescription_en}
            siteName={isAr ? ogForm.siteName_ar : ogForm.siteName_en}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
