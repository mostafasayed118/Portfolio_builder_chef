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

export default function AdminContactPage() {
  const contact = useQuery(api.queries.getContactInfo);
  const updateContact = useMutation(api.mutations.updateContactInfo);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [addressAr, setAddressAr] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  useEffect(() => {
    if (contact && !loaded) {
      setPhone(contact.phone ?? "");
      setEmail(contact.email ?? "");
      setInstagram(contact.instagram ?? "");
      setAddressEn(contact.address_en ?? "");
      setAddressAr(contact.address_ar ?? "");
      setBookingUrl(contact.bookingUrl ?? "");
      setLoaded(true);
    }
  }, [contact, loaded]);

  const hasUnsaved = loaded && (
    phone !== contact?.phone ||
    email !== contact?.email ||
    instagram !== contact?.instagram ||
    addressEn !== contact?.address_en ||
    addressAr !== contact?.address_ar ||
    bookingUrl !== contact?.bookingUrl
  );

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
      });
      toast.success("Contact info saved");
    } catch {
      toast.error("Failed to save");
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
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SectionEditorShell
      title="Contact Info"
      breadcrumb="Dashboard"
      onSave={handleSave}
      isSaving={saving}
      hasUnsaved={!!hasUnsaved}
    >
      <Card className="bg-surface border-border/50">
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-elevated border-border/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Instagram (without @)</Label>
            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="chefamira" className="bg-surface-elevated border-border/50" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">Address - English</Label>
              <Textarea value={addressEn} onChange={(e) => setAddressEn(e.target.value)} rows={2} className="bg-surface-elevated border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">العنوان - العربية</Label>
              <Textarea value={addressAr} onChange={(e) => setAddressAr(e.target.value)} rows={2} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Booking URL (optional)</Label>
            <Input value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://" className="bg-surface-elevated border-border/50" />
          </div>
        </CardContent>
      </Card>
    </SectionEditorShell>
  );
}
