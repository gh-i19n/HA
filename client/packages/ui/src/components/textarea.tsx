import { cn } from "../lib/utils";
import * as React from "react";

/** Provides the shared, visibly bounded surface for multi-line form values. */
function Textarea({
  className,
  ...properties
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "text-foreground placeholder:text-foreground-muted placeholder:text-sm placeholder:italic aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger flex field-sizing-content min-h-50 w-full rounded-lg border border-border-strong bg-surface-subtle/40 px-3.5 py-2.5 text-sm shadow-none transition-[color,box-shadow] outline-none hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:opacity-60",
        className,
      )}
      {...properties}
    />
  );
}

export { Textarea };
