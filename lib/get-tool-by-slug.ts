import "server-only";

import { tools } from "@/db/schema";
import { serverRuntime } from "@/lib/server-runtime";
import { DatabaseService } from "@/lib/services/database-service";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export async function getToolBySlug(slug: string) {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const result = yield* dbService.use((db) =>
      db.select().from(tools).where(eq(tools.slug, slug)).limit(1),
    );

    return result[0] || null;
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("Database error in getToolBySlug(): ", error),
    ),
  );

  return await serverRuntime.runPromise(program);
}
