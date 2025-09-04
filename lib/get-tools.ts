import "server-only";

import { tools } from "@/db/schema";
import { serverRuntime } from "@/lib/server-runtime";
import { DatabaseService } from "@/lib/services/database-service";
import type { ToolFilters } from "@/lib/tool-search-params";
import { unslugify } from "@/lib/utils";
import { and, arrayOverlaps, desc, eq, ilike, inArray, SQL } from "drizzle-orm";
import { Effect } from "effect";

export async function getTools(
  filters: Partial<ToolFilters>,
  userRole: string | null,
) {
  // This array will hold all the WHERE clauses for our final query
  const conditions: SQL[] = [];

  if (userRole !== "admin") {
    conditions.push(eq(tools.adminApprovalStatus, "approved"));
  }

  const categories = filters.category ?? [];
  const pricing = filters.pricing ?? [];

  // Search condition
  if (filters.search) {
    conditions.push(ilike(tools.name, `%${filters.search}%`));
  }

  // Category condition
  if (categories.length > 0) {
    const originalCategoryNames = categories.map((category) =>
      unslugify(category),
    );
    conditions.push(arrayOverlaps(tools.categories, originalCategoryNames));
  }

  // Pricing condition
  if (pricing.length > 0) {
    conditions.push(inArray(tools.pricing, pricing));
  }

  // 6. Build the dynamic ORDER BY clause
  let orderByClause;
  switch (filters.sort) {
    case "name-asc":
      orderByClause = tools.name;
      break;
    case "name-desc":
      orderByClause = desc(tools.name);
      break;
    case "bookmarks-desc":
      orderByClause = desc(tools.bookmarkCount);
      break;
    case "latest":
    default:
      orderByClause = desc(tools.submittedAt);
      break;
  }

  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const filteredTools = yield* dbService.use((db) =>
      db
        .select()
        .from(tools)
        .where(and(...conditions))
        .orderBy(orderByClause),
    );

    return filteredTools;
  }).pipe(
    Effect.tapError((error) => Effect.logError("Error at getTools(): ", error)),
  );

  return await serverRuntime.runPromise(program);
}
