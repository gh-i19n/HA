"use client";

import { Avatar, AvatarFallback } from "@healthalst/ui/components/avatar";
import { Badge } from "@healthalst/ui/components/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@healthalst/ui/components/table";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn, formatInitials } from "@healthalst/ui/lib/utils";
import type { Booking, BookingStatus } from "../types";
import { ReportPagination } from "./report-pagination";

type BookingTableProperties = {
  bookings: Booking[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  REQUESTED: "Pending request",
  APPROVED: "Confirmed",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

/** Renders the laboratory's booking queue over the same layout as the report queue. */
export function BookingTable({ bookings, page, totalPages, isLoading, onPageChange }: BookingTableProperties) {
  return (
    <div className={cn("min-w-0")}>
      <div className={cn("hidden md:block")}>
        <Table className={cn("min-w-[760px] xl:min-w-[940px]")}>
          <TableCaption className={cn("sr-only")}>Laboratory booking queue</TableCaption>
          <TableHeader className={cn("bg-surface-subtle/55")}>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Examination</TableHead>
              <TableHead>Booking date</TableHead>
              <TableHead>Scheduled time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody aria-busy={isLoading}>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className={cn("flex items-center gap-3")}>
                    <Avatar className={cn("size-8 border border-border")}>
                      <AvatarFallback className={cn("bg-primary-subtle text-[10px] font-semibold text-primary")}>
                        {formatInitials(booking.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("grid min-w-0 gap-0.5")}>
                      <span className={cn("truncate font-medium text-foreground")}>{booking.patientName}</span>
                      <span className={cn("max-w-52 truncate text-[11px] text-foreground-muted")}>{booking.patientEmail}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn("flex items-center gap-2 text-foreground")}>
                    <Icon name="FileText" size={14} className={cn("text-foreground-muted")} />
                    <span>{booking.examType}</span>
                  </div>
                </TableCell>
                <TableCell className={cn("whitespace-nowrap text-foreground-muted")}>{formatDate(booking.bookingDate)}</TableCell>
                <TableCell className={cn("whitespace-nowrap text-foreground-muted")}>{formatScheduledTime(booking.scheduledTime)}</TableCell>
                <TableCell>
                  <Badge className={cn("gap-1.5 px-2.5 py-1 text-[10px]")} variant={badgeVariant(booking.status)}>
                    <span className={cn("size-1.5 rounded-full bg-current")} />
                    {STATUS_LABEL[booking.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <section aria-label="Laboratory booking queue" className={cn("divide-y divide-border md:hidden")}>
        {bookings.map((booking) => (
          <article className={cn("grid gap-4 p-4 sm:p-5")} key={booking.id}>
            <div className={cn("flex items-start justify-between gap-4")}>
              <div className={cn("flex min-w-0 items-center gap-3")}>
                <Avatar className={cn("size-9 border border-border")}>
                  <AvatarFallback className={cn("bg-primary-subtle text-[10px] font-semibold text-primary")}>
                    {formatInitials(booking.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("min-w-0")}>
                  <h3 className={cn("m-0 truncate text-sm font-semibold text-foreground")}>{booking.patientName}</h3>
                  <p className={cn("m-0 mt-0.5 truncate text-[11px] text-foreground-muted")}>{booking.examType}</p>
                </div>
              </div>
              <Badge className={cn("px-2.5 py-1 text-[10px]")} variant={badgeVariant(booking.status)}>
                {STATUS_LABEL[booking.status]}
              </Badge>
            </div>
            <dl className={cn("grid grid-cols-2 gap-3 rounded-lg bg-surface-subtle/55 p-3")}>
              <ResultFact as="div" label="Email" value={booking.patientEmail} />
              <ResultFact as="div" label="Booking date" value={formatDate(booking.bookingDate)} />
              <ResultFact as="div" label="Scheduled time" value={formatScheduledTime(booking.scheduledTime)} />
              <ResultFact as="div" label="Status" value={STATUS_LABEL[booking.status]} />
            </dl>
          </article>
        ))}
      </section>
      <ReportPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}

function ResultFact({
  label,
  value,
  as: Element = "div",
}: {
  label: string;
  value: string;
  as?: "div";
}) {
  return (
    <Element className={cn("min-w-0")}>
      <p className={cn("m-0 text-[10px] font-medium uppercase tracking-wider text-foreground-muted")}>{label}</p>
      <p className={cn("m-0 mt-1 truncate text-xs font-medium text-foreground")}>{value}</p>
    </Element>
  );
}

function badgeVariant(status: BookingStatus): "warning" | "primary" | "danger" | "success" {
  switch (status) {
    case "REQUESTED":
      return "warning";
    case "APPROVED":
      return "primary";
    case "REJECTED":
      return "danger";
    case "COMPLETED":
      return "success";
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

function formatScheduledTime(value: string | null): string {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
