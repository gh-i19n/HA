import type { ReactNode } from "react";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "positive" | "warning";
};

export function StatusBadge({ children, tone = "positive" }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}
