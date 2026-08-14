"use client";

import { useSortable } from "@dnd-kit/sortable";
import { GripVerticalIcon } from "lucide-react";
import { Button } from "../../components/button";

export function DataTableDragHandle({ id }: { readonly id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className="size-7 cursor-grab text-foreground-muted hover:bg-transparent active:cursor-grabbing"
      size="icon"
      type="button"
      variant="ghost"
    >
      <GripVerticalIcon className="size-3" />
    </Button>
  );
}
