import { getTools } from "@/lib/get-tools";
import { getCategories } from "@/lib/get-categories";
import { HomePageClient } from "@/components/home-page-client"; // Import the new client component

export default async function HomePage() {
  const tools = await getTools();
  const categories = await getCategories();

  return <HomePageClient initialTools={tools} allCategories={categories} />;
}
