"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BookingData {
  // Step 1 — Business Info
  businessType: string;
  teamSize: string;
  governorate: string;
  // Step 2 — Challenge & Budget
  challengeType: string;
  budgetRange: string;
  message: string;
  // Step 3 — Contact & Preference
  name: string;
  email: string;
  phone: string;
  requestType: string;
  preferredMode: string;
  preferredSlot: string;
}

const INITIAL_DATA: BookingData = {
  businessType: "",
  teamSize: "",
  governorate: "",
  challengeType: "",
  budgetRange: "",
  message: "",
  name: "",
  email: "",
  phone: "",
  requestType: "",
  preferredMode: "",
  preferredSlot: "",
};

// ─── Option keys (match i18n booking.options.*) ─────────────────────────────

const BUSINESS_TYPES = ["bakery", "cafe", "hotel", "restaurant", "other"] as const;
const TEAM_SIZES = ["1-5", "6-20", "20+"] as const;
const CHALLENGE_TYPES = [
  "newOpening",
  "menuOverhaul",
  "qa",
  "training",
  "costReduction",
  "other",
] as const;
const BUDGET_RANGES = ["under50k", "50k-200k", "200k+", "notSure"] as const;
const PREFERRED_MODES = ["video", "inPerson", "whatsapp"] as const;
const PREFERRED_SLOTS = ["morning", "afternoon", "evening", "flexible"] as const;

const GOVERNORATES = [
  "cairo",
  "giza",
  "alexandria",
  "qalyubia",
  "sharqia",
  "dakahlia",
  "gharbia",
  "monufia",
  "beheira",
  "fayoum",
  "beniSuef",
  "minya",
  "assiut",
  "sohag",
  "qena",
  "luxor",
  "aswan",
  "redSea",
  "northSinai",
  "southSinai",
  "portSaid",
  "suez",
  "ismailia",
  "damietta",
  "matrouh",
  "newValley",
  "other",
] as const;

// ─── Helper to build option lists with translations ──────────────────────────

function useOptionLabels() {
  const t = useTranslations("booking");

  const businessTypeLabel = useCallback(
    (key: string) => t(`options.businessType.${key}` as keyof typeof t extends never ? string : never),
    [t],
  );
  const teamSizeLabel = useCallback(
    (key: string) => t(`options.teamSize.${key}` as keyof typeof t extends never ? string : never),
    [t],
  );
  const governorateLabel = useCallback(
    (key: string) => t(`options.governorate.${key}` as keyof typeof t extends never ? string : never),
    [t],
  );
  const challengeTypeLabel = useCallback(
    (key: string) => t(`options.challengeType.${key}` as keyof typeof t extends never ? string : never),
    [t],
  );
  const budgetRangeLabel = useCallback(
    (key: string) => t(`options.budgetRange.${key}` as keyof typeof t extends never ? string : never),
    [t],
  );
  const preferredModeLabel = useCallback(
    (key: string) => t(`options.preferredMode.${key}` as keyof typeof t extends never ? string : never),
    [t],
  );
  const preferredSlotLabel = useCallback(
    (key: string) => t(`options.preferredSlot.${key}` as keyof typeof t extends never ? string : never),
    [t],
  );

  return {
    businessTypeLabel,
    teamSizeLabel,
    governorateLabel,
    challengeTypeLabel,
    budgetRangeLabel,
    preferredModeLabel,
    preferredSlotLabel,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BookingForm() {
  const t = useTranslations("booking");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const submitInquiry = useMutation(api.mutations.submitContactInquiry);
  const contactInfo = useQuery(api.queries.getContactInfo);

  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [whatsappMode, setWhatsappMode] = useState(false);

  const totalSteps = 3;

  const updateField = useCallback(
    <K extends keyof BookingData>(field: K, value: BookingData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  // ─── Validation per step ─────────────────────────────────────────────────

  function validateStep(s: number): boolean {
    const newErrors: Partial<Record<keyof BookingData, string>> = {};

    if (s === 1) {
      if (!data.businessType) newErrors.businessType = t("errors.required");
      if (!data.teamSize) newErrors.teamSize = t("errors.required");
    }

    if (s === 2) {
      if (!data.challengeType) newErrors.challengeType = t("errors.required");
      if (!data.message.trim()) newErrors.message = t("errors.required");
    }

    if (s === 3) {
      if (!data.name.trim()) newErrors.name = t("errors.required");
      if (!data.email.trim()) {
        newErrors.email = t("errors.required");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = t("errors.invalidEmail");
      }
      if (!data.requestType) newErrors.requestType = t("errors.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  // ─── WhatsApp link construction ──────────────────────────────────────────

  function buildWhatsAppLink(): string {
    const whatsappUrl = contactInfo?.whatsapp ?? "https://wa.me/201020295018";
    const base = whatsappUrl.split("?")[0];

    const lines = [
      `${t("whatsappPrefill.title")}:`,
      "",
      `${t("whatsappPrefill.businessType")}: ${data.businessType || "-"}`,
      `${t("whatsappPrefill.teamSize")}: ${data.teamSize || "-"}`,
      `${t("whatsappPrefill.governorate")}: ${data.governorate || "-"}`,
      `${t("whatsappPrefill.challenge")}: ${data.challengeType || "-"}`,
      `${t("whatsappPrefill.budget")}: ${data.budgetRange || "-"}`,
      "",
      data.message || "-",
    ];

    if (data.name) lines.push("", `${t("whatsappPrefill.name")}: ${data.name}`);
    if (data.phone) lines.push(`${t("whatsappPrefill.phone")}: ${data.phone}`);

    return `${base}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  // ─── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      for (let s = 1; s <= totalSteps; s++) {
        if (!validateStep(s)) {
          setStep(s);
          return;
        }
      }
      return;
    }

    if (whatsappMode) {
      window.open(buildWhatsAppLink(), "_blank", "noopener,noreferrer");
      setSuccess(true);
      return;
    }

    setLoading(true);
    try {
      await submitInquiry({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim() || undefined,
        requestType: data.requestType,
        message: data.message.trim(),
        businessType: data.businessType || undefined,
        teamSize: data.teamSize || undefined,
        governorate: data.governorate || undefined,
        challengeType: data.challengeType || undefined,
        budgetRange: data.budgetRange || undefined,
        preferredMode: data.preferredMode || undefined,
        preferredSlot: data.preferredSlot || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const isRateLimit =
        err instanceof Error && err.message.includes("RATE_LIMITED");
      toast.error(isRateLimit ? t("errors.rateLimited") : t("errors.submitFailed"));
    } finally {
      setLoading(false);
    }
  }

  // ─── Success state ───────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h3 className="font-heading text-xl font-semibold text-foreground">
          {t("success.title")}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("success.description")}
        </p>
        {contactInfo?.whatsapp && (
          <a
            href={contactInfo.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            {t("success.whatsappFallback")}
          </a>
        )}
        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setData(INITIAL_DATA);
            }}
            className="cursor-pointer"
          >
            {t("success.sendAnother")}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  const requestTypes = contactInfo?.requestTypes ?? [
    { value: "consulting", label_en: "Consulting", label_ar: "استشارات" },
    { value: "catering", label_en: "Catering", label_ar: "تموين حفلات" },
    { value: "training", label_en: "Training", label_ar: "تدريب" },
    { value: "partnerships", label_en: "Partnerships", label_ar: "شراكات" },
    { value: "other", label_en: "Other", label_ar: "أخرى" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-2" aria-label={t("progress.label", { step, total: totalSteps })}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i + 1 <= step ? "bg-accent" : "bg-border"
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {t("progress.stepOf", { step, total: totalSteps })} — {t(`steps.${step}.title` as never)}
      </p>

      {/* ─── Step 1: Business Info ───────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in-0 duration-300">
          <StepHeading title={t("steps.1.title")} subtitle={t("steps.1.subtitle")} />

          <SelectField
            id="bf-businessType"
            label={t("fields.businessType.label")}
            placeholder={t("fields.businessType.placeholder")}
            value={data.businessType}
            onChange={(v) => updateField("businessType", v)}
            options={BUSINESS_TYPES.map((val) => ({
              value: val,
              label: t(`options.businessType.${val}` as never),
            }))}
            error={errors.businessType}
          />

          <SelectField
            id="bf-teamSize"
            label={t("fields.teamSize.label")}
            placeholder={t("fields.teamSize.placeholder")}
            value={data.teamSize}
            onChange={(v) => updateField("teamSize", v)}
            options={TEAM_SIZES.map((val) => ({
              value: val,
              label: t(`options.teamSize.${val}` as never),
            }))}
            error={errors.teamSize}
          />

          <SelectField
            id="bf-governorate"
            label={t("fields.governorate.label")}
            placeholder={t("fields.governorate.placeholder")}
            value={data.governorate}
            onChange={(v) => updateField("governorate", v)}
            options={GOVERNORATES.map((val) => ({
              value: val,
              label: t(`options.governorate.${val}` as never),
            }))}
          />
        </div>
      )}

      {/* ─── Step 2: Challenge & Budget ──────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in-0 duration-300">
          <StepHeading title={t("steps.2.title")} subtitle={t("steps.2.subtitle")} />

          <SelectField
            id="bf-challengeType"
            label={t("fields.challengeType.label")}
            placeholder={t("fields.challengeType.placeholder")}
            value={data.challengeType}
            onChange={(v) => updateField("challengeType", v)}
            options={CHALLENGE_TYPES.map((val) => ({
              value: val,
              label: t(`options.challengeType.${val}` as never),
            }))}
            error={errors.challengeType}
          />

          <SelectField
            id="bf-budgetRange"
            label={t("fields.budgetRange.label")}
            placeholder={t("fields.budgetRange.placeholder")}
            value={data.budgetRange}
            onChange={(v) => updateField("budgetRange", v)}
            options={BUDGET_RANGES.map((val) => ({
              value: val,
              label: t(`options.budgetRange.${val}` as never),
            }))}
          />

          <div className="space-y-2">
            <Label htmlFor="bf-message" className="text-foreground text-sm font-medium">
              {t("fields.description.label")}
            </Label>
            <Textarea
              id="bf-message"
              value={data.message}
              onChange={(e) => updateField("message", e.target.value)}
              rows={4}
              className="bg-surface-elevated/50 border-border/40 focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200 placeholder:text-muted-foreground/50 resize-none"
              placeholder={t("fields.description.placeholder")}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-xs text-destructive" role="alert">{errors.message}</p>
            )}
          </div>
        </div>
      )}

      {/* ─── Step 3: Contact & Preference ────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in-0 duration-300">
          <StepHeading title={t("steps.3.title")} subtitle={t("steps.3.subtitle")} />

          <div className="space-y-2">
            <Label htmlFor="bf-name" className="text-foreground text-sm font-medium">
              {t("fields.name.label")}
            </Label>
            <Input
              id="bf-name"
              value={data.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="bg-surface-elevated/50 border-border/40 focus:border-accent focus:ring-2 focus:ring-accent/15 h-11 transition-all duration-200 placeholder:text-muted-foreground/50"
              placeholder={t("fields.name.placeholder")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bf-email" className="text-foreground text-sm font-medium">
              {t("fields.email.label")}
            </Label>
            <Input
              id="bf-email"
              type="email"
              value={data.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="bg-surface-elevated/50 border-border/40 focus:border-accent focus:ring-2 focus:ring-accent/15 h-11 transition-all duration-200 placeholder:text-muted-foreground/50"
              placeholder={t("fields.email.placeholder")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive" role="alert">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bf-phone" className="text-foreground text-sm font-medium">
              {t("fields.phone.label")}
            </Label>
            <Input
              id="bf-phone"
              type="tel"
              dir="ltr"
              value={data.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder={t("fields.phone.placeholder")}
              className="bg-surface-elevated/50 border-border/40 focus:border-accent focus:ring-2 focus:ring-accent/15 h-11 transition-all duration-200 placeholder:text-muted-foreground/50"
            />
          </div>

          <SelectField
            id="bf-requestType"
            label={t("fields.requestType.label")}
            placeholder={t("fields.requestType.placeholder")}
            value={data.requestType}
            onChange={(v) => updateField("requestType", v)}
            options={requestTypes.map((rt) => ({
              value: rt.value,
              label: isAr ? (rt.label_ar || rt.label_en) : rt.label_en,
            }))}
            error={errors.requestType}
          />

          <SelectField
            id="bf-preferredMode"
            label={t("fields.preferredMode.label")}
            placeholder={t("fields.preferredMode.placeholder")}
            value={data.preferredMode}
            onChange={(v) => updateField("preferredMode", v)}
            options={PREFERRED_MODES.map((val) => ({
              value: val,
              label: t(`options.preferredMode.${val}` as never),
            }))}
          />

          <SelectField
            id="bf-preferredSlot"
            label={t("fields.preferredSlot.label")}
            placeholder={t("fields.preferredSlot.placeholder")}
            value={data.preferredSlot}
            onChange={(v) => updateField("preferredSlot", v)}
            options={PREFERRED_SLOTS.map((val) => ({
              value: val,
              label: t(`options.preferredSlot.${val}` as never),
            }))}
          />

          {/* WhatsApp toggle */}
          {contactInfo?.whatsapp && (
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-surface-elevated/30 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="bf-whatsapp-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                  {t("whatsappToggle.label")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("whatsappToggle.description")}
                </p>
              </div>
              <Switch
                id="bf-whatsapp-toggle"
                checked={whatsappMode}
                onCheckedChange={setWhatsappMode}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Navigation ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="gap-2 cursor-pointer"
          >
            {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {t("navigation.back")}
          </Button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <Button
            type="button"
            onClick={handleNext}
            className="bg-accent hover:bg-accent-hover text-background gap-2 shadow-accent hover:shadow-glow transition-all duration-300 cursor-pointer"
          >
            {t("navigation.next")}
            {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <Button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-background gap-2 shadow-accent hover:shadow-glow transition-all duration-300 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tCommon("loading")}
              </>
            ) : whatsappMode ? (
              <>
                <MessageCircle className="h-4 w-4" />
                {t("navigation.sendViaWhatsApp")}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t("navigation.submit")}
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h4 className="font-heading text-lg font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function SelectField({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border/40 bg-surface-elevated/50 px-3 py-2.5 pe-10 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-50 h-11 cursor-pointer"
          aria-invalid={!!error}
        >
          <option value="" disabled className="text-muted-foreground">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
