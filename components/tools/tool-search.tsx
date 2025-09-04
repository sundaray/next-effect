"use client";

import { useToolFilters } from "@/hooks/use-tool-filters";
import { useDebouncedCallback } from "use-debounce";

import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ToolSearchProps {
  className?: string;
  onFilterClick: () => void;
  onSearch: () => void;
}

export function ToolSearch({
  className,
  onFilterClick,
  onSearch,
}: ToolSearchProps) {
  const { isPending, filters, setFilters } = useToolFilters();

  // Handle search with debounce
  const handleSearch = useDebouncedCallback((search: string) => {
    onSearch();
    setFilters({ search, page: 1 });
  }, 250);

  return (
    <div className={cn("flex", className)}>
      <div
        className="grid w-full grid-cols-1"
        data-pending={isPending ? "" : undefined}
      >
        <Input
          className="col-start-1 row-start-1 rounded-r-none border-r-0 border-neutral-300 pr-3 pl-8"
          type="search"
          placeholder="Search for apps by name..."
          defaultValue={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search for apps by name..."
        />
        {isPending ? (
          <Icons.spinner className="col-start-1 row-start-1 ml-3 inline-block size-4 animate-spin self-center text-neutral-500" />
        ) : (
          <Icons.search className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-neutral-500 sm:size-4" />
        )}
      </div>
      <button
        type="button"
        onClick={onFilterClick}
        className="flex shrink-0 items-center gap-x-1.5 rounded-r-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:relative focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-600"
      >
        <Icons.listFilter
          aria-hidden="true"
          className="-ml-0.5 size-4 text-neutral-500"
        />
        Filter
      </button>
    </div>
  );
}
