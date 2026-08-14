'use client';

import { format, parseISO, isValid } from 'date-fns';
import { Calendar } from '../../../components/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/popover';
import { Icon } from '../../icons/icon';
import { cn } from '../../utils';
import type { AnyIconName } from '../../icons/types';
import type { AriaAttributes } from 'react';

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  'aria-describedby'?: string;
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

/** Renders a token-backed date field with the same surface states as other inputs. */
export function DatePicker({
  value,
  onChange,
  id,
  placeholder = 'Pick a date',
  disabled = false,
  required = false,
  min,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  className,
}: DatePickerProps) {
  const selected = toDate(value);
  const minimum = toDate(min);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          data-empty={!selected ? 'true' : 'false'}
          disabled={disabled}
          type="button"
          aria-required={required || undefined}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-lg border border-border-strong bg-surface-subtle/40',
            'px-3.5 py-1.5 text-sm transition-colors outline-none',
            'hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15',
            'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:opacity-60',
            'data-[empty=true]:text-foreground-muted',
            className,
          )}
        >
          <Icon name={CALENDAR_ICON} size={16} className="shrink-0 text-foreground-muted" />
          <span className="truncate">
            {selected ? format(selected, DISPLAY_FORMAT) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0" sideOffset={4}>
        <Calendar
          mode="single"
          selected={selected}
          disabled={minimum ? { before: minimum } : undefined}
          onSelect={(date) => onChange(toString(date))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
