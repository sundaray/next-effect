"use client";

import { MultiSelectCommand } from "@/components/multi-select-command";
import { pricingOptions } from "@/lib/schema";
import { useToolFilters } from "@/hooks/use-tool-filters";
import { slugify } from "@/lib/utils";

type Pricing = (typeof pricingOptions)[number];
const isPricing = (v: string): v is Pricing =>
  (pricingOptions as readonly string[]).includes(v);

interface ToolFiltersProps {
  categories: string[];
  categoryCounts: Record<string, number>;
  pricingCounts: Record<string, number>;
}

export function ToolFilter({
  categories,
  categoryCounts,
  pricingCounts,
}: ToolFiltersProps) {
  const { isPending, filters, setFilters } = useToolFilters();

  const categoryOptions = categories.map((cat) => ({
    value: slugify(cat),
    label: cat,
    count: categoryCounts[cat] || 0,
  }));

  const pricingOptionsFormatted = pricingOptions.map((p) => ({
    value: p,
    label: p.charAt(0).toUpperCase() + p.slice(1),
    count: pricingCounts[p] || 0,
  }));

  return (
    <div
      className="flex flex-col sm:flex-row gap-4 items-center"
      data-pending={isPending ? "" : undefined}
    >
      <MultiSelectCommand
        placeholder="Search categories..."
        options={categoryOptions}
        selectedValues={filters.category}
        onValueChange={(newCategories) => {
          setFilters({ category: newCategories });
        }}
      />
      <MultiSelectCommand
        placeholder="Search pricing..."
        options={pricingOptionsFormatted}
        selectedValues={filters.pricing}
        onValueChange={(newPricing) => {
          setFilters({ pricing: newPricing.filter(isPricing) });
        }}
      />
    </div>
  );
}
