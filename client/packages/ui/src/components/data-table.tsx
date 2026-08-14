import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export interface DataTableColumn<Row> {
  readonly key: string;
  readonly header: ReactNode;
  readonly align?: "left" | "right";
  readonly className?: string;
  readonly render: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  readonly rows: readonly Row[];
  readonly columns: readonly DataTableColumn<Row>[];
  readonly rowKey: (row: Row) => string;
  readonly className?: string;
}

/**
 * Renders a consistent read-only data table from declarative columns. Feature
 * views never assemble the low-level table family themselves, keeping table
 * structure and responsive overflow in one shared component.
 */
export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  className,
}: DataTableProps<Row>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg bg-surface shadow-sm",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                className={cn(column.align === "right" && "text-right")}
                key={column.key}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column) => (
                <TableCell
                  className={cn(
                    column.align === "right" && "text-right",
                    column.className,
                  )}
                  key={column.key}
                >
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
