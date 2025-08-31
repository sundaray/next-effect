import "server-only";

import { Effect } from "effect";
import { sql } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools } from "@/db/schema";

export async function getCategories(search: string) {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const query = search
      ? sql`
          SELECT DISTINCT category 
          FROM ${tools}, unnest(${tools.categories}) AS category 
          WHERE category ILIKE ${`%${search}%`}
        `
      : sql`
          SELECT DISTINCT unnest(${tools.categories}) AS category FROM ${tools}
        `;

    const result = yield* dbService
      .use((db) => db.execute(query))
      .pipe(
        Effect.tapError((error) =>
          Effect.logError("Database error in getCategories(): ", error)
        )
      );

    // The raw result from `db.execute` is an array of objects, e.g., [{ category: 'AI' }].
    // We need to map this to a simple array of strings.
    return result.map((row: any) => row.category as string);
  });

  return await serverRuntime.runPromise(program);
}
