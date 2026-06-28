import type { ThemeTokens } from "./theme-presets";

function parseOklch(oklch: string): [number, number, number] | null {
  const match = oklch.match(
    /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+)?\s*\)/,
  );
  if (!match) return null;
  return [parseFloat(match[1]) / 100, parseFloat(match[2]), parseFloat(match[3])];
}

function formatOklch(L: number, C: number, h: number): string {
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${h.toFixed(0)})`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function deriveDarkFromLight(light: ThemeTokens): ThemeTokens {
  const parsed = parseOklch(light.background);
  if (!parsed) {
    return {
      background: "oklch(16.5% 0.018 52)",
      foreground: "oklch(95% 0.012 60)",
      accent: light.accent,
      accentForeground: "oklch(16.5% 0.018 52)",
      muted: "oklch(23% 0.022 50)",
      mutedForeground: "oklch(68% 0.025 52)",
      border: "oklch(28% 0.025 48)",
      card: "oklch(20% 0.020 50)",
      destructive: light.destructive,
    };
  }

  const [, , bgHue] = parsed;

  const bgLightness = clamp(0.165, 0.1, 0.25);
  const fgLightness = clamp(0.95, 0.9, 0.98);
  const mutedLightness = clamp(0.23, 0.18, 0.3);
  const mutedFgLightness = clamp(0.68, 0.55, 0.75);
  const borderLightness = clamp(0.28, 0.22, 0.35);
  const cardLightness = clamp(0.2, 0.15, 0.28);

  const accentParsed = parseOklch(light.accent);
  let darkAccent = light.accent;
  if (accentParsed) {
    const [aL, aC, aH] = accentParsed;
    darkAccent = formatOklch(clamp(aL + 0.08, 0.55, 0.78), aC, aH);
  }

  return {
    background: formatOklch(bgLightness, 0.018, bgHue),
    foreground: formatOklch(fgLightness, 0.012, bgHue + 5),
    accent: darkAccent,
    accentForeground: formatOklch(bgLightness, 0.018, bgHue),
    muted: formatOklch(mutedLightness, 0.022, bgHue - 2),
    mutedForeground: formatOklch(mutedFgLightness, 0.025, bgHue - 3),
    border: formatOklch(borderLightness, 0.025, bgHue - 4),
    card: formatOklch(cardLightness, 0.02, bgHue - 2),
    destructive: light.destructive,
  };
}

export function oklchToHex(oklch: string): string {
  const parsed = parseOklch(oklch);
  if (!parsed) return "#000000";

  const [L, C, hDeg] = parsed;
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const toSrgb = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(255, srgb * 255)));
  };

  return `#${toSrgb(r).toString(16).padStart(2, "0")}${toSrgb(g).toString(16).padStart(2, "0")}${toSrgb(bl).toString(16).padStart(2, "0")}`;
}

export function hexToOklch(hex: string): string | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;

  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);

  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + bVal * bVal);
  let h = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return formatOklch(L, C, h);
}
