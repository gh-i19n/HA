import { cn } from '../lib/utils'
import type * as React from 'react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from './empty'

/**
 * EmptyState — the one-call answer for "there's nothing here yet".
 *
 * The `Empty*` family in `./empty` is a set of low-level building blocks (a
 * compound component): flexible, but every "nothing here" screen had to
 * re-assemble the same icon → title → description → action skeleton by hand,
 * ~15 lines at a time, across ~30 call sites. That repetition is structural,
 * not stylistic — the parts carry the shared *styling*, but the *shape* (which
 * parts, in which order, with which spacing) was copied everywhere and free to
 * drift.
 *
 * This wrapper fixes the shape in one place. Pass the content as props and it
 * lays the pieces out in the canonical order; anything you omit simply isn't
 * rendered (an empty state with only a description, or no action, is common and
 * valid). It composes the primitives rather than replacing them — so a rare
 * screen that needs something this API can't express (two differently-styled
 * descriptions, a custom media block) can still drop down to the raw `Empty*`
 * parts. Reach for those only when this wrapper genuinely cannot fit.
 *
 * The icon is passed as an element (e.g. `<Icon name="Calendar" />`) so the
 * caller controls which glyph and its size; the wrapper only supplies the
 * standard tinted media chip around it.
 */
interface EmptyStateProperties {
  /** Glyph shown in the standard tinted chip, e.g. `<Icon name="Calendar" />`. Omit for a text-only empty state. */
  icon?: React.ReactNode
  /** Short heading naming what is missing. */
  title?: React.ReactNode
  /** One or two sentences explaining the state and how to leave it. Links inside are auto-styled. */
  description?: React.ReactNode
  /** Call-to-action(s), normally `MainButton`(s). Omit for a purely informational empty state. */
  actions?: React.ReactNode
  /**
   * Text/content alignment. `center` (default) is the full-surface empty state;
   * `start` left-aligns everything for an inline prompt sitting inside a wider
   * card or checkpoint, where centred content would read as misplaced.
   */
  align?: 'center' | 'start'
  /** Passed to the root `Empty` — use for surface/spacing overrides like `min-h-80 bg-surface shadow-xs`. */
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  align = 'center',
  className,
}: EmptyStateProperties) {
  // The primitives default to centred; for an inline prompt we flip the root,
  // header, and action cluster to the leading edge in one place instead of at
  // every call site. `className` is applied last so a caller can still override.
  const start = align === 'start'
  return (
    <Empty className={cn(start && 'items-start text-left', className)}>
      <EmptyHeader className={cn(start && 'items-start text-left')}>
        {icon && (
          <span className='p-2 rounded-xl bg-surface-subtle'>{icon}</span>
        )}
        {title && (
          <EmptyTitle className='font-medium text-sm tracking-tight'>
            {title}
          </EmptyTitle>
        )}
        {description && (
          <EmptyDescription className='text-xs font-light text-foreground-muted/55'>
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {actions && (
        // A start-aligned inline prompt spans its container, so its action row
        // is not capped at the centred default's narrow max-width.
        <EmptyContent className={cn(start && 'max-w-none items-start')}>
          {actions}
        </EmptyContent>
      )}
    </Empty>
  )
}
