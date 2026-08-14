"use client";

import { cn } from "../utils";
import { Badge } from "@healthalst/ui/components/badge";
import { Button } from "@healthalst/ui/components/button";
import { MainButton } from "../button";
import { Label } from "@healthalst/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@healthalst/ui/components/popover";
import { ChevronDownIcon } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

interface MultiSelectOption {
  value: string;
  label: string;
  thumbnail?: string;
}

interface MultiSelectProps {
  name: string;
  label?: string;
  options: MultiSelectOption[];
  placeholder?: string;
  required?: boolean;
  hideRequiredIndicator?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

/**
 * A checkbox-style multi-value picker wired into react-hook-form. Shows the
 * chosen count on a popover trigger, lets the user toggle any number of
 * options in the popover body, and echoes the current selection back as a
 * row of badges below the trigger.
 */
export function MultiSelect({
  label,
  name,
  options,
  placeholder = "Select options",
  required = false,
  hideRequiredIndicator = false,
  disabled = false,
  readOnly = false,
  className,
}: MultiSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && !hideRequiredIndicator && (
            <span className="text-danger ml-0.5">*</span>
          )}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selected: string[] = field.value ?? [];
          const triggerText =
            selected.length > 0 ? `${selected.length} selected` : placeholder;

          const toggle = (value: string) => {
            if (disabled || readOnly) return;
            const next = selected.includes(value)
              ? selected.filter((v) => v !== value)
              : [...selected, value];
            field.onChange(next);
          };

          return (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    aria-label={triggerText}
                    aria-invalid={Boolean(error)}
                    className={cn(
                      "min-w-md justify-between bg-surface text-left font-normal",
                      error && "border-danger",
                      className,
                    )}
                    disabled={disabled || readOnly}
                    type="button"
                    variant="outline"
                  >
                    <span className="min-w-0 truncate">{triggerText}</span>
                    <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="max-h-80 w-full max-w-md overflow-y-auto p-1"
                >
                  <div className="space-y-1">
                    {options.map((option) => {
                      const checked = selected.includes(option.value);
                      return (
                        <MainButton
                          key={option.value}
                          type="button"
                          variant="ghost"
                          aria-pressed={checked}
                          className="h-auto w-full min-w-0 flex-row items-start justify-between gap-2 rounded-sm px-2 py-2 text-left font-normal shadow-none hover:bg-surface-subtle focus:bg-surface-subtle focus:outline-none"
                          onClick={() => toggle(option.value)}
                        >
                          <span className="flex min-w-0 items-start gap-2 break-words text-sm">
                            {option.thumbnail && (
                              <img
                                src={option.thumbnail}
                                alt=""
                                className="size-5 shrink-0 rounded-full object-cover"
                              />
                            )}
                            <span className="min-w-0 break-words">
                              {option.label}
                            </span>
                          </span>
                          <div
                            className={cn(
                              "size-4 shrink-0 rounded border border-input",
                              checked && "bg-primary border-primary",
                            )}
                            aria-hidden="true"
                          >
                            {checked && (
                              <svg
                                className="size-full text-primary-foreground p-0.5"
                                viewBox="0 0 16 16"
                              >
                                <polyline
                                  points="2 8 6 12 14 4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </MainButton>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {selected.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.map((value) => {
                    const opt = options.find((o) => o.value === value);
                    if (!opt) return null;
                    return (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="h-auto max-w-full whitespace-normal break-words py-1 text-left text-xs"
                      >
                        {opt.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </>
          );
        }}
      />

      {error && (
        <p className="text-danger text-sm">{error.message?.toString()}</p>
      )}
    </div>
  );
}

export type { MultiSelectProps, MultiSelectOption };
