import {
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
  parseAsStringLiteral,
} from "nuqs/server";
import { pricingOptions } from "@/lib/schema";
import { createSearchParamsCache } from "nuqs/server";

const validPricing = pricingOptions as readonly ["free", "paid", "freemium"];

export const toolSearchParams = {
  page: parseAsInteger.withDefault(1),

  sort: parseAsString.withDefault("latest"),

  search: parseAsString.withDefault(""),

  category: parseAsArrayOf(parseAsString).withDefault([]),

  pricing: parseAsArrayOf(parseAsStringLiteral(validPricing)).withDefault([]),
};

export const toolSearchParamsCache = createSearchParamsCache(toolSearchParams);

export type ToolFilters = Awaited<
  ReturnType<typeof toolSearchParamsCache.parse>
>;
