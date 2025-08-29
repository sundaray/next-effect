import { getCategories } from "@/lib/get-categories";
import { CategorySearch } from "@/components/category-search";
import { CategoryGrid } from "@/components/category-grid";
import { type SearchParams } from "nuqs/server";
import { categorySearchParamsCache } from "@/lib/category-search-params";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const { search } = await categorySearchParamsCache.parse(searchParams);

  const categories = await getCategories(search);
  categories.sort((a, b) => a.localeCompare(b));

  const groupedCategories = categories.reduce(
    (acc, category) => {
      const firstLetter = category[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(category);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 my-36 group">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 text-pretty">
          Categories
        </h1>
        <p className="text-lg text-neutral-700 mt-4 text-pretty">
          Browse all categories to discover the perfect AI app for your needs.
        </p>
      </div>

      <CategorySearch />
      <CategoryGrid categories={groupedCategories} search={search} />
    </div>
  );
}
