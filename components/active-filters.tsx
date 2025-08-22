"use client";

import { useTransition } from "react";
import { useQueryState, parseAsString, parseAsArrayOf } from "nuqs";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

// This should be the same as in your ToolOrderBy component
const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "name-asc", label: "Name (A to Z)" },
  { value: "name-desc", label: "Name (Z to A)" },
  { value: "bookmarks-desc", label: "Most Bookmarks" },
];

export function ActiveFilters() {
  const [_isPending, startTransition] = useTransition();

  // Read all relevant query states from the URL
  const [orderBy, setOrderBy] = useQueryState(
    "orderBy",
    parseAsString.withDefault("latest").withOptions({ startTransition })
  );

  // === FIX IS HERE ===
  const [categories, setCategories] = useQueryState(
    "category",
    parseAsArrayOf(parseAsString) // You must pass the item parser here
      .withDefault([])
      .withOptions({ startTransition })
  );
  const [pricing, setPricing] = useQueryState(
    "pricing",
    parseAsArrayOf(parseAsString) // And here as well
      .withDefault([])
      .withOptions({ startTransition })
  );
  // === END FIX ===

  // Build a list of active filters to render
  const activeFilters = [];

  // Order By filter (only show if it's not the default)
  if (orderBy && orderBy !== "latest") {
    const option = sortOptions.find((o) => o.value === orderBy);
    if (option) {
      activeFilters.push({
        key: "orderBy",
        label: option.label,
        clear: () => setOrderBy(null), // Resets to default
      });
    }
  }

  // Category filters
  categories.forEach((categoryName) => {
    activeFilters.push({
      key: `category-${categoryName}`,
      label: categoryName,
      clear: () =>
        setCategories(categories.filter((name) => name !== categoryName)),
    });
  });

  // Pricing filters
  pricing.forEach((price) => {
    activeFilters.push({
      key: `pricing-${price}`,
      // Simple capitalization for the label
      label: price.charAt(0).toUpperCase() + price.slice(1),
      clear: () => setPricing(pricing.filter((p) => p !== price)),
    });
  });

  const handleClearAll = () => {
    startTransition(() => {
      setOrderBy(null);
      setCategories([]);
      setPricing([]);
    });
  };

  // Don't render anything if no filters are active
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        {activeFilters.map((filter) => (
          <div
            key={filter.key}
            className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-sm"
          >
            <span className="font-medium text-neutral-700">{filter.label}</span>
            <button
              onClick={filter.clear}
              className="text-neutral-500 hover:text-neutral-800 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {activeFilters.length > 1 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClearAll}
          className="shrink-0"
        >
          <Check className="mr-1.5 size-4" />
          Clear all
        </Button>
      )}
    </div>
  );
}
