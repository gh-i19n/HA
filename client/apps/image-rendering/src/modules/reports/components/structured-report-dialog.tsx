"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppDialog } from "@healthalst/ui/components/app-dialog";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { Input } from "@healthalst/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@healthalst/ui/components/select";
import { Textarea } from "@healthalst/ui/components/textarea";
import { MainButton } from "@healthalst/ui/lib/button";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn } from "@healthalst/ui/lib/utils";
import { reportsService } from "../services/reports.service";
import type { Booking, Report, ReportTemplate, StructuredReportPayload } from "../types";

const initialContent: StructuredReportPayload["content"] = {
  clinicalIndication: "", technique: "", comparison: "", findings: "", impression: "",
  reportingProfessional: "", professionalTitle: "Consultant Radiologist",
};

/** Reusable canonical-template authoring flow; it supplies structure, never diagnostic suggestions. */
export function StructuredReportDialog({ bookings, open, onOpenChange, onCreated }: {
  bookings: Booking[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (report: Report) => Promise<void> | void;
}) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [template, setTemplate] = useState<ReportTemplate["key"] | "">("");
  const [content, setContent] = useState(initialContent);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open && templates.length === 0) void reportsService.listTemplates().then(setTemplates).catch((reason) => setError(reason instanceof Error ? reason.message : "Templates could not be loaded.")); }, [open, templates.length]);

  function update(key: keyof typeof content, value: string) { setContent((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!template) return;
    setSubmitting(true); setError(null);
    try {
      const report = await reportsService.createStructuredReport({ bookingId, template, content });
      await onCreated(report); onOpenChange(false); setContent(initialContent); setBookingId(""); setTemplate("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The report could not be created."); }
    finally { setSubmitting(false); }
  }

  return (
    <AppDialog open={open} onOpenChange={onOpenChange} title="Create structured report" description="Choose a booking and complete a clinically reviewed template." className={cn("w-[96vw] sm:max-w-3xl")} footer={(
      <div className={cn("flex justify-end gap-2")}><MainButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</MainButton><MainButton form="structured-report-form" type="submit" variant="primary" isLoading={submitting} isDisabled={submitting || !bookingId || !template} icon={<Icon name="FileCheck" size={15} />} isLeftIconVisible>Create pending report</MainButton></div>
    )}>
      <form className={cn("grid gap-5")} id="structured-report-form" onSubmit={submit}>
        <InlineNotice tone="info" title="Clinical responsibility">This template standardizes document structure. An authorized imaging professional remains responsible for every finding and impression.</InlineNotice>
        {error ? <InlineNotice tone="risk" title="Something needs attention">{error}</InlineNotice> : null}
        <div className={cn("grid gap-4 sm:grid-cols-2")}>
          <ReportField label="Patient booking"><Select value={bookingId} onValueChange={setBookingId}><SelectTrigger className={cn("w-full")} size="lg"><SelectValue placeholder="Choose completed booking" /></SelectTrigger><SelectContent>{bookings.map((booking) => <SelectItem key={booking.id} value={booking.id}>{booking.patientName} · {booking.examType}</SelectItem>)}</SelectContent></Select></ReportField>
          <ReportField label="Report template"><Select value={template} onValueChange={(value) => setTemplate(value as ReportTemplate["key"])}><SelectTrigger className={cn("w-full")} size="lg"><SelectValue placeholder="Choose template" /></SelectTrigger><SelectContent>{templates.map((item) => <SelectItem key={item.key} value={item.key}>{item.title}</SelectItem>)}</SelectContent></Select></ReportField>
        </div>
        <ReportField label="Clinical indication"><Textarea className={cn("min-h-24")} value={content.clinicalIndication} onChange={(event) => update("clinicalIndication", event.target.value)} /></ReportField>
        <div className={cn("grid gap-4 sm:grid-cols-2")}><ReportField label="Technique"><Textarea className={cn("min-h-28")} value={content.technique} onChange={(event) => update("technique", event.target.value)} /></ReportField><ReportField label="Comparison"><Textarea className={cn("min-h-28")} value={content.comparison} onChange={(event) => update("comparison", event.target.value)} /></ReportField></div>
        <ReportField label="Findings" required><Textarea className={cn("min-h-36")} required value={content.findings} onChange={(event) => update("findings", event.target.value)} /></ReportField>
        <ReportField label="Impression" required><Textarea className={cn("min-h-28")} required value={content.impression} onChange={(event) => update("impression", event.target.value)} /></ReportField>
        <div className={cn("grid gap-4 sm:grid-cols-2")}><ReportField label="Reporting professional" required><Input required value={content.reportingProfessional} onChange={(event) => update("reportingProfessional", event.target.value)} /></ReportField><ReportField label="Professional title"><Input value={content.professionalTitle} onChange={(event) => update("professionalTitle", event.target.value)} /></ReportField></div>
      </form>
    </AppDialog>
  );
}

function ReportField({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className={cn("grid gap-2 text-sm font-medium text-foreground")}>{label}{required ? <span className={cn("sr-only")}> required</span> : null}{children}</label>;
}
