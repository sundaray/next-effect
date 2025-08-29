"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";
import { categorySearchParams } from "@/lib/category-search-params";
import type { CategoryFilters } from "@/lib/category-search-params";

export function useCategoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [filters, setFiltersOriginal] = useQueryStates(categorySearchParams, {
    shallow: true,
    history: "push",
  });

  const setFilters = (newFilters: Partial<CategoryFilters> | null) => {
    const updateAndRefresh = async () => {
      const newSearchParams = await setFiltersOriginal(newFilters);

      startTransition(() => {
        router.push(`${pathname}?${newSearchParams.toString()}`);
      });
    };

    updateAndRefresh();
  };

  return { isPending, filters, setFilters } as const;
}
