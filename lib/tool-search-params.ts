import { pricingOptions } from "@/lib/schema";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const toolSearchParams = {
  page: parseAsInteger.withDefault(1),

  sort: parseAsString.withDefault("latest"),

  search: parseAsString.withDefault(""),

  category: parseAsArrayOf(parseAsString).withDefault([]),

  pricing: parseAsArrayOf(parseAsStringLiteral(pricingOptions)).withDefault([]),
};

export const toolSearchParamsCache = createSearchParamsCache(toolSearchParams);

export type ToolFilters = Awaited<
  ReturnType<typeof toolSearchParamsCache.parse>
>;
