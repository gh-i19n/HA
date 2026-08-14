'use client';

import { cn } from '../utils';
import { Label } from '@healthalst/ui/components/label';
import { Switch } from '@healthalst/ui/components/switch';
import { Controller, useFormContext } from 'react-hook-form';
import type { ReactNode } from 'react';

interface SwitchFieldProps {
  name: string;
  label?: string | ReactNode;
  labelClassName?: string;
  description?: string;
  required?: boolean;
  hideRequiredIndicator?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onChange?: (checked: boolean) => void;
}

export function SwitchField({
  label,
  labelClassName,
  name,
  description,
  required = false,
  hideRequiredIndicator = false,
  disabled = false,
  readOnly = false,
  className,
  onChange,
}: SwitchFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <div>
      <div className={cn('flex items-center justify-between gap-4', className)}>
        <div className="space-y-1">
          {label && (
            <Label className={cn('font-medium', labelClassName)}>
              {label}
              {required && !hideRequiredIndicator && (
                <span className="text-danger ml-0.5">*</span>
              )}
            </Label>
          )}
          {description && (
            <p className="text-foreground-muted text-xs">{description}</p>
          )}
        </div>

        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch
              checked={!!field.value}
              onCheckedChange={(checked: boolean) => {
                if (readOnly) return;
                field.onChange(checked);
                onChange?.(checked);
              }}
              disabled={disabled || readOnly}
              className={cn(error && 'border-danger', 'shrink-0')}
            />
          )}
        />
      </div>

      {error && (
        <p className="text-danger text-sm">{error.message?.toString()}</p>
      )}
    </div>
  );
}

export type { SwitchFieldProps };
