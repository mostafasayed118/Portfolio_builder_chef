import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="py-20 bg-accent">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-background mb-4">
          Ready to taste perfection?
        </h2>
        <p className="text-background/80 max-w-lg mx-auto mb-8">
          Book a tasting session or place a custom order. We&apos;d love to bake for you.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/contact">
            <Button
              variant="outline"
              size="lg"
              className="border-background text-background hover:bg-background hover:text-accent text-base px-8"
            >
              Book a Tasting
            </Button>
          </Link>
          <Link href="/menu">
            <Button
              size="lg"
              className="bg-background text-accent hover:bg-background/90 text-base px-8"
            >
              View Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
