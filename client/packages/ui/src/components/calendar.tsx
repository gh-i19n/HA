"use client";

import { cn } from "../lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker, type ChevronProps } from "react-day-picker";
import { buttonVariants } from "./button";

function Chevron({ orientation }: ChevronProps) {
  return orientation === "left" ? (
    <ChevronLeftIcon className="size-4" />
  ) : (
    <ChevronRightIcon className="size-4" />
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...properties
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-1",
        month_caption: "flex h-6 justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday: "text-foreground-muted h-5 w-8 shrink-0 rounded-md text-center font-normal text-xs",
        week: "flex w-full mt-1",
        day: cn(
          "relative w-8 shrink-0 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected=\"true\"])]:bg-accent [&:has([aria-selected=\"true\"].day-range-end)]:rounded-r-md",
          properties.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected=\"true\"])]:rounded-l-md last:[&:has([aria-selected=\"true\"])]:rounded-r-md"
            : "[&:has([aria-selected=\"true\"])]:rounded-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-6 w-8 p-0 font-normal aria-selected:opacity-100",
        ),
        range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-foreground-muted aria-selected:text-foreground-muted",
        disabled: "text-foreground-muted opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron,
      }}
      {...properties}
    />
  );
}

export { Calendar };
