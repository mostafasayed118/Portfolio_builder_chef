"use client";

import { useState, useOptimistic, startTransition, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionEditorShell } from "@/components/admin/SectionEditorShell";
import { SortableItem } from "@/components/admin/SortableItem";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Doc } from "@convex/_generated/dataModel";

type SectionConfig = Doc<"sectionConfigs">;

export default function AdminSectionsPage() {
  const tNav = useTranslations("admin.nav");
  const t = useTranslations("admin.sections");
  const sections = useQuery(api.queries.getAllSectionConfigs);
  const updateVisibility = useMutation(api.mutations.updateSectionVisibility);
  const reorderMutation = useMutation(api.mutations.reorderSections);

  const [hasUnsaved, setHasUnsaved] = useState(false);

  const [optimisticSections, applyOptimistic] = useOptimistic(
    sections,
    (prev: SectionConfig[] | undefined, action: { type: "toggle"; key: string } | { type: "reorder"; keys: string[] }) => {
      if (!prev) return prev;
      if (action.type === "toggle") {
        return prev.map((s) =>
          s.sectionKey === action.key ? { ...s, isVisible: !s.isVisible } : s,
        );
      }
      if (action.type === "reorder") {
        const map = new Map(prev.map((s) => [s.sectionKey, s]));
        return action.keys
          .map((key, i) => {
            const item = map.get(key);
            return item ? { ...item, order: i } : null;
          })
          .filter(Boolean) as SectionConfig[];
      }
      return prev;
    },
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleToggle = useCallback(
    async (sectionKey: string, isRequired: boolean | undefined) => {
      if (isRequired) return;
      const section = sections?.find((s) => s.sectionKey === sectionKey);
      if (!section) return;

      startTransition(() => {
        applyOptimistic({ type: "toggle", key: sectionKey });
      });

      try {
        await updateVisibility({
          sectionKey,
          isVisible: !section.isVisible,
        });
        toast.success(t("toggled"));
      } catch {
        toast.error(t("toggleFailed"));
      }
    },
    [sections, updateVisibility, applyOptimistic, t],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !optimisticSections) return;

      const oldIndex = optimisticSections.findIndex(
        (s) => s.sectionKey === active.id,
      );
      const newIndex = optimisticSections.findIndex(
        (s) => s.sectionKey === over.id,
      );
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...optimisticSections];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      const orderedKeys = reordered.map((s) => s.sectionKey);

      startTransition(() => {
        applyOptimistic({ type: "reorder", keys: orderedKeys });
      });
      setHasUnsaved(true);

      try {
        await reorderMutation({ orderedKeys });
        toast.success(t("reordered"));
        setHasUnsaved(false);
      } catch {
        toast.error(t("reorderFailed"));
        setHasUnsaved(false);
      }
    },
    [optimisticSections, reorderMutation, applyOptimistic, t],
  );

  return (
    <SectionEditorShell
      title={t("title")}
      breadcrumb={tNav("dashboard")}
      onSave={() => {}}
      isSaving={false}
      hasUnsaved={hasUnsaved}
      viewSiteHref="/"
    >
      <p className="text-sm text-muted-foreground mb-6">{t("description")}</p>

      {!optimisticSections ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={optimisticSections.map((s) => s.sectionKey)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3" role="list" aria-label={t("title")}>
              {optimisticSections.map((item) => (
                <SortableItem
                  key={item.sectionKey}
                  id={item.sectionKey}
                  className="flex items-center gap-3 overflow-hidden rounded-lg border border-border/50 bg-surface p-4 transition-colors hover:bg-surface-elevated"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground truncate">
                        {item.label_en}
                      </p>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.label_ar}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="mt-1 text-[10px] font-mono text-muted-foreground border-border/40"
                    >
                      {item.sectionKey}
                    </Badge>
                  </div>

                  {item.isRequired ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                      <Lock className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t("required")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {item.isVisible ? t("visible") : t("hidden")}
                      </span>
                      <Switch
                        checked={item.isVisible}
                        onCheckedChange={() =>
                          handleToggle(item.sectionKey, item.isRequired)
                        }
                        aria-label={t("toggleLabel", {
                          section: item.label_en,
                        })}
                      />
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </SectionEditorShell>
  );
}
