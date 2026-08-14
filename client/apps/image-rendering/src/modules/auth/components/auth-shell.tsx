import type { ReactNode } from "react";
import { cn } from "@healthalst/ui/lib/utils";

/** Eventorch auth-shell composition tailored to healthcare report delivery. */
export function AuthShell({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className={cn("grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,.95fr)]")}>
      <section className={cn("relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between")}>
        <div className={cn("absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_10%,hsl(var(--sidebar-accent))_0,transparent_42%)]")} />
        <div className={cn("relative") }>
          <p className={cn("m-0 font-serif text-2xl leading-none tracking-[-.05em] text-sidebar-foreground")}>healthAlst</p>
          <p className={cn("m-0 mt-1 text-[11px] text-sidebar-foreground/55")}>Clinical report delivery</p>
        </div>
        <div className={cn("relative max-w-xl")}>
          <p className={cn("text-xs font-semibold uppercase tracking-[.18em] text-sidebar-foreground/55")}>Secure by design</p>
          <h2 className={cn("mt-5 font-display text-5xl font-normal leading-[1.06] tracking-tight")}>One trusted workspace from imaging centre to patient.</h2>
          <p className={cn("mt-6 max-w-lg text-sm leading-7 text-sidebar-foreground/65")}>Manage bookings, publish clinically final reports, and keep every patient informed without losing tenant or role boundaries.</p>
        </div>
        <p className={cn("relative text-xs text-sidebar-foreground/45")}>Private · Accountable · Built for high-volume report queues</p>
      </section>
      <section className={cn("flex min-h-screen items-center justify-center px-5 py-10 sm:px-10")}>
        <div className={cn("w-full max-w-md")}>
          <p className={cn("text-xs font-semibold uppercase tracking-[.16em] text-primary")}>{eyebrow}</p>
          <h1 className={cn("mt-3 text-4xl font-normal tracking-tight text-foreground")}>{title}</h1>
          <p className={cn("mt-3 text-sm leading-6 text-foreground-muted")}>{description}</p>
          <div className={cn("mt-8")}>{children}</div>
        </div>
      </section>
    </main>
  );
}
