"use client";

import { useState } from "react";
import { Card } from "@healthalst/ui/components/card";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { MainButton } from "@healthalst/ui/lib/button";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn } from "@healthalst/ui/lib/utils";
import { authService } from "../services/auth.service";
import type { User } from "../types";
import { AuthShell } from "./auth-shell";

/** Shown to staff whose laboratory workspace has not been activated yet. */
export function StaffOnboardingView({ user, onUserChange, onLogout }: {
  user: User;
  onUserChange: (user: User) => void;
  onLogout: () => Promise<void>;
}) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Re-reads the session; the server activates the laboratory workspace once one exists. */
  async function checkAccess() {
    setChecking(true);
    setError(null);
    try {
      const refreshed = await authService.currentUser();
      if (refreshed) onUserChange(refreshed);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not check your laboratory access.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Report staff · Pending laboratory"
      title="Your laboratory workspace is being set up."
      description="Your staff account is created by your laboratory. Once the laboratory owner or administrator activates your workspace, you will be able to manage bookings and reports here."
    >
      <Card className={cn("gap-0 p-6 shadow-sm")}>
        <div className={cn("grid place-items-start gap-4")}>
          <span className={cn("grid size-12 place-items-center rounded-xl bg-primary-subtle text-primary")}>
            <Icon name="Briefcase" size={22} />
          </span>
          <div className={cn("grid gap-1")}>
            <p className={cn("m-0 text-sm font-semibold text-foreground")}>{user.displayName}</p>
            <p className={cn("m-0 text-xs text-foreground-muted")}>{user.email}</p>
          </div>
          <p className={cn("m-0 text-xs leading-5 text-foreground-muted")}>
            Your laboratory activates your workspace from team settings. Check for access below, or sign out and sign in again at any time.
          </p>
          {error ? <InlineNotice tone="risk" title="Could not check access">{error}</InlineNotice> : null}
          <div className={cn("grid w-full gap-2")}>
            <MainButton type="button" variant="primary" className={cn("w-full")} isLoading={checking} onClick={() => void checkAccess()}>
              Check laboratory access
            </MainButton>
            <MainButton type="button" variant="ghost" className={cn("w-full")} onClick={() => void onLogout()}>
              Sign out
            </MainButton>
          </div>
        </div>
      </Card>
    </AuthShell>
  );
}
