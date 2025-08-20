import "server-only";

import { Effect } from "effect";
import { desc } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools } from "@/db/schema";

export async function getTools() {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    // Order the results by submission date in descending order (newest first).
    const allTools = yield* dbService.use((db) =>
      db.select().from(tools).orderBy(desc(tools.submittedAt))
    );

    return allTools;
  }).pipe(Effect.tapError((error) => Effect.logError(error)));

  return await serverRuntime.runPromise(program);
}
