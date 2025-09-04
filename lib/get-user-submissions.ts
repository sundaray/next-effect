import "server-only";

import { toolHistory, tools } from "@/db/schema";
import { serverRuntime } from "@/lib/server-runtime";
import { DatabaseService } from "@/lib/services/database-service";
import { and, desc, eq, sql } from "drizzle-orm";
import { Effect } from "effect";

export async function getUserSubmissions(userId: string) {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const submissions = yield* dbService.use(async (db) => {
      const latestRejection = db.$with("latest_rejection").as(
        db
          .select({
            toolId: toolHistory.toolId,
            reason: toolHistory.reason,
            rowNumber:
              sql`ROW_NUMBER() OVER (PARTITION BY ${toolHistory.toolId} ORDER BY ${toolHistory.createdAt} DESC)`.as(
                "rn",
              ),
          })
          .from(toolHistory)
          .where(eq(toolHistory.eventType, "rejected")),
      );

      return await db
        .with(latestRejection)
        .select({
          name: tools.name,
          submittedAt: tools.submittedAt,
          status: tools.adminApprovalStatus,
          rejectionCount: tools.rejectionCount,
          rejectionReason: sql<string | null>`${latestRejection.reason}`.as(
            "rejection_reason",
          ),
        })
        .from(tools)
        .leftJoin(
          latestRejection,
          and(
            eq(tools.id, latestRejection.toolId),
            eq(latestRejection.rowNumber, 1),
          ),
        )
        .where(eq(tools.submittedBy, userId))
        .orderBy(desc(tools.submittedAt));
    });

    return submissions;
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("Database error in getUserSubmissions(): ", error),
    ),
  );

  return await serverRuntime.runPromise(program);
}
