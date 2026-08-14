import { cn } from '../lib/utils'
import * as React from 'react'

/**
 * PanelHeader — the standard header row at the top of a content card/panel.
 *
 * Several panels open the same way: a small square icon "medallion" (a tinted
 * chip around a single glyph), a quiet eyebrow label naming the kind of
 * information ("Planning record", "Accountability"), and the panel's title
 * ("Event essentials", "People responsible"). Before this component existed
 * that block was hand-rolled at each panel — the same `flex items-center gap-3`
 * row, the same `size-9 rounded-xl bg-surface-subtle` chip, the same
 * eyebrow/title pair — copied and free to drift (a different chip size here, a
 * heavier eyebrow there).
 *
 * This is the props-based single-component form (the "Style A" API the codebase
 * requires): a caller configures one `<PanelHeader icon eyebrow title />`
 * rather than re-assembling the row from primitives. Changing the panel-header
 * rhythm now happens in this one file.
 *
 * Naming note: this is deliberately *not* called `CardHeader` — that name is a
 * shadcn layout slot in `card.tsx`. `PanelHeader` is the icon-medallion header
 * used inside a panel's body, the card-level sibling of the full-page
 * `PageHeader`.
 *
 * The icon is passed as an element (e.g. `<Icon name="FileCheck" size={17} />`)
 * so the caller controls the glyph; the wrapper only supplies the standard
 * tinted medallion around it — the same convention `EmptyState` uses for its
 * icon chip.
 */
interface PanelHeaderProperties {
  /** Glyph shown in the tinted medallion, e.g. `<Icon name="FileCheck" size={17} />`. */
  icon?: React.ReactNode
  /** Small muted label above the title, naming the kind of information. */
  eyebrow?: React.ReactNode
  /** The panel's heading, rendered as an `h2`. */
  title: React.ReactNode
  /** Optional id for the `h2`, so a `section` can be `aria-labelledby` it. */
  titleId?: string
  className?: string
}

/** Renders a panel's icon-medallion header from props. */
export function PanelHeader({
  icon,
  eyebrow,
  title,
  titleId,
  className,
}: PanelHeaderProperties) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      {/* The medallion: a fixed tinted chip that keeps every panel header's
          icon at the same size and tone regardless of the glyph inside it. */}
      {icon && (
        <div className='size-9 flex items-center justify-center shrink-0 rounded-xl bg-surface text-primary'>
          {icon}
        </div>
      )}
      <div className='min-w-0'>
        {eyebrow && (
          <h4 className='text-base font-semibold text-foreground'>{eyebrow}</h4>
        )}
        <p
          className='text-xs text-foreground-muted'
          id={titleId}
        >
          {title}
        </p>
      </div>
    </div>
  )
}
