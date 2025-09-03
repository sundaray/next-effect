"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { ToolSearch } from "@/components/tools/tool-search";
import { ToolSort } from "@/components/tools/tool-sort";
import { ToolFilter } from "@/components/tools/tool-filter";
import { ActiveFilters } from "@/components/tools/active-filters";

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
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  return (
    <LayoutGroup>
      <ActiveFilters onClearAll={() => setShowFilters(false)} />
      <div className="mt-8 mb-12 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <div className="space-y-1" ref={controlsRef}>
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
      </div>
    </LayoutGroup>
  );
}
