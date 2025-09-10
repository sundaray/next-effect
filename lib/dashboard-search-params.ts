import { parseAsStringLiteral } from "nuqs";

export const dashboardAdminTabs = [
  "submission-management",
  "user-management",
  "my-submissions",
] as const;

export const dashboardSearchParams = {
  tab: parseAsStringLiteral(dashboardAdminTabs).withDefault(
    "submission-management",
  ),
};
