"use client";

import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../lib/icons/icon";
import type { AnyIconName } from "../lib/icons/types";

export type DocumentOutlineTone = "default" | "ok" | "warn" | "risk";

export interface DocumentOutlineItem {
  /** The id of the section element this entry anchors to. */
  readonly id: string;
  readonly label: string;
  /** Optional outline-family icon for a top-level document step. */
  readonly icon?: AnyIconName;
  /** Health signal rendered through the entry rule, without a status badge. */
  readonly tone?: DocumentOutlineTone;
  /** Optional count rendered after the label (e.g. open items). */
  readonly count?: number;
  /**
   * Nested sub-sections, rendered indented beneath this item. Only leaf
   * items (those without children) are scroll-spied — a parent with
   * children is treated as a pure grouping label and is highlighted
   * whenever one of its descendants is active.
   */
  readonly children?: readonly DocumentOutlineItem[];
}

interface DocumentOutlineProperties {
  readonly items: readonly DocumentOutlineItem[];
  readonly title?: string;
  readonly className?: string;
  /**
   * Observer band for the active section, as IntersectionObserver
   * rootMargin. The default treats the section crossing the upper third of
   * the viewport as active.
   */
  readonly rootMargin?: string;
  /**
   * Called with an item's id when its link is clicked, before the default
   * hash-anchor jump. Lets a caller whose sections can be collapsed (e.g.
   * an accordion of chapters) expand the target first — the outline itself
   * has no notion of collapsed content. The default `href="#id"` navigation
   * still runs afterward, so this is additive, not a replacement.
   */
  readonly onNavigate?: (id: string) => void;
}

/** Flattens nested outline entries so the scroll observer tracks leaf content. */
function collectLeaves(
  items: readonly DocumentOutlineItem[],
): readonly DocumentOutlineItem[] {
  return items.flatMap((item) =>
    item.children && item.children.length > 0
      ? collectLeaves(item.children)
      : [item],
  );
}

/** Returns every ancestor id for an outline entry so its chapter stays active. */
function findPathToId(
  items: readonly DocumentOutlineItem[],
  id: string,
): readonly string[] | null {
  for (const item of items) {
    if (item.id === id) return [item.id];
    if (item.children) {
      const nested = findPathToId(item.children, id);
      if (nested) return [item.id, ...nested];
    }
  }
  return null;
}

/**
 * Scroll-spy outline for a long structured document: anchors to section
 * elements by id, highlights the section in view, and carries per-section
 * health signals. Items may nest one level deep (e.g. chapter → sub-section)
 * — both levels are independently navigable, but only leaves are observed
 * for scroll position so a chapter and its active sub-section never fight
 * over the highlight. Purely presentational — callers own section
 * semantics.
 */
export function DocumentOutline({
  items,
  title = "On this page",
  className,
  rootMargin = "-15% 0px -75% 0px",
  onNavigate,
}: DocumentOutlineProperties) {
  const leaves = collectLeaves(items);
  const [activeId, setActiveId] = useState<string | null>(
    leaves[0]?.id ?? null,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin },
    );

    for (const item of collectLeaves(items)) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [items, rootMargin]);

  const activePath = activeId ? (findPathToId(items, activeId) ?? []) : [];

  /** Recursively renders the chapter and section links for this document. */
  function renderList(entries: readonly DocumentOutlineItem[], depth: number) {
    return (
      <ul
        className={cn(
          "m-0 list-none space-y-1 p-0",
          depth === 0 ? undefined : "ml-3 mt-1",
        )}
      >
        {entries.map((item) => {
          const isActive = item.id === activeId;
          const isOnActivePath = !isActive && activePath.includes(item.id);
          return (
            <li key={item.id}>
              <a
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "flex items-center pr-2 transition-colors",
                  depth === 0 ? "py-1.5 pl-3 text-sm" : "py-1 pl-3 text-xs",
                  isActive
                    ? "font-medium text-primary"
                    : isOnActivePath
                      ? "text-primary"
                      : "text-foreground-muted hover:text-foreground",
                )}
                href={`#${item.id}`}
                onClick={onNavigate ? () => onNavigate(item.id) : undefined}
              >
                {item.icon ? (
                  <Icon
                    className="mr-2 shrink-0"
                    name={item.icon}
                    provider="lucide"
                    size={14}
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.count != null && item.count > 0 ? (
                  <span className="shrink-0 font-mono text-xs tabular-nums text-foreground-muted">
                    {item.count}
                  </span>
                ) : null}
              </a>
              {item.children && item.children.length > 0
                ? renderList(item.children, depth + 1)
                : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <nav aria-label={title} className={cn("min-w-0", className)}>
      <p className="m-0 mb-3 text-xs font-semibold text-foreground-muted">
        {title}
      </p>
      {renderList(items, 0)}
    </nav>
  );
}
