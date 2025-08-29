"use client";

import { LayoutGroup } from "motion/react";
import type { Tool } from "@/db/schema";
import { ToolControls } from "@/components/tool-controls";
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
      {isFiltered && filteredToolCount > 0 && (
        <div className="text-sm text-neutral-700">
          Showing{" "}
          <span className="font-medium text-neutral-900">
            {paginatedTools.length}{" "}
          </span>
          of{" "}
          <span className="font-medium text-neutral-900">
            {filteredToolCount}
          </span>{" "}
          app{filteredToolCount !== 1 ? "s" : ""} matching your filter criteria.
        </div>
      )}
      <ToolGrid tools={paginatedTools} />
      <ToolPagination totalPages={totalPages} />
    </LayoutGroup>
  );
}
