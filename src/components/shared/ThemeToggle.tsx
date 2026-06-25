"use client";

import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

type Props = {
  variant?: "navbar" | "sidebar";
};

export function ThemeToggle({ variant = "navbar" }: Props) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return variant === "sidebar" ? (
      <div className="flex items-center gap-3 px-3 py-2"><div className="h-5 w-5" /><span className="text-sm text-muted-foreground">Theme</span></div>
    ) : (
      <div className="h-5 w-5" />
    );
  }

  if (variant === "sidebar") {
    return (
      <button onClick={toggleTheme} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground w-full">
        {theme === "dark" ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
