"use client";

import { ToolControls } from "@/components/tools/tool-controls";
import { ToolFilterSummary } from "@/components/tools/tool-filter-summary";
import { ToolGrid } from "@/components/tools/tool-grid";
import { ToolPagination } from "@/components/tools/tool-pagination";
import type { Tool } from "@/db/schema";
import { LayoutGroup } from "motion/react";

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
