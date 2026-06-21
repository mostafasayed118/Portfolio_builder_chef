"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { Languages } from "lucide-react";

type Props = {
  variant?: "navbar" | "sidebar";
};

export function LanguageToggle({ variant = "navbar" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const nextLocale = locale === "en" ? "ar" : "en";

  function switchLocale() {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={switchLocale}
        disabled={isPending}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground w-full"
      >
        <Languages className="h-4 w-4 shrink-0" />
        {nextLocale === "ar" ? "عربي" : "English"}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      disabled={isPending}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      {nextLocale === "ar" ? "عربي" : "EN"}
    </Button>
  );
}
