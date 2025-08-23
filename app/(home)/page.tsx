import { getTools } from "@/lib/get-tools";
import { getCategories } from "@/lib/get-categories";
import { HomePageClient } from "@/components/home-page-client";
import type { SearchParams } from "nuqs/server";
import { toolSearchParamsCache } from "@/lib/tool-search-params";

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const filters = await toolSearchParamsCache.parse(searchParams);

  const tools = await getTools(filters);

  const categories = await getCategories();

  const categoryCounts: Record<string, number> = {};
  for (const tool of tools) {
    for (const category of tool.categories) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  }

  // Calculate pricing counts
  const pricingCounts: Record<string, number> = {};
  for (const tool of tools) {
    pricingCounts[tool.pricing] = (pricingCounts[tool.pricing] || 0) + 1;
  }

  return (
    <HomePageClient
      initialTools={tools}
      allCategories={categories}
      categoryCounts={categoryCounts}
      pricingCounts={pricingCounts}
    />
  );
}
