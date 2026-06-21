"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Globe, Mail, Phone } from "lucide-react";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 text-foreground">
              {t("site.title")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("site.tagline")}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">{t("nav.home")}</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/menu" className="hover:text-accent transition-colors">
                {t("nav.menu")}
              </Link>
              <Link href="/about" className="hover:text-accent transition-colors">
                {t("nav.about")}
              </Link>
              <Link href="/contact" className="hover:text-accent transition-colors">
                {t("nav.contact")}
              </Link>
            </nav>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">{t("contact.heading")}</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a href="tel:+15551234567" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4 shrink-0" />
                +1 (555) 123-4567
              </a>
              <a href="mailto:hello@chefamira.com" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4 shrink-0" />
                hello@chefamira.com
              </a>
              <a href="https://instagram.com/chefamira" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Globe className="h-4 w-4 shrink-0" />
                @chefamira
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {t("site.title")}. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
