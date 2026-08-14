"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@healthalst/ui/components/dialog";
import { EmptyState } from "@healthalst/ui/components/empty-state";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { PageHeader } from "@healthalst/ui/components/page-header";
import { Skeleton } from "@healthalst/ui/components/skeleton";
import { MainButton } from "@healthalst/ui/lib/button";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn } from "@healthalst/ui/lib/utils";
import { ReportDashboardShell } from "../../app/report-dashboard-shell";
import type { User } from "../../auth/types";
import { reportsService } from "../services/reports.service";
import type { Booking } from "../types";
import { BookingDecisionsPanel } from "./booking-decisions-panel";

type PendingRequestsWorkspaceProperties = {
  user: User;
  onLogout: () => Promise<void>;
  onUserChange: (user: User) => void;
};

/** Staff-only surface for deciding pending appointment requests. */
export function PendingRequestsWorkspace({ user, onLogout, onUserChange }: PendingRequestsWorkspaceProperties) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decidingAction, setDecidingAction] = useState<"approve" | "reject" | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [approvedBooking, setApprovedBooking] = useState<Booking | null>(null);

  /** Loads the laboratory's pending requests only. */
  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const allBookings = await reportsService.listBookings();
      setBookings(allBookings.filter((booking) => booking.status === "REQUESTED"));
    } catch (reason) {
      setLoadError(reason instanceof Error ? reason.message : "Pending requests could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRequests(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  /** Decides one pending request and refreshes the queue. */
  async function decideBooking(bookingId: string, decision: "approve" | "reject", payload: { scheduledTime?: string; message?: string }) {
    setDecidingId(bookingId);
    setDecidingAction(decision);
    setDecisionError(null);
    try {
      if (decision === "approve") {
        const approved = await reportsService.approveBooking(bookingId, payload.scheduledTime ?? "", payload.message);
        setApprovedBooking(approved);
      } else {
        await reportsService.rejectBooking(bookingId, payload.message);
      }
      await loadRequests();
    } catch (reason) {
      setDecisionError(reason instanceof Error ? reason.message : "The appointment could not be updated.");
    } finally {
      setDecidingId(null);
      setDecidingAction(null);
    }
  }

  return (
    <ReportDashboardShell user={user} onLogout={onLogout} onUserChange={onUserChange}>
      <main className={cn("min-h-[calc(100svh-4rem)] bg-surface-subtle/35")}>
        <div className={cn("mx-auto grid w-full max-w-[1200px] gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8")}>
          <PageHeader
            className={cn("scroll-mt-24")}
            eyebrow="Imaging operations · Requests"
            title="Pending requests"
            titleId="pending-requests"
            description="Confirm the show-up time to email the patient, or reject the request. Decided requests leave this queue."
          />

          {loadError ? <InlineNotice tone="risk" title="Pending requests could not be loaded">{loadError}</InlineNotice> : null}

          {isLoading && bookings.length === 0 ? (
            <div className={cn("grid gap-3")} aria-label="Loading pending requests">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton className={cn("h-20 w-full")} key={index} />
              ))}
            </div>
          ) : null}

          {!isLoading && bookings.length === 0 ? (
            <EmptyState
              title="No pending requests"
              description="New patient appointment requests will appear here for you to approve or reject."
              className={cn("min-h-64 bg-surface")}
            />
          ) : null}

          {bookings.length > 0 ? (
            <BookingDecisionsPanel
              bookings={bookings}
              decidingId={decidingId}
              decidingAction={decidingAction}
              error={decisionError}
              onApprove={(bookingId, scheduledTime, message) => void decideBooking(bookingId, "approve", { scheduledTime, message })}
              onReject={(bookingId, message) => void decideBooking(bookingId, "reject", { message })}
            />
          ) : null}
        </div>
      </main>

      <Dialog open={approvedBooking !== null} onOpenChange={(open) => { if (!open) setApprovedBooking(null); }}>
        <DialogContent className={cn("sm:max-w-md")}>
          <DialogHeader>
            <span className={cn("grid size-10 place-items-center rounded-lg bg-success-subtle text-success")}>
              <Icon name="CheckCircle2" size={20} />
            </span>
            <DialogTitle>Request approved</DialogTitle>
            <DialogDescription>
              {approvedBooking ? `${approvedBooking.patientName} · ${approvedBooking.examType} is now confirmed. Attach the imaging report so it can be published to the patient.` : "The booking is now confirmed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <MainButton type="button" variant="ghost" onClick={() => setApprovedBooking(null)}>
              Back to requests
            </MainButton>
            <MainButton
              type="button"
              variant="primary"
              icon={<Icon name="UploadCloud" size={16} />}
              isLeftIconVisible
              onClick={() => { setApprovedBooking(null); router.push("/reports"); }}
            >
              Attach report
            </MainButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ReportDashboardShell>
  );
}
