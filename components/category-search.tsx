"use client";

import { useDebouncedCallback } from "use-debounce";
import { useCategoryFilters } from "@/hooks/use-category-filters";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function CategorySearch({ className }: { className?: string }) {
  const { isPending, setFilters } = useCategoryFilters();

  const handleSearch = useDebouncedCallback((search: string) => {
    setFilters({ search });
  }, 250);

  return (
    <div
      className={cn("w-full group", className)}
      data-pending={isPending ? "" : undefined}
    >
      <div className="w-full grid grid-cols-1">
        <Input
          className="border-neutral-300 pl-8 col-start-1 row-start-1"
          type="search"
          placeholder="Search for a category..."
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search for a category..."
        />
        {isPending ? (
          <Icons.spinner className="animate-spin col-start-1 row-start-1 size-4 text-neutral-500 ml-3 self-center" />
        ) : (
          <Icons.search className="pointer-events-none col-start-1 row-start-1 size-4 text-neutral-500 ml-3 self-center" />
        )}
      </div>
    </div>
  );
}
