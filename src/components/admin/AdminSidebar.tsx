"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Utensils,
  MessageSquare,
  Image,
  Mail,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero Section", icon: BookOpen },
  { href: "/admin/about", label: "About Me", icon: User },
  { href: "/admin/menu", label: "Menu Items", icon: Utensils },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/contact", label: "Contact Info", icon: Mail },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <aside className="flex h-full w-full flex-col bg-surface border-border border-s">
      <div className="flex h-16 items-center gap-3 px-4 border-b border-border shrink-0">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight text-foreground truncate"
        >
          Chef Amira
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
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-2 shrink-0">
        <LanguageToggle variant="sidebar" />
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full min-h-[48px] px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-elevated/50 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
