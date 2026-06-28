"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactForm } from "./ContactForm";
import { useDirection } from "@/hooks/useDirection";
import { motion, useReducedMotion } from "motion/react";
import { Phone, Mail, Globe, MapPin, Calendar, MessageCircle, Clock, ExternalLink, Send } from "lucide-react";
import { getBilingualField } from "@/lib/bilingual";

export function ContactSection() {
  const contact = useQuery(api.queries.getContactInfo);
  const t = useTranslations("contact");
  const tSite = useTranslations("site");
  const { isRTL, locale } = useDirection();
  const shouldReduce = useReducedMotion();

  function renderContactCards() {
    // Loading
    if (contact === undefined) {
      return Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-surface border-border/40">
          <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 flex-1" />
          </CardContent>
        </Card>
      ));
    }

    // No data seeded yet
    if (contact === null) {
      return (
        <p className="text-sm text-muted-foreground py-4">{tSite("setupInProgress")}</p>
      );
    }

    // Has data
    return (
      <>
        {contact.phone && (
          <ContactCard
            icon={Phone}
            label={t("phoneLabel")}
            href={`tel:${contact.phone}`}
            value={contact.phone}
            dir="ltr"
          />
        )}
        {contact.email && (
          <ContactCard
            icon={Mail}
            label={t("emailLabel")}
            href={`mailto:${contact.email}`}
            value={contact.email}
          />
        )}
        {contact.whatsapp && (
          <ContactCard
            icon={MessageCircle}
            label={t("whatsappLabel")}
            href={contact.whatsapp}
            value={contact.secondaryPhone ?? "WhatsApp"}
            dir={contact.secondaryPhone ? "ltr" : undefined}
          />
        )}
        {contact.responseTime_en && (
          <ContactCard
            icon={Clock}
            label={t("responseLabel")}
            value={getBilingualField(locale, contact.responseTime_ar, contact.responseTime_en)}
          />
        )}
        <ContactCard
          icon={MapPin}
          label={t("addressLabel")}
          value={getBilingualField(locale, contact.address_ar, contact.address_en)}
        />
        {contact.instagram && (
          <ContactCard
            icon={Globe}
            label={t("instagramLabel")}
            href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
            value={contact.instagram}
          />
        )}
        {contact.bookingUrl && (
          <a href={contact.bookingUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-accent hover:bg-accent-hover text-background gap-2 cursor-pointer shadow-accent hover:shadow-glow transition-all duration-300">
              <Calendar className="h-4 w-4" /> {t("bookBtn")}
            </Button>
          </a>
        )}
        {contact.whatsapp && (
          <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-success hover:bg-success text-background border-transparent gap-2 text-base py-6 cursor-pointer transition-all duration-300">
              <MessageCircle className="h-4 w-4" /> {t("whatsappLabel")}
              <ExternalLink className="h-3 w-3 ms-auto" />
            </Button>
          </a>
        )}
        {contact.businessHours && (
          <Card className="bg-surface border-border/40 hover:border-accent/15 transition-colors duration-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t("businessHoursLabel")}</p>
                <p className="text-sm font-medium text-foreground">
                  {getBilingualField(locale, contact.businessHours.note_ar, contact.businessHours.note_en)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  return (
    <section className="py-24 relative" id="contact">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{t("heading")}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t("subheading")}</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, x: isRTL ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {renderContactCards()}
          </motion.div>
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, x: isRTL ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="bg-surface border-border/40 hover:border-accent/15 transition-colors duration-300 shadow-card">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Send className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{t("heading")}</h3>
                </div>
                <ContactForm />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  label,
  href,
  value,
  dir,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <Card className="bg-surface border-border/40 hover:border-accent/20 hover:shadow-card transition-all duration-300 group cursor-pointer">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors duration-200">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          {href ? (
            <a
              href={href}
              target={href.startsWith("https://") ? "_blank" : undefined}
              rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
              className="text-sm font-medium text-foreground hover:text-accent transition-colors duration-200"
              dir={dir}
            >
              {value}
            </a>
          ) : (
            <p className="text-sm font-medium text-foreground" dir={dir}>{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
