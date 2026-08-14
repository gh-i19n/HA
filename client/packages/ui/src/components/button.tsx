import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@healthalst/ui/lib/utils';

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'cursor-pointer shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:border-surface-subtle disabled:bg-surface-subtle disabled:text-foreground-muted disabled:shadow-none',
  ),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-none hover:bg-primary-hover hover:text-primary-foreground',
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground',
        primaryOutline:
          'border border-primary hover:bg-primary-subtle text-primary bg-background shadow-none',
        accentOutline:
          'border border-border hover:bg-primary-subtle text-primary bg-background shadow-none',
        destructive:
          'bg-danger text-danger-foreground hover:bg-danger-hover',
        destructiveOutline:
          'border border-danger hover:bg-danger-subtle text-danger bg-background shadow-none',
        subtle: 'bg-surface-subtle text-foreground hover:bg-surface-hover',
        loading:
          'bg-surface-subtle text-foreground-muted hover:bg-surface-hover opacity-50 hover:opacity-100 transition-opacity duration-500 ease-out',
        outline: 'border border-border shadow-none hover:bg-surface-subtle',
        secondary:
          'bg-surface-subtle text-foreground hover:bg-surface-hover',
        ghost: 'shadow-none hover:bg-surface-hover',
        link: 'text-link underline-offset-4 hover:underline shadow-none',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8  px-3 text-xs',
        lg: 'h-10  px-8',
        xl: 'h-12  px-8',
        '2xl': 'h-14  px-8',
        link: 'h-9 px-0 py-2',
        icon: 'px-2 py-2',
        circle: 'px-3 py-3 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProperties
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/** Renders the shared token-backed action variants used throughout healthAlst. */
const Button = forwardRef<HTMLButtonElement, ButtonProperties>(
  ({ className, variant, size, asChild = false, ...properties }, reference) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={reference}
        {...properties}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
