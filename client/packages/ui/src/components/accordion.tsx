'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@healthalst/ui/lib/utils';

function Accordion({
  ...properties
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...properties} />;
}

function AccordionItem({
  className,
  ...properties
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...properties}
    />
  );
}

interface AccordionTriggerProps
  extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  /**
   * Suppresses the built-in chevron and the default trigger styling, leaving
   * the caller's `children` and `className` in full control of the header.
   *
   * Exists because some headers are richer than a text label — the brief
   * Understanding chapters carry an icon, a "n of m captured" count and their
   * own directional chevron. Without this they would render two chevrons and
   * fight the default `py-4 text-sm hover:underline` styling. Defaults to
   * false, so existing callers keep the standard shadcn appearance.
   */
  readonly bare?: boolean;
}

function AccordionTrigger({
  className,
  children,
  bare = false,
  ...properties
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          bare
            ? 'flex flex-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
            : 'focus-visible:border-ring focus-visible:ring-ring/50 flex ' +
                'flex-1 items-start justify-between gap-4 rounded-md py-4 ' +
                'text-left text-sm font-medium transition-all outline-none ' +
                'hover:underline focus-visible:ring-[3px] disabled:pointer-events-none ' +
                'disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...properties}
      >
        {children}
        {!bare ? (
          <ChevronDownIcon
            className="text-foreground-muted
        pointer-events-none size-6 shrink-0 translate-y-0.5
        transition-transform duration-300 ease-out"
          />
        ) : null}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...properties
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up
      data-[state=open]:animate-accordion-down
      data-[state=closed]:duration-300
      data-[state=open]:duration-300 data-[state=closed]:ease-in-out
      data-[state=open]:ease-in-out
      overflow-hidden text-sm"
      {...properties}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
