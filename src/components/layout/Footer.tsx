"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Globe, Mail, MessageCircle, Phone, ChefHat } from "lucide-react";
import { useMemo } from "react";

const FOOTER_NAV = [
  { href: "/about", labelKey: "nav.about", sectionKey: "about" },
  { href: "/services", labelKey: "nav.services", sectionKey: "services" },
  { href: "/craft-practice", labelKey: "nav.craftPractice", sectionKey: "craftPractice" },
  { href: "/menu", labelKey: "nav.menu", sectionKey: "menu" },
  { href: "/gallery", labelKey: "nav.gallery", sectionKey: "gallery" },
  { href: "/contact", labelKey: "nav.contact", sectionKey: "contact" },
];

export function Footer() {
  const t = useTranslations();
  const contact = useQuery(api.queries.getContactInfo);
  const visibleSections = useQuery(api.queries.getVisibleSections);

  const visibleKeys = useMemo(() => {
    if (!visibleSections) return null;
    return new Set(visibleSections.map((s) => s.sectionKey));
  }, [visibleSections]);

  const filteredNav = useMemo(() => {
    if (!visibleKeys) return FOOTER_NAV;
    return FOOTER_NAV.filter((item) => visibleKeys.has(item.sectionKey));
  }, [visibleKeys]);

  return (
    <footer className="border-t border-border/40 bg-surface relative">
      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" aria-hidden="true" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors duration-200">
                <ChefHat className="h-4 w-4 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-accent transition-colors duration-200">
                {t("site.title")}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("site.tagline")}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground font-heading">{t("footer.navigation")}</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              {filteredNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-accent transition-colors duration-200 cursor-pointer"
                >
                  {t(item.labelKey as "nav.about" | "nav.services" | "nav.craftPractice" | "nav.menu" | "nav.gallery" | "nav.contact")}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground font-heading">{t("contact.heading")}</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              {contact?.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 hover:text-accent transition-colors duration-200 cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/12 transition-colors duration-200">
                    <Phone className="h-4 w-4 text-accent" />
                  </div>
                  <span dir="ltr">{contact.phone}</span>
                </a>
              )}
              {contact?.whatsapp && (
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-accent transition-colors duration-200 cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/12 transition-colors duration-200">
                    <MessageCircle className="h-4 w-4 text-accent" />
                  </div>
                  {t("contact.whatsappLabel")}
                </a>
              )}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 hover:text-accent transition-colors duration-200 cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/12 transition-colors duration-200">
                    <Mail className="h-4 w-4 text-accent" />
                  </div>
                  {contact.email}
                </a>
              )}
              {contact?.instagram && (
                <a
                  href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-accent transition-colors duration-200 cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/12 transition-colors duration-200">
                    <Globe className="h-4 w-4 text-accent" />
                  </div>
                  @{contact.instagram.replace("@", "")}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          &copy; {new Date().getFullYear()} {t("site.title")}. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
