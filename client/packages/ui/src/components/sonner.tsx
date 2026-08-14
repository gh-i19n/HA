'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';
import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';

/**
 * The application's single toast surface.
 *
 * Styling notes, because the defaults and this design system disagree in a few
 * places:
 *
 * - `richColors` is deliberately OFF. It paints the entire toast in a saturated
 *   status colour, which shouts on a document-led interface. Instead every
 *   toast shares the same calm elevated surface (`bg-surface`, `shadow-lg`) and
 *   only the icon carries the status colour — the same restraint the rest of
 *   the app uses.
 * - Widths are bounded rather than fixed. The previous `min-w-md` was not a
 *   real Tailwind width and resolved to an oversized arbitrary value.
 * - Positioning is left entirely to sonner. A stray `right-5` on the toast used
 *   to fight the library's own offset and pushed toasts off the viewport edge.
 */
const Toaster = ({ ...properties }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-right"
      offset={20}
      gap={10}
      icons={{
        success: <CheckCircle2 className="text-success" size={18} />,
        error: <XCircle className="text-danger" size={18} />,
        warning: <TriangleAlert className="text-warning" size={18} />,
        info: <Info className="text-primary" size={18} />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group w-full sm:w-[380px] items-start gap-3 rounded-lg bg-surface p-4 shadow-lg',
          // The icon is the only status-coloured element, aligned to the first
          // line of the title rather than centred against a two-line block.
          icon: 'mt-0.5 shrink-0',
          title: 'text-sm font-medium leading-snug text-foreground',
          description: 'mt-1 text-sm leading-relaxed text-foreground-muted',
          actionButton:
            'rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-hover',
          cancelButton:
            'rounded-md bg-surface-subtle px-2.5 py-1 text-xs font-medium text-foreground-muted',
          closeButton:
            'bg-surface text-foreground-muted hover:bg-surface-subtle hover:text-foreground',
        },
      }}
      {...properties}
    />
  );
};

export { Toaster };
