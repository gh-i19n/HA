'use client';

import { cn } from '../lib/utils';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

function Progress({
  className,
  indicatorClassName,
  value,
  ...properties
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        'bg-foreground/20 relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...properties}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'bg-foreground h-full w-full flex-1 transition-all',
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
