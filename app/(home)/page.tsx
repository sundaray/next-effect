import { getTools } from "@/lib/get-tools";
import { getCategories } from "@/lib/get-categories";
import type { SearchParams } from "nuqs/server";
import { toolSearchParamsCache } from "@/lib/tool-search-params";
import { ToolHero } from "@/components/tool-hero";
import { ToolControls } from "@/components/tool-controls";
import { ToolGrid } from "@/components/tool-grid";
import { ToolPagination } from "@/components/tool-pagination";

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};

const TOOLS_PER_PAGE = 1;

export default async function HomePage({ searchParams }: HomePageProps) {
  const filters = await toolSearchParamsCache.parse(searchParams);

  const allFilteredTools = await getTools(filters);

  const categories = await getCategories();

  const categoryCounts: Record<string, number> = {};
  for (const tool of allFilteredTools) {
    for (const category of tool.categories) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  }

  // Calculate pricing counts
  const pricingCounts: Record<string, number> = {};
  for (const tool of allFilteredTools) {
    pricingCounts[tool.pricing] = (pricingCounts[tool.pricing] || 0) + 1;
  }

  // 4. Calculate total pages based on the full list.
  const totalPages = Math.ceil(allFilteredTools.length / TOOLS_PER_PAGE);

  // 5. Calculate the start and end indexes for slicing the array.
  //    The `filters.page` comes directly from the URL search params.
  const startIndex = (filters.page - 1) * TOOLS_PER_PAGE;
  const endIndex = startIndex + TOOLS_PER_PAGE;

  // 6. Create the paginated list of tools to send to the client.
  const paginatedTools = allFilteredTools.slice(startIndex, endIndex);

  return (
    <div className="w-6xl max-w-6xl mx-auto group">
      <ToolHero />
      <ToolControls
        allCategories={categories}
        categoryCounts={categoryCounts}
        pricingCounts={pricingCounts}
      />
      <ToolGrid tools={paginatedTools} />
      <ToolPagination totalPages={totalPages} />
    </div>
  );
}
