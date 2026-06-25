"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "chef-bakery-theme";
const DEFAULT_THEME = "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
    setThemeState(initial);
    document.documentElement.classList.toggle("light", initial === "light");
    document.documentElement.classList.toggle("dark", initial !== "light");
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
