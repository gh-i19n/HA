"use client";

import { cn } from "../lib/utils";
import * as React from "react";

function Table({
  className,
  containerClassName,
  ...properties
}: React.ComponentProps<"table"> & { readonly containerClassName?: string }) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative min-w-0 max-w-full overflow-x-auto",
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full max-w-full caption-bottom text-sm", className)}
        {...properties}
      />
    </div>
  );
}

function TableHeader({
  className,
  ...properties
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b bg-surface", className)}
      {...properties}
    />
  );
}

function TableBody({
  className,
  ...properties
}: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...properties}
    />
  );
}

function TableFooter({
  className,
  ...properties
}: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-surface-subtle/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...properties}
    />
  );
}

function TableRow({ className, ...properties }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-surface-subtle data-[state=selected]:bg-surface-subtle border-b transition-colors",
        className,
      )}
      {...properties}
    />
  );
}

function TableHead({ className, ...properties }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground-muted h-10 px-4 text-left text-xs font-medium align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
        className,
      )}
      {...properties}
    />
  );
}

// Cells wrap by default. Forcing nowrap here made every table wider than its
// container and pushed the whole page into a horizontal scrollbar; a cell that
// genuinely must stay on one line (a date, a short code) opts in instead.
function TableCell({ className, ...properties }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
        className,
      )}
      {...properties}
    />
  );
}

function TableCaption({
  className,
  ...properties
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-foreground-muted mt-4 text-sm", className)}
      {...properties}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
