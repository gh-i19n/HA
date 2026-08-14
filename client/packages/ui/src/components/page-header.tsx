import { cn } from '../lib/utils';
import * as React from 'react';

/**
 * PageHeader — the standard header block at the top of a full page view.
 *
 * Every major workspace page opens the same way: a small all-caps eyebrow
 * naming where you are in the event lifecycle ("COORDINATION · MASTER PLAN"),
 * the page title in the sans typeface (Inter Tight), a sentence of supporting
 * description, and an optional cluster of page-level actions on the right.
 *
 * Typography note: the page title has two intentional voices, chosen with the
 * `display` prop. By default it is set in the sans family (Inter Tight) — the
 * right, quiet choice for a working surface (Master Plan, Budget). Pass
 * `display` on a marquee/brand surface (the events portfolio landing) and the
 * title switches to the Fraunces display serif, the one place we let the serif
 * sing. Either way the family is stated explicitly on the element rather than
 * relied on as an inherited default, so a title rendered inside some future
 * serif- or sans-scoped container still comes out in the intended typeface.
 * (The serif's optical-size axis is set globally on `h1` in base.css, so
 * display titles get display-tuned letterforms and tight leading for free.)
 *
 * Before this component existed each page hand-rolled that block, and the
 * copies had already drifted apart — different title sizes, different font
 * weights, the eyebrow inside the flex row on one page and outside it on
 * another. Centralising it means a change to page-header rhythm happens in
 * one file rather than being hunted down across every view.
 *
 * Layout note (this is the part that is easy to get wrong by hand): the title
 * column and the action cluster are siblings in a flex row. The action cluster
 * is marked `shrink-0` so the buttons keep their natural width and stay on one
 * line, and the title column gets `min-w-0` so it — not the buttons — absorbs
 * the remaining space. Without those two, flexbox lets the buttons be squeezed
 * until they wrap one-per-line while the title still wraps mid-phrase.
 *
 * The header stacks vertically on narrow screens and only becomes a row at
 * `sm`, where there is enough width for actions to sit beside the title.
 */
interface PageHeaderProperties {
  /** Small all-caps line above the title, e.g. "COORDINATION · MASTER PLAN". */
  eyebrow?: React.ReactNode;
  /** The page title. Rendered as the page's single `h1`. */
  title: React.ReactNode;
  /** One or two sentences explaining what the planner does on this page. */
  description?: React.ReactNode;
  /**
   * When true, render the title in the Fraunces display serif instead of the
   * default Inter Tight sans. Reserve this for marquee/brand surfaces (the
   * events portfolio landing) — the serif loses its impact if every working
   * page reaches for it.
   */
  display?: boolean;
  /**
   * Page-level actions, normally `MainButton`s. Kept at natural width and
   * right-aligned; wraps internally only if the buttons genuinely cannot fit.
   */
  actions?: React.ReactNode;
  /** Optional id for the `h1`, so a `section` can be `aria-labelledby` it. */
  titleId?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProperties> = ({
  eyebrow,
  title,
  description,
  actions,
  display,
  titleId,
  className,
}) => {
  return (
    <header
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      {/* min-w-0 lets this column shrink so the action cluster never does. */}
      <div className="min-w-0">
        {eyebrow ? (
          <p className="m-0 text-xs font-semibold capitalize tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            'm-0 mt-2 text-balance text-4xl font-normal tracking-tight text-foreground',
            // Serif display titles need tight leading so a two-line title reads
            // as one considered phrase; the sans default is comfortable as-is.
            display ? 'font-serif leading-tight' : 'font-sans',
          )}
          id={titleId}
        >
          {title}
        </h1>
        {description ? (
          <p className="m-0 mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted font-light">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        // shrink-0 keeps the buttons at natural width instead of being
        // compressed until each one wraps onto its own line.
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
};
