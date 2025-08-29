import { parseAsString } from "nuqs/server";
import { createSearchParamsCache } from "nuqs/server";

export const categorySearchParams = {
  search: parseAsString.withDefault(""),
};

export const categorySearchParamsCache =
  createSearchParamsCache(categorySearchParams);

export type CategoryFilters = Awaited<
  ReturnType<typeof categorySearchParamsCache.parse>
>;
