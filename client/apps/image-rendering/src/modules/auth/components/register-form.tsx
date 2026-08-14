"use client";

import { FormEvent, useState } from "react";
import { Card } from "@healthalst/ui/components/card";
import { Input } from "@healthalst/ui/components/input";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { MainButton } from "@healthalst/ui/lib/button";
import { cn } from "@healthalst/ui/lib/utils";
import type { RegistrationPayload } from "../types";
import { AuthShell } from "./auth-shell";

/** Laboratory-only registration: staff accounts are created by the laboratory, patients by the platform. */
export function RegisterForm({ error, onSubmit, onSignIn }: {
  error?: string | null;
  onSubmit: (payload: RegistrationPayload) => Promise<void>;
  onSignIn: () => void;
}) {
  const [ownerName, setOwnerName] = useState("");
  const [laboratoryName, setLaboratoryName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true);
    try { await onSubmit({ ownerName, laboratoryName, location, address, email, password }); }
    finally { setSubmitting(false); }
  }

  return (
    <AuthShell eyebrow="Register your laboratory" title="Open a laboratory workspace." description="Laboratories register once. Staff accounts are created by the laboratory owner, and patients are provisioned automatically when they book an appointment.">
      <Card className={cn("gap-0 p-6 shadow-sm")}>
        <form className={cn("grid gap-4")} onSubmit={submit}>
          <Field id="register-owner" label="Owner name"><Input id="register-owner" autoComplete="name" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required /></Field>
          <Field id="register-laboratory" label="Laboratory name"><Input id="register-laboratory" value={laboratoryName} onChange={(event) => setLaboratoryName(event.target.value)} required /></Field>
          <div className={cn("grid gap-4 sm:grid-cols-2")}>
            <Field id="register-location" label="Location"><Input id="register-location" placeholder="e.g. Yaba, Lagos" value={location} onChange={(event) => setLocation(event.target.value)} required /></Field>
            <Field id="register-address" label="Street address"><Input id="register-address" placeholder="e.g. 20 Herbert Macaulay Way, Yaba" value={address} onChange={(event) => setAddress(event.target.value)} required /></Field>
          </div>
          <Field id="register-email" label="Email"><Input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
          <Field id="register-password" label="Password"><Input id="register-password" type="password" autoComplete="new-password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} required /><span className={cn("text-[11px] text-foreground-muted")}>At least 10 characters</span></Field>
          {error ? <InlineNotice tone="risk" title="Could not create account">{error}</InlineNotice> : null}
          <MainButton type="submit" variant="primary" className={cn("w-full")} isLoading={submitting} isDisabled={submitting}>Register laboratory</MainButton>
          <MainButton type="button" variant="ghost" className={cn("w-full")} onClick={onSignIn}>Already registered? Sign in</MainButton>
        </form>
      </Card>
    </AuthShell>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-2")}><label className={cn("text-sm font-medium text-foreground")} htmlFor={id}>{label}</label>{children}</div>;
}