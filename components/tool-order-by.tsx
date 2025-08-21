"use client";

import { useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useQueryState, parseAsString } from "nuqs";

import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

export function ToolOrderBy({ page }: { page: string }) {
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

  return <div></div>;
}
