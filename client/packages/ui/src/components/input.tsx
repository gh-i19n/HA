import { cn } from "../lib/utils";
import * as React from "react";

/** Provides the shared, visibly bounded surface for single-line form values. */
function Input({
  className,
  type,
  ...properties
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "text-foreground file:text-foreground selection:bg-primary selection:text-primary-foreground placeholder:text-sm placeholder:text-foreground-muted " +
          "flex h-9 w-full min-w-0 rounded-lg border border-border-strong bg-surface-subtle/40 px-3.5 py-1.5 text-sm shadow-none " +
          "transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent " +
          "file:text-sm file:font-medium hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 " +
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:opacity-60",
        "aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger",
        className,
      )}
      {...properties}
    />
  );
}

export { Input };
