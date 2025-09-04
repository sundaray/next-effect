import { ToolHero } from "@/components/tools/tool-hero";
import { ToolsDisplay } from "@/components/tools/tools-display";
import { getCategories } from "@/lib/get-categories";
import { getTools } from "@/lib/get-tools";
import { getUser } from "@/lib/get-user";
import { toolSearchParamsCache } from "@/lib/tool-search-params";
import { headers } from "next/headers";
import type { SearchParams } from "nuqs/server";

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};

const TOOLS_PER_PAGE = 40;

export default async function HomePage({ searchParams }: HomePageProps) {
  const filters = await toolSearchParamsCache.parse(searchParams);

  const requestHeaders = await headers();
  const user = await getUser(requestHeaders);
  const userRole = user?.role ?? null;

  const isFiltered =
    filters.search !== "" ||
    filters.category.length > 0 ||
    filters.pricing.length > 0 ||
    filters.sort !== "latest";

  const allFilteredTools = await getTools(filters, userRole);

  const categories = await getCategories(filters.search);

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
    <div className="group mx-auto max-w-6xl px-4">
      <ToolHero />
      <ToolsDisplay
        allCategories={categories}
        categoryCounts={categoryCounts}
        pricingCounts={pricingCounts}
        paginatedTools={paginatedTools}
        totalPages={totalPages}
        filteredToolCount={allFilteredTools.length}
        isFiltered={isFiltered}
      />
    </div>
  );
}
