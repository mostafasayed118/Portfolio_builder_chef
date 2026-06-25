"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale, useTranslations } from "next-intl";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { toast } from "sonner";
import { Mail, MailOpen, ChevronDown, ChevronUp, Inbox } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { formatEgyptTime } from "@convex/lib/timezone";

const REQUEST_TYPE_KEYS = [
  "consulting",
  "catering",
  "training",
  "partnerships",
  "other",
] as const;

export default function AdminInboxPage() {
  const t = useTranslations("admin.inbox");
  const tTypes = useTranslations("contact.form.requestTypes");
  const locale = useLocale() as "en" | "ar";
  const inquiries = useQuery(api.queries.getContactInquiries);
  const markRead = useMutation(api.mutations.markInquiryRead);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleToggleRead(id: string, currentRead: boolean) {
    try {
      await markRead({ id: id as Id<"contactInquiries"> });
      toast.success(currentRead ? t("markedUnread") : t("markedRead"));
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  function getRequestTypeLabel(raw: string): string {
    const key = REQUEST_TYPE_KEYS.find((k) => k === raw);
    return key ? tTypes(key) : raw;
  }

  const unreadCount = inquiries?.filter((i) => !i.isRead).length ?? 0;

  return (
    <SectionEditorShell
      title={t("title")}
      breadcrumb={t("breadcrumb")}
      onSave={() => {}}
      isSaving={false}
      hasUnsaved={false}
    >
      {!inquiries ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-surface border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <Card className="bg-surface border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h3 className="font-heading text-xl text-foreground mb-2">
              {t("emptyTitle")}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t("emptyDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("totalCount", { count: inquiries.length })}
              {unreadCount > 0 && (
                <span className="ms-2">
                  <Badge variant="default" className="bg-accent text-accent-foreground text-xs">
                    {t("unreadCount", { count: unreadCount })}
                  </Badge>
                </span>
              )}
            </p>
          </div>

          <div className="space-y-2">
            {inquiries.map((item) => {
              const isExpanded = expandedId === item._id;
              return (
                <Card
                  key={item._id}
                  className={`bg-surface border-border/50 transition-colors ${
                    !item.isRead
                      ? "border-s-[3px] border-s-accent"
                      : ""
                  }`}
                >
                  <CardContent className="p-0">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedId(isExpanded ? null : item._id);
                        }
                      }}
                      className="flex w-full items-center gap-3 p-4 text-start hover:bg-surface-elevated/30 transition-colors cursor-pointer"
                    >
                      <div className={`shrink-0 ${!item.isRead ? "text-accent" : "text-muted-foreground"}`}>
                        {item.isRead ? (
                          <MailOpen className="h-5 w-5" />
                        ) : (
                          <Mail className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium truncate ${!item.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                            {item.name}
                          </span>
                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.email}
                          {item.requestType && (
                            <>
                              <span className="mx-1">·</span>
                              {getRequestTypeLabel(item.requestType)}
                            </>
                          )}
                          <span className="mx-1">·</span>
                          {formatEgyptTime(item.createdAt, locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRead(item._id, item.isRead);
                          }}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {item.isRead ? t("markUnread") : t("markRead")}
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border/50 px-4 py-4 space-y-3">
                        {item.phone && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {t("phoneLabel")}
                            </span>
                            <p className="text-sm text-foreground mt-0.5">
                              {item.phone}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t("requestTypeLabel")}
                          </span>
                          <p className="text-sm text-foreground mt-0.5">
                            {getRequestTypeLabel(item.requestType)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t("messageLabel")}
                          </span>
                          <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
                            {item.message}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t("receivedLabel")}
                          </span>
                          <p className="text-sm text-foreground mt-0.5">
                            {formatEgyptTime(item.createdAt, locale)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </SectionEditorShell>
  );
}
