"use client";

import { useToolFilters } from "@/hooks/use-tool-filters";
import { toolSortOptions } from "@/config/tool-options";
import { Icons } from "@/components/icons";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { MyTagGroup, MyTag } from "@/components/ui/tag";
import { unslugify } from "@/lib/utils";
import { Key, useState, useEffect, useRef } from "react";

const getActiveFilterKeys = (
  filters: ReturnType<typeof useToolFilters>["filters"]
) => {
  const keys = new Set<string>();
  if (filters.search) keys.add("search");
  if (filters.sort !== "latest") keys.add("sort");
  filters.category.forEach((cat) => keys.add(`category-${cat}`));
  filters.pricing.forEach((price) => keys.add(`pricing-${price}`));
  return keys;
};

export function ActiveFilters({ onClearAll }: { onClearAll: () => void }) {
  const { filters, setFilters } = useToolFilters();

  const [orderedFilterKeys, setOrderedFilterKeys] = useState<string[]>([]);
  const prevFiltersRef = useRef(filters);

  useEffect(() => {
    const prevKeys = getActiveFilterKeys(prevFiltersRef.current);
    const currentKeys = getActiveFilterKeys(filters);

    const addedKeys = [...currentKeys].filter((key) => !prevKeys.has(key));

    const removedKeys = [...prevKeys].filter((key) => !currentKeys.has(key));

    if (addedKeys.length > 0 || removedKeys.length > 0) {
      setOrderedFilterKeys((currentOrderedKeys) => {
        const remainingKeys = currentOrderedKeys.filter(
          (key) => !removedKeys.includes(key)
        );
        return [...remainingKeys, ...addedKeys];
      });
    }

    prevFiltersRef.current = filters;
  }, [filters]);

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
  if (filters.sort !== "latest") {
    const option = toolSortOptions.find((opt) => opt.value === filters.sort);
    if (option) {
      allFiltersMap.set("sort", {
        label: option.label,
        clear: () => setFilters({ sort: "" }),
        group: "Sort:",
      });
    }
  }
  filters.category.forEach((slug) => {
    allFiltersMap.set(`category-${slug}`, {
      label: unslugify(slug),
      clear: () =>
        setFilters({ category: filters.category.filter((c) => c !== slug) }),
      group: "Categories:",
    });
  });
  filters.pricing.forEach((price) => {
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

  const groupedAndOrderedFilters = orderedFilterKeys.reduce(
    (acc, key) => {
      const filter = allFiltersMap.get(key);
      if (filter) {
        if (!acc[filter.group]) {
          acc[filter.group] = [];
        }
        acc[filter.group].push({ id: key, label: filter.label });
      }
      return acc;
    },
    {} as Record<string, { id: string; label: string }[]>
  );

  return (
    <AnimatePresence>
      {totalActiveFilters > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
            {Object.entries(groupedAndOrderedFilters).map(
              ([groupLabel, items]) => (
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
              )
            )}
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
      )}
    </AnimatePresence>
  );
}
