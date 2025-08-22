import "server-only";

import { Effect } from "effect";
// 1. Import Drizzle query helpers
import { desc, and, ilike, or, inArray, sql, SQL } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools } from "@/db/schema";
// 2. Import nuqs tools for server-side parsing
import { toolSearchParams } from "@/lib/tool-search-params";
import { createSearchParamsCache } from "nuqs/server";
import type { SearchParams } from "nuqs/server";
import { unslugify } from "@/lib/utils";

const toolSearchParamsCache = createSearchParamsCache(toolSearchParams);

// 3. Update the function to accept searchParams
export async function getTools(searchParams: SearchParams) {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    // 4. Use nuqs's server-side parser to safely parse params and apply defaults
    const filters = toolSearchParamsCache.parse(searchParams);
    // 5. Build an array of dynamic query conditions
    const conditions: SQL[] = [];

    // Search condition (case-insensitive search on name and tagline)
    if (filters.search) {
      conditions.push(
        or(
          ilike(tools.name, `%${filters.search}%`),
          ilike(tools.tagline, `%${filters.search}%`)
        )!
      );
    }

    // Category condition (tool must have at least one of the selected categories)
    if (filters.category.length > 0) {
      const originalCategoryNames = filters.category.map(unslugify);
      // Use SQL's && operator to check for array overlap in Postgres
      conditions.push(sql`${tools.categories} && ${originalCategoryNames}`);
    }

    // Pricing condition
    if (filters.pricing.length > 0) {
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
      // You can add more cases here later, e.g., for bookmarks
      case "latest":
      default:
        orderByClause = desc(tools.submittedAt);
        break;
    }

    // 7. Construct and execute the final Drizzle query
    const filteredTools = yield* dbService.use(
      (db) =>
        db
          .select()
          .from(tools)
          .where(and(...conditions)) // Apply all conditions
          .orderBy(orderByClause) // Apply the sort order
    );

    return filteredTools;
  }).pipe(Effect.tapError((error) => Effect.logError(error)));

  return await serverRuntime.runPromise(program);
}
