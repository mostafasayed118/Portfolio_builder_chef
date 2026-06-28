"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "chef-bakery-theme";
const DEFAULT_THEME = "dark";

function getInitialTheme(): string {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
}

export function useTheme() {
  const [theme, setThemeState] = useState<string>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: string) => {
    const resolved = newTheme === "light" ? "light" : "dark";
    setThemeState(resolved);
    localStorage.setItem(STORAGE_KEY, resolved);
    document.documentElement.classList.toggle("light", resolved === "light");
    document.documentElement.classList.toggle("dark", resolved !== "light");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, mounted };
}
