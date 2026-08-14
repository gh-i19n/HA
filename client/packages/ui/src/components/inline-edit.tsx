"use client";

import { cn } from "../lib/utils";
import { Icon } from "../lib/icons/icon";
import { useCallback, useRef, useState } from "react";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { MainButton } from "../lib/button";

type InlineEditBaseProperties = {
  readonly value: string;
  readonly onSave: (value: string) => Promise<unknown> | void;
  readonly className?: string;
  readonly placeholder?: string;
};

type InlineEditTextProperties = InlineEditBaseProperties & {
  readonly type?: "text";
  readonly options?: never;
};

type InlineEditTextareaProperties = InlineEditBaseProperties & {
  readonly type: "textarea";
  readonly options?: never;
};

type InlineEditSelectProperties = InlineEditBaseProperties & {
  readonly type: "select";
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
  }[];
};

type InlineEditProperties =
  | InlineEditTextProperties
  | InlineEditTextareaProperties
  | InlineEditSelectProperties;

/**
 * Click-to-edit field: shows the current value as plain text/button until the
 * user clicks it, then swaps in the real input (text, textarea, or select) so
 * they can change it in place without leaving the surrounding layout. Saves
 * automatically on blur/commit and reverts the draft if `onSave` throws.
 */
export function InlineEdit({
  value,
  onSave,
  className,
  placeholder,
  type = "text",
  options,
}: InlineEditProperties) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = useCallback(async () => {
    if (draft !== value) {
      setSaving(true);
      try {
        await onSave(draft);
      } catch {
        setDraft(value);
      } finally {
        setSaving(false);
      }
    }
    setEditing(false);
  }, [draft, onSave, value]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  if (!editing) {
    const isTextarea = type === "textarea";
    return (
      <MainButton
        variant="ghost"
        className={cn(
          "h-auto justify-start shadow-none",
          isTextarea
            ? "group w-full min-h-6 cursor-pointer rounded px-1 text-left text-sm leading-relaxed transition-colors hover:bg-surface-subtle/50"
            : "group inline-flex cursor-pointer items-center gap-1 rounded px-1 -mx-1 transition-colors hover:bg-surface-subtle/50",
          saving && "pointer-events-none opacity-50",
          className,
        )}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        type="button"
      >
        <span className={cn(isTextarea ? "" : "truncate")}>
          {value || (
            <span className="italic text-foreground-muted">
              {placeholder ?? "Click to edit"}
            </span>
          )}
        </span>
        {saving ? (
          <Icon
            className="shrink-0 animate-spin text-foreground-muted"
            name="Loader2"
            size={12}
          />
        ) : (
          <Icon
            className="shrink-0 opacity-0 text-foreground-muted group-hover:opacity-100"
            name="Pencil"
            size={12}
          />
        )}
      </MainButton>
    );
  }

  if (type === "select" && options) {
    return (
      <div className="flex items-center gap-1">
        <Select
          onValueChange={(next) => {
            setDraft(next);
            onSave(next);
            setEditing(false);
          }}
          value={draft}
        >
          <SelectTrigger className={cn("h-8 text-sm", className)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <MainButton
          className="size-6 shrink-0"
          onClick={cancel}
          size="icon"
          variant="ghost"
        >
          <Icon name="CloseCircle" size={14} />
        </MainButton>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="space-y-1">
        <textarea
          className={cn(
            "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring",
            className,
          )}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancel();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
          }}
          placeholder={placeholder}
          ref={inputRef as never}
          rows={3}
          value={draft}
        />
        <div className="flex items-center gap-2">
          <MainButton onClick={commit} size="sm" variant="default">
            Save
          </MainButton>
          <MainButton onClick={cancel} size="sm" variant="ghost">
            Cancel
          </MainButton>
        </div>
      </div>
    );
  }

  return (
    <Input
      className={cn("h-8 text-sm", className)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") cancel();
        if (e.key === "Enter") commit();
      }}
      placeholder={placeholder}
      ref={inputRef}
      value={draft}
    />
  );
}
