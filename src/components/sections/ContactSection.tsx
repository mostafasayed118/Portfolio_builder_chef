"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirection } from "@/hooks/useDirection";
import { toast } from "sonner";
import { useState } from "react";
import { Phone, Mail, Globe, MapPin, Calendar } from "lucide-react";

function ContactForm() {
  const t = useTranslations("contact");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success(t("success"));
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Name</Label>
        <Input id="name" required className="bg-surface border-border/50 focus:border-accent" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <Input id="email" type="email" required className="bg-surface border-border/50 focus:border-accent" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="text-foreground">Message</Label>
        <Textarea id="message" rows={5} required className="bg-surface border-border/50 focus:border-accent" />
      </div>
      <Button
        type="submit"
        className="w-full bg-accent hover:bg-accent-hover text-background"
        disabled={loading}
      >
        {loading ? "..." : t("btn")}
      </Button>
    </form>
  );
}

export function ContactSection() {
  const contact = useQuery(api.queries.getContactInfo);
  const t = useTranslations("contact");
  const { isRTL } = useDirection();

  return (
    <section className="py-24" id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            {t("heading")}
          </h2>
          <p className="text-muted-foreground">{t("subheading")}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-4">
            {!contact ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="bg-surface border-border/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card className="bg-surface border-border/50 hover:border-accent/30 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                      <a href={`tel:${contact.phone}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                        {contact.phone}
                      </a>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-surface border-border/50 hover:border-accent/30 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                        {contact.email}
                      </a>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-surface border-border/50 hover:border-accent/30 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                      <p className="text-sm font-medium text-foreground">
                        {isRTL ? contact.address_ar : contact.address_en}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {contact.instagram && (
                  <Card className="bg-surface border-border/50 hover:border-accent/30 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Globe className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Instagram</p>
                        <a
                          href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                        >
                          {contact.instagram}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {contact.bookingUrl && (
                  <a href={contact.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-accent hover:bg-accent-hover text-background gap-2">
                      <Calendar className="h-4 w-4" />
                      Book a Tasting
                    </Button>
                  </a>
                )}
              </>
            )}
          </div>
          <div className="lg:col-span-3">
            <Card className="bg-surface border-border/50">
              <CardContent className="p-6">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
