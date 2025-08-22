// components/tool-filters.tsx
"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { useTransition } from "react";
import { MultiSelectCommand } from "@/components/multi-select-command"; // Assuming you named it this
import { pricingOptions } from "@/lib/schema";

interface ToolFiltersProps {
  categories: string[];
  categoryCounts: Record<string, number>;
  pricingCounts: Record<string, number>;
}

export function ToolFilters({
  categories,
  categoryCounts,
  pricingCounts,
}: ToolFiltersProps) {
  const [_isPending, startTransition] = useTransition();

  const [selectedCategories, setSelectedCategories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({
      startTransition,
      shallow: false,
    })
  );

  const [selectedPricing, setSelectedPricing] = useQueryState(
    "pricing",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({
      startTransition,
      shallow: false,
    })
  );

  const categoryOptions = categories.map((cat) => ({
    value: cat,
    label: cat,
    count: categoryCounts[cat] || 0,
  }));

  const pricingOptionsFormatted = pricingOptions.map((p) => ({
    value: p,
    label: p.charAt(0).toUpperCase() + p.slice(1),
    count: pricingCounts[p] || 0,
  }));

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <MultiSelectCommand
        placeholder="Search categories..."
        options={categoryOptions}
        selectedValues={selectedCategories}
        onValueChange={setSelectedCategories}
      />
      <MultiSelectCommand
        placeholder="Search pricing..."
        options={pricingOptionsFormatted}
        selectedValues={selectedPricing}
        onValueChange={setSelectedPricing}
      />
    </div>
  );
}
