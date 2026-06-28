"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRESET_THEMES,
  DEFAULT_THEME,
  TOKEN_LABELS,
  type ThemeTokens,
  type PresetTheme,
} from "@/lib/theme-presets";
import { deriveDarkFromLight, oklchToHex, hexToOklch } from "@/lib/theme-utils";
import { validateTheme, checkContrast } from "@/lib/contrast-checker";
import { Palette, Download, Upload, RotateCcw, Check, AlertTriangle, Moon, Sun } from "lucide-react";

type ThemeState = {
  preset: string | null;
  light: ThemeTokens;
  dark: ThemeTokens | null;
  autoDark: boolean;
};

function buildInitialTheme(
  stored: ReturnType<typeof useQuery<typeof api.queries.getTheme>>,
): ThemeState {
  if (stored) {
    return {
      preset: stored.preset ?? null,
      light: stored.light,
      dark: stored.dark ?? null,
      autoDark: !stored.dark,
    };
  }
  return {
    preset: "bakery-gold",
    light: DEFAULT_THEME.light,
    dark: null,
    autoDark: true,
  };
}

function ColorSwatch({ color, size = "md" }: { color: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";
  return (
    <div
      className={cn(sizeClass, "rounded-md border border-border/50 shrink-0")}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function ContrastBadge({ fg, bg }: { fg: string; bg: string }) {
  const t = useTranslations("admin.theme");
  const result = checkContrast(fg, bg);
  if (!result) return null;

  if (result.aaNormal) {
    return (
      <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-600 dark:text-green-400 gap-1">
        <Check className="h-3 w-3" />
        {t("contrastPass")} ({result.ratio}:1)
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-600 dark:text-red-400 gap-1">
      <AlertTriangle className="h-3 w-3" />
      {t("contrastFail")} ({result.ratio}:1)
    </Badge>
  );
}

function ColorEditor({
  tokenKey,
  value,
  onChange,
  locale,
}: {
  tokenKey: keyof ThemeTokens;
  value: string;
  onChange: (val: string) => void;
  locale: string;
}) {
  const label = TOKEN_LABELS[tokenKey];
  const hexVal = oklchToHex(value);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-surface/50">
      <ColorSwatch color={value} size="lg" />
      <div className="flex-1 min-w-0">
        <Label className="text-xs font-medium text-foreground">
          {locale === "ar" ? label.ar : label.en}
        </Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="color"
            value={hexVal}
            onChange={(e) => {
              const oklch = hexToOklch(e.target.value);
              if (oklch) onChange(oklch);
            }}
            className="h-8 w-12 p-1 cursor-pointer"
          />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs font-mono"
            placeholder="oklch(...)"
          />
        </div>
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  isActive,
  onClick,
  locale,
}: {
  preset: PresetTheme;
  isActive: boolean;
  onClick: () => void;
  locale: string;
}) {
  const label = locale === "ar" ? preset.label_ar : preset.label_en;
  const colors = preset.light;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
        isActive
          ? "border-accent ring-2 ring-accent/20 bg-surface"
          : "border-border/50 hover:border-border bg-surface/50 hover:bg-surface",
      )}
    >
      <div className="flex gap-1.5">
        <ColorSwatch color={colors.accent} size="md" />
        <ColorSwatch color={colors.background} size="md" />
        <ColorSwatch color={colors.foreground} size="md" />
        <ColorSwatch color={colors.card} size="md" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {isActive && (
        <div className="absolute top-2 end-2">
          <Check className="h-4 w-4 text-accent" />
        </div>
      )}
    </button>
  );
}

function MiniPreview({ light, dark, isDark }: { light: ThemeTokens; dark: ThemeTokens; isDark: boolean }) {
  const t = useTranslations();
  const tokens = isDark ? dark : light;
  return (
    <div
      className="rounded-xl border border-border/50 overflow-hidden"
      style={{ backgroundColor: tokens.background }}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: tokens.accent }}
          >
            <span style={{ color: tokens.accentForeground }} className="text-xs font-bold">M</span>
          </div>
          <span style={{ color: tokens.foreground }} className="text-sm font-medium">
            {t("site.title")}
          </span>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: tokens.card, borderColor: tokens.border, borderWidth: 1 }}
        >
          <div className="h-3 w-3/4 rounded" style={{ backgroundColor: tokens.foreground, opacity: 0.8 }} />
          <div className="h-2 w-1/2 rounded mt-2" style={{ backgroundColor: tokens.mutedForeground, opacity: 0.5 }} />
        </div>
        <div className="flex gap-2">
          <div
            className="h-7 w-20 rounded-md flex items-center justify-center"
            style={{ backgroundColor: tokens.accent }}
          >
            <span style={{ color: tokens.accentForeground }} className="text-[10px]">
              {t("hero.ctaPrimary")}
            </span>
          </div>
          <div
            className="h-7 w-20 rounded-md flex items-center justify-center"
            style={{ backgroundColor: tokens.muted }}
          >
            <span style={{ color: tokens.mutedForeground }} className="text-[10px]">
              {t("nav.about")}
            </span>
          </div>
        </div>
        <div className="h-px" style={{ backgroundColor: tokens.border }} />
        <div className="flex gap-2">
          {["#1", "#2", "#3"].map((n) => (
            <div
              key={n}
              className="flex-1 rounded-lg p-2"
              style={{ backgroundColor: tokens.card, borderColor: tokens.border, borderWidth: 1 }}
            >
              <div className="h-12 rounded" style={{ backgroundColor: tokens.muted }} />
              <div className="h-2 w-3/4 rounded mt-2" style={{ backgroundColor: tokens.foreground, opacity: 0.6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminThemePage() {
  const t = useTranslations("admin.theme");
  const locale = useLocale();
  const stored = useQuery(api.queries.getTheme);
  const updateTheme = useMutation(api.mutations.updateTheme);
  const resetTheme = useMutation(api.mutations.resetTheme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ThemeState | null>(null);
  const [previewDark, setPreviewDark] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  useEffect(() => {
    if (stored !== undefined && state === null) {
      setState(buildInitialTheme(stored));
    }
  }, [stored, state]);

  const resolvedDark = state?.dark ?? (state?.light ? deriveDarkFromLight(state.light) : DEFAULT_THEME.light);
  const validation = state ? validateTheme(state.light) : { valid: true, criticalPass: true, issues: [] };

  const applyPreset = useCallback((key: string) => {
    const preset = PRESET_THEMES[key];
    if (!preset) return;
    setState((prev) =>
      prev
        ? { ...prev, preset: key, light: preset.light, dark: preset.dark ?? null }
        : prev,
    );
    setHasUnsaved(true);
  }, []);

  const updateLightToken = useCallback((token: keyof ThemeTokens, value: string) => {
    setState((prev) =>
      prev ? { ...prev, preset: "custom", light: { ...prev.light, [token]: value } } : prev,
    );
    setHasUnsaved(true);
  }, []);

  const updateDarkToken = useCallback((token: keyof ThemeTokens, value: string) => {
    setState((prev) =>
      prev ? { ...prev, dark: { ...(prev.dark ?? deriveDarkFromLight(prev.light)), [token]: value } } : prev,
    );
    setHasUnsaved(true);
  }, []);

  const toggleAutoDark = useCallback((auto: boolean) => {
    setState((prev) => (prev ? { ...prev, autoDark: auto, dark: auto ? null : prev.dark } : prev));
    setHasUnsaved(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!state || !validation.criticalPass) return;
    try {
      await updateTheme({
        theme: {
          preset: state.preset ?? undefined,
          light: state.light,
          dark: state.autoDark ? undefined : state.dark ?? undefined,
          updatedAt: Date.now(),
        },
      });
      toast.success(t("saved"));
      setHasUnsaved(false);
    } catch {
      toast.error(t("saveFailed"));
    }
  }, [state, validation.criticalPass, updateTheme, t]);

  const handleReset = useCallback(async () => {
    if (!window.confirm(t("resetConfirm"))) return;
    try {
      await resetTheme({});
      setState({ preset: "bakery-gold", light: DEFAULT_THEME.light, dark: null, autoDark: true });
      toast.success(t("resetDone"));
      setHasUnsaved(false);
    } catch {
      toast.error(t("resetFailed"));
    }
  }, [resetTheme, t]);

  const handleExport = useCallback(() => {
    if (!state) return;
    const data = { preset: state.preset, light: state.light, dark: state.autoDark ? null : state.dark };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chef-theme.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (!data.light || typeof data.light !== "object") {
            toast.error(t("invalidImport"));
            return;
          }
          setState({
            preset: data.preset ?? "custom",
            light: data.light,
            dark: data.dark ?? null,
            autoDark: !data.dark,
          });
          setHasUnsaved(true);
          toast.success(t("imported"));
        } catch {
          toast.error(t("invalidImport"));
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [t],
  );

  if (stored === undefined || !state) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const tokenGroups: Array<{
    title: string;
    keys: Array<keyof ThemeTokens>;
  }> = [
    { title: t("baseColors"), keys: ["background", "foreground", "border", "card"] },
    { title: t("accentColors"), keys: ["accent", "accentForeground"] },
    { title: t("semanticColors"), keys: ["muted", "mutedForeground", "destructive"] },
  ];

  const activeTokens = previewDark ? resolvedDark : state.light;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Palette className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Contrast warnings */}
      {validation.issues.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {validation.issues.filter((i) => i.level === "critical").length > 0
                ? t("saveDisabled")
                : `${validation.issues.length} ${t("contrastFail").toLowerCase()}`}
            </span>
          </div>
          <ul className="space-y-1">
            {validation.issues.map((issue, i) => (
              <li key={i} className="text-xs text-red-500/80 flex items-center gap-2">
                <span className="font-medium">{issue.pair}</span>
                <span>— {issue.ratio}:1</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preset selector */}
      <section>
        <h2 className="text-lg font-heading font-semibold text-foreground mb-4">{t("presets")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(PRESET_THEMES).map(([key, preset]) => (
            <PresetCard
              key={key}
              preset={preset}
              isActive={state.preset === key}
              onClick={() => applyPreset(key)}
              locale={locale}
            />
          ))}
        </div>
      </section>

      {/* Preview + editors */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">
              {previewDark ? t("darkModePreview") : t("lightModePreview")}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={previewDark ? "outline" : "default"}
                size="sm"
                onClick={() => setPreviewDark(false)}
                className={!previewDark ? "bg-accent text-background" : ""}
              >
                <Sun className="h-4 w-4 me-1" />
                Light
              </Button>
              <Button
                variant={previewDark ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewDark(true)}
                className={previewDark ? "bg-accent text-background" : ""}
              >
                <Moon className="h-4 w-4 me-1" />
                Dark
              </Button>
            </div>
          </div>
          <MiniPreview light={state.light} dark={resolvedDark} isDark={previewDark} />

          {/* Contrast summary for current preview */}
          <div className="mt-4 space-y-2">
            <ContrastBadge fg={activeTokens.foreground} bg={activeTokens.background} />
            <ContrastBadge fg={activeTokens.accentForeground} bg={activeTokens.accent} />
            <ContrastBadge fg={activeTokens.mutedForeground} bg={activeTokens.background} />
          </div>
        </section>

        {/* Token editors */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-foreground">{t("custom")}</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.autoDark}
                onChange={(e) => toggleAutoDark(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm text-muted-foreground">{t("autoDark")}</span>
            </label>
          </div>

          {tokenGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.title}</h3>
              <div className="space-y-3">
                {group.keys.map((key) => (
                  <ColorEditor
                    key={key}
                    tokenKey={key}
                    value={previewDark ? resolvedDark[key] : state.light[key]}
                    onChange={(val) =>
                      previewDark ? updateDarkToken(key, val) : updateLightToken(key, val)
                    }
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 -mx-6 p-4 bg-background border-t border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 me-1" />
            {t("exportTheme")}
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 me-1" />
            {t("importTheme")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 me-1" />
            {t("resetConfirm").replace("?", "")}
          </Button>
        </div>
        <Button
          onClick={handleSave}
          disabled={!validation.criticalPass || !hasUnsaved}
          className="bg-accent hover:bg-accent-hover text-background min-w-[120px]"
        >
          {validation.criticalPass ? t("saved").replace("!", "") : t("saveDisabled")}
        </Button>
      </div>
    </div>
  );
}
