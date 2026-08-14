/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { CheckIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/popover";
import { Button } from "../../components/button";
import { Icon } from "../icons/icon";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/command";

export interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboBoxProperties {
  options: ComboBoxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  width?: string;
  triggerClassName?: string;
  contentClassName?: string;
  allowClear?: boolean;
}

export function ComboBox({
  options,
  value = "",
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  readOnly = false,
  contentClassName,
  allowClear = true,
}: ComboBoxProperties) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value);

  // Update internal value when prop changes
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const currentValue = onValueChange ? value : internalValue;
  const setCurrentValue = onValueChange || setInternalValue;

  const selectedOption = options.find(
    (option) => option.value === currentValue,
  );

  const handleSelect = (selectedValue: string) => {
    const newValue =
      selectedValue === currentValue && allowClear ? "" : selectedValue;
    setCurrentValue(newValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={readOnly ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-input bg-background",
            "px-3 py-2 text-sm transition-colors hover:bg-accent/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "min-h-12",
          )}
          // className={cn(
          //   `bg-background dark:bg-primary-subtle text-foreground-muted ring-offset-background
          //   focus-visible:ring-ring h-10
          //   hover:text-primary hover:border-primary focus:text-primary focus:border-primary
          //    active:text-primary active:border-primary transition-colors flex w-full rounded-md px-3 py-2 text-sm
          //     shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium
          //      placeholder:text-foreground-muted focus:ring-1
          //       focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`,
          //   "border border-border justify-between hover:border-primary-hover hover:text-primary",
          //   readOnly && "pointer-events-none cursor-default",
          //   triggerClassName,
          // )}
        >
          {/*<span className={cn(!selectedOption && 'text-foreground-muted')}>*/}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <Icon name={`ChevronsUpDown`} className="ml-2 size-3 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0 shadow-none", contentClassName)}
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <Command className="w-full">
          <CommandInput
            placeholder={searchPlaceholder}
            className="placeholder:text-primary-hover"
          />
          <CommandList className="max-h-50">
            <CommandEmpty className="py-6 text-center text-sm text-primary">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Use label for search instead of value
                  disabled={option.disabled}
                  onSelect={() => handleSelect(option.value)}
                  className="data-[selected=true]:bg-primary-subtle cursor-pointer"
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentValue === option.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
