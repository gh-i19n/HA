"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { Button } from "./button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

export interface BreadcrumbTrailItem {
  readonly label: string;
  /** Omitted (or null) renders this item as the current, non-navigable page. */
  readonly href?: string | null;
}

interface BreadcrumbTrailProperties {
  readonly items: readonly BreadcrumbTrailItem[];
  readonly className?: string;
  /**
   * Renders a back button before the trail. Set `true` for standard browser
   * back navigation, or pass a handler to fully control where "back" goes.
   */
  readonly onBack?: boolean | (() => void);
}

/**
 * Purely presentational breadcrumb trail: pass ordered items with an
 * optional href — the last item always renders as the current page
 * regardless of whether it has an href, so callers don't need to
 * special-case the final entry.
 */
export function BreadcrumbTrail({ items, className, onBack }: BreadcrumbTrailProperties) {
  const router = useRouter();

  if (items.length === 0) return null;

  const handleBack = onBack === true ? () => router.back() : onBack;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex-nowrap">
        {handleBack ? (
          <BreadcrumbItem className="shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 -ml-1.5 p-0 text-foreground-muted hover:text-foreground"
              aria-label="Go back"
              onClick={handleBack}
            >
              <Icon name="ArrowLeft" size={14} />
            </Button>
          </BreadcrumbItem>
        ) : null}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem className={isLast ? "min-w-0" : "shrink-0"}>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
