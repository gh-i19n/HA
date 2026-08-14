import { cn } from '../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * InlineNotice — the app's standard inline status notice.
 *
 * This is the tinted-background treatment used
 * throughout the product to tell the planner or client the state of something
 * in place: a brief confirmed, changes requested by a client, questions still
 * needing an owner, a source trail.
 *
 * It is deliberately NOT the shadcn `Alert` component. `Alert` is a rounded,
 * fully-bordered card with only default/destructive variants; this is a flat
 * accent-bar strip with a full tone range. Both exist: use `Alert` for boxed
 * dialog-level messages, and `InlineNotice` for status inside a page or panel.
 *
 * Tones map onto the design tokens' notice families (ok / warn / risk / info),
 * so a tone change here propagates everywhere instead of being re-typed as
 * `bg-<x>-tint/40 px-4 py-3` at each call site.
 */
const inlineNoticeVariants = cva('px-4 py-3', {
  variants: {
    tone: {
      ok: 'bg-success-subtle/40',
      warn: 'bg-warning-subtle/40',
      risk: 'bg-danger-subtle/40',
      info: 'bg-primary-subtle/40',
      neutral: 'bg-surface-subtle',
    },
  },
  defaultVariants: {
    tone: 'info',
  },
});

/** Title colour has to track the tone, so it lives in its own variant map. */
const inlineNoticeTitleVariants = cva(
  'flex items-center gap-2 text-sm font-semibold',
  {
    variants: {
      tone: {
        ok: 'text-success',
        warn: 'text-warning',
        risk: 'text-danger',
        info: 'text-primary',
        neutral: 'text-foreground',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  }
);

type InlineNoticeTone = NonNullable<
  VariantProps<typeof inlineNoticeVariants>['tone']
>;

/**
 * The notice container. Pass `icon` and `title` for the standard heading row,
 * and any supporting copy as children — a plain string renders as the muted
 * description, richer content (lists, per-recipient blocks) renders as-is.
 */
function InlineNotice({
  className,
  tone = 'info',
  icon,
  title,
  children,
  ...properties
}: React.ComponentProps<'div'> &
  VariantProps<typeof inlineNoticeVariants> & {
    readonly icon?: React.ReactNode;
    readonly title?: React.ReactNode;
  }) {
  return (
    <div
      data-slot="inline-notice"
      data-tone={tone}
      role="status"
      className={cn(inlineNoticeVariants({ tone }), className)}
      {...properties}
    >
      {title ? (
        <div className={cn(inlineNoticeTitleVariants({ tone }))}>
          {icon}
          {title}
        </div>
      ) : null}
      {typeof children === 'string' ? (
        <InlineNoticeDescription className={title ? 'mt-1' : undefined}>
          {children}
        </InlineNoticeDescription>
      ) : (
        children
      )}
    </div>
  );
}

/** Muted supporting copy under the notice title. */
function InlineNoticeDescription({
  className,
  ...properties
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="inline-notice-description"
      className={cn('m-0 text-xs leading-relaxed text-foreground-muted', className)}
      {...properties}
    />
  );
}

export { InlineNotice, InlineNoticeDescription, type InlineNoticeTone };
