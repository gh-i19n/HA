"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@healthalst/ui/lib/utils";

/** Public booking shell: appointment request without an account. */
export function BookingShell({ children }: { children: ReactNode }) {
  return (
    <main className={cn("grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,.95fr)]")}>
      <section className={cn("relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between")}>
        <div className={cn("absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_10%,hsl(var(--sidebar-accent))_0,transparent_42%)]")} />
        <Link href="/" className={cn("relative block w-fit")}>
          <p className={cn("m-0 font-serif text-2xl leading-none tracking-[-.05em] text-sidebar-foreground")}>healthAlst</p>
          <p className={cn("m-0 mt-1 text-[11px] text-sidebar-foreground/55")}>Clinical report delivery</p>
        </Link>
        <div className={cn("relative max-w-xl")}>
          <p className={cn("text-xs font-semibold uppercase tracking-[.18em] text-sidebar-foreground/55")}>No account needed</p>
          <h2 className={cn("mt-5 font-display text-5xl font-normal leading-[1.06] tracking-tight")}>Book an appointment with a registered laboratory.</h2>
          <p className={cn("mt-6 max-w-lg text-sm leading-7 text-sidebar-foreground/65")}>Choose a laboratory, pick a preferred date, and the laboratory will confirm the exact time by email. Your patient account and sign-in details are created automatically.</p>
        </div>
        <p className={cn("relative text-xs text-sidebar-foreground/45")}>Private · Accountable · Built for high-volume report queues</p>
      </section>
      <section className={cn("flex min-h-screen items-center justify-center px-5 py-10 sm:px-10")}>
        <div className={cn("w-full max-w-md")}>
          <nav aria-label="Account navigation" className={cn("mb-8 flex items-center justify-between gap-4 text-xs")}>
            <Link href="/" className={cn("font-medium text-foreground-muted transition-colors hover:text-foreground hover:underline")}>Back to sign in</Link>
            <span className={cn("text-foreground-muted")}>New laboratory? <Link href="/register" className={cn("font-semibold text-primary hover:underline")}>Register</Link></span>
          </nav>
          <p className={cn("text-xs font-semibold uppercase tracking-[.16em] text-primary")}>Book an appointment</p>
          <h1 className={cn("mt-3 text-4xl font-normal tracking-tight text-foreground")}>Choose your laboratory.</h1>
          <p className={cn("mt-3 text-sm leading-6 text-foreground-muted")}>Your request goes straight to the laboratory team, who confirm the appointment time by email.</p>
          <div className={cn("mt-8")}>{children}</div>
        </div>
      </section>
    </main>
  );
}
