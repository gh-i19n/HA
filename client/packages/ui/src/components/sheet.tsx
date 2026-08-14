"use client";

import { cn } from "../lib/utils";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

function Sheet({
  modal = false,
  ...properties
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return (
    <SheetPrimitive.Root data-slot="sheet" modal={modal} {...properties} />
  );
}

function SheetTrigger({
  ...properties
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...properties} />;
}

function SheetClose({
  ...properties
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...properties} />;
}

function SheetPortal({
  ...properties
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...properties} />;
}

function SheetOverlay({
  className,
  ...properties
}: React.ComponentProps<"div">) {
  // Radix's own SheetPrimitive.Overlay (react-dialog's Overlay) renders null
  // whenever the Sheet's `modal` prop is falsy, and Sheet defaults
  // modal={false}. A plain div here still mounts/unmounts correctly because
  // SheetPortal wraps every direct child in its own Presence keyed on the
  // sheet's open state, independent of `modal`. pointer-events-none keeps it
  // purely visual so background content stays interactive, matching the
  // non-modal behavior.
  return (
    <div
      data-slot="sheet-overlay"
      data-state="open"
      className={cn(
        "animate-in fade-in-0 pointer-events-none fixed inset-0 z-50" +
          " bg-overlay/50",
        className,
      )}
      {...properties}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...properties
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-xl transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto",
          className,
        )}
        {...properties}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-surface-subtle absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  ...properties
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...properties}
    />
  );
}

function SheetFooter({
  className,
  ...properties
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...properties}
    />
  );
}

function SheetTitle({
  className,
  ...properties
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...properties}
    />
  );
}

function SheetDescription({
  className,
  ...properties
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-foreground-muted text-sm", className)}
      {...properties}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
