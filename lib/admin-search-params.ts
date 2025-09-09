import { parseAsStringLiteral } from "nuqs";

export const adminTabs = ["submissions", "users"] as const;

export const adminSearchParams = {
  tab: parseAsStringLiteral(adminTabs).withDefault("submissions"),
};
