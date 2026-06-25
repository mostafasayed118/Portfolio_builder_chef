import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  params?: Promise<{ locale: string }>;
};

export default async function NotFoundPage({ params }: Props) {
  let locale = "en";
  try {
    const resolved = await params;
    if (resolved?.locale) locale = resolved.locale;
  } catch {
    // params may be undefined when triggered outside [locale] context
  }

  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "errors" });

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center min-h-[60vh]">
      <h1 className="font-heading text-8xl font-bold text-accent mb-4">404</h1>
      <h2 className="font-heading text-2xl text-foreground mb-2">
        {t("notFoundTitle")}
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        {t("notFoundMessage")}
      </p>
      <Link href="/">
        <Button className="bg-accent hover:bg-accent-hover text-background">
          {t("backHome")}
        </Button>
      </Link>
    </div>
  );
}
