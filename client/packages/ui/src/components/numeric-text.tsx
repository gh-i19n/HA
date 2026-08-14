import { cn } from '../lib/utils';
import * as React from 'react';

/**
 * Matches a run of digits that belongs to one number — including internal
 * grouping/decimal marks (`1,250`, `85,000.50`) but never trailing punctuation
 * or spaces, so `Jun 1, 2027` splits into `1` and `2027` rather than one run.
 */
const NUMBER_RUN = /\d[\d,.]*\d|\d/g;

interface NumericTextProperties {
  /** The text to render. Only the numeric runs inside it become mono. */
  children: string;
  /** Extra classes for the mono numeral spans (merged after the defaults). */
  numeralClassName?: string;
}

/**
 * Renders a string with only its **numbers** set in the mono typeface, leaving
 * the surrounding words on the ambient (sans) stack. Drop it around any value —
 * `1,250 on-site`, `US$85,000`, `Jun 1, 2027` — and just the digits line up as
 * data while the attached text ("on-site", "US$", "Jun") reads normally.
 *
 * It returns a fragment with no wrapper element, so it inherits the size,
 * weight, and colour of whatever it is placed inside; the numeral spans only
 * add the mono family and tabular figures on top.
 */
export function NumericText({ children, numeralClassName }: NumericTextProperties) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  // matchAll on a global regex iterates with its own state, so the shared
  // NUMBER_RUN pattern is safe to reuse across renders.
  for (const match of children.matchAll(NUMBER_RUN)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push(children.slice(cursor, start));
    parts.push(
      <span
        className={cn('font-mono tabular-nums', numeralClassName)}
        key={key++}
      >
        {match[0]}
      </span>,
    );
    cursor = start + match[0].length;
  }
  if (cursor < children.length) parts.push(children.slice(cursor));

  return <>{parts}</>;
}
