export type Locale = "en" | "ar";

export type MenuCategory = "breads" | "cakes" | "pastries" | "cookies" | "seasonal";

export type ProjectCategory = "early" | "specialization" | "leadership" | "founder" | "international";

export type LocationRegion = "cairo" | "international";

export interface HeroContent {
  heading_en: string;
  heading_ar: string;
  subheading_en: string;
  subheading_ar: string;
  ctaLabel_en: string;
  ctaLabel_ar: string;
  imageUrl: string | null;
}

export interface AboutContent {
  heading_en: string;
  heading_ar: string;
  bio_en: string;
  bio_ar: string;
  imageUrl: string | null;
  skills: string[];
  stats?: string[];
  tagline_en?: string | null;
  tagline_ar?: string | null;
  education_en?: string | null;
  education_ar?: string | null;
}

export interface MenuItem {
  id?: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number | null;
  category: MenuCategory;
  imageUrl: string | null;
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
  url: string | null;
  storageId: string | null;
  caption_en: string;
  caption_ar: string;
  order: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  instagram: string | null;
  address_en: string;
  address_ar: string;
  bookingUrl: string | null;
  whatsapp?: string | null;
  responseTime_en?: string | null;
  responseTime_ar?: string | null;
  secondaryPhone?: string | null;
  requestTypes?: RequestType[];
  businessHours?: BusinessHoursNote;
}

export interface RequestType {
  value: string;
  label_en: string;
  label_ar: string;
}

export interface BusinessHoursNote {
  note_en: string;
  note_ar: string;
}

export interface Project {
  id?: string;
  role_en: string;
  role_ar: string;
  workplace_en: string;
  workplace_ar: string;
  location_en: string;
  location_ar: string;
  description_en?: string;
  description_ar?: string;
  category: ProjectCategory;
  imageUrl: string | null;
  order: number;
  isVisible: boolean;
  isHighlight?: boolean;
}

export interface Location {
  id?: string;
  name_en: string;
  name_ar: string;
  region: LocationRegion;
  neighborhoods: string[];
  neighborhoods_ar: string[];
  markerIcon: string;
  order: number;
  isVisible: boolean;
}
