export type Locale = "en" | "ar";

export type MenuCategory = "cakes" | "pastries" | "cookies" | "seasonal";

export interface HeroContent {
  heading_en: string;
  heading_ar: string;
  subheading_en: string;
  subheading_ar: string;
  ctaLabel_en: string;
  ctaLabel_ar: string;
  ctaSecondaryLabel_en: string;
  ctaSecondaryLabel_ar: string;
  imageUrl?: string;
}

export interface AboutContent {
  heading_en: string;
  heading_ar: string;
  bio_en: string;
  bio_ar: string;
  imageUrl?: string;
  skills: string[];
}

export interface MenuItem {
  id?: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  category: MenuCategory;
  imageUrl?: string;
  isAvailable: boolean;
  order: number;
}

export interface Testimonial {
  id?: string;
  quote_en: string;
  quote_ar: string;
  customerName: string;
  rating: number;
  isVisible: boolean;
}

export interface GalleryImage {
  id?: string;
  url: string;
  caption_en: string;
  caption_ar: string;
  order: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  instagram?: string;
  address_en: string;
  address_ar: string;
  bookingUrl?: string;
}

export interface SessionData {
  isLoggedIn: boolean;
  username: string;
}
