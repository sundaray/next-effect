"use client";

import { useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { ToolSearch } from "@/components/tool-search";
import { ToolSort } from "@/components/tool-sort";
import { ToolFilter } from "@/components/tool-filter";
import { ActiveFilters } from "@/components/active-filters";

interface ToolControlsProps {
  allCategories: string[];
  categoryCounts: Record<string, number>;
  pricingCounts: Record<string, number>;
}

export function ToolControls({
  allCategories,
  categoryCounts,
  pricingCounts,
}: ToolControlsProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <LayoutGroup>
      <AnimatePresence>
        <ActiveFilters onClearAll={() => setShowFilters(false)} />
      </AnimatePresence>
      <motion.div
        layout
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="my-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4"
      >
        <div>
          <ToolSearch
            page="search"
            isFilterOpen={showFilters}
            onFilterClick={() => setShowFilters(!showFilters)}
          />
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: 0 }}
                animate={{ height: "auto", opacity: 1, y: 8 }}
                exit={{ height: 0, opacity: 0, y: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ToolFilter
                  categories={allCategories}
                  categoryCounts={categoryCounts}
                  pricingCounts={pricingCounts}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ToolSort />
      </motion.div>
    </LayoutGroup>
  );
}
