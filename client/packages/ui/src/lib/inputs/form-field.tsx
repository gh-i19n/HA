"use client";

import { cn } from "../utils";
import { Input } from "@healthalst/ui/components/input";
import { Label } from "@healthalst/ui/components/label";
import { Textarea } from "@healthalst/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@healthalst/ui/components/select";
import { Icon } from "../utils/icons/icon";
import { MainButton } from "../button";
import { useState, type ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Link from "next/link";
import { DatePicker } from "./date-picker";

type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "password"
  | "email"
  | "date"
  | "tel";

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  name: string;
  label?: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  hideRequiredIndicator?: boolean;
  disabled?: boolean;
  showForgotPasswordLink?: boolean;
  readOnly?: boolean;
  options?: Option[];
  className?: string;
  containerClassName?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  labelNode?: ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Additional props forwarded to the wrapper container */
  [dataAttr: `data-${string}`]: string | undefined;
}

/**
 * A single labelled form control wired into react-hook-form via `Controller`.
 * Renders the right underlying input for the given `type` (text, textarea,
 * select, date, password, etc.) and handles the shared bits every field
 * needs: label, required-indicator, validation error message, and
 * left/right addon slots. This is the one place field-level markup and error
 * display live, so individual forms don't reimplement it per field.
 */
export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  hideRequiredIndicator = false,
  disabled = false,
  readOnly = false,
  options = [],
  className = "",
  containerClassName,
  leftAddon,
  rightAddon,
  labelNode,
  showForgotPasswordLink = false,
  onChange,
  ...rest
}: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];
  const [showPassword, setShowPassword] = useState(false);

  const errorCls = error
    ? "border-danger"
    : "placeholder:text-xs! text-xs!";

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div>
          <Label htmlFor={name}>
            {label}
            {required && !hideRequiredIndicator && (
              <span className="text-danger ml-0.5">*</span>
            )}
          </Label>
          {labelNode && (
            <div className="text-foreground-muted text-xs">{labelNode}</div>
          )}
        </div>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const shared = {
            id: name,
            "data-testid": name,
            placeholder,
            disabled,
            readOnly,
          };

          const fieldContent = (() => {
            switch (type) {
              case "textarea":
                return (
                  <Textarea
                    {...field}
                    {...shared}
                    className={cn("min-h-20 resize-y", errorCls)}
                  />
                );

              case "select": {
                const val = field.value == null ? "" : String(field.value);
                const key = `${options.map((o) => o.value).join("|")}::${val}`;
                return (
                  <Select
                    key={key}
                    value={val}
                    onValueChange={readOnly ? undefined : field.onChange}
                    disabled={disabled}
                  >
                    {/*
                      A read-only select must be unreachable, not merely
                      un-clickable. `pointer-events-none` alone stops the mouse
                      while leaving the trigger in the tab order and openable
                      with Enter or Space — so a keyboard user could still open
                      the list and pick a value the field is meant to forbid.
                      aria-disabled and tabIndex -1 close that, and also tell a
                      screen reader what the styling already tells everyone else.
                    */}
                    <SelectTrigger
                      aria-disabled={readOnly || undefined}
                      data-testid={name}
                      tabIndex={readOnly ? -1 : undefined}
                      className={cn(
                        "w-full",
                        readOnly && "pointer-events-none opacity-100",
                        errorCls,
                      )}
                    >
                      <SelectValue
                        placeholder={placeholder ?? "Select a value"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }

              case "number":
                return (
                  <Input
                    {...field}
                    {...shared}
                    type="number"
                    className={errorCls}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      field.onChange(Number.isNaN(v) ? undefined : v);
                    }}
                  />
                );

              case "password":
                return (
                  <section className="relative w-full">
                    <div className="relative">
                      <Input
                        {...field}
                        {...shared}
                        type={showPassword ? "text" : "password"}
                        className={cn("pr-10", errorCls)}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          onChange?.(e);
                        }}
                      />
                      <MainButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute top-1/2 right-3 h-auto w-auto -translate-y-1/2 p-0 text-foreground-muted hover:text-foreground hover:bg-transparent"
                        ariaLabel={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <Icon
                          name={showPassword ? "EyeOff" : "Eye"}
                          size={18}
                        />
                      </MainButton>
                    </div>
                    <div
                      hidden={!showForgotPasswordLink}
                      className="text-end"
                    >
                      <Link
                        href={`/forgot-password`}
                        className="hover:underline text-xs text-danger font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </section>
                );

              case "date":
                return (
                  <DatePicker
                    id={name}
                    value={field.value as string | undefined}
                    onChange={field.onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    aria-invalid={Boolean(error)}
                    className={errorCls}
                  />
                );

              case "tel":
                return (
                  <Input
                    {...field}
                    {...shared}
                    type="tel"
                    className={errorCls}
                  />
                );

              default:
                return (
                  <Input
                    {...field}
                    {...shared}
                    type={type}
                    className={errorCls}
                  />
                );
            }
          })();

          return (
            <div
              className={cn("flex items-center gap-2", containerClassName)}
              {...rest}
            >
              {leftAddon && (
                <div className="flex items-center">{leftAddon}</div>
              )}
              {fieldContent}
              {rightAddon && (
                <div className="flex items-center">{rightAddon}</div>
              )}
            </div>
          );
        }}
      />

      {error && (
        <p className="text-danger text-sm">{error.message?.toString()}</p>
      )}
    </div>
  );
}

export type { FormFieldProps, FieldType, Option };
