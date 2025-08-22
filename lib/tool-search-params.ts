import { parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs/server";

export const toolSearchParams = {
  page: parseAsInteger.withDefault(1),

  sort: parseAsString.withDefault("latest"),

  search: parseAsString.withDefault(""),

  category: parseAsArrayOf(parseAsString).withDefault([]),

  pricing: parseAsArrayOf(parseAsString).withDefault([]),
};
