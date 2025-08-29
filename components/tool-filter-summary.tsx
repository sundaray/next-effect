"use client";

interface ResultsCountProps {
  isFiltered: boolean;
  filteredToolCount: number;
  paginatedToolCount: number;
}

export function ToolFilterSummary({
  isFiltered,
  filteredToolCount,
  paginatedToolCount,
}: ResultsCountProps) {
  if (!isFiltered) {
    return null;
  }

  return (
    <div className="text-sm text-neutral-700">
      Showing{" "}
      <span className="font-medium text-neutral-900">{paginatedToolCount}</span>{" "}
      of{" "}
      <span className="font-medium text-neutral-900">{filteredToolCount}</span>{" "}
      tool{filteredToolCount !== 1 ? "s" : ""} matching your filter criteria:
    </div>
  );
}
