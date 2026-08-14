'use client';

import { cn } from '@healthalst/ui/lib/utils';
import { Icon } from './icons/icon';
import { MainButton } from '../button';
import type { MouseEventHandler } from 'react';

interface NetworkErrorProps extends React.ComponentProps<'div'> {
  message?: string;
  onRetry?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * A full-width alert shown in place of content that failed to load because
 * of a network problem. Optionally renders a "Try again" button when the
 * caller supplies `onRetry`, so a screen can offer a way to recover without
 * a full page reload.
 */
function NetworkError({
  message = 'A network error occurred. Please check your connection and try again.',
  onRetry,
  className,
  ...properties
}: NetworkErrorProps) {
  return (
    <div
      data-slot="network-error"
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-danger bg-danger-subtle p-8 text-center',
        className
      )}
      {...properties}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-danger-subtle">
        <Icon name="LucideAlertTriangle" size={20} className="text-danger" />
      </div>
      <p className="text-sm text-foreground-muted max-w-sm">{message}</p>
      {onRetry && (
        <MainButton variant="outline" size="sm" onClick={onRetry}>
          Try again
        </MainButton>
      )}
    </div>
  );
}

export { NetworkError, type NetworkErrorProps };
