'use client';

import { Label } from '@healthalst/ui/components/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@healthalst/ui/components/radio-group';
import { cn } from '@healthalst/ui/lib/utils';
import { Controller, useFormContext } from 'react-hook-form';

export interface RadioGroupFieldOption {
  readonly value: string;
  readonly label: string;
}

export interface RadioGroupFieldProps {
  readonly name: string;
  readonly label?: string;
  readonly options: readonly RadioGroupFieldOption[];
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function RadioGroupField({
  name,
  label,
  options,
  required = false,
  disabled = false,
  className,
}: RadioGroupFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <Label className="text-sm font-medium">
          {label}
          {required ? <span className="text-danger ml-0.5">*</span> : null}
        </Label>
      ) : null}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value == null ? '' : String(field.value)}
            onValueChange={field.onChange}
            disabled={disabled}
            className="flex flex-wrap gap-3"
          >
            {options.map((option) => {
              const id = `${name}-${option.value}`;
              return (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem id={id} value={option.value} />
                  <Label htmlFor={id} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}
      />
      {error ? (
        <p className="text-danger text-sm">{error.message?.toString()}</p>
      ) : null}
    </div>
  );
}
