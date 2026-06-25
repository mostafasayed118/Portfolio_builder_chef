"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { Menu, ChefHat } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDirection } from "@/hooks/useDirection";

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { isRTL } = useDirection();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-tight text-foreground hover:text-accent transition-colors duration-200 flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-accent" />
            </div>
            {t("site.title")}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md cursor-pointer",
                  "hover:text-accent hover:bg-accent/5",
                  pathname === item.href
                    ? "text-accent after:absolute after:bottom-0 after:start-3 after:end-3 after:h-0.5 after:bg-accent after:rounded-full after:transition-all after:duration-300"
                    : "text-muted-foreground",
                )}
              >
                {t(item.label)}
              </Link>
            ))}
            <div className="ms-2">
              <Link href="/contact">
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent-hover text-background px-5 shadow-accent hover:shadow-glow transition-all duration-300"
                >
                  {t("nav.bookNow")}
                </Button>
              </Link>
            </div>
            <LanguageToggle />
            <ThemeToggle />
          </nav>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" aria-label="Menu" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"}>
              <nav className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors duration-200 cursor-pointer",
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
    </div>
  );
}
