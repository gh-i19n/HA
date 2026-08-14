"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@healthalst/ui/components/card";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { Input } from "@healthalst/ui/components/input";
import { MainButton } from "@healthalst/ui/lib/button";
import { DatePicker } from "@healthalst/ui/lib/inputs/date-picker";
import { cn } from "@healthalst/ui/lib/utils";
import type { Booking } from "../types";

/** Approves or rejects pending appointment requests with the confirmed show-up time. */
export function BookingDecisionsPanel({
  bookings,
  decidingId,
  decidingAction,
  error,
  onApprove,
  onReject,
}: {
  bookings: Booking[];
  decidingId: string | null;
  decidingAction: "approve" | "reject" | null;
  error: string | null;
  onApprove: (bookingId: string, scheduledTime: string, message: string) => void;
  onReject: (bookingId: string, message: string) => void;
}) {
  const [scheduledTimes, setScheduledTimes] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const now = new Date();
  const today = toLocalDate(now);
  const currentTime = toLocalTime(now);
  const defaultTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  defaultTime.setMinutes(0, 0, 0);
  const defaultLocal = `${toLocalDate(defaultTime)}T${toLocalTime(defaultTime)}`;

  return (
    <Card className={cn("gap-0 overflow-hidden rounded-xl bg-surface py-0 shadow-sm")}>
      <CardHeader className={cn("border-b border-border px-5 py-5 lg:px-6")}>
        <CardTitle className={cn("text-base")}>Pending appointment requests</CardTitle>
        <CardDescription className={cn("mt-1")}>Confirm the show-up time to email the patient, or reject the request.</CardDescription>
      </CardHeader>
      <CardContent className={cn("p-0")}>
        {error ? <div className={cn("px-5 pt-4")}><InlineNotice tone="risk" title="Could not update the appointment">{error}</InlineNotice></div> : null}
        <ul className={cn("divide-y divide-border")}>
          {bookings.map((booking) => {
            const isDeciding = decidingId === booking.id;
            const isApproving = isDeciding && decidingAction === "approve";
            const isRejecting = isDeciding && decidingAction === "reject";
            const scheduledTime = scheduledTimes[booking.id] ?? defaultLocal;
            const [scheduledDate, scheduledClock = ""] = scheduledTime.split("T");
            return (
              <li key={booking.id} className={cn("px-5 py-5 lg:px-6")}>
                <div className={cn("grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:items-start lg:gap-8")}>
                  <div className={cn("min-w-0 lg:pt-1")}>
                    <div className={cn("flex items-center gap-2")}>
                      <span className={cn("size-2 rounded-full bg-warning")} aria-hidden="true" />
                      <span className={cn("text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted")}>
                        Awaiting decision
                      </span>
                    </div>
                    <p className={cn("m-0 mt-2 truncate text-sm font-semibold text-foreground")}>
                      {booking.patientName}
                    </p>
                    <p className={cn("m-0 mt-1 text-xs font-medium text-foreground")}>
                      {booking.examType}
                    </p>
                    <p className={cn("m-0 mt-1 truncate text-xs text-foreground-muted")}>
                      Preferred {booking.bookingDate} · {booking.patientEmail}
                    </p>
                  </div>

                  <div className={cn("min-w-0 rounded-lg bg-surface-subtle/50 p-3")}>
                    <div className={cn("grid gap-3")}>
                      <div className={cn("grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto_auto] sm:items-end")}>
                        <div className={cn("grid min-w-0 gap-1.5")}>
                          <label className={cn("text-[11px] font-medium text-foreground-muted")} htmlFor={`scheduled-date-${booking.id}`}>
                            Confirmed date
                          </label>
                          <DatePicker
                            id={`scheduled-date-${booking.id}`}
                            value={scheduledDate}
                            min={today}
                            onChange={(date) => setScheduledTimes({ ...scheduledTimes, [booking.id]: `${date}T${scheduledClock || "09:00"}` })}
                            placeholder="Choose date"
                            className={cn("min-w-0")}
                            required
                          />
                        </div>
                        <div className={cn("grid gap-1.5")}>
                          <label className={cn("text-[11px] font-medium text-foreground-muted")} htmlFor={`scheduled-time-${booking.id}`}>
                            Time
                          </label>
                          <Input
                            id={`scheduled-time-${booking.id}`}
                            type="time"
                            value={scheduledClock}
                            min={scheduledDate === today ? currentTime : undefined}
                            onChange={(event) => setScheduledTimes({ ...scheduledTimes, [booking.id]: `${scheduledDate}T${event.target.value}` })}
                            required
                          />
                        </div>
                        <MainButton type="button" variant="primary" size="sm" className={cn("min-w-20")} isLoading={isApproving} isDisabled={isDeciding} onClick={() => onApprove(booking.id, new Date(scheduledTime).toISOString(), messages[booking.id] ?? "")}>
                          Approve
                        </MainButton>
                        <MainButton type="button" variant="outline" size="sm" className={cn("min-w-16")} isLoading={isRejecting} isDisabled={isDeciding} onClick={() => onReject(booking.id, messages[booking.id] ?? "")}>
                          Reject
                        </MainButton>
                      </div>
                      <div className={cn("grid gap-1.5")}>
                        <label className={cn("text-[11px] font-medium text-foreground-muted")} htmlFor={`message-${booking.id}`}>
                          Message to patient <span className={cn("font-normal")}>(optional)</span>
                        </label>
                        <Input id={`message-${booking.id}`} placeholder="Add a note for the patient" value={messages[booking.id] ?? ""} onChange={(event) => setMessages({ ...messages, [booking.id]: event.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function toLocalDate(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function toLocalTime(date: Date): string {
  return [String(date.getHours()).padStart(2, "0"), String(date.getMinutes()).padStart(2, "0")].join(":");
}
