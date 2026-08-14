'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'
import { cn } from '../lib/utils'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

export interface ConfirmDialogProps {
  /** Whether the dialog is showing. Controlled by the caller. */
  readonly open: boolean
  /** Fired when the dialog wants to close (cancel, escape, overlay click). */
  readonly onOpenChange: (open: boolean) => void
  /** Short question naming the action, e.g. "Remove client contact?" */
  readonly title: ReactNode
  /** What will happen, including anything irreversible. */
  readonly description?: ReactNode
  /** Label for the confirming button. Defaults to "Confirm". */
  readonly confirmLabel?: string
  /** Label for the dismissing button. Defaults to "Cancel". */
  readonly cancelLabel?: string
  /**
   * Marks the action as destructive, styling the confirm button accordingly.
   * Use for anything that deletes or revokes.
   */
  readonly destructive?: boolean
  /**
   * Puts the confirm button into its loading state: spinner, `pendingLabel`,
   * and both buttons disabled so the action cannot be fired twice.
   */
  readonly isPending?: boolean
  /**
   * What the button says while working — phrase it as the action in progress
   * ("Sending…", "Removing…") so the user can see which action they triggered.
   */
  readonly pendingLabel?: string
  /** Runs when the user confirms. The caller closes the dialog. */
  readonly onConfirm: () => void
  /** Optional extra content rendered between description and footer. */
  readonly children?: ReactNode
}

/**
 * The shared confirmation dialog for the whole application.
 *
 * Every destructive or otherwise irreversible action routes through this
 * rather than a bespoke AlertDialog composition or a native `window.confirm`,
 * so confirmations look and behave the same everywhere and can be restyled in
 * one place. The caller owns the open state and the mutation; this component
 * owns only the presentation and the confirm/cancel affordances.
 *
 * Pair it with a toast for the *outcome* — this dialog asks the question, the
 * toast reports what happened.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  isPending = false,
  pendingLabel,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              destructive &&
                'bg-danger text-danger-foreground hover:bg-danger-hover',
            )}
            disabled={isPending}
            onClick={(event) => {
              // The caller decides when to close — a mutation may need to run
              // first — so the dialog's own auto-close is suppressed here.
              event.preventDefault()
              onConfirm()
            }}
          >
            {/*
              A disabled button tells the user to wait without telling them
              anything is happening. While the action is in flight the button
              shows a spinner and says so, which is the difference between
              "the app is working" and "the app is stuck".
            */}
            {isPending ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                {pendingLabel ?? 'Working…'}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
