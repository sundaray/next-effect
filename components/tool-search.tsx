"use client";

import { useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useQueryState, parseAsString } from "nuqs";

import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

export function ToolSearch({ page }: { page: string }) {
  const [isPending, startTransition] = useTransition();

  // Set up query parameter for search term
  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault("").withOptions({
      startTransition,
      shallow: false,
    })
  );

  // Set up access to page parameter just to reset it
  const [_, setPage] = useQueryState(
    "page",
    parseAsString.withDefault("1").withOptions({
      startTransition,
      shallow: false,
    })
  );

  // Handle search with debounce
  const handleSearch = useDebouncedCallback((term: string) => {
    setQuery(term);

    // Only reset page if we're using the podcast search
    if (page === "podcasts") {
      setPage("1");
    }
  }, 250);

  return (
    <div className="flex">
      <div
        className="w-full grid grid-cols-1"
        data-pending={isPending ? "" : undefined}
      >
        <Input
          className="border-neutral-300 pl-8 rounded-r-none border-r-0 col-start-1 row-start-1 pr-3"
          type="search"
          placeholder="Search for apps by name..."
          defaultValue={query || ""}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search for apps by name..."
        />
        <Icons.search className="pointer-events-none col-start-1 row-start-1 size-5 sm:size-4 text-neutral-500 ml-3 self-center" />
      </div>
      <button
        type="button"
        className="flex shrink-0 items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-neutral-900 outline-1 -outline-offset-1 outline-neutral-300 hover:bg-neutral-100 transition-colors focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600"
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
