import "server-only";

import { Effect } from "effect";
import { desc, eq } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools, users } from "@/db/schema";

export async function getAllSubmissions() {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const submissions = yield* dbService.use((db) =>
      db
        .select({
          id: tools.id,
          name: tools.name,
          slug: tools.slug,
          submittedAt: tools.submittedAt,
          status: tools.adminApprovalStatus,
          submittedByEmail: users.email,
        })
        .from(tools)
        .leftJoin(users, eq(tools.submittedBy, users.id))
        .orderBy(desc(tools.submittedAt))
    );

    return submissions;
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("Database error in getAllSubmissions(): ", error)
    )
  );

  return await serverRuntime.runPromise(program);
}
