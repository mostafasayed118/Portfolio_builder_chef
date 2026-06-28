export interface ThemeTokens {
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  card: string;
  destructive: string;
}

export interface PresetTheme {
  label_en: string;
  label_ar: string;
  light: ThemeTokens;
  dark?: ThemeTokens;
}

export const PRESET_THEMES: Record<string, PresetTheme> = {
  "bakery-gold": {
    label_en: "Bakery Gold",
    label_ar: "ذهبي المخبز",
    light: {
      background: "oklch(96% 0.012 55)",
      foreground: "oklch(15% 0.02 50)",
      accent: "oklch(68% 0.095 62)",
      accentForeground: "oklch(15% 0.005 55)",
      muted: "oklch(92% 0.01 55)",
      mutedForeground: "oklch(35% 0.02 50)",
      border: "oklch(88% 0.01 55)",
      card: "oklch(97% 0.01 55)",
      destructive: "oklch(55% 0.2 25)",
    },
  },
  chocolate: {
    label_en: "Dark Chocolate",
    label_ar: "شوكولاتة داكنة",
    light: {
      background: "oklch(95% 0.015 45)",
      foreground: "oklch(15% 0.03 40)",
      accent: "oklch(45% 0.08 40)",
      accentForeground: "oklch(15% 0.01 50)",
      muted: "oklch(90% 0.02 45)",
      mutedForeground: "oklch(35% 0.03 40)",
      border: "oklch(85% 0.02 45)",
      card: "oklch(96% 0.015 45)",
      destructive: "oklch(55% 0.2 25)",
    },
  },
  matcha: {
    label_en: "Matcha Green",
    label_ar: "أخضر ماتشا",
    light: {
      background: "oklch(96% 0.01 120)",
      foreground: "oklch(15% 0.02 120)",
      accent: "oklch(55% 0.12 130)",
      accentForeground: "oklch(15% 0.005 120)",
      muted: "oklch(92% 0.01 120)",
      mutedForeground: "oklch(35% 0.02 120)",
      border: "oklch(88% 0.01 120)",
      card: "oklch(97% 0.01 120)",
      destructive: "oklch(55% 0.2 25)",
    },
  },
  berry: {
    label_en: "Berry Rose",
    label_ar: "وردي التوت",
    light: {
      background: "oklch(96% 0.012 350)",
      foreground: "oklch(15% 0.02 350)",
      accent: "oklch(60% 0.15 350)",
      accentForeground: "oklch(15% 0.005 350)",
      muted: "oklch(92% 0.01 350)",
      mutedForeground: "oklch(35% 0.02 350)",
      border: "oklch(88% 0.01 350)",
      card: "oklch(97% 0.012 350)",
      destructive: "oklch(55% 0.2 25)",
    },
  },
};

export const DEFAULT_THEME = PRESET_THEMES["bakery-gold"];

export const TOKEN_LABELS: Record<keyof ThemeTokens, { en: string; ar: string }> = {
  background: { en: "Background", ar: "الخلفية" },
  foreground: { en: "Text", ar: "النصوص" },
  accent: { en: "Accent", ar: "اللون المميز" },
  accentForeground: { en: "Accent Text", ar: "نصوص اللون المميز" },
  muted: { en: "Muted Background", ar: "خلفية هادئة" },
  mutedForeground: { en: "Muted Text", ar: "نصوص هادئة" },
  border: { en: "Borders", ar: "الحدود" },
  card: { en: "Card Background", ar: "خلفية البطاقات" },
  destructive: { en: "Error/Danger", ar: "خطأ/خطر" },
};
