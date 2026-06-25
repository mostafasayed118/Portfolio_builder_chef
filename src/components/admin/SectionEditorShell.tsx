"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  breadcrumb?: string;
  children: ReactNode;
  onSave: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  hasUnsaved?: boolean;
  viewSiteHref?: string;
};

export function SectionEditorShell({
  title,
  breadcrumb,
  children,
  onSave,
  onCancel,
  isSaving = false,
  hasUnsaved = false,
  viewSiteHref,
}: Props) {
  const router = useRouter();
  const t = useTranslations("admin.shell");

  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  const handleCancel = useCallback(() => {
    if (hasUnsaved) {
      const proceed = window.confirm(t("unsavedConfirm"));
      if (!proceed) return;
    }
    if (onCancel) {
      onCancel();
    } else {
      router.push("/admin/dashboard");
    }
  }, [hasUnsaved, onCancel, router, t]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col gap-1 mb-6">
        {breadcrumb && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {breadcrumb}
          </button>
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {title}
          </h1>
          {viewSiteHref && (
            <a
              href={viewSiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              {t("viewSite")}
            </a>
          )}
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <div className="sticky bottom-0 mt-8 -mx-6 p-4 bg-background border-t border-border flex items-center justify-end gap-3">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          {t("cancel")}
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-accent hover:bg-accent-hover text-background min-w-[120px]"
        >
          {isSaving ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}
