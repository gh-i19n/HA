import { cn } from '../lib/utils';
import type { ReactNode } from 'react';

/**
 * The application's label typography, in one place.
 *
 * These exist because `uppercase tracking-widest` had spread to ~185 call
 * sites and was doing four different jobs at once — page kicker, card heading,
 * field label, table column header. When every level shouts, none of them
 * signals anything, and the interface reads as noise.
 *
 * The rule these encode: **all-caps is reserved for the page eyebrow.** It is a
 * kicker device that earns attention by being rare. Everything nested inside a
 * card or form uses sentence case and establishes hierarchy through size,
 * weight and colour instead.
 *
 * Prefer these over ad-hoc label classes so the styling stays in one file and
 * cannot drift back to bespoke caps.
 */

interface LabelProperties {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * The small kicker above a page title ("Concept" over "Big Idea"). The one
 * place all-caps is correct: it must register as a category without competing
 * with the h1 beneath it.
 */
export function PageEyebrow({ children, className }: LabelProperties) {
  return (
    <p
      className={cn(
        'm-0 text-xs font-semibold uppercase tracking-widest text-primary',
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * Names a section within a card or panel ("Objectives", "Sessions"). Sentence
 * case: it sits inside a bounded surface that already separates it from its
 * neighbours, so it needs weight rather than volume.
 */
export function SectionHeading({ children, className }: LabelProperties) {
  return (
    <p className={cn('m-0 text-sm font-medium text-foreground', className)}>
      {children}
    </p>
  );
}

/**
 * Labels a single value in a detail grid or form ("Venue name", "Duration").
 * Quiet by design — the value it introduces is the content, not the label.
 */
export function FieldLabel({ children, className }: LabelProperties) {
  return (
    <span className={cn('text-xs font-medium text-foreground-muted', className)}>
      {children}
    </span>
  );
}

/**
 * A table or grid column header ("Metric", "Target"). Lighter than a field
 * label because it is repeated across every row and should recede once the
 * reader has parsed the table's shape.
 */
export function ColumnLabel({ children, className }: LabelProperties) {
  return (
    <span className={cn('text-xs font-medium text-foreground-muted', className)}>
      {children}
    </span>
  );
}
