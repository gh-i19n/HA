"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { MainButton } from "@healthalst/ui/lib/button";
import { Card } from "@healthalst/ui/components/card";
import { Input } from "@healthalst/ui/components/input";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { cn } from "@healthalst/ui/lib/utils";
import type { LoginPayload } from "../types";
import { AuthShell } from "./auth-shell";

type LoginFormProperties = {
  error?: string | null;
  onSubmit: (payload: LoginPayload) => Promise<void>;
  onRegister: () => void;
};

/** Presents the single entry point for laboratory and patient accounts. */
export function LoginForm({ error, onSubmit, onRegister }: LoginFormProperties) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Prevents a browser navigation and delegates credentials to the auth service. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ email, password });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to healthAlst." description="Laboratory staff sign in here. Patients receive their sign-in details by email when their results are ready.">
        <Card className={cn("gap-0 p-6") }>
          <form className={cn("grid gap-5") } onSubmit={handleSubmit}>
            <div className={cn("grid gap-2") }>
              <label className={cn("text-sm font-medium text-foreground")} htmlFor="email">Email</label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-describedby={error ? "login-error" : undefined} required />
            </div>
            <div className={cn("grid gap-2") }>
              <label className={cn("text-sm font-medium text-foreground")} htmlFor="password">Password</label>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={error ? "login-error" : undefined} required />
            </div>
            {error ? <InlineNotice id="login-error" tone="risk" title="Could not sign in">{error}</InlineNotice> : null}
            <MainButton type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting} className={cn("w-full") }>
              Sign in
            </MainButton>
            <div className={cn("h-px bg-border")} />
            <MainButton type="button" variant="outline" onClick={onRegister} className={cn("w-full") }>
              Register a laboratory
            </MainButton>
            <p className={cn("m-0 text-center text-xs text-foreground-muted")}>
              New patient? <Link className={cn("font-medium text-primary hover:underline")} href="/book">Book an appointment</Link> — no account needed.
            </p>
          </form>
        </Card>
    </AuthShell>
  );
}
