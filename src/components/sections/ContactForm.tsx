"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronDown, Send, Loader2 } from "lucide-react";

type RequestType = "consulting" | "catering" | "training" | "partnerships" | "other";

const FALLBACK_VALUES: { value: RequestType; label_en: string; label_ar: string }[] = [
  { value: "consulting", label_en: "Consulting", label_ar: "استشارات" },
  { value: "catering", label_en: "Catering", label_ar: "تموين حفلات" },
  { value: "training", label_en: "Training", label_ar: "تدريب" },
  { value: "partnerships", label_en: "Partnerships", label_ar: "شراكات" },
  { value: "other", label_en: "Other", label_ar: "أخرى" },
];

export function ContactForm() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const submitInquiry = useMutation(api.mutations.submitContactInquiry);
  const contactInfo = useQuery(api.queries.getContactInfo);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestType, setRequestType] = useState<RequestType | "">("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const requestTypes = contactInfo?.requestTypes ?? FALLBACK_VALUES;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!requestType) {
      toast.error(t("form.requestTypePlaceholder"));
      return;
    }

    setLoading(true);
    try {
      await submitInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        requestType,
        message: message.trim(),
      });
      toast.success(t("success"));
      setName("");
      setEmail("");
      setPhone("");
      setRequestType("");
      setMessage("");
    } catch (err: unknown) {
      const isRateLimit =
        err instanceof Error && err.message.includes("RATE_LIMITED");
      toast.error(isRateLimit ? t("rateLimited") : t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="cf-name" className="text-foreground text-sm font-medium">
          {t("form.nameLabel")}
        </Label>
        <Input
          id="cf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-surface-elevated/50 border-border/40 focus:border-accent focus:ring-2 focus:ring-accent/15 h-11 transition-all duration-200 placeholder:text-muted-foreground/50"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cf-email" className="text-foreground text-sm font-medium">
          {t("form.emailLabel")}
        </Label>
        <Input
          id="cf-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-surface-elevated/50 border-border/40 focus:border-accent focus:ring-2 focus:ring-accent/15 h-11 transition-all duration-200 placeholder:text-muted-foreground/50"
          placeholder="your@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cf-phone" className="text-foreground text-sm font-medium">
          {t("form.phoneLabel")}
        </Label>
        <Input
          id="cf-phone"
          type="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("form.phonePlaceholder")}
          className="bg-surface-elevated/50 border-border/40 focus:border-accent focus:ring-2 focus:ring-accent/15 h-11 transition-all duration-200 placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cf-type" className="text-foreground text-sm font-medium">
          {t("form.requestTypeLabel")}
        </Label>
        <div className="relative">
          <select
            id="cf-type"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as RequestType)}
            className="w-full appearance-none rounded-lg border border-border/40 bg-surface-elevated/50 px-3 py-2.5 pe-10 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-50 h-11 cursor-pointer"
            required
          >
            <option value="" disabled className="text-muted-foreground">
              {t("form.requestTypePlaceholder")}
            </option>
            {requestTypes.map((rt) => {
              const value = typeof rt === "string" ? rt : rt.value;
              const label = typeof rt === "string"
                ? t(`form.requestTypes.${value}` as `form.requestTypes.${RequestType}`)
                : (locale === "ar" ? (rt.label_ar || rt.label_en) : rt.label_en);
              return (
                <option key={value} value={value} className="text-foreground">
                  {label}
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cf-message" className="text-foreground text-sm font-medium">
          {t("form.messageLabel")}
        </Label>
        <Textarea
          id="cf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          className="bg-surface-elevated/50 border-border/40 focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200 placeholder:text-muted-foreground/50 resize-none"
          placeholder="Tell us about your request..."
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-accent hover:bg-accent-hover text-background h-11 shadow-accent hover:shadow-glow transition-all duration-300 gap-2"
        disabled={loading || !requestType}
        aria-label={t("btn")}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {tCommon("loading")}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t("btn")}
          </>
        )}
      </Button>
    </form>
  );
}
