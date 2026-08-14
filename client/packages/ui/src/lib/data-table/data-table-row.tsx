"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { flexRender, type Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "../../components/table";

function DataTableRowCells<TData>({ row }: { readonly row: Row<TData> }) {
  return row
    .getVisibleCells()
    .map((cell) => (
      <TableCell key={cell.id}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </TableCell>
    ));
}

/**
 * Renders one row, optionally as an activation target.
 *
 * When a table's rows lead somewhere, clicking anywhere on the row is what
 * people expect, so `onRowClick` also takes keyboard focus and Enter/Space to
 * keep that shortcut available without a mouse. Cells holding their own
 * controls should stop propagation so a menu or checkbox does not also open
 * the row.
 */
export function DataTableStandardRow<TData>({
  row,
  onRowClick,
}: {
  readonly row: Row<TData>;
  readonly onRowClick?: (row: TData) => void;
}) {
  const interactive = onRowClick !== undefined;

  return (
    <TableRow
      data-state={row.getIsSelected() ? "selected" : undefined}
      className={
        interactive
          ? "cursor-pointer transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          : undefined
      }
      onClick={interactive ? () => onRowClick?.(row.original) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onRowClick?.(row.original);
            }
          : undefined
      }
      tabIndex={interactive ? 0 : undefined}
    >
      <DataTableRowCells row={row} />
    </TableRow>
  );
}

export function DataTableSortableRow<TData>({
  row,
}: {
  readonly row: Row<TData>;
}) {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: row.id,
  });

  return (
    <TableRow
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      data-dragging={isDragging}
      data-state={row.getIsSelected() ? "selected" : undefined}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <DataTableRowCells row={row} />
    </TableRow>
  );
}
