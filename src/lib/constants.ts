import type { MenuCategory } from "@/types";

export const LOCALES = ["en", "ar"] as const;
export const DEFAULT_LOCALE = "en" as const;

export const SITE_NAME = "Chef Mohamed";

export const MENU_CATEGORIES: Array<{
  id: MenuCategory;
  label_en: string;
  label_ar: string;
}> = [
  { id: "breads", label_en: "Breads", label_ar: "الخبز" },
  { id: "cakes", label_en: "Cakes", label_ar: "الكيك" },
  { id: "pastries", label_en: "Pastries", label_ar: "المعجنات" },
  { id: "cookies", label_en: "Cookies", label_ar: "البسكويت" },
  { id: "seasonal", label_en: "Seasonal", label_ar: "الموسمي" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "nav.home" },
  { href: "/about", label: "nav.about" },
  { href: "/services", label: "nav.services" },
  { href: "/craft-practice", label: "nav.craftPractice" },
  { href: "/menu", label: "nav.menu" },
  { href: "/gallery", label: "nav.gallery" },
  { href: "/contact", label: "nav.contact" },
] as const;
