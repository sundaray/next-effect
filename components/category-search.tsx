"use client";

import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { useCategoryFilters } from "@/hooks/use-category-filters";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

export function CategorySearch({ className }: { className?: string }) {
  const { isPending, setFilters } = useCategoryFilters();

  const handleSearch = useDebouncedCallback((search: string) => {
    setFilters({ search });
  }, 250);

  return (
    <div
      className={cn("group w-full", className)}
      data-pending={isPending ? "" : undefined}
    >
      <div className="grid w-full grid-cols-1">
        <Input
          className="col-start-1 row-start-1 border-neutral-300 pl-8"
          type="search"
          placeholder="Search for a category..."
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search for a category..."
        />
        {isPending ? (
          <Icons.spinner className="col-start-1 row-start-1 ml-3 size-4 animate-spin self-center text-neutral-500" />
        ) : (
          <Icons.search className="pointer-events-none col-start-1 row-start-1 ml-3 size-4 self-center text-neutral-500" />
        )}
      </div>
    </div>
  );
}
