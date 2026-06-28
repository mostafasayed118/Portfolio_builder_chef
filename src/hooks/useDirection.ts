"use client";

import { useLocale } from "next-intl";

export function useDirection() {
  const locale = useLocale();
  return {
    dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const),
    isRTL: locale === "ar",
    locale,
  };
}

export type Direction = ReturnType<typeof useDirection>;
