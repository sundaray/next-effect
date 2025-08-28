"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
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
}

export function ToolsDisplay({
  allCategories,
  categoryCounts,
  pricingCounts,
  paginatedTools,
  totalPages,
}: ToolsDisplayProps) {
  return (
    <LayoutGroup>
      <ToolControls
        allCategories={allCategories}
        categoryCounts={categoryCounts}
        pricingCounts={pricingCounts}
      />
      <ToolGrid tools={paginatedTools} />
      <ToolPagination totalPages={totalPages} />
    </LayoutGroup>
  );
}
