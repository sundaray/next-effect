"use client";

import { useTransition } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useMemo } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { calculatePaginationRange } from "@/lib/calculate-pagination-range";

const SIBLING_COUNT = 1; // Number of pages to show on each side of the current page

type PodcastPaginationProps = {
  totalPages: number;
  className?: string;
};

export function ToolPagination({
  totalPages,
  className,
}: PodcastPaginationProps) {
  const [isLoading, startTransition] = useTransition();
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      startTransition,
      shallow: false,
    }),
  );

  // Use the extracted pagination range calculation
  const paginationRange = useMemo(
    () => calculatePaginationRange(page, totalPages, SIBLING_COUNT),
    [page, totalPages],
  );

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return (
    <Pagination
      className={cn("pt-32", className)}
      data-pending={isLoading ? "" : undefined}
    >
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={isFirstPage}
            tabIndex={isFirstPage ? -1 : undefined}
            className={cn(
              "text-sky-600 hover:text-sky-700",
              isFirstPage && "pointer-events-none opacity-50",
            )}
            onClick={() => setPage(page - 1)}
          />
        </PaginationItem>

        {/* Page Numbers & Ellipses */}
        {paginationRange.map((pageNumberOrEllipsis, index) => {
          // Render Ellipsis component if the item is one of our string identifiers
          if (
            pageNumberOrEllipsis === "ellipsis-left" ||
            pageNumberOrEllipsis === "ellipsis-right"
          ) {
            return (
              <PaginationItem key={`${pageNumberOrEllipsis}-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          // Otherwise, it's a page number - render the link
          const pageNumber = pageNumberOrEllipsis as number; // Type assertion
          const isActive = page === pageNumber;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={isActive}
                className={cn("text-gray-900", isActive && "text-white")}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={isLastPage}
            tabIndex={isLastPage ? -1 : undefined}
            className={cn(
              "text-sky-600 hover:text-sky-700",
              isLastPage && "pointer-events-none opacity-50",
            )}
            onClick={() => setPage(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}