"use client";

import { SignIn } from "@clerk/nextjs";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ChefHat } from "lucide-react";
import { useParams } from "next/navigation";

export default function AdminLoginPage() {
  const { locale } = useParams<{ locale: string }>();
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent/5 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-accent/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-accent" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">
              Chef Mohamed
            </span>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <blockquote className="font-heading text-2xl text-foreground leading-snug">
            &ldquo;Slow bread, French pastry, ten years at the bench.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">
            — Chef Mohamed
          </p>
        </div>
        <div className="relative z-10">
          <LanguageToggle />
        </div>
      </div>

      {/* Right panel — Clerk SignIn */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
              <ChefHat className="h-7 w-7 text-accent" />
            </div>
          </div>

          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-1">
            Admin
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Sign in to manage your bakery portfolio
          </p>

          <SignIn
            routing="hash"
            fallbackRedirectUrl={`/${locale}/admin/dashboard`}
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border border-border/50 bg-surface",
              },
            }}
          />

          <div className="mt-6 lg:hidden">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
