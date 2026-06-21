import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NotFoundPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center min-h-[60vh]">
      <h1 className="font-heading text-8xl font-bold text-accent mb-4">404</h1>
      <h2 className="font-heading text-2xl text-foreground mb-2">
        {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        {isAr
          ? "عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها"
          : "Sorry, the page you are looking for doesn't exist or has been moved"}
      </p>
      <Link href="/">
        <Button className="bg-accent hover:bg-accent-hover text-background">
          {isAr ? "العودة إلى الرئيسية" : "Back to Home"}
        </Button>
      </Link>
    </div>
  );
}
