"use client";

import { useToolFilters } from "@/hooks/use-tool-filters";
import { toolSortOptions } from "@/config/tool-options";
import { Icons } from "@/components/icons";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { MyTagGroup, MyTag } from "@/components/ui/tag";
import { unslugify } from "@/lib/utils";
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
    {} as Record<string, { id: string; label: string }[]>
  );

  if (totalActiveFilters === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
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
            className="shrink-0 rounded-full bg-transparent border border-neutral-300 hover:bg-neutral-200 text-neutral-700 font-semibold transition-colors px-3 py-1.5 gap-x-2"
          >
            <Icons.x className="size-4 text-neutral-500" aria-hidden="true" />
            Clear all
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
