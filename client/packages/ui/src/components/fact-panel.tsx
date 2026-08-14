import { cn } from '../lib/utils'
import * as React from 'react'
import { Icon } from '../lib/icons/icon'
import type { AnyIconName } from '../lib/icons/types'
import { NumericText } from './numeric-text'
import { PanelHeader } from './panel-header'

/** One label/value fact shown in a FactPanel cell. */
export interface PanelFact {
  /**
   * Optional glyph in a tinted medallion beside the fact. Omit for facts that
   * read fine as plain label/value pairs (e.g. governance status), in which
   * case no medallion is rendered and the text takes the full cell width.
   */
  readonly icon?: AnyIconName
  /** Muted field name, e.g. "Event date". */
  readonly label: string
  /** The captured value, e.g. "Mar 18, 2027". */
  readonly value: string
  /** When true the value is tinted as a warning (not yet captured). */
  readonly missing?: boolean
}

interface FactPanelProperties {
  /** Muted eyebrow naming the kind of record, e.g. "Planning record". */
  readonly eyebrow: string
  /** The panel heading, e.g. "Event essentials". */
  readonly title: string
  /**
   * Optional glyph shown in the header medallion, e.g. a shield for a handover
   * panel. Passed straight to PanelHeader.
   */
  readonly icon?: React.ReactNode
  /**
   * Optional supporting line under the header, e.g. "Opens when all seven
   * Concept decisions are complete." Sits between the header and the fact band.
   */
  readonly description?: string
  /** Optional id for the heading so a section can be aria-labelledby it. */
  readonly titleId?: string
  /** The facts to display. */
  readonly facts: readonly PanelFact[]
  /**
   * How many fact columns the grid uses from `sm` up (1 or 2), in the `banded`
   * variant only. One column suits a narrow side panel; two suits a wide
   * record. Below `sm` it is always a single column. Defaults to 2. Ignored by
   * the `plain` variant, which is always a single stacked list.
   */
  readonly columns?: 1 | 2
  /**
   * How the facts are presented:
   *
   * - `banded` (default): facts sit in a tinted `bg-surface-subtle` band divided
   *   by hairline borders — the substantial, auditable record look
   *   (Budget estimate, Overview panels).
   * - `plain`: no tint; facts are a quiet `divide-y` list that shares the
   *   card's padding — the lighter checklist look used for status side panels
   *   (e.g. Coordination handover).
   */
  readonly variant?: 'banded' | 'plain'
  /**
   * Optional content rendered inside the card, below the facts — e.g. an
   * InlineNotice summarising the panel's overall state. Keeping it inside the
   * card (rather than as a sibling below it) means the status reads as part of
   * the same record. Available in the `plain` variant, where it shares the
   * card's padding.
   */
  readonly footer?: React.ReactNode
  readonly className?: string
}

/**
 * A record card that makes a small set of facts read as one substantial,
 * auditable block rather than a thin scatter of label/value pairs.
 *
 * The treatment mirrors the Budget estimate's confirmed-authority card: a
 * single elevated `bg-surface` card whose facts live in a tinted
 * `bg-surface-subtle` band divided by hairline borders (like the Working
 * target / Approved maximum / Planning headroom row). That border-integrated
 * banding is what gives the content weight — a nested tinted block floating
 * inside the card with no border logic reads as scanty, which is exactly what
 * this replaces.
 *
 * It is the single reusable shape for "a titled panel of facts", so every such
 * panel (event essentials, accountability, and any future record) stays
 * identical instead of each re-inventing the banding and drifting apart.
 */
export function FactPanel({
  eyebrow,
  title,
  icon,
  description,
  titleId,
  facts,
  columns = 2,
  variant = 'banded',
  footer,
  className,
}: FactPanelProperties) {
  const isPlain = variant === 'plain'

  return (
    <section
      className={cn(
        // An elevated resting surface — shadow-defined rather than
        // border-defined, so the card floats on the canvas instead of being
        // outlined by a box. Internal hairline dividers still rule the fact
        // band.
        'overflow-hidden rounded-xl bg-surface shadow-sm',
        // The plain variant keeps everything inside one padded card, so it
        // carries the bottom padding here; the banded variant closes on its
        // tinted band instead.
        isPlain && 'px-5 py-5 sm:px-6',
        className,
      )}
    >
      {/* Header region. In the banded variant it sits in its own padding above
          the tinted band; in the plain variant it shares the card's padding.
          An optional description line explains what the record is (e.g. a
          handover panel's unlock condition). */}
      <div className={cn(!isPlain && 'px-5 pt-5 sm:px-6')}>
        <PanelHeader
          eyebrow={eyebrow}
          icon={icon}
          title={title}
          titleId={titleId}
        />
        {description ? (
          <p className={cn('mt-2 text-xs leading-relaxed text-foreground-muted')}>
            {description}
          </p>
        ) : null}
      </div>

      {isPlain ? (
        /* Plain variant — a quiet divide-y list, no tint, sharing the card's
           padding. Reads as a light status checklist rather than a heavy
           record band. */
        <dl className={cn('mt-4 divide-y divide-border')}>
          {facts.map((fact) => (
            <div
              className={cn('flex items-start gap-3 py-3 first:pt-0')}
              key={fact.label}
            >
              {fact.icon ? (
                <Icon
                  className={cn('mt-0.5 shrink-0 text-foreground-muted')}
                  name={fact.icon}
                  size={15}
                />
              ) : null}
              <div className={cn('min-w-0 flex-1')}>
                <dt className={cn('text-xs font-normal text-foreground-muted')}>
                  {fact.label}
                </dt>
                <dd
                  className={cn(
                    'mt-1 truncate text-sm font-semibold text-foreground',
                    fact.missing && 'text-warning',
                  )}
                >
                  <NumericText>{fact.value}</NumericText>
                </dd>
              </div>
            </div>
          ))}
        </dl>
      ) : (
        /* Banded variant — facts sit in a tinted band divided by hairlines.
           With a footer the band gets a closing bottom border too, so the
           white footer reads as a distinct region below it (like the Budget
           card); without one the card's `overflow-hidden` rounds the band off
           cleanly. */
        <dl
          className={cn(
            'mt-4 grid border-t border-border bg-surface-subtle',
            footer && 'border-b',
            columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1',
          )}
        >
          {facts.map((fact, index) => (
            <div
              className={cn(
                'flex min-w-0 items-start gap-3 px-5 py-4 sm:px-6',
                // A top border on every cell after the first draws the
                // horizontal dividers; from sm the second column of each row
                // drops its top border and takes a left border instead, so the
                // grid is cleanly ruled in both axes.
                index > 0 && 'border-t border-border',
                columns === 2 && index % 2 === 1 && 'sm:border-l sm:border-border',
                columns === 2 && index >= 2 && 'sm:border-t sm:border-border',
                columns === 2 && index < 2 && 'sm:border-t-0',
              )}
              key={fact.label}
            >
              {fact.icon ? (
                <span
                  className={cn(
                    'mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface text-foreground-muted',
                  )}
                >
                  <Icon name={fact.icon} size={15} />
                </span>
              ) : null}
              <div className={cn('min-w-0')}>
                <dt className={cn('text-xs font-normal text-foreground-muted')}>
                  {fact.label}
                </dt>
                <dd
                  className={cn(
                    'mt-1 truncate text-base font-semibold text-foreground',
                    fact.missing && 'text-warning',
                  )}
                >
                  <NumericText>{fact.value}</NumericText>
                </dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {/* Footer content lives inside the card so a summary notice reads as part
          of the record. In the plain variant it shares the card's padding; in
          the banded variant (whose band closes the card) it gets its own. */}
      {footer ? (
        <div className={cn('mt-5', !isPlain && 'px-5 pb-5 sm:px-6')}>
          {footer}
        </div>
      ) : null}
    </section>
  )
}
