"use client";

import { useEffect, useState } from "react";
import { AppDialog } from "@healthalst/ui/components/app-dialog";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { Skeleton } from "@healthalst/ui/components/skeleton";
import { MainButton } from "@healthalst/ui/lib/button";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn } from "@healthalst/ui/lib/utils";
import { reportsService } from "../services/reports.service";
import type { Report, ReportPreview } from "../types";
import { ReportPreviewDocument } from "./report-preview-document";

/** Loads the renderer-free preview for one report; remounted per report id. */
function ReportPreviewPane({ report, role }: {
  report: Report;
  role: "STAFF" | "PATIENT";
}) {
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    reportsService.previewContent(role, report.id).then((value) => {
      if (active) setPreview(value);
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : "The report preview could not be loaded.");
    });
    return () => { active = false; };
  }, [report, role]);

  if (error) return <InlineNotice tone="risk" title="Preview unavailable">{error}</InlineNotice>;
  if (!preview) {
    return (
      <div className={cn("grid gap-3")}>
        <Skeleton className={cn("h-10 w-1/3")} />
        <Skeleton className={cn("min-h-[520px] w-full")} />
      </div>
    );
  }
  return (
    <div className={cn("max-h-[64svh] overflow-y-auto rounded-lg bg-white p-4 sm:p-6")}>
      <ReportPreviewDocument preview={preview} />
    </div>
  );
}

/** Eventorch-style authorized document viewer shared by staff and patients. */
export function ReportViewerDialog({ report, role, open, onOpenChange }: {
  report: Report | null;
  role: "STAFF" | "PATIENT";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function download(format: "pdf" | "docx") {
    if (!report) return;
    setDownloading(format); setDownloadError(null);
    try {
      const blob = await reportsService.exportReport(role, report.id, format);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${report.fileName.replace(/\.[^.]+$/, "")}.${format}`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (reason) {
      setDownloadError(reason instanceof Error ? reason.message : "The report could not be downloaded.");
    } finally { setDownloading(null); }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={report?.examType ?? "Report preview"}
      description="Authorized imaging report preview"
      className={cn("h-[92svh] w-[96vw] sm:max-w-5xl")}
      headerActions={report ? <span className={cn("rounded-full bg-success-subtle px-2.5 py-1 text-[10px] font-semibold text-success")}>{report.status === "AVAILABLE" ? "Available" : "Pending review"}</span> : null}
      footer={report ? (
        <div className={cn("flex flex-wrap items-center justify-between gap-3")}>
          <p className={cn("m-0 text-xs text-foreground-muted")}>Downloaded documents are confidential medical records.</p>
          <div className={cn("flex gap-2")}>
            <MainButton type="button" variant="outline" size="sm" icon={<Icon name="Download" size={15} />} isLeftIconVisible isLoading={downloading === "pdf"} onClick={() => void download("pdf")}>PDF</MainButton>
            <MainButton type="button" variant="primary" size="sm" icon={<Icon name="Download" size={15} />} isLeftIconVisible isLoading={downloading === "docx"} isDisabled={!report.exportFormats.includes("DOCX")} title={!report.exportFormats.includes("DOCX") ? "DOCX is available for structured reports" : undefined} onClick={() => void download("docx")}>DOCX</MainButton>
          </div>
        </div>
      ) : undefined}
    >
      {downloadError ? <InlineNotice tone="risk" title="Download failed">{downloadError}</InlineNotice> : null}
      {report ? <ReportPreviewPane key={report.id} report={report} role={role} /> : null}
    </AppDialog>
  );
}