import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type MetricSummaryTone = "neutral" | "ok" | "warn" | "risk";

export interface MetricSummaryProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly detail?: ReactNode;
  readonly tone?: MetricSummaryTone;
  readonly className?: string;
}

/**
 * Displays one labelled operational figure with a consistent tone. Feature
 * views supply the domain meaning while this shared component owns the visual
 * hierarchy used by package, event, and closeout summaries.
 */
export function MetricSummary({
  label,
  value,
  detail,
  tone = "neutral",
  className,
}: MetricSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface px-4 py-3 shadow-xs",
        tone === "ok" && "bg-success-tint/20",
        tone === "warn" && "bg-warning-tint/20",
        tone === "risk" && "bg-danger-tint/20",
        className,
      )}
    >
      <p className={cn("m-0 text-xs text-foreground-muted")}>{label}</p>
      <p
        className={cn(
          "m-0 mt-1 font-mono text-lg font-medium",
          tone === "ok" && "text-success",
          tone === "warn" && "text-warning",
          tone === "risk" && "text-danger",
          tone === "neutral" && "text-foreground",
        )}
      >
        {value}
      </p>
      {detail ? (
        <p className={cn("m-0 mt-1 text-xs text-foreground-muted")}>{detail}</p>
      ) : null}
    </div>
  );
}
