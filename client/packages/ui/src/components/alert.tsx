import { cn } from '../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Button } from './button';
import { Icon } from '../lib/icons/icon';

const alertVariants = cva(
  'relative w-full rounded-lg px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-surface-subtle/70 text-foreground',
        destructive:
          'text-danger bg-danger-subtle/50 [&>svg]:text-current *:data-[slot=alert-description]:text-danger/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...properties
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...properties}
    />
  );
}

function AlertTitle({ className, ...properties }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className
      )}
      {...properties}
    />
  );
}

function AlertDescription({
  className,
  ...properties
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-foreground-muted col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className
      )}
      {...properties}
    />
  );
}

function AlertDismiss({
  onDismiss,
  className,
  ...properties
}: React.ComponentProps<'button'> & { readonly onDismiss: () => void }) {
  return (
    <Button
      aria-label="Dismiss"
      className={cn('absolute right-2 top-2', className)}
      data-slot="alert-dismiss"
      onClick={onDismiss}
      size="icon"
      variant="ghost"
      {...properties}
    >
      <Icon name="X" size={16} />
    </Button>
  );
}

export { Alert, AlertTitle, AlertDescription, AlertDismiss };
