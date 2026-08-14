"use client";

import type { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "../../components/button";
import { Label } from "../../components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select";

export interface DataTablePaginationProperties<TData> {
  readonly pageSizeOptions?: readonly number[];
  readonly showPageSizeSelector?: boolean;
  readonly showSelectionCount?: boolean;
  readonly table: Table<TData>;
  readonly totalRowCount?: number;
}

export function DataTablePagination<TData>({
  pageSizeOptions = [10, 20, 30, 40, 50],
  showPageSizeSelector = true,
  showSelectionCount = true,
  table,
  totalRowCount,
}: DataTablePaginationProperties<TData>) {
  const rowsPerPageId = React.useId();
  const pageCount = Math.max(table.getPageCount(), 1);
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredCount =
    totalRowCount ?? table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
      {showSelectionCount ? (
        <div className="text-sm text-foreground-muted">
          {selectedCount} of {filteredCount} row(s) selected.
        </div>
      ) : (
        <div />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
        {showPageSizeSelector ? (
          <div className="flex items-center gap-2">
            <Label
              className="whitespace-nowrap text-sm font-medium"
              htmlFor={rowsPerPageId}
            >
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-20" id={rowsPerPageId} size="sm">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="whitespace-nowrap text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {pageCount}
        </div>

        <div className="flex items-center gap-2">
          <Button
            aria-label="Go to first page"
            className="hidden size-8 p-0 sm:inline-flex"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronsLeftIcon className="size-4" />
          </Button>
          <Button
            aria-label="Go to previous page"
            className="size-8 p-0"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            aria-label="Go to next page"
            className="size-8 p-0"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            aria-label="Go to last page"
            className="hidden size-8 p-0 sm:inline-flex"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(pageCount - 1)}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
