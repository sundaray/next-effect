"use client";

import { useTransition } from "react";
import { useQueryStates } from "nuqs";
import { toolSearchParams } from "@/lib/tool-search-params";

export function useToolFilters() {
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useQueryStates(toolSearchParams, {
    startTransition,
  });

  return [filters, setFilters] as const;
}
