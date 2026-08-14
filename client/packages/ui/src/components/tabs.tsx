"use client";

import { cn } from "../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

/**
 * The app's Tabs come in two visual styles, selected with one `variant` prop:
 *
 * - `underline` (default): the flat, full-width ledger tabs with an accent
 *   underbar on the active trigger. This is the historical behavior, so every
 *   existing call site keeps working untouched.
 * - `pill`: a rounded segmented control — a tinted track with a raised,
 *   surface-filled pill sliding under the active trigger. Use it for a small
 *   set of peer views (e.g. Brief Understanding vs Source history) where a
 *   segmented toggle reads better than document-style tabs.
 *
 * `TabsList` owns the variant and shares it down to its `TabsTrigger`s through
 * context, so a caller sets the style once on the list and every trigger
 * matches automatically — no need to repeat the variant on each trigger.
 */
const TabsVariantContext = React.createContext<"underline" | "pill">(
  "underline",
);

/** The container / track. Shape and fill differ per variant. */
const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      underline: "h-9 w-fit justify-center border-b border-border",
      pill: "h-10 w-fit justify-center gap-1 rounded-full bg-surface-subtle p-1",
    },
  },
  defaultVariants: {
    variant: "underline",
  },
});

/** A single tab. The active/inactive treatment differs per variant. */
const tabsTriggerVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        underline:
          "text-foreground-muted h-full flex-1 border-b-2 border-transparent px-4 py-1 data-[state=inactive]:border-border data-[state=active]:border-primary data-[state=active]:text-primary",
        pill: "text-foreground-muted h-full rounded-full px-4 py-1 data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-xs",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

/** Root — a thin pass-through over Radix's Tabs root. */
function Tabs({
  className,
  ...properties
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...properties}
    />
  );
}

/**
 * The tab bar. Reads its `variant`, applies the matching track style, and
 * publishes the variant to its triggers so they render the same style.
 */
function TabsList({
  className,
  variant = "underline",
  ...properties
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsVariantContext.Provider value={variant ?? "underline"}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...properties}
      />
    </TabsVariantContext.Provider>
  );
}

/**
 * A single tab trigger. Takes its style from the enclosing `TabsList`'s
 * variant by default; an explicit `variant` prop still wins if a caller ever
 * needs to override one trigger.
 */
function TabsTrigger({
  className,
  variant,
  ...properties
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>) {
  const listVariant = React.useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerVariants({ variant: variant ?? listVariant }),
        className,
      )}
      {...properties}
    />
  );
}

/** The panel for one tab's content. */
function TabsContent({
  className,
  ...properties
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...properties}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
