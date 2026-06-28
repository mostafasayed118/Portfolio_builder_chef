"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { toast } from "sonner";
import {
  Mail,
  MailOpen,
  ChevronDown,
  ChevronUp,
  Inbox,
  Archive,
  ArchiveRestore,
  CheckSquare,
  Square,
  X,
  Eye,
  EyeOff,
  MessageCircle,
  Download,
  AlertTriangle,
} from "lucide-react";
import type { Id, Doc } from "@convex/_generated/dataModel";
import { formatEgyptTime, formatRelativeEgyptTime } from "@convex/lib/timezone";

type Status = "new" | "contacted" | "quoted" | "won" | "lost";

const STATUS_ORDER: Status[] = ["new", "contacted", "quoted", "won", "lost"];
const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000;

export default function AdminInboxPage() {
  return (
    <Suspense
      fallback={
        <SectionEditorShell
          title="Inbox"
          breadcrumb="Dashboard"
          onSave={() => {}}
          isSaving={false}
          hasUnsaved={false}
        >
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
        </SectionEditorShell>
      }
    >
      <AdminInboxContent />
    </Suspense>
  );
}

function statusBadgeVariant(status: string | undefined): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "new": return "destructive";
    case "contacted": return "default";
    case "quoted": return "secondary";
    case "won": return "default";
    case "lost": return "outline";
    default: return "secondary";
  }
}

function AdminInboxContent() {
  const t = useTranslations("admin.inbox");
  const tNav = useTranslations("admin.nav");
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // View + status filter from URL
  const currentView = searchParams.get("view") === "archived" ? "archived" : "active";
  const isArchivedView = currentView === "archived";
  const currentStatus = searchParams.get("status") as Status | null;

  const inquiries = useQuery(api.queries.getContactInquiries, {
    showArchived: isArchivedView,
  });
  const staleCount = useQuery(api.queries.getStaleInquiryCount);
  const contactInfo = useQuery(api.queries.getContactInfo);

  const markRead = useMutation(api.mutations.markInquiryRead);
  const unmarkRead = useMutation(api.mutations.unmarkInquiryRead);
  const archiveMut = useMutation(api.mutations.archiveInquiries);
  const unarchiveMut = useMutation(api.mutations.unarchiveInquiries);
  const batchMarkMut = useMutation(api.mutations.batchMarkInquiriesRead);
  const updateStatus = useMutation(api.mutations.updateInquiryStatus);
  const updateNotes = useMutation(api.mutations.updateInquiryNotes);
  const exportMut = useMutation(api.mutations.getInquiriesExport);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "archive" | "unarchive";
    count: number;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  // ─── Filtered list ───────────────────────────────────────────────────────

  const filteredInquiries = useMemo(() => {
    if (!inquiries) return undefined;
    if (!currentStatus) return inquiries;
    // Show items with matching status OR status undefined/null when filter is "new"
    return inquiries.filter((item) => {
      if (currentStatus === "new") return !item.status || item.status === "new";
      return item.status === currentStatus;
    });
  }, [inquiries, currentStatus]);

  const setView = useCallback(
    (view: "active" | "archived") => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("status");
      if (view === "archived") params.set("view", "archived");
      else params.delete("view");
      router.replace(`${pathname}?${params.toString()}`);
      setSelectedIds(new Set());
      setExpandedId(null);
    },
    [router, pathname, searchParams],
  );

  const setStatusFilter = useCallback(
    (status: Status | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status) params.set("status", status);
      else params.delete("status");
      router.replace(`${pathname}?${params.toString()}`);
      setSelectedIds(new Set());
      setExpandedId(null);
    },
    [router, pathname, searchParams],
  );

  // ─── Selection ───────────────────────────────────────────────────────────

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredIds = useMemo(
    () => filteredInquiries?.map((i) => i._id as string) ?? [],
    [filteredInquiries],
  );

  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));

  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredIds));
  }, [allSelected, filteredIds]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function handleToggleRead(id: string, currentRead: boolean) {
    try {
      if (currentRead) {
        await unmarkRead({ id: id as Id<"contactInquiries"> });
        toast.success(t("markedUnread"));
      } else {
        await markRead({ id: id as Id<"contactInquiries"> });
        toast.success(t("markedRead"));
      }
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  async function handleBatchMarkRead(isRead: boolean) {
    const ids = [...selectedIds] as Id<"contactInquiries">[];
    if (ids.length === 0) return;
    try {
      await batchMarkMut({ ids, isRead });
      toast.success(isRead ? t("batchReadSuccess", { count: ids.length }) : t("batchUnreadSuccess", { count: ids.length }));
      setSelectedIds(new Set());
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  async function handleArchive() {
    const ids = [...selectedIds] as Id<"contactInquiries">[];
    if (ids.length === 0) return;
    try {
      await archiveMut({ ids });
      toast.success(t("archiveSuccess", { count: ids.length }));
      setSelectedIds(new Set());
    } catch {
      toast.error(t("updateFailed"));
    }
    setConfirmDialog(null);
  }

  async function handleUnarchive() {
    const ids = [...selectedIds] as Id<"contactInquiries">[];
    if (ids.length === 0) return;
    try {
      await unarchiveMut({ ids });
      toast.success(t("unarchiveSuccess", { count: ids.length }));
      setSelectedIds(new Set());
    } catch {
      toast.error(t("updateFailed"));
    }
    setConfirmDialog(null);
  }

  async function handleStatusChange(id: Id<"contactInquiries">, newStatus: string) {
    try {
      await updateStatus({ id, status: newStatus });
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  async function handleSaveNotes(id: Id<"contactInquiries">) {
    try {
      await updateNotes({ id, notes: notesDraft });
      toast.success(t("notesSaved"));
      setEditingNotes(null);
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  function handleStartNotes(item: Doc<"contactInquiries">) {
    setEditingNotes(item._id);
    setNotesDraft(item.notes ?? "");
  }

  // ─── CSV Export ──────────────────────────────────────────────────────────

  async function handleExportCsv() {
    setExporting(true);
    try {
      const allData = await exportMut();
      if (!allData || allData.length === 0) {
        toast.error(t("exportEmpty"));
        return;
      }

      const headers = [
        "name", "email", "phone", "requestType", "message",
        "businessType", "teamSize", "governorate", "challengeType", "budgetRange",
        "preferredMode", "preferredSlot",
        "status", "notes", "sourcePage", "quotedValue",
        "createdAt", "isRead", "archived", "respondedAt",
      ];

      const rows = allData.map((item) =>
        headers.map((h) => {
          const val = (item as Record<string, unknown>)[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          // Escape CSV
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(","),
      );

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inquiries-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("exportSuccess", { count: allData.length }));
    } catch {
      toast.error(t("exportFailed"));
    } finally {
      setExporting(false);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function getResponseBadge(item: Doc<"contactInquiries">): React.ReactNode {
    if (item.respondedAt) {
      const hoursAgo = Math.round((item.respondedAt - item.createdAt) / (1000 * 60 * 60));
      return (
        <Badge variant="outline" className="text-xs text-muted-foreground border-border/40">
          {t("respondedIn", { hours: hoursAgo })}
        </Badge>
      );
    }
    if (Date.now() - item.createdAt > STALE_THRESHOLD_MS && !isArchivedView) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 me-1" />
          {t("staleAlert")}
        </Badge>
      );
    }
    return null;
  }

  function buildWhatsAppLink(phone: string | undefined, name: string): string {
    const base = contactInfo?.whatsapp
      ? contactInfo.whatsapp.split("?")[0]
      : "https://wa.me/201020295018";
    const text = encodeURIComponent(
      `${t("whatsappReplyTemplate", { name })}`,
    );
    return `${base}?text=${text}`;
  }

  function formatSourcePage(sourcePage: string | undefined): string {
    if (!sourcePage) return "";
    // Strip locale prefix for cleaner display
    return sourcePage.replace(/^\/(en|ar)/, "");
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  const unreadCount = !isArchivedView
    ? (inquiries?.filter((i) => !i.isRead).length ?? 0)
    : 0;

  return (
    <SectionEditorShell
      title={t("title")}
      breadcrumb={t("breadcrumb")}
      onSave={() => {}}
      isSaving={false}
      hasUnsaved={false}
    >
      {/* Status filter + stale alert + export */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* View tabs */}
        <button
          onClick={() => setView("active")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !isArchivedView
              ? "bg-accent text-background"
              : "bg-surface-elevated text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("activeTab")}
          {!isArchivedView && staleCount !== undefined && staleCount > 0 && (
            <span className="ms-1.5 inline-flex h-2 w-2 rounded-full bg-destructive" />
          )}
        </button>
        <button
          onClick={() => setView("archived")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isArchivedView
              ? "bg-accent text-background"
              : "bg-surface-elevated text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("archivedTab")}
        </button>

        <span className="text-muted-foreground mx-1">|</span>

        {/* Status filter tabs */}
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !currentStatus
              ? "bg-accent/10 text-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("status.all")}
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              currentStatus === s
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`status.${s}`)}
          </button>
        ))}

        <div className="ms-auto flex items-center gap-2">
          {(staleCount ?? 0) > 0 && !isArchivedView && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {t("staleCount", { count: staleCount ?? 0 })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleExportCsv}
            disabled={exporting}
          >
            <Download className="h-3.5 w-3.5 me-1" />
            {t("exportCsv")}
          </Button>
        </div>
      </div>

      {/* Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-30 mb-3 flex items-center gap-2 rounded-lg border border-accent/30 bg-surface p-3 shadow-md">
          <span className="text-sm font-medium text-foreground">
            {t("selectedCount", { count: selectedIds.size })}
          </span>

          <div className="ms-auto flex items-center gap-2">
            {isArchivedView ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleUnarchive()}
              >
                <ArchiveRestore className="h-3.5 w-3.5 me-1" />
                {t("unarchive")}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setConfirmDialog({ type: "archive", count: selectedIds.size })}
                >
                  <Archive className="h-3.5 w-3.5 me-1" />
                  {t("archive")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => handleBatchMarkRead(true)}
                >
                  <Eye className="h-3.5 w-3.5 me-1" />
                  {t("batchMarkRead")}
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => setSelectedIds(new Set())}
            >
              <X className="h-3.5 w-3.5 me-1" />
              {t("deselectAll")}
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {!filteredInquiries ? (
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
      ) : filteredInquiries.length === 0 ? (
        <Card className="bg-surface border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h3 className="font-heading text-xl text-foreground mb-2">
              {isArchivedView ? t("emptyArchived") : t("emptyTitle")}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {isArchivedView ? t("emptyArchivedDesc") : t("emptyDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("totalCount", { count: filteredInquiries.length })}
              {!isArchivedView && unreadCount > 0 && (
                <span className="ms-2">
                  <Badge variant="default" className="bg-accent text-accent-foreground text-xs">
                    {t("unreadCount", { count: unreadCount })}
                  </Badge>
                </span>
              )}
            </p>
            {!isArchivedView && (
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {allSelected ? t("deselectAll") : t("selectAll")}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {filteredInquiries.map((item) => {
              const isExpanded = expandedId === item._id;
              const isSelected = selectedIds.has(item._id as string);
              const itemStatus: Status = (item.status as Status) ?? "new";
              const isStale = !item.respondedAt && Date.now() - item.createdAt > STALE_THRESHOLD_MS && !isArchivedView;

              return (
                <Card
                  key={item._id}
                  className={`bg-surface border-border/50 transition-colors ${
                    isSelected ? "border-accent/50 ring-1 ring-accent/20" : ""
                  } ${!item.isRead && !isArchivedView ? "border-s-[3px] border-s-accent" : ""}`}
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
                      {/* Selection */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(item._id as string);
                        }}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={isSelected ? t("deselectAll") : t("selectAll")}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-accent" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>

                      {/* Read indicator */}
                      {!isArchivedView && (
                        <div className={`shrink-0 ${!item.isRead ? "text-accent" : "text-muted-foreground"}`}>
                          {item.isRead ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                        </div>
                      )}
                      {isArchivedView && (
                        <div className="shrink-0 text-muted-foreground">
                          <Archive className="h-5 w-5" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium truncate ${!item.isRead && !isArchivedView ? "text-foreground" : "text-muted-foreground"}`}>
                            {item.name}
                          </span>
                          {!item.isRead && !isArchivedView && (
                            <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                          )}
                          {/* Status badge */}
                          <Badge variant={statusBadgeVariant(itemStatus)} className="text-[10px] px-1.5 py-0">
                            {t(`status.${itemStatus}`)}
                          </Badge>
                          {/* Response badge */}
                          {getResponseBadge(item)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.email}
                          {item.requestType && <><span className="mx-1">·</span>{item.requestType}</>}
                          <span className="mx-1">·</span>
                          {formatEgyptTime(item.createdAt, locale)}
                          {item.sourcePage && (
                            <><span className="mx-1">·</span>{formatSourcePage(item.sourcePage)}</>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isArchivedView && (
                          <>
                            {/* WhatsApp reply */}
                            {contactInfo?.whatsapp && (
                              <a
                                href={buildWhatsAppLink(item.phone, item.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                aria-label={t("whatsappReply")}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            )}
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
                          </>
                        )}
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="border-t border-border/50 px-4 py-4 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          {/* Left column */}
                          <div className="space-y-3">
                            {item.phone && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("phoneLabel")}</span>
                                <p className="text-sm text-foreground mt-0.5" dir="ltr">{item.phone}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("requestTypeLabel")}</span>
                              <p className="text-sm text-foreground mt-0.5">{item.requestType}</p>
                            </div>
                            {item.businessType && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("businessType")}</span>
                                <p className="text-sm text-foreground mt-0.5">{item.businessType}</p>
                              </div>
                            )}
                            {item.teamSize && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("teamSize")}</span>
                                <p className="text-sm text-foreground mt-0.5">{item.teamSize}</p>
                              </div>
                            )}
                            {item.governorate && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("governorate")}</span>
                                <p className="text-sm text-foreground mt-0.5">{item.governorate}</p>
                              </div>
                            )}
                            {item.challengeType && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("challengeType")}</span>
                                <p className="text-sm text-foreground mt-0.5">{item.challengeType}</p>
                              </div>
                            )}
                            {item.budgetRange && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("budgetRange")}</span>
                                <p className="text-sm text-foreground mt-0.5">{item.budgetRange}</p>
                              </div>
                            )}
                            {item.preferredMode && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("preferredMode")}</span>
                                <p className="text-sm text-foreground mt-0.5">{item.preferredMode}</p>
                              </div>
                            )}
                            {item.preferredSlot && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("preferredSlot")}</span>
                                <p className="text-sm text-foreground mt-0.5">{item.preferredSlot}</p>
                              </div>
                            )}
                          </div>

                          {/* Right column */}
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("messageLabel")}</span>
                              <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{item.message}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("receivedLabel")}</span>
                              <p className="text-sm text-foreground mt-0.5">{formatEgyptTime(item.createdAt, locale)}</p>
                            </div>
                            {item.sourcePage && (
                              <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("sourcePage")}</span>
                                <p className="text-sm text-foreground mt-0.5">{formatSourcePage(item.sourcePage)}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status + Notes row */}
                        <div className="flex flex-wrap gap-4 pt-2 border-t border-border/30">
                          {/* Status dropdown */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("status.label")}</span>
                            <select
                              value={itemStatus}
                              onChange={(e) => handleStatusChange(item._id, e.target.value)}
                              className="rounded-lg border border-border/40 bg-surface-elevated/50 px-2 py-1 text-xs text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent/15 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {STATUS_ORDER.map((s) => (
                                <option key={s} value={s}>{t(`status.${s}`)}</option>
                              ))}
                            </select>
                          </div>

                          {/* Notes editable area */}
                          <div className="flex-1 min-w-[200px]">
                            {editingNotes === item._id ? (
                              <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                                <Textarea
                                  value={notesDraft}
                                  onChange={(e) => setNotesDraft(e.target.value)}
                                  rows={2}
                                  className="text-xs bg-surface-elevated/50 border-border/40 resize-none"
                                  placeholder={t("notesPlaceholder")}
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" className="h-7 text-xs cursor-pointer" onClick={() => handleSaveNotes(item._id)}>
                                    {t("notesSave")}
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs cursor-pointer" onClick={() => setEditingNotes(null)}>
                                    {t("notesCancel")}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartNotes(item);
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground text-start w-full transition-colors cursor-pointer"
                              >
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("notes")}</span>
                                <p className="text-sm text-foreground mt-0.5">
                                  {item.notes || <span className="italic text-muted-foreground/60">{t("notesEmpty")}</span>}
                                </p>
                              </button>
                            )}
                          </div>
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

      {/* Confirmation Dialogs */}
      <Dialog
        open={confirmDialog !== null}
        onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}
      >
        <DialogContent className="bg-surface border-border/50 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading">
              {confirmDialog?.type === "archive"
                ? t("confirmArchive", { count: confirmDialog?.count ?? 0 })
                : t("confirmUnarchive", { count: confirmDialog?.count ?? 0 })}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {confirmDialog?.type === "archive" ? t("confirmArchiveDesc") : t("confirmUnarchiveDesc")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              {t("deleteCancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDialog?.type === "archive") handleArchive();
                else handleUnarchive();
              }}
            >
              {confirmDialog?.type === "archive" ? t("archive") : t("unarchive")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionEditorShell>
  );
}
