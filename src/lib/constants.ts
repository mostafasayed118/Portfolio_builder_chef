import type { MenuCategory } from "@/types";

export const LOCALES = ["en", "ar"] as const;
export const DEFAULT_LOCALE = "en" as const;

export const SITE_NAME = "Chef Amira";

export const MENU_CATEGORIES: Array<{
  id: MenuCategory;
  label_en: string;
  label_ar: string;
}> = [
  { id: "cakes", label_en: "Cakes", label_ar: "الكيك" },
  { id: "pastries", label_en: "Pastries", label_ar: "المعجنات" },
  { id: "cookies", label_en: "Cookies", label_ar: "البسكويت" },
  { id: "seasonal", label_en: "Seasonal", label_ar: "الموسمي" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "nav.home" },
  { href: "/menu", label: "nav.menu" },
  { href: "/about", label: "nav.about" },
  { href: "/contact", label: "nav.contact" },
] as const;

export const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET!,
  cookieName: "bakery-admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};
