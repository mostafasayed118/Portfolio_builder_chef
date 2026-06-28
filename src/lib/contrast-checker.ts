import type { ThemeTokens } from "./theme-presets";

function parseOklch(oklch: string): [number, number, number] | null {
  const match = oklch.match(
    /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+)?\s*\)/,
  );
  if (!match) return null;
  return [parseFloat(match[1]) / 100, parseFloat(match[2]), parseFloat(match[3])];
}

function oklchToLinearSrgb(L: number, C: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const rs = linearToSrgb(Math.max(0, Math.min(1, r)));
  const gs = linearToSrgb(Math.max(0, Math.min(1, g)));
  const bs = linearToSrgb(Math.max(0, Math.min(1, b)));
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(fg: string, bg: string): number | null {
  const fgParsed = parseOklch(fg);
  const bgParsed = parseOklch(bg);
  if (!fgParsed || !bgParsed) return null;

  const fgRgb = oklchToLinearSrgb(...fgParsed);
  const bgRgb = oklchToLinearSrgb(...bgParsed);

  const l1 = relativeLuminance(...fgRgb);
  const l2 = relativeLuminance(...bgRgb);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
}

export function checkContrast(fg: string, bg: string): ContrastResult | null {
  const ratio = getContrastRatio(fg, bg);
  if (ratio === null) return null;
  return {
    ratio: Math.round(ratio * 100) / 100,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
  };
}

export interface ThemeValidation {
  valid: boolean;
  criticalPass: boolean;
  issues: Array<{
    pair: string;
    fg: string;
    bg: string;
    ratio: number;
    level: "critical" | "warning";
  }>;
}

export function validateTheme(tokens: ThemeTokens): ThemeValidation {
  const issues: ThemeValidation["issues"] = [];

  const criticalPairs: Array<[string, keyof ThemeTokens, keyof ThemeTokens]> = [
    ["Text on Background", "foreground", "background"],
    ["Accent Text on Accent", "accentForeground", "accent"],
  ];

  const warningPairs: Array<[string, keyof ThemeTokens, keyof ThemeTokens]> = [
    ["Muted Text on Background", "mutedForeground", "background"],
    ["Muted Text on Card", "mutedForeground", "card"],
  ];

  for (const [pair, fgKey, bgKey] of criticalPairs) {
    const result = checkContrast(tokens[fgKey], tokens[bgKey]);
    if (result && !result.aaNormal) {
      issues.push({
        pair,
        fg: tokens[fgKey],
        bg: tokens[bgKey],
        ratio: result.ratio,
        level: "critical",
      });
    }
  }

  for (const [pair, fgKey, bgKey] of warningPairs) {
    const result = checkContrast(tokens[fgKey], tokens[bgKey]);
    if (result && !result.aaNormal) {
      issues.push({
        pair,
        fg: tokens[fgKey],
        bg: tokens[bgKey],
        ratio: result.ratio,
        level: "warning",
      });
    }
  }

  const criticalFailures = issues.filter((i) => i.level === "critical");
  return {
    valid: issues.length === 0,
    criticalPass: criticalFailures.length === 0,
    issues,
  };
}
