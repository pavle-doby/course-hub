"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { cn } from "@repo/ui-web/lib/utils";

type SortableRowProps = {
  id: string;
  handleLabel: string;
  className?: string;
  children: ReactNode;
};

/** Row with a drag handle; dragging (or Space + arrow keys on the handle) reorders the list. */
export function SortableRow({ id, handleLabel, className, children }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 bg-card",
        isDragging && "relative z-10 opacity-80",
        className
      )}
    >
      <Button
        ref={setActivatorNodeRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={handleLabel}
        className="shrink-0 cursor-grab touch-none text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      {children}
    </div>
  );
}
