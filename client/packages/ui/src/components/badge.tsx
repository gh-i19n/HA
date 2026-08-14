import { cn } from '../lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-6 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-surface-subtle text-foreground [a&]:hover:bg-surface-subtle/90',
        primary:
          'border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/90',
        success:
          'border-transparent bg-success-subtle text-success [a&]:hover:bg-success-subtle',
        warning:
          'border-transparent bg-warning-subtle text-warning [a&]:hover:bg-warning-subtle',
        danger:
          'border-transparent bg-danger-subtle text-danger [a&]:hover:bg-danger-subtle',
        info: 'border-transparent bg-primary-subtle text-primary [a&]:hover:bg-primary-subtle',
        light:
          'border-transparent bg-light-50 text-light-foreground [a&]:hover:bg-light-100',
        dark: 'border-transparent bg-dark-50 text-dark-foreground [a&]:hover:bg-dark-100',
        destructive:
          'border-transparent bg-danger text-danger-foreground [a&]:hover:bg-danger-hover focus-visible:ring-danger/20 dark:focus-visible:ring-danger/40',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        primaryOutline:
          'bg-transparent text-primary border-primary [a&]:hover:bg-primary/10',
        secondaryOutline:
          'bg-transparent text-surface-subtle border-surface-subtle [a&]:hover:bg-surface-subtle/10',
        successOutline:
          'bg-transparent text-success border-success [a&]:hover:bg-success-subtle',
        warningOutline:
          'bg-transparent text-warning border-warning [a&]:hover:bg-warning-subtle',
        dangerOutline:
          'bg-transparent text-danger border-danger [a&]:hover:bg-danger-subtle',
        infoOutline:
          'bg-transparent text-primary border-primary [a&]:hover:bg-primary-subtle',
        lightOutline:
          'bg-transparent text-light-foreground border-light [a&]:hover:bg-light-50',
        darkOutline:
          'bg-transparent text-dark-foreground border-dark [a&]:hover:bg-dark-50',
        destructiveOutline:
          'bg-transparent text-danger border-danger [a&]:hover:bg-danger/10 focus-visible:ring-danger/20 dark:focus-visible:ring-danger/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...properties
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...properties}
    />
  );
}

export { Badge, badgeVariants, VariantProps };
