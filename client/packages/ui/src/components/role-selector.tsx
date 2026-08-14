"use client";

import { cn } from "../lib/utils";
import { MainButton } from "../lib/button";

export interface RoleOption {
  readonly value: string;
  readonly title: string;
  readonly description: string;
  readonly hint: string;
}

interface RoleSelectorProperties {
  readonly options: readonly RoleOption[];
  readonly value: string | null;
  readonly onChange: (value: string) => void;
  readonly className?: string;
}

/**
 * A vertical list of selectable role cards. Each option shows a title,
 * description, and a radio-style indicator; selecting one reveals a short
 * hint explaining what that role can do. Used where a user must pick exactly
 * one role from a small, well-described set (e.g. during onboarding).
 */
export function RoleSelector({
  options,
  value,
  onChange,
  className,
}: RoleSelectorProperties) {
  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <MainButton
            key={option.value}
            type="button"
            variant="ghost"
            onClick={() => onChange(option.value)}
            className={cn(
              "h-auto w-full flex-col items-stretch justify-start text-left rounded-lg border px-4 py-3 transition-all duration-100 shadow-none whitespace-normal",
              isSelected
                ? "border-foreground bg-surface"
                : "border-border bg-surface hover:border-foreground/40",
            )}
          >
            <div className="flex items-start justify-between gap-3 w-full">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground mb-0.5">
                  {option.title}
                </div>
                <div className="text-sm text-foreground-muted leading-relaxed">
                  {option.description}
                </div>
              </div>
              <span
                className={cn(
                  "mt-0.5 size-4 shrink-0 rounded-full border-2 transition-colors",
                  isSelected ? "border-foreground bg-foreground" : "border-border",
                )}
              />
            </div>
            {isSelected ? (
              <div className="mt-3 w-full border-t border-border pt-3 text-xs font-medium text-primary">
                {option.hint}
              </div>
            ) : null}
          </MainButton>
        );
      })}
    </div>
  );
}
