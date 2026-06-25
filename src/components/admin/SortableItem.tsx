/**
 * Shared SortableItem component for @dnd-kit/sortable lists.
 *
 * Extracts the common `useSortable` hook + drag handle pattern that was
 * previously duplicated across menu, gallery, and services admin pages
 * (see BUG_FIXES_REGISTRY.md Bug #7 — every admin editor must follow
 * the same pattern without reinventing the DnD wrapper).
 *
 * Usage:
 * ```tsx
 * import { SortableItem } from "@/components/admin/SortableItem";
 *
 * <SortableItem id={item._id}>
 *   <div className="flex-1">{item.name}</div>
 *   <Switch checked={item.isAvailable} />
 * </SortableItem>
 * ```
 *
 * The drag handle is rendered automatically. Customize appearance by
 * passing `className` to the wrapper. The `isDragging` state reduces
 * opacity to 0.5 automatically.
 */
"use client";

import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { GripVertical } from "lucide-react";

type Props = {
  id: string;
  children: ReactNode;
  className?: string;
  /** If true, renders as a table row (<tr>) instead of a <div> */
  asTableRow?: boolean;
};

export function SortableItem({ id, children, className = "", asTableRow = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const t = useTranslations("admin.actions");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Tag = asTableRow ? "tr" : "div";
  const HandleWrapper = asTableRow ? "td" : "span";

  return (
    <Tag ref={setNodeRef} style={style} className={className}>
      <HandleWrapper className="inline-flex items-center shrink-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded focus-visible:outline-2 focus-visible:outline-accent"
          aria-label={t("reorder")}
          tabIndex={0}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </HandleWrapper>
      {children}
    </Tag>
  );
}
