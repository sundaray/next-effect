import { getTools } from "@/lib/get-tools";
import { getCategories } from "@/lib/get-categories";
import type { SearchParams } from "nuqs/server";
import { toolSearchParamsCache } from "@/lib/tool-search-params";
import { ToolHero } from "@/components/tool-hero";
import { ToolsDisplay } from "@/components/tools-display";

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};

const TOOLS_PER_PAGE = 40;

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

  const pricingCounts: Record<string, number> = {};
  for (const tool of allFilteredTools) {
    pricingCounts[tool.pricing] = (pricingCounts[tool.pricing] || 0) + 1;
  }

  const totalPages = Math.ceil(allFilteredTools.length / TOOLS_PER_PAGE);

  const startIndex = (filters.page - 1) * TOOLS_PER_PAGE;
  const endIndex = startIndex + TOOLS_PER_PAGE;

  const paginatedTools = allFilteredTools.slice(startIndex, endIndex);

  return (
    <div className="w-6xl max-w-6xl mx-auto group px-4">
      <ToolHero />
      <ToolsDisplay
        allCategories={categories}
        categoryCounts={categoryCounts}
        pricingCounts={pricingCounts}
        paginatedTools={paginatedTools}
        totalPages={totalPages}
      />
    </div>
  );
}
