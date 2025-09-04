"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MyTag, MyTagGroup } from "@/components/ui/tag";
import { toolSortOptions } from "@/config/tool-options";
import { useToolFilters } from "@/hooks/use-tool-filters";
import { unslugify } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Key } from "react";

export function ActiveFilters({ onClearAll }: { onClearAll: () => void }) {
  const { filters, setFilters } = useToolFilters();

  const allFiltersMap = new Map<
    string,
    { label: string; clear: () => void; group: string }
  >();

  if (filters.search) {
    allFiltersMap.set("search", {
      label: filters.search,
      clear: () => setFilters({ search: "" }),
      group: "Search:",
    });
  }
  if (filters.sort && filters.sort !== "latest") {
    const option = toolSortOptions.find((opt) => opt.value === filters.sort);
    if (option) {
      allFiltersMap.set("sort", {
        label: option.label,
        clear: () => setFilters({ sort: "" }),
        group: "Sort:",
      });
    }
  }
  filters.category?.forEach((slug) => {
    allFiltersMap.set(`category-${slug}`, {
      label: unslugify(slug),
      clear: () =>
        setFilters({
          category: filters.category.filter((c) => c !== slug),
        }),
      group: "Categories:",
    });
  });
  filters.pricing?.forEach((price) => {
    allFiltersMap.set(`pricing-${price}`, {
      label: price.charAt(0).toUpperCase() + price.slice(1),
      clear: () =>
        setFilters({ pricing: filters.pricing.filter((p) => p !== price) }),
      group: "Pricing:",
    });
  });

  const totalActiveFilters = allFiltersMap.size;

  const handleClearAll = () => {
    setFilters(null);
    onClearAll();
  };

  const handleRemove = (keys: Set<Key>) => {
    const keyToRemove = Array.from(keys)[0] as string;
    allFiltersMap.get(keyToRemove)?.clear();
  };

  const groupedFilters = Array.from(allFiltersMap.entries()).reduce(
    (acc, [key, filter]) => {
      if (!acc[filter.group]) {
        acc[filter.group] = [];
      }
      acc[filter.group].push({ id: key, label: filter.label });
      return acc;
    },
    {} as Record<string, { id: string; label: string }[]>,
  );

  return (
    <AnimatePresence>
      {totalActiveFilters > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {Object.entries(groupedFilters).map(([groupLabel, items]) => (
              <MyTagGroup
                key={groupLabel}
                items={items}
                label={groupLabel}
                onRemove={handleRemove}
                className="flex items-center gap-2"
                labelClassName="text-sm font-medium text-neutral-500"
              >
                {(item) => <MyTag id={item.id}>{item.label}</MyTag>}
              </MyTagGroup>
            ))}
          </div>

          {totalActiveFilters > 1 && (
            <Button
              onClick={handleClearAll}
              className="shrink-0 cursor-pointer gap-x-2 rounded-full border border-neutral-300 bg-transparent px-3 py-1.5 font-semibold text-neutral-700 transition-colors hover:bg-neutral-200"
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
