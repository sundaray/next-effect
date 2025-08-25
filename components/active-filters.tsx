"use client";

import { useToolFilters } from "@/hooks/use-tool-filters";
import { toolSortOptions } from "@/config/tool-options";
import { Icons } from "@/components/icons";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { unslugify } from "@/lib/utils";

function FilterPill({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex items-center gap-x-2 rounded-full bg-neutral-200 px-2 py-1 border"
    >
      <span className="text-xs text-neutral-700 font-semibold">{label}</span>
      <button
        onClick={onClear}
        className="text-neutral-500 hover:text-neutral-700 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <Icons.x className="size-4" />
      </button>
    </motion.div>
  );
}

export function ActiveFilters({ onClearAll }: { onClearAll: () => void }) {
  const { filters, setFilters } = useToolFilters();

  // --- Create separate filter groups ---
  const searchFilters = [];
  if (filters.search) {
    searchFilters.push({
      key: "search",
      prefix: "Search:",
      value: `${filters.search}`,
      clear: () => setFilters({ search: null }),
    });
  }

  const sortFilters = [];
  if (filters.sort !== "latest") {
    const option = toolSortOptions.find(
      (option) => option.value === filters.sort
    );
    if (option) {
      sortFilters.push({
        key: "sort",
        prefix: "Sort:",
        value: option.label,
        clear: () => setFilters({ sort: null }),
      });
    }
  }

  const categoryFilters = filters.category.map((categorySlug) => ({
    key: `category-${categorySlug}`,
    label: unslugify(categorySlug),
    clear: () =>
      setFilters({
        category: filters.category.filter((name) => name !== categorySlug),
      }),
  }));

  const pricingFilters = filters.pricing.map((price) => ({
    key: `pricing-${price}`,
    label: price.charAt(0).toUpperCase() + price.slice(1),
    clear: () =>
      setFilters({
        pricing: filters.pricing.filter((p) => p !== price),
      }),
  }));

  const totalActiveFilters =
    searchFilters.length +
    sortFilters.length +
    categoryFilters.length +
    pricingFilters.length;

  const handleClearAll = () => {
    setFilters(null);
    onClearAll();
  };

  return (
    <AnimatePresence>
      {totalActiveFilters > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex items-center justify-between gap-4 mb-4 flex-wrap"
        >
          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
            <AnimatePresence>
              {/* Render non-grouped filters first */}
              {searchFilters.map((filter) => (
                <div key={filter.key} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-500">
                    {filter.prefix}
                  </span>
                  <FilterPill label={filter.value} onClear={filter.clear} />
                </div>
              ))}

              {sortFilters.map((filter) => (
                <div key={filter.key} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-500">
                    {filter.prefix}
                  </span>
                  <FilterPill label={filter.value} onClear={filter.clear} />
                </div>
              ))}

              {/* Render Category group */}
              {categoryFilters.length > 0 && (
                <div key="category-group" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-500">
                    Categories:
                  </span>
                  {categoryFilters.map((filter) => (
                    <FilterPill
                      key={filter.key}
                      label={filter.label}
                      onClear={filter.clear}
                    />
                  ))}
                </div>
              )}

              {/* Render Pricing group */}
              {pricingFilters.length > 0 && (
                <div className="flex items-center gap-2" key="pricing-group">
                  <span className="text-sm font-medium text-neutral-500">
                    Pricing:
                  </span>
                  {pricingFilters.map((filter) => (
                    <FilterPill
                      key={filter.key}
                      label={filter.label}
                      onClear={filter.clear}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
          {totalActiveFilters > 1 && (
            <Button
              onClick={handleClearAll}
              className="shrink-0 rounded-full bg-transparent border border-neutral-300 hover:bg-neutral-200 text-neutral-700 font-semibold transition-colors px-2 py-1 text-xs h-auto gap-x-2"
            >
              <Icons.x className="size-4 text-neutral-500" aria-hidden="true" />
              Clear all
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
