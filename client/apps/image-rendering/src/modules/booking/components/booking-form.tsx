"use client";

import { FormEvent, useEffect, useState } from "react";
import { Card } from "@healthalst/ui/components/card";
import { Input } from "@healthalst/ui/components/input";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@healthalst/ui/components/select";
import { Skeleton } from "@healthalst/ui/components/skeleton";
import { MainButton } from "@healthalst/ui/lib/button";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { DatePicker } from "@healthalst/ui/lib/inputs/date-picker";
import { cn } from "@healthalst/ui/lib/utils";
import { bookingService } from "../services/booking.service";
import type { AppointmentConfirmation, PublicLaboratory } from "../types";

type BookingFormProperties = {
  onSignIn: () => void;
  onBookAnother: () => void;
};

/** Public appointment request: patients pick a registered laboratory without an account. */
export function BookingForm({ onSignIn, onBookAnother }: BookingFormProperties) {
  const [laboratories, setLaboratories] = useState<PublicLaboratory[] | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [laboratoryId, setLaboratoryId] = useState("");
  const [examType, setExamType] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<AppointmentConfirmation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    bookingService.listLaboratories()
      .then((labs) => { if (!cancelled) setLaboratories(labs); })
      .catch((reason) => { if (!cancelled) setLoadError(reason instanceof Error ? reason.message : "Laboratories could not be loaded."); });
    return () => { cancelled = true; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preferredDate || preferredDate < today) {
      setError("Choose a preferred date from today onward.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await bookingService.createAppointment({ patientName, patientEmail, laboratoryId, examType, preferredDate });
      setConfirmation(created);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The appointment could not be requested.");
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  if (confirmation) {
    return (
      <Card className={cn("gap-0 p-6 shadow-sm")}>
        <div className={cn("grid gap-4")}>
          <span className={cn("grid size-11 place-items-center rounded-xl bg-success-subtle text-success")}><Icon name="CheckCircle2" size={22} /></span>
          <div>
            <h2 className={cn("m-0 text-lg font-semibold text-foreground")}>Appointment requested</h2>
            <p className={cn("m-0 mt-2 text-sm leading-6 text-foreground-muted")}>
              {confirmation.organizationName} will confirm your {confirmation.examType.toLowerCase()} appointment. When the time is set, you will receive an email at <span className={cn("font-medium text-foreground")}>{confirmation.patientEmail}</span>. Your sign-in details arrive with your results.
            </p>
          </div>
          <MainButton type="button" variant="primary" onClick={() => { setConfirmation(null); setPatientName(""); setPatientEmail(""); setLaboratoryId(""); setExamType(""); setPreferredDate(""); onBookAnother(); }}>Request another appointment</MainButton>
          <MainButton type="button" variant="ghost" onClick={onSignIn}>Sign in to an existing account</MainButton>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("gap-0 p-6 shadow-sm")}>
      {loadError ? <InlineNotice tone="risk" title="Laboratories could not be loaded">{loadError}</InlineNotice> : null}
      {laboratories === null ? (
        <div className={cn("grid gap-4")} aria-label="Loading laboratories">
          {Array.from({ length: 5 }, (_, index) => <Skeleton className={cn("h-11 w-full")} key={index} />)}
        </div>
      ) : (
        <form className={cn("grid gap-4")} onSubmit={submit}>
          <div className={cn("grid gap-4 sm:grid-cols-2")}>
            <BookingField id="booking-name" label="Full name"><Input id="booking-name" autoComplete="name" value={patientName} onChange={(event) => setPatientName(event.target.value)} required /></BookingField>
            <BookingField id="booking-email" label="Email"><Input id="booking-email" type="email" autoComplete="email" value={patientEmail} onChange={(event) => setPatientEmail(event.target.value)} required /></BookingField>
          </div>
          <BookingField id="booking-laboratory" label="Laboratory">
            <Select value={laboratoryId} onValueChange={setLaboratoryId}>
              <SelectTrigger className={cn("w-full")}><SelectValue placeholder="Choose a laboratory" /></SelectTrigger>
              <SelectContent>
                {laboratories.map((laboratory) => (
                  <SelectItem key={laboratory.id} value={laboratory.id}>
                    {laboratory.name}{laboratory.location ? ` · ${laboratory.location}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BookingField>
          <div className={cn("grid gap-4 sm:grid-cols-2")}>
            <BookingField id="booking-exam" label="Examination"><Input id="booking-exam" placeholder="e.g. Chest X-ray, MRI brain" value={examType} onChange={(event) => setExamType(event.target.value)} required /></BookingField>
            <BookingField id="booking-date" label="Preferred date"><DatePicker id="booking-date" min={today} value={preferredDate} onChange={setPreferredDate} placeholder="Choose a date" required /></BookingField>
          </div>
          <p className={cn("m-0 text-xs leading-5 text-foreground-muted")}>The laboratory will confirm the exact time by email. No account is needed to book.</p>
          {error ? <InlineNotice tone="risk" title="Could not request the appointment">{error}</InlineNotice> : null}
          <MainButton type="submit" variant="primary" className={cn("w-full")} isLoading={submitting} isDisabled={submitting || laboratories.length === 0}>Request appointment</MainButton>
        </form>
      )}
    </Card>
  );
}

function BookingField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-2")}><label className={cn("text-sm font-medium text-foreground")} htmlFor={id}>{label}</label>{children}</div>;
}
