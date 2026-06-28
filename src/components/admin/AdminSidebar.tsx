"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LayoutGrid,
  Palette,
  Search,
  BookOpen,
  User,
  Utensils,
  MessageSquare,
  Image,
  Mail,
  Briefcase,
  Cog,
  MapPin,
  Inbox,
  LogOut,
  Video,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

const sidebarLinks = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/sections", labelKey: "sections", icon: LayoutGrid },
  { href: "/admin/theme", labelKey: "theme", icon: Palette },
  { href: "/admin/seo", labelKey: "seo", icon: Search },
  { href: "/admin/hero", labelKey: "hero", icon: BookOpen },
  { href: "/admin/about", labelKey: "about", icon: User },
  { href: "/admin/projects", labelKey: "projects", icon: Briefcase },
  { href: "/admin/menu", labelKey: "menu", icon: Utensils },
  { href: "/admin/testimonials", labelKey: "testimonials", icon: MessageSquare },
  { href: "/admin/services", labelKey: "services", icon: Cog },
  { href: "/admin/videos", labelKey: "videos", icon: Video },
  { href: "/admin/gallery", labelKey: "gallery", icon: Image },
  { href: "/admin/locations", labelKey: "locations", icon: MapPin },
  { href: "/admin/contact", labelKey: "contact", icon: Mail },
  { href: "/admin/inbox", labelKey: "inbox", icon: Inbox },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const t = useTranslations("admin.nav");
  const tSite = useTranslations("site");

  return (
    <aside className="flex h-full w-full flex-col bg-surface border-border border-s">
      <div className="flex h-16 items-center gap-3 px-4 border-b border-border shrink-0">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight text-foreground truncate"
        >
          {tSite("title")}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 min-h-[48px] px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-surface-elevated text-accent border-s-[3px] border-accent ps-[calc(0.75rem-3px)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/50 border-s-[3px] border-transparent",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{t(link.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-2 shrink-0">
        <LanguageToggle variant="sidebar" />
        <ThemeToggle variant="sidebar" />
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-3 w-full min-h-[48px] px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-elevated/50 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
