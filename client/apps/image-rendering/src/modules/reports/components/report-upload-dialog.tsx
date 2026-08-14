"use client";

import { useState } from "react";
import { MainButton } from "@healthalst/ui/lib/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@healthalst/ui/components/dialog";
import { Input } from "@healthalst/ui/components/input";
import { Label } from "@healthalst/ui/components/label";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { cn } from "@healthalst/ui/lib/utils";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import type { Booking, Report } from "../types";

type ReportUploadDialogProperties = {
  bookings: Booking[];
  isSubmitting: boolean;
  onUpload: (bookingId: string, file: File) => Promise<Report>;
  compact?: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Owns the staff upload interaction and delegates persistence to the feature service. */
export function ReportUploadDialog({ bookings, isSubmitting, onUpload, compact = false }: ReportUploadDialogProperties) {
  const [open, setOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Resets local form state after the dialog closes. */
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setBookingId("");
      setFile(null);
      setError(null);
    }
  }

  /** Validates the lightweight browser constraints before calling the API. */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingId || !file) {
      setError("Choose a booking and a PDF file before uploading.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Reports must be uploaded as PDF files.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Reports must be 10 MB or smaller.");
      return;
    }
    setError(null);
    try {
      await onUpload(bookingId, file);
      handleOpenChange(false);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The report could not be uploaded.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <MainButton
        type="button"
        variant={compact ? "primaryOutline" : "primary"}
        size={compact ? "sm" : "lg"}
        icon={<Icon name="UploadCloud" size={16} />}
        isLeftIconVisible
        onClick={() => setOpen(true)}
      >
        Attach report
      </MainButton>
      <DialogContent className={cn("sm:max-w-xl")}>
        <DialogHeader>
          <DialogTitle>Upload an imaging report</DialogTitle>
          <DialogDescription>Attach a PDF to a completed booking. It stays pending until you publish it.</DialogDescription>
        </DialogHeader>
        <form className={cn("grid gap-5")} onSubmit={handleSubmit}>
          <div className={cn("grid gap-2")}>
            <Label htmlFor="booking">Booking</Label>
            <select
              id="booking"
              className={cn("h-10 rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15")}
              value={bookingId}
              onChange={(event) => setBookingId(event.target.value)}
              required
            >
              <option value="">Select a booking</option>
              {bookings.map((booking) => (
                <option value={booking.id} key={booking.id}>
                  {booking.patientName} · {booking.examType} · {booking.bookingDate}
                </option>
              ))}
            </select>
          </div>
          <div className={cn("grid gap-2")}>
            <Label htmlFor="report-file">PDF report</Label>
            <Input
              id="report-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
            <p className={cn("text-xs text-foreground-muted")}>Maximum file size: 10 MB.</p>
          </div>
          {error ? <InlineNotice tone="risk" title="Upload not completed">{error}</InlineNotice> : null}
          <DialogFooter>
            <MainButton type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </MainButton>
            <MainButton type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
              Save as pending
            </MainButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
