/* eslint-disable react-hooks/incompatible-library */
"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { Checkbox } from "../../components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table";
import { cn } from "../utils";
import { DataTableDragHandle } from "./data-table-drag-handle";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSortableRow, DataTableStandardRow } from "./data-table-row";
import { DataTableViewOptions } from "./data-table-view-options";

export interface DataTableProperties<TData, TValue = unknown> {
  readonly className?: string;
  readonly columns: readonly ColumnDef<TData, TValue>[];
  readonly data: readonly TData[];
  readonly emptyMessage?: React.ReactNode;
  readonly enableColumnVisibility?: boolean;
  readonly enableRowReordering?: boolean;
  readonly enableRowSelection?: boolean;
  readonly getRowId: (row: TData, index: number) => string;
  readonly initialPageSize?: number;
  readonly manualPagination?: boolean;
  readonly onRowOrderChange?: (rows: readonly TData[]) => void;
  readonly onPaginationChange?: (pagination: PaginationState) => void;
  /** Activates a row by click, Enter, or Space. Omit for non-navigating tables. */
  readonly onRowClick?: (row: TData) => void;
  readonly onRowSelectionChange?: (rows: readonly TData[]) => void;
  readonly pageCount?: number;
  readonly pagination?: PaginationState;
  readonly pageSizeOptions?: readonly number[];
  readonly showPageSizeSelector?: boolean;
  readonly showPagination?: boolean;
  readonly showSelectionCount?: boolean;
  readonly tableClassName?: string;
  readonly tableContainerClassName?: string;
  readonly totalRowCount?: number;
  readonly toolbar?:
    | React.ReactNode
    | ((table: TanStackTable<TData>) => React.ReactNode);
}

function createDragColumn<TData, TValue>(): ColumnDef<TData, TValue> {
  return {
    id: "__drag",
    header: () => null,
    cell: ({ row }) => <DataTableDragHandle id={row.id} />,
    enableHiding: false,
    enableSorting: false,
  };
}

function createSelectionColumn<TData, TValue>(): ColumnDef<TData, TValue> {
  return {
    id: "__select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all rows on this page"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  };
}

export function DataTable<TData, TValue = unknown>({
  className,
  columns,
  data: sourceData,
  emptyMessage = "No results.",
  enableColumnVisibility = true,
  enableRowReordering = false,
  enableRowSelection = true,
  getRowId,
  initialPageSize = 10,
  manualPagination = false,
  onRowOrderChange,
  onPaginationChange,
  onRowClick,
  onRowSelectionChange,
  pageCount,
  pagination: controlledPagination,
  pageSizeOptions,
  showPageSizeSelector = true,
  showPagination = true,
  showSelectionCount = enableRowSelection,
  tableClassName,
  tableContainerClassName,
  totalRowCount,
  toolbar,
}: DataTableProperties<TData, TValue>) {
  const [data, setData] = React.useState<TData[]>(() => [...sourceData]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: initialPageSize,
    });
  const pagination = controlledPagination ?? internalPagination;
  const dndContextId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  React.useEffect(() => {
    setData([...sourceData]);
  }, [sourceData]);

  const resolvedColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const utilityColumns: ColumnDef<TData, TValue>[] = [];

    if (enableRowReordering) {
      utilityColumns.push(createDragColumn<TData, TValue>());
    }
    if (enableRowSelection) {
      utilityColumns.push(createSelectionColumn<TData, TValue>());
    }

    return [...utilityColumns, ...columns];
  }, [columns, enableRowReordering, enableRowSelection]);

  const table = useReactTable({
    columns: resolvedColumns,
    data,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    manualPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function" ? updater(pagination) : updater;

      if (!controlledPagination) {
        setInternalPagination(nextPagination);
      }
      onPaginationChange?.(nextPagination);
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
      sorting,
    },
    pageCount,
  });

  React.useEffect(() => {
    onRowSelectionChange?.(
      table.getFilteredSelectedRowModel().rows.map((row) => row.original),
    );
  }, [onRowSelectionChange, rowSelection, table]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map((row, index) => getRowId(row, index)),
    [data, getRowId],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setData((currentData) => {
      const currentIds = currentData.map((row, index) => getRowId(row, index));
      const oldIndex = currentIds.indexOf(String(active.id));
      const newIndex = currentIds.indexOf(String(over.id));

      if (oldIndex < 0 || newIndex < 0) {
        return currentData;
      }

      const reorderedData = arrayMove(currentData, oldIndex, newIndex);
      onRowOrderChange?.(reorderedData);
      return reorderedData;
    });
  }

  const renderedToolbar =
    typeof toolbar === "function" ? toolbar(table) : toolbar;

  const tableContent = (
    <Table
      className={tableClassName}
      containerClassName={tableContainerClassName}
    >
      <TableHeader className="sticky top-0 z-10 bg-surface-subtle">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead colSpan={header.colSpan} key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          enableRowReordering ? (
            <SortableContext
              items={dataIds}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map((row) => (
                <DataTableSortableRow key={row.id} row={row} />
              ))}
            </SortableContext>
          ) : (
            table
              .getRowModel()
              .rows.map((row) => (
                <DataTableStandardRow
                  key={row.id}
                  onRowClick={onRowClick}
                  row={row}
                />
              ))
          )
        ) : (
          <TableRow>
            <TableCell
              className="h-24 text-center text-foreground-muted"
              colSpan={resolvedColumns.length}
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn("flex min-w-0 max-w-full flex-col gap-4", className)}>
      {renderedToolbar || enableColumnVisibility ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">{renderedToolbar}</div>
          {enableColumnVisibility ? (
            <DataTableViewOptions table={table} />
          ) : null}
        </div>
      ) : null}

      <div className="min-w-0 max-w-full overflow-hidden rounded-lg border bg-surface">
        {enableRowReordering ? (
          <DndContext
            collisionDetection={closestCenter}
            id={dndContextId}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            {tableContent}
          </DndContext>
        ) : (
          tableContent
        )}
      </div>

      {showPagination ? (
        <DataTablePagination
          pageSizeOptions={pageSizeOptions}
          showPageSizeSelector={showPageSizeSelector}
          showSelectionCount={showSelectionCount}
          table={table}
          totalRowCount={totalRowCount}
        />
      ) : null}
    </div>
  );
}
