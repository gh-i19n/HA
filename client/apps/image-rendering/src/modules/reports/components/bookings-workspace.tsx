"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@healthalst/ui/components/card";
import { EmptyState } from "@healthalst/ui/components/empty-state";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { PageHeader } from "@healthalst/ui/components/page-header";
import { Skeleton } from "@healthalst/ui/components/skeleton";
import { MainButton } from "@healthalst/ui/lib/button";
import { FilterDropdown } from "@healthalst/ui/lib/filter-dropdown";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { SearchInput } from "@healthalst/ui/lib/inputs/search-input";
import { cn } from "@healthalst/ui/lib/utils";
import { ReportDashboardShell } from "../../app/report-dashboard-shell";
import type { User } from "../../auth/types";
import { reportsService } from "../services/reports.service";
import type { Booking, BookingStatus } from "../types";
import { BookingTable } from "./booking-table";

type BookingsWorkspaceProperties = {
  user: User;
  onLogout: () => Promise<void>;
  onUserChange: (user: User) => void;
};

const PAGE_SIZE = 25;

/** Provides the laboratory's full booking queue over the same layout as the report queue. */
export function BookingsWorkspace({ user, onLogout, onUserChange }: BookingsWorkspaceProperties) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");

  /** Loads the laboratory's bookings once so the queue can be filtered and paged locally. */
  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allBookings = await reportsService.listBookings();
      setBookings(allBookings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The booking queue could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadBookings(), 0);
    return () => window.clearTimeout(timer);
  }, [loadBookings]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
    const matchesQuery = normalizedQuery.length === 0 || [
      booking.patientName,
      booking.patientEmail,
      booking.examType,
      booking.organizationName ?? "",
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesStatus && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleBookings = filteredBookings.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const pendingCount = bookings.filter((booking) => booking.status === "REQUESTED").length;
  const confirmedCount = bookings.filter((booking) => booking.status === "APPROVED").length;
  const completedCount = bookings.filter((booking) => booking.status === "COMPLETED").length;

  return (
    <ReportDashboardShell user={user} reportCount={undefined} onLogout={onLogout} onUserChange={onUserChange}>
      <div className={cn("min-h-[calc(100svh-4rem)] bg-surface-subtle/35")}>
        <div className={cn("mx-auto grid w-full max-w-[1600px] gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8")}>
          <PageHeader
            className={cn("scroll-mt-24")}
            eyebrow="Imaging operations · Bookings"
            title="Bookings"
            titleId="bookings-overview"
            description="Review every appointment request, confirmed booking, and completed examination across the laboratory."
          />

          {error ? <InlineNotice tone="risk" title="Something needs attention">{error}</InlineNotice> : null}

          <section aria-label="Booking queue summary" className={cn("grid grid-cols-2 gap-3 xl:grid-cols-4")}>
            <BookingMetric
              icon="Calendar"
              label="Total bookings"
              value={bookings.length}
              detail="Across the laboratory"
            />
            <BookingMetric
              icon="Clock"
              label="Pending requests"
              value={pendingCount}
              detail="Awaiting a decision"
              tone="warning"
            />
            <BookingMetric
              icon="Calendar2"
              label="Confirmed"
              value={confirmedCount}
              detail="Ready for report upload"
              tone="primary"
            />
            <BookingMetric
              icon="CheckCircle2"
              label="Completed"
              value={completedCount}
              detail="Examinations finished"
              tone="success"
            />
          </section>

          <Card className={cn("scroll-mt-24 gap-0 overflow-hidden rounded-xl bg-surface py-0 shadow-sm")} id="bookings">
            <CardHeader className={cn("gap-5 border-b border-border px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-6")}>
              <div>
                <div className={cn("flex items-center gap-2")}>
                  <CardTitle className={cn("text-base")}>Booking queue</CardTitle>
                  <span className={cn("rounded-full bg-surface-subtle px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground-muted")}>
                    {bookings.length}
                  </span>
                </div>
                <CardDescription className={cn("mt-1")}>
                  Latest requests first · {PAGE_SIZE} records per page
                </CardDescription>
              </div>
              <div className={cn("flex w-full flex-col gap-2 sm:flex-row lg:w-auto")}>
                <SearchInput
                  id="booking-search"
                  name="booking-search"
                  aria-label="Search bookings on this page"
                  className={cn("w-full bg-background sm:w-72")}
                  placeholder="Search patient, exam or email"
                  value={query}
                  onValueChange={setQuery}
                />
                <FilterDropdown
                  ariaLabel="Filter bookings by status"
                  icon={<Icon name="Filter" size={16} />}
                  options={[
                    { value: "ALL", label: "All statuses" },
                    { value: "REQUESTED", label: "Pending request" },
                    { value: "APPROVED", label: "Confirmed" },
                    { value: "COMPLETED", label: "Completed" },
                    { value: "REJECTED", label: "Rejected" },
                  ]}
                  placeholder="All statuses"
                  size="lg"
                  value={statusFilter}
                  width="w-full bg-background sm:w-48"
                  onValueChange={(value) => setStatusFilter(value as "ALL" | BookingStatus)}
                />
              </div>
            </CardHeader>
            <CardContent className={cn("p-0")}>
              {isLoading && bookings.length === 0 ? <BookingsLoading /> : null}
              {!isLoading && bookings.length === 0 ? (
                <EmptyState
                  title="No bookings yet"
                  description="Patient appointment requests will appear here once they book an examination."
                  className={cn("min-h-64 border-0")}
                />
              ) : null}
              {!isLoading && bookings.length > 0 && filteredBookings.length === 0 ? (
                <EmptyState
                  title="No bookings match these filters"
                  description="Try a different search or show all booking statuses on this page."
                  className={cn("min-h-64 border-0")}
                  actions={(
                    <MainButton type="button" variant="outline" size="sm" onClick={() => { setQuery(""); setStatusFilter("ALL"); setPage(0); }}>
                      Clear filters
                    </MainButton>
                  )}
                />
              ) : null}
              {visibleBookings.length > 0 ? (
                <BookingTable
                  bookings={visibleBookings}
                  page={safePage}
                  totalPages={totalPages}
                  isLoading={isLoading}
                  onPageChange={setPage}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </ReportDashboardShell>
  );
}

type BookingMetricTone = "neutral" | "primary" | "success" | "warning";

function BookingMetric({
  icon,
  label,
  value,
  detail,
  tone = "neutral",
}: {
  icon: "Calendar" | "Clock" | "Calendar2" | "CheckCircle2";
  label: string;
  value: number;
  detail: string;
  tone?: BookingMetricTone;
}) {
  return (
    <div className={cn("group rounded-xl border border-border bg-surface p-4 shadow-xs transition-colors hover:border-border-strong sm:p-5")}>
      <div className={cn("flex items-start justify-between gap-4")}>
        <div>
          <p className={cn("m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted")}>{label}</p>
          <p className={cn("m-0 mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground")}>{value.toLocaleString()}</p>
        </div>
        <span className={cn(
          "grid size-10 place-items-center rounded-lg bg-surface-subtle text-foreground-muted",
          tone === "primary" && "bg-primary-subtle text-primary",
          tone === "success" && "bg-success-subtle text-success",
          tone === "warning" && "bg-warning-subtle text-warning",
        )}>
          <Icon name={icon} size={18} />
        </span>
      </div>
      <p className={cn("m-0 mt-3 text-xs text-foreground-muted")}>{detail}</p>
    </div>
  );
}

/** Avoids a blank surface while the booking queue is being requested. */
function BookingsLoading() {
  return (
    <div className={cn("grid gap-3 p-6")} aria-label="Loading bookings">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton className={cn("h-12 w-full")} key={index} />
      ))}
    </div>
  );
}