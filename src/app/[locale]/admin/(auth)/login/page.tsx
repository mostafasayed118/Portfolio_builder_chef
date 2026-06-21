"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Eye, EyeOff, ChefHat } from "lucide-react";

export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        toast.error(t("errorMsg"));
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      toast.error(t("errorMsg"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-accent/5 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-accent/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-accent" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">
              Chef Amira
            </span>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <blockquote className="font-heading text-2xl text-foreground leading-snug">
            &ldquo;Baking is not just a craft — it&rsquo;s how I tell stories.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">
            — Chef Amira
          </p>
        </div>
        <div className="relative z-10">
          <LanguageToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
              <ChefHat className="h-7 w-7 text-accent" />
            </div>
          </div>

          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-1">
            {t("heading")}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {t("subheading")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                {t("userLabel")}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={t("userPlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-surface border-border/50 focus:border-accent h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                {t("passLabel")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-surface border-border/50 focus:border-accent h-11 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-background h-11"
              disabled={loading}
            >
              {loading ? "Signing in..." : t("btn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
