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
      <motion.div className="my-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <div className="space-y-1">
          <ToolSearch
            onFilterClick={() => setShowFilters(!showFilters)}
            onSearch={() => setShowFilters(false)}
          />
          <AnimatePresence>
            {showFilters && (
              <ToolFilter
                categories={allCategories}
                categoryCounts={categoryCounts}
                pricingCounts={pricingCounts}
              />
            )}
          </AnimatePresence>
        </div>
        <ToolSort />
      </motion.div>
    </LayoutGroup>
  );
}
