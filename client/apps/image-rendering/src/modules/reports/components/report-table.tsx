"use client";

import { Avatar, AvatarFallback } from "@healthalst/ui/components/avatar";
import { Badge } from "@healthalst/ui/components/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@healthalst/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@healthalst/ui/components/table";
import { MainButton } from "@healthalst/ui/lib/button";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn, formatFileSize, formatInitials } from "@healthalst/ui/lib/utils";
import type { Report } from "../types";
import { ReportPagination } from "./report-pagination";

type ReportTableProperties = {
  reports: Report[];
  role: "STAFF" | "PATIENT";
  page: number;
  totalPages: number;
  isLoading: boolean;
  publishingId: string | null;
  downloadingId: string | null;
  onPageChange: (page: number) => void;
  onPublish: (reportId: string) => void;
  onPreview: (report: Report) => void;
};

/** Renders the reusable report table while keeping role-specific actions explicit. */
export function ReportTable({
  reports,
  role,
  page,
  totalPages,
  isLoading,
  publishingId,
  downloadingId,
  onPageChange,
  onPublish,
  onPreview,
}: ReportTableProperties) {
  if (role === "PATIENT") {
    return (
      <div className={cn("grid gap-5")}>
        <section aria-label="Available imaging results" className={cn("grid gap-4 md:grid-cols-2")}>
          {reports.map((report) => (
            <Card className={cn("gap-0 overflow-hidden border-border bg-surface py-0 shadow-xs transition-colors hover:border-primary/30")} key={report.id}>
              <CardHeader className={cn("border-b border-border bg-surface-subtle/35 px-5 py-5")}>
                <div className={cn("flex items-start justify-between gap-4")}>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary")}>
                    <Icon name="FileText" size={19} />
                  </span>
                  <span className={cn("rounded-full border border-success/20 bg-success-subtle px-2.5 py-1 text-[10px] font-semibold text-success")}>
                    Ready to view
                  </span>
                </div>
                <CardTitle className={cn("mt-5 text-lg")}>{report.examType}</CardTitle>
                <p className={cn("m-0 mt-1 text-xs text-foreground-muted")}>{report.organizationName}</p>
              </CardHeader>
              <CardContent className={cn("grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5")}>
                <ResultFact label="Service date" value={formatDate(report.bookingDate)} />
                <ResultFact label="Report date" value={formatDate(report.uploadedAt)} />
                <ResultFact label="File type" value="PDF document" />
                <ResultFact label="File size" value={formatFileSize(report.fileSize)} />
              </CardContent>
              <CardFooter className={cn("border-t border-border bg-surface-subtle/25 px-5 py-4")}>
                <MainButton
                  type="button"
                  variant="primary"
                  size="sm"
                  className={cn("w-full sm:w-auto")}
                  icon={<Icon name="Eye" size={15} />}
                  isLeftIconVisible
                  isLoading={downloadingId === report.id}
                  isDisabled={downloadingId !== null}
                  onClick={() => onPreview(report)}
                  aria-label={`View ${report.examType} report from ${formatDate(report.bookingDate)}`}
                >
                  View report
                </MainButton>
              </CardFooter>
            </Card>
          ))}
        </section>
        <ReportPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    );
  }

  return (
    <div className={cn("min-w-0")}>
      <div className={cn("hidden md:block")}>
        <Table className={cn("min-w-[760px] xl:min-w-[940px]")}>
          <TableCaption className={cn("sr-only")}>Imaging report delivery list</TableCaption>
          <TableHeader className={cn("bg-surface-subtle/55")}>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead className={cn("hidden xl:table-cell")}>Booking</TableHead>
              <TableHead>Examination</TableHead>
              <TableHead>Service date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead className={cn("text-right")}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody aria-busy={isLoading}>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div className={cn("flex items-center gap-3")}>
                    <Avatar className={cn("size-8 border border-border")}>
                      <AvatarFallback className={cn("bg-primary-subtle text-[10px] font-semibold text-primary")}>
                        {formatInitials(report.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("grid min-w-0 gap-0.5")}>
                      <span className={cn("truncate font-medium text-foreground")}>{report.patientName}</span>
                      <span className={cn("max-w-44 truncate text-[11px] text-foreground-muted")}>{report.fileName}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cn("hidden xl:table-cell")}>
                  <span className={cn("font-mono text-[11px] font-medium text-foreground-muted")}>{formatBookingReference(report.bookingId)}</span>
                </TableCell>
                <TableCell>
                  <div className={cn("flex items-center gap-2 text-foreground")}>
                    <Icon name="FileText" size={14} className={cn("text-foreground-muted")} />
                    <span>{report.examType}</span>
                  </div>
                </TableCell>
                <TableCell className={cn("whitespace-nowrap text-foreground-muted")}>{formatDate(report.bookingDate)}</TableCell>
                <TableCell>
                  <Badge className={cn("gap-1.5 px-2.5 py-1 text-[10px]")} variant={report.status === "AVAILABLE" ? "success" : "warning"}>
                    <span className={cn("size-1.5 rounded-full bg-current")} />
                    {report.status === "AVAILABLE" ? "Available" : "Pending review"}
                  </Badge>
                </TableCell>
                <TableCell className={cn("whitespace-nowrap text-foreground-muted")}>{formatDate(report.uploadedAt)}</TableCell>
                <TableCell className={cn("text-right")}>
                  <div className={cn("flex justify-end gap-2")}>
                    <MainButton type="button" variant="ghost" size="sm" icon={<Icon name="Eye" size={14} />} isLeftIconVisible onClick={() => onPreview(report)}>Preview</MainButton>
                    <MainButton type="button" variant={report.status === "AVAILABLE" ? "ghost" : "primaryOutline"} size="sm" className={cn("min-w-28")} isLoading={publishingId === report.id} isDisabled={report.status === "AVAILABLE" || publishingId !== null} onClick={() => onPublish(report.id)} aria-label={report.status === "AVAILABLE" ? `${report.examType} report is available to ${report.patientName}` : `Make ${report.examType} report available to ${report.patientName}`}>{report.status === "AVAILABLE" ? "Available" : "Make available"}</MainButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <section aria-label="Imaging report delivery list" className={cn("divide-y divide-border md:hidden")}>
        {reports.map((report) => (
          <article className={cn("grid gap-4 p-4 sm:p-5")} key={report.id}>
            <div className={cn("flex items-start justify-between gap-4")}>
              <div className={cn("flex min-w-0 items-center gap-3")}>
                <Avatar className={cn("size-9 border border-border")}>
                  <AvatarFallback className={cn("bg-primary-subtle text-[10px] font-semibold text-primary")}>
                    {formatInitials(report.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("min-w-0")}>
                  <h3 className={cn("m-0 truncate text-sm font-semibold text-foreground")}>{report.patientName}</h3>
                  <p className={cn("m-0 mt-0.5 truncate text-[11px] text-foreground-muted")}>{report.examType}</p>
                </div>
              </div>
              <Badge className={cn("px-2.5 py-1 text-[10px]")} variant={report.status === "AVAILABLE" ? "success" : "warning"}>
                {report.status === "AVAILABLE" ? "Available" : "Pending review"}
              </Badge>
            </div>
            <dl className={cn("grid grid-cols-2 gap-3 rounded-lg bg-surface-subtle/55 p-3")}>
              <ResultFact as="div" label="Booking" value={formatBookingReference(report.bookingId)} mono />
              <ResultFact as="div" label="Service date" value={formatDate(report.bookingDate)} />
              <ResultFact as="div" label="File" value={report.fileName} />
              <ResultFact as="div" label="Uploaded" value={formatDate(report.uploadedAt)} />
            </dl>
            <div className={cn("grid grid-cols-2 gap-2")}><MainButton type="button" variant="ghost" size="sm" icon={<Icon name="Eye" size={14} />} isLeftIconVisible onClick={() => onPreview(report)}>Preview</MainButton><MainButton type="button" variant={report.status === "AVAILABLE" ? "ghost" : "primaryOutline"} size="sm" isLoading={publishingId === report.id} isDisabled={report.status === "AVAILABLE" || publishingId !== null} onClick={() => onPublish(report.id)}>{report.status === "AVAILABLE" ? "Available" : "Publish"}</MainButton></div>
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
  mono = false,
  as: Element = "div",
}: {
  label: string;
  value: string;
  mono?: boolean;
  as?: "div";
}) {
  return (
    <Element className={cn("min-w-0")}>
      <p className={cn("m-0 text-[10px] font-medium uppercase tracking-wider text-foreground-muted")}>{label}</p>
      <p className={cn("m-0 mt-1 truncate text-xs font-medium text-foreground", mono && "font-mono")}>{value}</p>
    </Element>
  );
}

function formatBookingReference(value: string): string {
  const compact = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();
  return compact ? `BK-${compact}` : "Booking";
}

/** Keeps date presentation consistent across staff and patient lists. */
function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}
