import { getTools } from "@/lib/get-tools";
import { getCategories } from "@/lib/get-categories";
import { HomePageClient } from "@/components/home-page-client"; // Import the new client component

export default async function HomePage() {
  const tools = await getTools();
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
