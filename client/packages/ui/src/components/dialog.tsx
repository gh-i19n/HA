"use client";

import { cn } from "@healthalst/ui/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

/** Provides the Radix state root used by every shared dialog composition. */
function Dialog({
  modal = false,
  ...properties
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return (
    <DialogPrimitive.Root data-slot="dialog" modal={modal} {...properties} />
  );
}

/** Connects a trigger control to its nearest dialog root. */
function DialogTrigger({
  ...properties
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...properties} />;
}

/** Renders dialog layers outside the normal document stacking context. */
function DialogPortal({
  ...properties
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...properties} />;
}

/** Closes the nearest dialog while preserving Radix focus restoration. */
function DialogClose({
  ...properties
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...properties} />;
}

/** Provides the visual backdrop for the project's intentionally non-modal dialogs. */
function DialogOverlay({
  className,
  ...properties
}: React.ComponentProps<"div">) {
  // Radix's own DialogPrimitive.Overlay renders null whenever the Dialog's
  // `modal` prop is falsy, and this project's Dialog defaults modal={false}
  // (see packages/ui/src/components/dialog.tsx Dialog). A plain div here
  // still mounts/unmounts correctly because DialogPortal wraps every direct
  // child in its own Presence keyed on the dialog's open state, independent
  // of `modal`. pointer-events-none keeps it purely visual so background
  // content stays interactive, matching the non-modal behavior.
  return (
    <div
      data-slot="dialog-overlay"
      data-state="open"
      className={cn(
        "pointer-events-none fixed inset-0 z-50 bg-overlay/50 backdrop-blur-sm",
        "animate-in fade-in-0",
        className,
      )}
      {...properties}
    />
  );
}

interface DialogContentProperties extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  hideClose?: boolean;
}

/** Positions the accessible dialog surface and supplies its close control. */
function DialogContent({
  className,
  children,
  hideClose = false,
  ...properties
}: DialogContentProperties) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-11/12 -translate-x-1/2 -translate-y-1/2",
          "gap-4 rounded-xl bg-background p-6 shadow-xl",
          "duration-200 sm:max-w-lg",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...properties}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100",
              "ring-offset-background focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-foreground-muted",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** Aligns the dialog title and description across screen sizes. */
function DialogHeader({
  className,
  ...properties
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...properties}
    />
  );
}

/** Arranges secondary and primary dialog actions responsively. */
function DialogFooter({
  className,
  ...properties
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...properties}
    />
  );
}

/** Applies the shared typographic treatment to an accessible dialog title. */
function DialogTitle({
  className,
  ...properties
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...properties}
    />
  );
}

/** Styles the accessible supporting description for a dialog. */
function DialogDescription({
  className,
  ...properties
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-foreground-muted text-sm", className)}
      {...properties}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
