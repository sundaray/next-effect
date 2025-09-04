import { CategoryGrid } from "@/components/category-grid";
import { CategorySearch } from "@/components/category-search";
import { categorySearchParamsCache } from "@/lib/category-search-params";
import { getCategories } from "@/lib/get-categories";
import { type SearchParams } from "nuqs/server";

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
    {} as Record<string, string[]>,
  );

  return (
    <div className="group mx-auto my-36 max-w-4xl px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-pretty text-neutral-900">
          Categories
        </h1>
        <p className="mt-4 text-lg text-pretty text-neutral-700">
          Browse all categories to discover the perfect AI app for your needs.
        </p>
      </div>

      <CategorySearch />
      <CategoryGrid categories={groupedCategories} search={search} />
    </div>
  );
}
