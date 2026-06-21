"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDirection } from "@/hooks/useDirection";

const NAV_ITEMS = [
  { href: "/", label: "nav.home" },
  { href: "/menu", label: "nav.menu" },
  { href: "/about", label: "nav.about" },
  { href: "/contact", label: "nav.contact" },
] as const;

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { isRTL } = useDirection();
  const [open, setOpen] = useState(false);

  return (
    <div className="container mx-auto px-4">
      <div className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-foreground"
        >
          {t("site.title")}
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition-colors rounded-md",
                "hover:text-accent",
                pathname === item.href
                  ? "text-accent after:absolute after:bottom-0 after:start-3 after:end-3 after:h-0.5 after:bg-accent after:rounded-full"
                  : "text-muted-foreground",
              )}
            >
              {t(item.label)}
            </Link>
          ))}
          <div className="ms-2">
            <Link href="/contact">
              <Button size="sm" className="bg-accent hover:bg-accent-hover text-background px-4">
                {t("nav.bookNow")}
              </Button>
            </Link>
          </div>
          <LanguageToggle />
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" aria-label="Menu" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side={isRTL ? "left" : "right"}>
            <nav className="flex flex-col gap-4 mt-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors",
                    pathname === item.href
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(item.label)}
                </Link>
              ))}
              <Link href="/contact" onClick={() => setOpen(false)}>
                <Button className="w-full bg-accent hover:bg-accent-hover text-background">
                  {t("nav.bookNow")}
                </Button>
              </Link>
              <LanguageToggle variant="sidebar" />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
