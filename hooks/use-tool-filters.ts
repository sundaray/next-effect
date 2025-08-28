"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";
import { toolSearchParams } from "@/lib/tool-search-params";
import type { ToolFilters } from "@/lib/tool-search-params";

export function useToolFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [filters, setFiltersOriginal] = useQueryStates(toolSearchParams, {
    shallow: true,
    history: "push",
  });

  const setFilters = (newFilters: Partial<ToolFilters> | null) => {
    // We need to handle the promise returned by the nuqs setter.
    // An async function is the cleanest way.
    const updateAndRefresh = async () => {
      // Step A: Update the URL on the client-side instantly.
      // We `await` this to get the `newSearchParams` object.
      const newSearchParams = await setFiltersOriginal(newFilters);

      // Step B: Manually trigger a server-side navigation with the new URL.
      startTransition(() => {
        router.push(`${pathname}?${newSearchParams.toString()}`);
      });
    };

    updateAndRefresh();
  };

  return { isPending, filters, setFilters } as const;
}
