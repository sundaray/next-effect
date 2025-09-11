import "server-only";

import { tools } from "@/db/schema";
import { serverRuntime } from "@/lib/server-runtime";
import { DatabaseService } from "@/lib/services/database-service";
import { and, eq } from "drizzle-orm";
import { Effect } from "effect";

// This function finds a tool by its slug BUT only if it belongs to the specified user.
export async function getToolForEdit(slug: string, userId: string) {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const result = yield* dbService.use((db) =>
      db
        .select()
        .from(tools)
        .where(and(eq(tools.slug, slug), eq(tools.submittedBy, userId)))
        .limit(1),
    );

    return result[0] || null;
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("Database error in getToolForEdit(): ", error),
    ),
  );

  return await serverRuntime.runPromise(program);
}
