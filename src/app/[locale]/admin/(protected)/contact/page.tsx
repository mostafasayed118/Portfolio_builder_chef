"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

export default function AdminContactPage() {
  const t = useTranslations("admin.contactEditor.labels");
  const tPlaceholders = useTranslations("admin.contactEditor.placeholders");
  const tEditor = useTranslations("admin.contactEditor");
  const tNav = useTranslations("admin.nav");
  const contact = useQuery(api.queries.getContactInfo);
  const updateContact = useMutation(api.mutations.updateContactInfo);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [phone, setPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [addressAr, setAddressAr] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [responseTimeEn, setResponseTimeEn] = useState("");
  const [responseTimeAr, setResponseTimeAr] = useState("");
  const [businessHoursEn, setBusinessHoursEn] = useState("");
  const [businessHoursAr, setBusinessHoursAr] = useState("");
  const [requestTypes, setRequestTypes] = useState<{ value: string; label_en: string; label_ar: string }[]>([]);
  const [newReqValue, setNewReqValue] = useState("");
  const [newReqEn, setNewReqEn] = useState("");
  const [newReqAr, setNewReqAr] = useState("");

  useEffect(() => {
    if (contact && !loaded) {
      setPhone(contact.phone ?? "");
      setSecondaryPhone(contact.secondaryPhone ?? "");
      setWhatsapp(contact.whatsapp ?? "");
      setEmail(contact.email ?? "");
      setInstagram(contact.instagram ?? "");
      setAddressEn(contact.address_en ?? "");
      setAddressAr(contact.address_ar ?? "");
      setBookingUrl(contact.bookingUrl ?? "");
      setResponseTimeEn(contact.responseTime_en ?? "");
      setResponseTimeAr(contact.responseTime_ar ?? "");
      setBusinessHoursEn(contact.businessHours?.note_en ?? "");
      setBusinessHoursAr(contact.businessHours?.note_ar ?? "");
      setRequestTypes(contact.requestTypes ?? []);
      setLoaded(true);
    }
  }, [contact, loaded]);

  const hasUnsaved = loaded && (
    phone !== contact?.phone ||
    secondaryPhone !== (contact?.secondaryPhone ?? "") ||
    whatsapp !== (contact?.whatsapp ?? "") ||
    email !== contact?.email ||
    instagram !== (contact?.instagram ?? "") ||
    addressEn !== contact?.address_en ||
    addressAr !== contact?.address_ar ||
    bookingUrl !== (contact?.bookingUrl ?? "") ||
    responseTimeEn !== (contact?.responseTime_en ?? "") ||
    responseTimeAr !== (contact?.responseTime_ar ?? "") ||
    businessHoursEn !== (contact?.businessHours?.note_en ?? "") ||
    businessHoursAr !== (contact?.businessHours?.note_ar ?? "") ||
    JSON.stringify(requestTypes) !== JSON.stringify(contact?.requestTypes ?? [])
  );

  function addRequestType() {
    if (!newReqValue.trim() || !newReqEn.trim()) return;
    if (requestTypes.some((r) => r.value === newReqValue.trim())) return;
    setRequestTypes([...requestTypes, { value: newReqValue.trim(), label_en: newReqEn.trim(), label_ar: newReqAr.trim() || newReqEn.trim() }]);
    setNewReqValue(""); setNewReqEn(""); setNewReqAr("");
  }

  function removeRequestType(value: string) {
    setRequestTypes(requestTypes.filter((r) => r.value !== value));
  }

  async function handleSave() {
    if (!contact) return;
    setSaving(true);
    try {
      await updateContact({
        phone,
        email,
        instagram: instagram || null,
        address_en: addressEn,
        address_ar: addressAr,
        bookingUrl: bookingUrl || null,
        whatsapp: whatsapp || null,
        secondaryPhone: secondaryPhone || null,
        responseTime_en: responseTimeEn || null,
        responseTime_ar: responseTimeAr || null,
        requestTypes: requestTypes.length > 0 ? requestTypes : undefined,
        businessHours: businessHoursEn.trim() ? { note_en: businessHoursEn, note_ar: businessHoursAr || "" } : undefined,
      });
      toast.success(tEditor("savedToast"));
    } catch {
      toast.error(tEditor("saveFailedToast"));
    } finally {
      setSaving(false);
    }
  }

  if (!contact && !loaded) {
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
      title={tNav("contact")}
      breadcrumb={tNav("dashboard")}
      onSave={handleSave}
      isSaving={saving}
      hasUnsaved={!!hasUnsaved}
    >
      <Card className="bg-surface border-border/50">
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{t("phonePrimary")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{t("phoneSecondary")}</Label>
              <Input value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} dir="ltr" className="bg-surface-elevated border-border/50" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{t("email")}</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{t("whatsapp")}</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder={tPlaceholders("whatsapp")} className="bg-surface-elevated border-border/50" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{t("responseTimeEn")}</Label>
              <Input value={responseTimeEn} onChange={(e) => setResponseTimeEn(e.target.value)} placeholder={tPlaceholders("responseTimeEn")} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{t("responseTimeAr")}</Label>
              <Input value={responseTimeAr} onChange={(e) => setResponseTimeAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">{t("instagram")}</Label>
            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder={tPlaceholders("instagram")} className="bg-surface-elevated border-border/50" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">{t("addressEn")}</Label>
              <Textarea value={addressEn} onChange={(e) => setAddressEn(e.target.value)} rows={2} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">{t("addressAr")}</Label>
              <Textarea value={addressAr} onChange={(e) => setAddressAr(e.target.value)} rows={2} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">{t("bookingUrl")}</Label>
            <Input value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder={tPlaceholders("bookingUrl")} className="bg-surface-elevated border-border/50" />
          </div>

          {/* Business Hours */}
          <div className="border-t border-border/50 pt-6">
            <h3 className="font-medium text-foreground mb-4">{t("businessHours")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">{t("hoursNoteEn")}</Label>
                <Input value={businessHoursEn} onChange={(e) => setBusinessHoursEn(e.target.value)} placeholder={tPlaceholders("hoursNoteEn")} className="bg-surface-elevated border-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{t("hoursNoteAr")}</Label>
                <Input value={businessHoursAr} onChange={(e) => setBusinessHoursAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
              </div>
            </div>
          </div>

          {/* Request Types */}
          <div className="border-t border-border/50 pt-6">
            <h3 className="font-medium text-foreground mb-4">{t("requestTypes")}</h3>
            <div className="space-y-3">
              {requestTypes.map((rt) => (
                <div key={rt.value} className="flex items-center gap-3 rounded-lg border border-border/50 bg-surface-elevated p-3">
                  <Badge variant="outline" className="border-accent/20 text-accent/80 text-xs shrink-0">{rt.value}</Badge>
                  <span className="text-sm text-foreground flex-1">{rt.label_en}</span>
                  <span className="text-sm text-muted-foreground" dir="rtl">{rt.label_ar}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeRequestType(rt.value)} aria-label={tEditor("removeRequestType")} className="h-8 w-8 text-error hover:text-error shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="grid gap-2 sm:grid-cols-3">
                <Input value={newReqValue} onChange={(e) => setNewReqValue(e.target.value)} placeholder={tPlaceholders("reqValue")} className="bg-surface-elevated border-border/50" />
                <Input value={newReqEn} onChange={(e) => setNewReqEn(e.target.value)} placeholder={tPlaceholders("reqLabelEn")} className="bg-surface-elevated border-border/50" />
                <div className="flex gap-2">
                  <Input value={newReqAr} onChange={(e) => setNewReqAr(e.target.value)} dir="rtl" placeholder={tPlaceholders("reqLabelAr")} className="bg-surface-elevated border-border/50 text-right flex-1" />
                  <Button type="button" onClick={addRequestType} disabled={!newReqValue.trim() || !newReqEn.trim()}
                    className="bg-accent hover:bg-accent-hover text-background shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </SectionEditorShell>
  );
}
