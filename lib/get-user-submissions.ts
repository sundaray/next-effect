import "server-only";

import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools } from "@/db/schema";

export async function getUserSubmissions(userId: string) {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const submissions = yield* dbService.use((db) =>
      db
        .select({
          name: tools.name,
          submittedAt: tools.submittedAt,
          status: tools.adminApprovalStatus,
        })
        .from(tools)
        .where(eq(tools.submittedBy, userId))
    );

    return submissions;
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("Database error in getUserSubmissions(): ", error)
    )
  );

  return await serverRuntime.runPromise(program);
}
