"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center min-h-[60vh]">
      <h1 className="font-heading text-6xl font-bold text-error mb-4">!</h1>
      <h2 className="font-heading text-2xl text-foreground mb-2">
        {t("pageTitle")}
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">{t("pageMessage")}</p>
      <Button
        onClick={reset}
        className="bg-accent hover:bg-accent-hover text-background"
      >
        {t("tryAgain")}
      </Button>
    </div>
  );
}
