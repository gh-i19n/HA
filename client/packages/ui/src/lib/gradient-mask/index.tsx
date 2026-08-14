import React from 'react';
import { cn } from '../utils';

type GradientMaskDirection = 'top' | 'bottom' | 'left' | 'right';

const directionStyles: Record<
  GradientMaskDirection,
  { position: string; gradient: string; size: string }
> = {
  bottom: {
    position: 'inset-x-0 bottom-0',
    gradient: 'bg-linear-to-t from-background via-background/70 to-transparent',
    size: 'h-24 sm:h-32 lg:h-44',
  },
  top: {
    position: 'inset-x-0 top-0',
    gradient: 'bg-linear-to-b from-background via-background/70 to-transparent',
    size: 'h-24 sm:h-32 lg:h-44',
  },
  left: {
    position: 'inset-y-0 left-0',
    gradient: 'bg-linear-to-r from-background via-background/70 to-transparent',
    size: 'w-16 sm:w-24 lg:w-36',
  },
  right: {
    position: 'inset-y-0 right-0',
    gradient: 'bg-linear-to-l from-background via-background/70 to-transparent',
    size: 'w-16 sm:w-24 lg:w-36',
  },
};

export interface GradientMaskProps {
  /** Which edge carries the solid background colour. @default "bottom" */
  direction?: GradientMaskDirection;
  /** Extra Tailwind classes — use to override height/width, z-index, colours, etc. */
  className?: string;
}

export const GradientMask = ({
  direction = 'bottom',
  className,
}: GradientMaskProps) => {
  const { position, gradient, size } = directionStyles[direction];

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-10',
        position,
        gradient,
        size,
        className
      )}
    />
  );
};
