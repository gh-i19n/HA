"use client";

import { MainButton } from "@healthalst/ui/lib/button";
import { cn } from "@healthalst/ui/lib/utils";

type ReportPaginationProperties = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

/** Provides bounded, accessible paging for large clinic report lists. */
export function ReportPagination({ page, totalPages, onPageChange }: ReportPaginationProperties) {
  if (totalPages < 2) return null;

  return (
    <div className={cn("flex items-center justify-between gap-4 border-t border-border px-4 py-3")}>
      <p className={cn("text-xs text-foreground-muted")}>
        Page {page + 1} of {totalPages}
      </p>
      <div className={cn("flex gap-2")}>
        <MainButton
          type="button"
          variant="ghost"
          size="sm"
          isDisabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous report page"
        >
          Previous
        </MainButton>
        <MainButton
          type="button"
          variant="ghost"
          size="sm"
          isDisabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next report page"
        >
          Next
        </MainButton>
      </div>
    </div>
  );
}
