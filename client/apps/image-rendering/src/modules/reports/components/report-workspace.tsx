"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import type { Booking, PageResponse, Report, ReportStatus } from "../types";
import { ReportTable } from "./report-table";
import { ReportUploadDialog } from "./report-upload-dialog";
import { ReportViewerDialog } from "./report-viewer-dialog";
import { StructuredReportDialog } from "./structured-report-dialog";

type ReportWorkspaceProperties = {
  user: User;
  onLogout: () => Promise<void>;
  onUserChange: (user: User) => void;
};

const PAGE_SIZE = 25;

/** Provides the staff and patient workspaces over the same paginated report surface. */
export function ReportWorkspace({ user, onLogout, onUserChange }: ReportWorkspaceProperties) {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<Report> | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [structuredOpen, setStructuredOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReportStatus>("ALL");
  const [laboratoryFilter, setLaboratoryFilter] = useState("ALL");
  const bookingsLoaded = useRef(false);

  /** Loads only one page of metadata and the staff booking selector when needed. */
  const loadWorkspace = useCallback(async (requestedPage = page) => {
    setIsLoading(true);
    setError(null);
    try {
      const reportPage = user.role === "STAFF"
        ? await reportsService.listStaffReports(requestedPage, PAGE_SIZE)
        : await reportsService.listPatientReports(requestedPage, PAGE_SIZE, laboratoryFilter !== "ALL" ? laboratoryFilter : undefined);
      setResult(reportPage);
      if (user.role === "STAFF" && !bookingsLoaded.current) {
        const recentBookings = await reportsService.listBookings();
        setBookings(recentBookings);
        bookingsLoaded.current = true;
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The report workspace could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [page, user.role, laboratoryFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadWorkspace(), 0);
    return () => window.clearTimeout(timer);
  }, [loadWorkspace]);

  /** Uploads through the feature service, then refreshes the first queue page. */
  async function uploadReport(bookingId: string, file: File): Promise<Report> {
    setIsUploading(true);
    try {
      const report = await reportsService.uploadReport(bookingId, file);
      setPage(0);
      await loadWorkspace(0);
      return report;
    } finally {
      setIsUploading(false);
    }
  }

  /** Publishes one pending report and refreshes the current page. */
  async function publishReport(reportId: string) {
    setPublishingId(reportId);
    setError(null);
    try {
      await reportsService.publishReport(reportId);
      await loadWorkspace();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "The report could not be published.");
    } finally {
      setPublishingId(null);
    }
  }

  function previewReport(report: Report) { setSelectedReport(report); }

  const reports = result?.items ?? [];
  const isStaff = user.role === "STAFF";
  const readyBookings = bookings.filter((booking) => booking.status === "APPROVED" || booking.status === "COMPLETED");
  const pendingCount = reports.filter((report) => report.status === "PENDING").length;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleReports = reports.filter((report) => {
    const matchesStatus = statusFilter === "ALL" || report.status === statusFilter;
    const matchesQuery = normalizedQuery.length === 0 || [
      report.patientName,
      report.fileName,
      report.examType,
      report.bookingId,
      report.organizationName,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesStatus && matchesQuery;
  });

  if (!isStaff) {
    const laboratories = Array.from(new Map(reports.map((report) => [report.organizationId, report.organizationName])).entries());
    return (
      <ReportDashboardShell user={user} reportCount={result?.totalElements ?? 0} onLogout={onLogout} onUserChange={onUserChange}>
        <PatientResultsWorkspace reports={reports} visibleReports={visibleReports} result={result} page={page} isLoading={isLoading} error={error} laboratories={laboratories} laboratoryFilter={laboratoryFilter} statusFilter={statusFilter} query={query} onQueryChange={setQuery} onStatusFilterChange={setStatusFilter} onLaboratoryChange={(value) => { setPage(0); setLaboratoryFilter(value); }} onClearFilters={() => { setQuery(""); setStatusFilter("ALL"); setLaboratoryFilter("ALL"); }} onPageChange={setPage} onPreview={previewReport} />
        <ReportViewerDialog report={selectedReport} role="PATIENT" open={selectedReport !== null} onOpenChange={(open) => { if (!open) setSelectedReport(null); }} />
      </ReportDashboardShell>
    );
  }

  return (
    <ReportDashboardShell
      user={user}
      reportCount={result?.totalElements ?? 0}
      onLogout={onLogout}
      onUserChange={onUserChange}
    >
      <div className={cn("min-h-[calc(100svh-4rem)] bg-surface-subtle/35")}>
        <div className={cn("mx-auto grid w-full max-w-[1600px] gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8")}>
        <PageHeader
          className={cn("scroll-mt-24")}
          eyebrow="Imaging operations · Delivery queue"
          title="Reports dashboard"
          titleId="overview"
          description="Review the laboratory queue, attach reports to confirmed bookings, and control when results become available to patients."
          actions={(
            readyBookings.length > 0 ? <div className={cn("flex flex-wrap gap-2")}><MainButton type="button" variant="outline" icon={<Icon name="ClipboardList" size={15} />} isLeftIconVisible onClick={() => setStructuredOpen(true)}>Create from template</MainButton><ReportUploadDialog bookings={readyBookings} isSubmitting={isUploading} onUpload={uploadReport} /></div> : null
          )}
        />

        {error ? <InlineNotice tone="risk" title="Something needs attention">{error}</InlineNotice> : null}

        <section aria-label="Report queue summary" className={cn("grid grid-cols-2 gap-3 xl:grid-cols-3")}>
          <DashboardMetric
            icon="FileText"
            label="Laboratory reports"
            value={result?.totalElements ?? 0}
            detail="Across the delivery queue"
          />
          <DashboardMetric
            icon="Clock"
            label="Pending review"
            value={pendingCount}
            detail="On the current page"
            tone="warning"
          />
          <DashboardMetric
            icon="Calendar"
            label="Bookings ready"
            value={readyBookings.length}
            detail="Eligible for report upload"
            tone="primary"
          />
        </section>

        <Card className={cn("scroll-mt-24 gap-0 overflow-hidden rounded-xl bg-surface py-0 shadow-sm")} id="reports">
          <CardHeader className={cn("gap-5 border-b border-border px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-6")}>
            <div>
              <div className={cn("flex items-center gap-2")}>
                <CardTitle className={cn("text-base")}>Laboratory report queue</CardTitle>
                <span className={cn("rounded-full bg-surface-subtle px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground-muted")}>
                  {result?.totalElements ?? 0}
                </span>
              </div>
              <CardDescription className={cn("mt-1")}>
                Latest uploads first · {PAGE_SIZE} records per page · report files load only when opened
              </CardDescription>
            </div>
            <div className={cn("flex w-full flex-col gap-2 sm:flex-row lg:w-auto")}>
              <SearchInput
                id="report-search"
                name="report-search"
                aria-label="Search reports on this page"
                className={cn("w-full bg-background sm:w-72")}
                placeholder="Search patient, exam or file"
                value={query}
                onValueChange={setQuery}
              />
              <FilterDropdown
                ariaLabel="Filter reports by status"
                icon={<Icon name="Filter" size={16} />}
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "PENDING", label: "Pending review" },
                  { value: "AVAILABLE", label: "Available" },
                ]}
                placeholder="All statuses"
                size="lg"
                value={statusFilter}
                width="w-full bg-background sm:w-44"
                onValueChange={(value) => setStatusFilter(value as "ALL" | ReportStatus)}
              />
            </div>
          </CardHeader>
          <CardContent className={cn("p-0")}>
            {isLoading && !result ? <WorkspaceLoading /> : null}
            {!isLoading && reports.length === 0 ? (
              <EmptyState
                title="No reports uploaded yet"
                description="Upload a PDF against a completed booking to start the delivery queue."
                className={cn("min-h-64 border-0")}
              />
            ) : null}
            {!isLoading && reports.length > 0 && visibleReports.length === 0 ? (
              <EmptyState
                title="No reports match these filters"
                description="Try a different search or show all report statuses on this page."
                className={cn("min-h-64 border-0")}
                actions={(
                  <MainButton type="button" variant="outline" size="sm" onClick={() => { setQuery(""); setStatusFilter("ALL"); }}>
                    Clear filters
                  </MainButton>
                )}
              />
            ) : null}
            {visibleReports.length > 0 ? (
              <ReportTable
                reports={visibleReports}
                role="STAFF"
                page={result?.page ?? page}
                totalPages={result?.totalPages ?? 0}
                isLoading={isLoading}
                publishingId={publishingId}
                downloadingId={null}
                onPageChange={setPage}
                onPublish={(reportId) => void publishReport(reportId)}
                onPreview={previewReport}
              />
            ) : null}
          </CardContent>
        </Card>
        <section className={cn("scroll-mt-24 rounded-xl bg-primary-subtle/45 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6")} id="bookings" aria-labelledby="bookings-heading">
          <div className={cn("flex items-start gap-3")}>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground")}>
              <Icon name="Calendar" size={17} />
            </span>
            <div>
              <h2 className={cn("m-0 text-sm font-semibold text-foreground")} id="bookings-heading">Attach a report to a booking</h2>
              <p className={cn("m-0 mt-1 text-xs text-foreground-muted")}>
                {readyBookings.length} confirmed booking{readyBookings.length === 1 ? " is" : "s are"} ready for report upload.
              </p>
            </div>
          </div>
          {readyBookings.length > 0 ? (
            <div className={cn("mt-4 sm:mt-0")}>
              <ReportUploadDialog bookings={readyBookings} isSubmitting={isUploading} onUpload={uploadReport} compact />
            </div>
          ) : null}
        </section>
        <StructuredReportDialog bookings={readyBookings} open={structuredOpen} onOpenChange={setStructuredOpen} onCreated={async () => { setPage(0); await loadWorkspace(0); }} />
        <ReportViewerDialog report={selectedReport} role="STAFF" open={selectedReport !== null} onOpenChange={(open) => { if (!open) setSelectedReport(null); }} />
        </div>
      </div>
    </ReportDashboardShell>
  );
}

type DashboardMetricTone = "neutral" | "primary" | "success" | "warning";

function DashboardMetric({
  icon,
  label,
  value,
  detail,
  tone = "neutral",
}: {
  icon: "FileText" | "Clock" | "CalendarClock" | "Calendar" | "Building2" | "CheckCircle2" | "FileCheck" | "Shield";
  label: string;
  value: number;
  detail: string;
  tone?: DashboardMetricTone;
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

function PatientResultsWorkspace({
  reports,
  visibleReports,
  result,
  page,
  isLoading,
  error,
  laboratories,
  laboratoryFilter,
  statusFilter,
  query,
  onQueryChange,
  onStatusFilterChange,
  onLaboratoryChange,
  onClearFilters,
  onPageChange,
  onPreview,
}: {
  reports: Report[];
  visibleReports: Report[];
  result: PageResponse<Report> | null;
  page: number;
  isLoading: boolean;
  error: string | null;
  laboratories: Array<[string, string]>;
  laboratoryFilter: string;
  statusFilter: "ALL" | ReportStatus;
  query: string;
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: "ALL" | ReportStatus) => void;
  onLaboratoryChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPreview: (report: Report) => void;
}) {
  const availableCount = reports.filter((report) => report.status === "AVAILABLE").length;
  const pendingCount = reports.filter((report) => report.status === "PENDING").length;

  return (
    <main className={cn("min-h-[calc(100svh-4rem)] bg-surface-subtle/35")}>
      <div className={cn("mx-auto grid w-full max-w-[1200px] gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8")}>
        <PageHeader
          eyebrow="Secure patient portal"
          title="Your imaging results"
          display
          description="Reports appear here only after the laboratory makes them available to you."
          actions={laboratories.length > 1 ? (
            <FilterDropdown
              ariaLabel="Filter results by laboratory"
              icon={<Icon name="Filter" size={16} />}
              options={[{ value: "ALL", label: "All laboratories" }, ...laboratories.map(([id, name]) => ({ value: id, label: name }))]}
              placeholder="All laboratories"
              value={laboratoryFilter}
              width="w-full sm:w-56"
              onValueChange={onLaboratoryChange}
            />
          ) : null}
        />

        {error ? <InlineNotice tone="risk" title="Results could not be loaded">{error}</InlineNotice> : null}

        <div className={cn("flex items-center gap-3 rounded-xl bg-primary-subtle/55 px-4 py-3")}>
          <Icon name="Shield" size={18} className={cn("text-primary")} />
          <p className={cn("m-0 text-xs text-foreground-muted")}>
            Your reports are protected. Each file is authorized again when you open it.
          </p>
        </div>

        <section aria-label="Your results summary" className={cn("grid grid-cols-2 gap-3 xl:grid-cols-4")}>
          <DashboardMetric
            icon="FileText"
            label="Imaging results"
            value={result?.totalElements ?? 0}
            detail="Across your account"
          />
          <DashboardMetric
            icon="CheckCircle2"
            label="Available now"
            value={availableCount}
            detail="Ready to view and download"
            tone="success"
          />
          <DashboardMetric
            icon="Clock"
            label="Awaiting release"
            value={pendingCount}
            detail="Pending the laboratory's review"
            tone="warning"
          />
          <DashboardMetric
            icon="Building2"
            label="Laboratories"
            value={laboratories.length}
            detail="Holding your results"
            tone="primary"
          />
        </section>

        <Card className={cn("scroll-mt-24 gap-0 overflow-hidden rounded-xl bg-surface py-0 shadow-sm")} id="results">
          <CardHeader className={cn("gap-5 border-b border-border px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-6")}>
            <div>
              <div className={cn("flex items-center gap-2")}>
                <CardTitle className={cn("text-base")}>Your imaging results</CardTitle>
                <span className={cn("rounded-full bg-surface-subtle px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground-muted")}>
                  {result?.totalElements ?? 0}
                </span>
              </div>
              <CardDescription className={cn("mt-1")}>
                Latest uploads first · results are authorized again each time you open them
              </CardDescription>
            </div>
            <div className={cn("flex w-full flex-col gap-2 sm:flex-row lg:w-auto")}>
              <SearchInput
                id="patient-results-search"
                name="patient-results-search"
                aria-label="Search your results"
                className={cn("w-full bg-background sm:w-72")}
                placeholder="Search exam, laboratory or file"
                value={query}
                onValueChange={onQueryChange}
              />
              <FilterDropdown
                ariaLabel="Filter results by status"
                icon={<Icon name="Filter" size={16} />}
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "AVAILABLE", label: "Available" },
                  { value: "PENDING", label: "Awaiting release" },
                ]}
                placeholder="All statuses"
                size="lg"
                value={statusFilter}
                width="w-full bg-background sm:w-48"
                onValueChange={(value) => onStatusFilterChange(value as "ALL" | ReportStatus)}
              />
            </div>
          </CardHeader>
          <CardContent className={cn("p-0")}>
            {isLoading && !result ? <WorkspaceLoading /> : null}
            {!isLoading && reports.length === 0 ? (
              <EmptyState
                title="No imaging results are available in your account"
                description="Reports will appear here when a laboratory makes them available to you."
                className={cn("min-h-64 border-0")}
              />
            ) : null}
            {!isLoading && reports.length > 0 && visibleReports.length === 0 ? (
              <EmptyState
                title="No results match these filters"
                description="Try a different search, status, or laboratory on this page."
                className={cn("min-h-64 border-0")}
                actions={(
                  <MainButton type="button" variant="outline" size="sm" onClick={onClearFilters}>
                    Clear filters
                  </MainButton>
                )}
              />
            ) : null}
            {visibleReports.length > 0 ? (
              <ReportTable
                reports={visibleReports}
                role="PATIENT"
                page={result?.page ?? page}
                totalPages={result?.totalPages ?? 0}
                isLoading={isLoading}
                publishingId={null}
                downloadingId={null}
                onPageChange={onPageChange}
                onPublish={() => undefined}
                onPreview={onPreview}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

/** Avoids a blank surface while the first page is being requested. */
function WorkspaceLoading() {
  return (
    <div className={cn("grid gap-3 p-6")} aria-label="Loading reports">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton className={cn("h-12 w-full")} key={index} />
      ))}
    </div>
  );
}
