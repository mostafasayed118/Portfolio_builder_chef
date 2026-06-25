import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export async function CTABanner({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as "en" | "ar", namespace: "cta" });

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent-hover to-accent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(100%_0_0_/_0.1),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_oklch(0%_0_0_/_0.08),_transparent_50%)]" />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/5 animate-float-slow" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary-foreground/5 animate-float" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          <span className="text-xs font-medium text-primary-foreground tracking-wide uppercase">
            Order Now
          </span>
        </div>

        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
          {t("heading")}
        </h2>
        <p className="text-primary-foreground/80 max-w-lg mx-auto mb-10 text-lg">
          {t("subheading")}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/contact">
            <Button
              size="lg"
              className="group bg-background text-foreground hover:bg-background/90 border border-accent-foreground/10 text-base px-8 cursor-pointer shadow-float hover:shadow-xl transition-all duration-300"
            >
              {t("primary")}
              <ArrowRight className="h-4 w-4 ms-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/menu">
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 cursor-pointer transition-all duration-300"
            >
              {t("secondary")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
