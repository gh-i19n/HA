"use client";

import { Input } from "@healthalst/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@healthalst/ui/components/popover";
import { ScrollArea } from "@healthalst/ui/components/scroll-area";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn } from "@healthalst/ui/lib/utils";
import { MainButton } from "../button";
import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  KeyboardEvent,
  ReactNode,
} from "react";

export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly category?: string;
  readonly icon?: ReactNode;
}

export interface SearchInputProperties extends Omit<
  ComponentPropsWithoutRef<"input">,
  "className" | "disabled" | "onChange" | "type"
> {
  readonly className?: string;
  readonly delay?: number;
  readonly inputClassName?: string;
  readonly isDisabled?: boolean;
  readonly onSearch?: (query: string) => void;
  readonly onValueChange?: (query: string) => void;
}

export interface GlobalSearchInputProperties {
  readonly className?: string;
  readonly delay?: number;
  readonly disabled?: boolean;
  readonly emptyMessage?: string;
  readonly inputClassName?: string;
  readonly isLoading?: boolean;
  readonly onClearRecent?: () => void;
  readonly onResultSelect?: (result: SearchResult) => void;
  readonly onSearch?: (query: string) => void;
  readonly placeholder?: string;
  readonly recentSearches?: readonly string[];
  readonly results?: readonly SearchResult[];
}

export function SearchInput({
  className,
  delay = 300,
  inputClassName,
  isDisabled = false,
  onSearch,
  onValueChange,
  placeholder = "Search...",
  value,
  ...inputProperties
}: SearchInputProperties) {
  const [internalQuery, setInternalQuery] = useState("");
  const query = value === undefined ? internalQuery : String(value);

  useEffect(() => {
    if (!onSearch) return;
    const timeout = window.setTimeout(() => {
      onSearch(query);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, onSearch, query]);

  return (
    <div
      className={cn(
        "relative h-10 rounded-lg border border-border-strong bg-surface-subtle/40 transition-[color,box-shadow]",
        "hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
        className,
      )}
    >
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted"
        name="Search"
        size={16}
      />
      <Input
        {...inputProperties}
        className={cn(
          "h-full border-0 bg-transparent pl-10 pr-3.5 shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0",
          inputClassName,
        )}
        disabled={isDisabled}
        onChange={(event) => {
          if (value === undefined) setInternalQuery(event.target.value);
          onValueChange?.(event.target.value);
        }}
        placeholder={placeholder}
        type="search"
        value={query}
      />
    </div>
  );
}

/**
 * Debounced global search box that opens a popover of live results, recent
 * searches, or an empty state as the user types. Supports arrow-key/Enter
 * navigation through the result list and reports the final selection or
 * query back to the host via callbacks — it owns no data fetching itself.
 */
export function GlobalSearchInput({
  className,
  delay = 300,
  disabled = false,
  emptyMessage = "Try searching with different keywords.",
  inputClassName,
  isLoading = false,
  onClearRecent,
  onResultSelect,
  onSearch,
  placeholder = "Search anything...",
  recentSearches = [],
  results = [],
}: GlobalSearchInputProperties) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputReference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) return;

    const timeout = window.setTimeout(() => {
      onSearch?.(query);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, onSearch, query]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setOpen(value.trim() !== "" || recentSearches.length > 0);
  };

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result);
    setQuery("");
    setOpen(false);
    inputReference.current?.blur();
  };

  const handleRecentSearchSelect = (recentQuery: string) => {
    setQuery(recentQuery);
    setOpen(true);
    inputReference.current?.focus();
    onSearch?.(recentQuery);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) =>
        current < results.length - 1 ? current + 1 : current,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => (current > 0 ? current - 1 : -1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedResult = results[selectedIndex];
      if (selectedResult) handleResultSelect(selectedResult);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      inputReference.current?.blur();
    }
  };

  const trimmedQuery = query.trim();
  const hasResults = results.length > 0;
  const showRecentSearches = !trimmedQuery && recentSearches.length > 0;
  const showEmptyState =
    Boolean(trimmedQuery) && Boolean(onSearch) && !isLoading && !hasResults;
  const showDropdown =
    open && (showRecentSearches || hasResults || showEmptyState);

  return (
    <Popover onOpenChange={setOpen} open={showDropdown}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 transition-colors",
            "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <Icon
            className="text-foreground-muted"
            name="SearchNormal1"
            size={16}
            variant="Outline"
          />
          <Input
            className={cn(
              "h-full flex-1 border-0 placeholder:text-sm bg-transparent dark:bg-transparent p-0 text-sm shadow-none focus-visible:ring-0",
              inputClassName,
            )}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={() =>
              setOpen(trimmedQuery !== "" || recentSearches.length > 0)
            }
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={inputReference}
            type="search"
            value={query}
          />
          {isLoading && (
            <Icon
              className="text-foreground-muted animate-spin"
              name="Loader2"
              size={16}
            />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-72 p-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
        sideOffset={8}
      >
        <ScrollArea className="max-h-80">
          {showRecentSearches ? (
            <div className="space-y-1 p-1">
              <div className="flex items-center justify-between px-2 py-1 text-xs font-medium text-foreground-muted">
                <span>Recent searches</span>
                {onClearRecent ? (
                  <MainButton
                    variant="ghost"
                    className="h-auto w-auto p-0 font-normal shadow-none transition-colors hover:bg-transparent hover:text-foreground"
                    onClick={onClearRecent}
                    type="button"
                  >
                    Clear
                  </MainButton>
                ) : null}
              </div>
              {recentSearches.map((recentQuery) => (
                <MainButton
                  variant="ghost"
                  className="h-auto w-full flex-row justify-start gap-2 rounded-sm px-2 py-2 text-left text-sm font-normal shadow-none transition-colors hover:bg-accent"
                  key={recentQuery}
                  onClick={() => handleRecentSearchSelect(recentQuery)}
                  type="button"
                >
                  <Icon
                    className="text-foreground-muted"
                    name="Clock"
                    size={16}
                  />
                  <span className="min-w-0 flex-1 truncate">{recentQuery}</span>
                </MainButton>
              ))}
            </div>
          ) : null}

          {showEmptyState ? (
            <div className="px-3 py-6 text-center">
              <Icon
                className="mx-auto text-foreground-muted"
                name="SearchStatus"
                size={24}
                variant="Outline"
              />
              <p className="mt-2 text-sm font-medium">No results found</p>
              <p className="mt-1 text-xs text-foreground-muted">
                {emptyMessage}
              </p>
            </div>
          ) : null}

          {trimmedQuery && hasResults ? (
            <div className="space-y-1 p-1">
              {results.map((result, index) => (
                <MainButton
                  variant="ghost"
                  className={cn(
                    "h-auto w-full flex-row items-start justify-start gap-3 rounded-sm px-2 py-2.5 text-left font-normal shadow-none transition-colors hover:bg-accent",
                    selectedIndex === index && "bg-accent",
                  )}
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  type="button"
                >
                  <span className="mt-0.5 text-foreground-muted">
                    {result.icon ?? <Icon name="TrendingUp" size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {result.title}
                    </span>
                    {result.description ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-foreground-muted">
                        {result.description}
                      </span>
                    ) : null}
                  </span>
                  {result.category ? (
                    <span className="rounded-sm bg-surface-subtle px-1.5 py-0.5 text-xs text-foreground-muted">
                      {result.category}
                    </span>
                  ) : null}
                </MainButton>
              ))}
            </div>
          ) : null}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
