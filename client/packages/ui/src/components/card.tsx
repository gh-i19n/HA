import { cn } from '../lib/utils'
import * as React from 'react'

/** Provides the shared elevated surface used to group related information. */
function Card({ className, ...properties }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card'
      className={cn(
        'bg-surface text-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm',
        className,
      )}
      {...properties}
    />
  )
}

/** Aligns a card heading, description, and optional action. */
function CardHeader({ className, ...properties }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-header'
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...properties}
    />
  )
}

/** Renders the primary heading inside a card. */
function CardTitle({ className, ...properties }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-title'
      className={cn('leading-none font-semibold', className)}
      {...properties}
    />
  )
}

/** Renders supporting context beneath a card title. */
function CardDescription({
  className,
  ...properties
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-description'
      className={cn('text-foreground-muted text-sm', className)}
      {...properties}
    />
  )
}

/** Positions a secondary card action beside the header content. */
function CardAction({ className, ...properties }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-action'
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...properties}
    />
  )
}

/** Provides the standard horizontal padding for card body content. */
function CardContent({
  className,
  ...properties
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-content'
      className={cn('px-6', className)}
      {...properties}
    />
  )
}

/** Aligns actions or summary information at the bottom of a card. */
function CardFooter({ className, ...properties }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='card-footer'
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...properties}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
