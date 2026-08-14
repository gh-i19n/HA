"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDownIcon, Columns3Icon } from "lucide-react";
import { Button } from "../../components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu";

function formatColumnName(columnId: string) {
  return columnId
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

export function DataTableViewOptions<TData>({
  table,
}: {
  readonly table: Table<TData>;
}) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanHide() && column.accessorFn);

  if (columns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <Columns3Icon className="size-4" />
          <span className="hidden sm:inline">Customize columns</span>
          <span className="sm:hidden">Columns</span>
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            checked={column.getIsVisible()}
            className="capitalize"
            key={column.id}
            onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
          >
            {formatColumnName(column.id)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
