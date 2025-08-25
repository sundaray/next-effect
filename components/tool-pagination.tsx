"use client";

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
import { useToolFilters } from "@/hooks/use-tool-filters";

const SIBLING_COUNT = 1; // Number of pages to show on each side of the current page

type ToolPaginationProps = {
  totalPages: number;
  className?: string;
};

export function ToolPagination({ totalPages, className }: ToolPaginationProps) {
  const { isPending, filters, setFilters } = useToolFilters();

  const currentPage = filters.page;

  // Use the extracted pagination range calculation
  const paginationRange = useMemo(
    () => calculatePaginationRange(currentPage, totalPages, SIBLING_COUNT),
    [currentPage, totalPages]
  );

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <Pagination
      className={cn(className)}
      data-pending={isPending ? "" : undefined}
    >
      <PaginationContent className="w-full justify-center">
        {/* Previous Button */}
        <PaginationItem className="mr-auto">
          <PaginationPrevious
            href="#"
            aria-disabled={isFirstPage}
            tabIndex={isFirstPage ? -1 : undefined}
            className={cn(
              "bg-transparent hover:bg-transparent",
              isFirstPage && "pointer-events-none opacity-50"
            )}
            onClick={() => setFilters({ page: currentPage - 1 })}
          />
        </PaginationItem>

        {/* Page Numbers & Ellipses */}
        {paginationRange.map((pageNumberOrEllipsis, index) => {
          // Render Ellipsis component if the item is one of our string identifiers
          if (typeof pageNumberOrEllipsis === "string") {
            return (
              <PaginationItem key={`${pageNumberOrEllipsis}-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          // Otherwise, it's a page number - render the link
          const pageNumber = pageNumberOrEllipsis;
          const isActive = currentPage === pageNumber;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={isActive}
                className={cn("text-neutral-900 border-neutral-300")}
                onClick={() => setFilters({ page: pageNumber })}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next Button */}
        <PaginationItem className="ml-auto">
          <PaginationNext
            href="#"
            aria-disabled={isLastPage}
            tabIndex={isLastPage ? -1 : undefined}
            className={cn(
              "bg-transparent hover:bg-transparent",
              isLastPage && "pointer-events-none opacity-50"
            )}
            onClick={() => setFilters({ page: currentPage + 1 })}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
