"use client";

import { Skeleton } from "@healthalst/ui/components/skeleton";
import { cn } from "@healthalst/ui/lib/utils";
import { LoginForm } from "../auth/components/login-form";
import { StaffOnboardingView } from "../auth/components/staff-onboarding-view";
import { useAuth } from "../auth/hooks/use-auth";
import { ReportWorkspace } from "../reports/components/report-workspace";
import { PendingRequestsWorkspace } from "../reports/components/pending-requests-workspace";
import { BookingsWorkspace } from "../reports/components/bookings-workspace";
import { RegisterForm } from "../auth/components/register-form";
import { ReportDashboardShell } from "./report-dashboard-shell";
import { SettingsView } from "../settings/settings-view";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookingForm } from "../booking/components/booking-form";
import { BookingShell } from "../booking/components/booking-shell";

/** Selects the authenticated journey while keeping authorization server-side. */
export function HealthAlstShell() {
  const pathname = usePathname();
  const [authMode, setAuthMode] = useState<"login" | "register">(pathname === "/register" ? "register" : "login");
  const { user, isLoading, error, login, register, logout, setUser } = useAuth();

  if (isLoading) {
    return (
      <main className={cn("grid min-h-screen place-items-center bg-background p-6")}>
        <Skeleton className={cn("h-48 w-full max-w-md")} aria-label="Loading healthAlst" />
      </main>
    );
  }

  if (!user && pathname === "/book") {
    return (
      <BookingShell>
        <BookingForm onSignIn={() => setAuthMode("login")} onBookAnother={() => undefined} />
      </BookingShell>
    );
  }

  if (!user) {
    return authMode === "register"
      ? <RegisterForm error={error} onSubmit={register} onSignIn={() => setAuthMode("login")} />
      : <LoginForm error={error} onSubmit={login} onRegister={() => setAuthMode("register")} />;
  }

  const awaitingClinic = user.role === "STAFF" && user.organizationId === null;
  if (awaitingClinic) {
    return <StaffOnboardingView user={user} onUserChange={setUser} onLogout={logout} />;
  }

  if (pathname.startsWith("/settings")) {
    return (
      <ReportDashboardShell user={user} onLogout={logout} onUserChange={setUser}>
        <SettingsView user={user} onUserChange={setUser} />
      </ReportDashboardShell>
    );
  }

  if (pathname.startsWith("/bookings") && user.role === "STAFF") {
    return pathname === "/bookings/pending"
      ? <PendingRequestsWorkspace user={user} onLogout={logout} onUserChange={setUser} />
      : <BookingsWorkspace user={user} onLogout={logout} onUserChange={setUser} />;
  }

  return <ReportWorkspace user={user} onLogout={logout} onUserChange={setUser} />;
}
