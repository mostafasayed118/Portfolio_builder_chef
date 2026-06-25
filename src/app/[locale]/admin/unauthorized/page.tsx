import { ChefHat } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-xl bg-destructive/10 flex items-center justify-center">
            <ChefHat className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-8">
          This area is restricted to authorized administrators only.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-background hover:bg-accent-hover transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
