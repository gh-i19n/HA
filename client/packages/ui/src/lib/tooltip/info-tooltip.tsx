'use client';

import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils';
import { ReusableTooltip } from './reusable-tooltip';

interface InfoTooltipProperties {
  /** Content rendered inside the tooltip popup. Accepts a string or any React node. */
  content: string | ReactNode;
  /** Placement of the tooltip relative to the icon. Defaults to "top". */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the tooltip along the cross-axis. Defaults to "center". */
  align?: 'start' | 'center' | 'end';
  /** Extra classes applied to the info icon button wrapper. */
  className?: string;
  /** Extra classes applied to the tooltip content bubble. */
  contentClassName?: string;
  /** Pixel size of the info icon. Defaults to 16. */
  iconSize?: number;
  /** Milliseconds before the tooltip opens. Defaults to 200. */
  delayDuration?: number;
  /** When true the tooltip is suppressed and the icon is still rendered. */
  disabled?: boolean;
  /** Max-width Tailwind class for the tooltip bubble. Defaults to "max-w-xs". */
  maxWidth?: string;
}

/**
 * A small, accessible info icon that displays a tooltip on hover.
 *
 * @example
 * <InfoTooltip content="Net pay after all deductions." />
 *
 * @example
 * <InfoTooltip
 *   content={<span>Rich <strong>content</strong> here</span>}
 *   side="right"
 *   iconSize={18}
 * />
 */
export const InfoTooltip = ({
  content,
  side = 'top',
  align = 'center',
  className,
  contentClassName,
  iconSize = 16,
  delayDuration = 200,
  disabled = false,
  maxWidth = 'max-w-xs',
}: InfoTooltipProperties) => {
  return (
    <ReusableTooltip
      content={content}
      side={side}
      align={align}
      contentClassName={contentClassName}
      delayDuration={delayDuration}
      disabled={disabled}
      maxWidth={maxWidth}
    >
      {/* button gives keyboard focus and ARIA semantics for free */}
      <button
        type="button"
        aria-label="More information"
        className={cn(
          'inline-flex cursor-default items-center justify-center rounded-full',
          'text-foreground-muted transition-colors hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          className
        )}
      >
        <Info size={iconSize} aria-hidden="true" />
      </button>
    </ReusableTooltip>
  );
};
