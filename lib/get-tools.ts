import "server-only";

import { Effect } from "effect";
// 1. Import Drizzle query helpers
import { desc, and, ilike, inArray, arrayOverlaps, SQL } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools } from "@/db/schema";
// 2. Import nuqs tools for server-side parsing
import { unslugify } from "@/lib/utils";
import type { ToolFilters } from "@/lib/tool-search-params";

// 3. Update the function to accept searchParams
export async function getTools(filters: Partial<ToolFilters>) {
  // This array will hold all the WHERE clauses for our final query
  const conditions: SQL[] = [];

  const categories = filters.category ?? [];
  const pricing = filters.pricing ?? [];

  // Search condition
  if (filters.search) {
    conditions.push(ilike(tools.name, `%${filters.search}%`));
  }

  // Category condition
  if (categories.length > 0) {
    const originalCategoryNames = categories.map((category) =>
      unslugify(category)
    );
    conditions.push(arrayOverlaps(tools.categories, originalCategoryNames));
  }

  // Pricing condition
  // Pricing is a literal string type, so wht are we checking the length here?
  if (pricing.length > 0) {
    conditions.push(inArray(tools.pricing, filters.pricing));
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
    // Add the bookmarks-desc case
    case "latest":
    default:
      orderByClause = desc(tools.submittedAt);
      break;
  }

  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    // 7. Construct and execute the final Drizzle query
    const filteredTools = yield* dbService.use((db) =>
      db
        .select()
        .from(tools)
        .where(and(...conditions))
        .orderBy(orderByClause)
    );

    return filteredTools;
  }).pipe(
    Effect.tapError((error) => Effect.logError("Error at getTools(): ", error))
  );

  return await serverRuntime.runPromise(program);
}
