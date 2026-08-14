'use client';

import { format, parseISO, isValid } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '../../../components/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/popover';
import { Icon } from '../../icons/icon';
import { cn } from '../../utils';
import type { AnyIconName } from '../../icons/types';

export interface DateRangePickerProps {
  value?: { from: string; to: string };
  onChange: (value: { from: string; to: string } | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CALENDAR_ICON: AnyIconName = 'Calendar';
const DISPLAY_FORMAT = 'MMM d, yyyy';
const VALUE_FORMAT = 'yyyy-MM-dd';

function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

function toString(date: Date | undefined): string {
  if (!date) return '';
  return format(date, VALUE_FORMAT);
}

function toDateRange(value: { from: string; to: string } | undefined): DateRange | undefined {
  if (!value) return undefined;
  const from = toDate(value.from);
  const to = toDate(value.to);
  if (!from && !to) return undefined;
  return { from, to };
}

/** Renders a shared two-date field without falling back to browser primitives. */
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  disabled = false,
  className,
}: DateRangePickerProps) {
  const selected = toDateRange(value);
  const displayText =
    selected?.from && selected?.to
      ? `${format(selected.from, DISPLAY_FORMAT)} - ${format(selected.to, DISPLAY_FORMAT)}`
      : selected?.from
        ? format(selected.from, DISPLAY_FORMAT)
        : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-empty={!selected ? 'true' : 'false'}
          disabled={disabled}
          type="button"
          className={cn(
            'flex h-12 w-full items-center gap-2 rounded-lg border border-border-strong bg-surface-subtle/40',
            'hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15',
            'px-3 py-2 text-sm transition-colors',
            'hover:bg-accent/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[empty=true]:text-foreground-muted',
            'min-h-10',
            className,
          )}
        >
          <Icon name={CALENDAR_ICON} size={16} className="shrink-0 text-foreground-muted" />
          <span className="truncate">{displayText}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0" sideOffset={4}>
        <Calendar
          mode="range"
          selected={selected}
          onSelect={(range) => {
            if (!range?.from) {
              onChange(undefined as unknown as { from: string; to: string });
              return;
            }
            onChange({
              from: toString(range.from),
              to: toString(range.to),
            });
          }}
          initialFocus
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
