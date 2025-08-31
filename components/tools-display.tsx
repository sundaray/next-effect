"use client";

import { LayoutGroup } from "motion/react";
import type { Tool } from "@/db/schema";
import { ToolControls } from "@/components/tool-controls";
import { ToolFilterSummary } from "@/components/tool-filter-summary";
import { ToolGrid } from "@/components/tool-grid";
import { ToolPagination } from "@/components/tool-pagination";

interface ToolsDisplayProps {
  allCategories: string[];
  categoryCounts: Record<string, number>;
  pricingCounts: Record<string, number>;
  paginatedTools: Tool[];
  totalPages: number;
  filteredToolCount: number;
  isFiltered: boolean;
}

export function ToolsDisplay({
  allCategories,
  categoryCounts,
  pricingCounts,
  paginatedTools,
  totalPages,
  filteredToolCount,
  isFiltered,
}: ToolsDisplayProps) {
  return (
    <LayoutGroup>
      <ToolControls
        allCategories={allCategories}
        categoryCounts={categoryCounts}
        pricingCounts={pricingCounts}
      />
      <ToolFilterSummary
        isFiltered={isFiltered}
        filteredToolCount={filteredToolCount}
        paginatedToolCount={paginatedTools.length}
      />
      <ToolGrid tools={paginatedTools} isFiltered={isFiltered} />
      <ToolPagination totalPages={totalPages} />
    </LayoutGroup>
  );
}
