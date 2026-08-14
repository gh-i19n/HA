"use client";

import { type ReactNode } from "react";
import { cn } from "@healthalst/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface AppDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly headerActions?: ReactNode;
  readonly className?: string;
  readonly presentation?: "dialog" | "page";
  readonly pageHeaderVariant?: "display" | "compact";
  readonly workspaceCanvas?: boolean;
}

/** Renders shared content either as an overlay dialog or a full workspace page. */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  headerActions,
  className,
  presentation = "dialog",
  pageHeaderVariant = "display",
  workspaceCanvas = false,
}: AppDialogProps) {
  if (presentation === "page") {
    return (
      <main
        className={cn(
          "min-h-screen text-foreground",
          workspaceCanvas ? "bg-surface-subtle" : "bg-surface",
          className,
        )}
      >
        {/* Page mode supports a display treatment for lifecycle pages and a
            compact command header for dense operational workspaces. */}
        <header className={cn("border-b border-border bg-surface")}>
          <div
            className={cn(
              "mx-auto flex w-full flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between",
              pageHeaderVariant === "compact"
                ? "max-w-7xl py-4"
                : "max-w-6xl py-6",
            )}
          >
            <div className={cn("min-w-0")}>
              <h1
                className={cn(
                  "m-0 text-foreground",
                  pageHeaderVariant === "compact"
                    ? "font-sans text-lg font-semibold leading-snug"
                    : "font-serif text-4xl font-normal leading-tight tracking-tight",
                )}
              >
                {title}
              </h1>
              {description ? (
                <p
                  className={cn(
                    "m-0 mt-1 line-clamp-1 text-xs text-foreground-muted",
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>
            {headerActions ? (
              <div className={cn("flex shrink-0 flex-wrap items-center gap-2")}>
                {headerActions}
              </div>
            ) : null}
          </div>
        </header>
        <div
          className={cn(
            "mx-auto w-full px-5 py-6",
            pageHeaderVariant === "compact" ? "max-w-7xl" : "max-w-6xl",
          )}
        >
          {children}
        </div>
        {footer && (
          <div className={cn("border-t border-border bg-surface px-5 py-4")}>
            {footer}
          </div>
        )}
      </main>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={cn(
          "flex max-h-11/12 min-w-0 flex-col gap-0 overflow-hidden bg-surface p-0",
          className,
        )}
      >
        <DialogHeader
          className={cn("shrink-0 border-b border-border bg-surface p-5")}
        >
          <div className={cn("flex items-start justify-between gap-3")}>
            <DialogTitle
              className={cn(
                "text-xl font-semibold leading-none text-foreground",
              )}
            >
              {title}
            </DialogTitle>
            {headerActions ? (
              <div className={cn("flex shrink-0 flex-wrap items-center gap-2")}>
                {headerActions}
              </div>
            ) : null}
          </div>
          <DialogDescription className={cn("sr-only")}>
            {description ?? title}
          </DialogDescription>
        </DialogHeader>
        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-5",
          )}
        >
          {children}
        </div>
        {footer && (
          <div
            className={cn(
              "shrink-0 border-t border-border bg-surface px-5 py-4",
            )}
          >
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
