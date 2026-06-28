import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChefHat } from "lucide-react";

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "admin" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ChefHat className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {t("unauthorized.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("unauthorized.message")}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-accent hover:bg-accent-hover text-background px-6 py-3 text-sm font-medium transition-colors"
        >
          {t("unauthorized.backHome")}
        </Link>
      </div>
    </div>
  );
}
