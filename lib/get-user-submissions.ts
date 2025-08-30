import "server-only";

import { Effect } from "effect";
import { eq, desc, and, sql } from "drizzle-orm";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools, toolHistory } from "@/db/schema";

export async function getUserSubmissions(userId: string) {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    // 🔽 MODIFIED: The entire query is now in a single .use() call
    const submissions = yield* dbService.use(async (db) => {
      // Step 1: Define the CTE (subquery) builder
      const latestRejection = db.$with("latest_rejection").as(
        db
          .select({
            toolId: toolHistory.toolId,
            reason: toolHistory.reason,
            rowNumber:
              sql`ROW_NUMBER() OVER (PARTITION BY ${toolHistory.toolId} ORDER BY ${toolHistory.createdAt} DESC)`.as(
                "rn"
              ),
          })
          .from(toolHistory)
          .where(eq(toolHistory.eventType, "rejected"))
      );

      // Step 2: Use the CTE in the main query and execute it
      return await db
        .with(latestRejection)
        .select({
          name: tools.name,
          submittedAt: tools.submittedAt,
          status: tools.adminApprovalStatus,
          rejectionReason: sql<string | null>`${latestRejection.reason}`.as(
            "rejection_reason"
          ),
        })
        .from(tools)
        .leftJoin(
          latestRejection,
          and(
            eq(tools.id, latestRejection.toolId),
            eq(latestRejection.rowNumber, 1)
          )
        )
        .where(eq(tools.submittedBy, userId))
        .orderBy(desc(tools.submittedAt));
    });

    return submissions;
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("Database error in getUserSubmissions(): ", error)
    )
  );

  return await serverRuntime.runPromise(program);
}
