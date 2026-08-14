"use client";

import { cn } from "../lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

function Switch({
  className,
  ...properties
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=unchecked]:bg-border " +
          "dark:data-[state=unchecked]:bg-input/80 " +
          "data-[state=checked]:bg-[color-mix(in_oklab,var(--primary)_45%,var(--background))] " +
          "focus-visible:border-ring focus-visible:ring-ring/50 " +
          "inline-flex w-10 shrink-0 items-center rounded-full border border-transparent p-0.5 " +
          "shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...properties}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background shadow-sm dark:bg-foreground pointer-events-none block " +
            "size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%+1.5px)] " +
            "data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
