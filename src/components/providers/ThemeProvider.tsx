"use client";

import { useEffect, useRef } from "react";
import type { ThemeTokens } from "@/lib/theme-presets";
import { deriveDarkFromLight } from "@/lib/theme-utils";

type ThemeData = {
  light: ThemeTokens;
  dark?: ThemeTokens | null;
} | null;

const TOKEN_TO_CSS_VAR: Record<keyof ThemeTokens, string> = {
  background: "--background",
  foreground: "--text-primary",
  accent: "--accent",
  accentForeground: "--accent-hover",
  muted: "--surface-elevated",
  mutedForeground: "--text-secondary",
  border: "--border",
  card: "--surface",
  destructive: "--error",
};

function applyTokensToRoot(tokens: ThemeTokens) {
  const root = document.documentElement;
  const style = root.style;

  for (const [key, cssVar] of Object.entries(TOKEN_TO_CSS_VAR)) {
    const value = tokens[key as keyof ThemeTokens];
    style.setProperty(cssVar, value);
  }

  style.setProperty("--color-background", tokens.background);
  style.setProperty("--color-foreground", tokens.foreground);
  style.setProperty("--color-primary", tokens.accent);
  style.setProperty("--color-primary-foreground", tokens.background);
  style.setProperty("--color-accent", tokens.accent);
  style.setProperty("--color-accent-foreground", tokens.background);
  style.setProperty("--color-muted", tokens.muted);
  style.setProperty("--color-muted-foreground", tokens.mutedForeground);
  style.setProperty("--color-card", tokens.card);
  style.setProperty("--color-card-foreground", tokens.foreground);
  style.setProperty("--color-border", tokens.border);
  style.setProperty("--color-destructive", tokens.destructive);
  style.setProperty("--color-ring", tokens.accent);
  style.setProperty("--color-input", tokens.muted);
  style.setProperty("--color-sidebar", tokens.card);
  style.setProperty("--color-sidebar-foreground", tokens.foreground);
  style.setProperty("--color-sidebar-primary", tokens.accent);
  style.setProperty("--color-sidebar-primary-foreground", tokens.background);
  style.setProperty("--color-sidebar-accent", tokens.muted);
  style.setProperty("--color-sidebar-accent-foreground", tokens.foreground);
  style.setProperty("--color-sidebar-border", tokens.border);
  style.setProperty("--color-sidebar-ring", tokens.accent);
}

export function ThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme?: ThemeData;
}) {
  const appliedRef = useRef(false);

  useEffect(() => {
    if (!theme) return;

    const raf = requestAnimationFrame(() => {
      applyTokensToRoot(theme.light);

      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        const darkTokens = theme.dark ?? deriveDarkFromLight(theme.light);
        applyTokensToRoot(darkTokens);
      }

      appliedRef.current = true;
    });

    return () => cancelAnimationFrame(raf);
  }, [theme]);

  useEffect(() => {
    if (!theme) return;

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      const darkTokens = theme.dark ?? deriveDarkFromLight(theme.light);
      applyTokensToRoot(isDark ? darkTokens : theme.light);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [theme]);

  return <>{children}</>;
}
