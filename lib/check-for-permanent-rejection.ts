import { tools } from "@/db/schema";
import { DatabaseService } from "@/lib/services/database-service";
import { slugify } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { Data, Effect } from "effect";
import "server-only";

export class ToolPermanentlyRejectedError extends Data.TaggedError(
  "ToolPermanentlyRejectedError",
)<{
  message: string;
}> {}

export function checkForPermanentRejection(toolName: string, userId: string) {
  return Effect.gen(function* () {
    const dbService = yield* DatabaseService;
    const slug = slugify(toolName);

    const existingTool = yield* dbService.use((db) =>
      db.query.tools.findFirst({
        where: and(eq(tools.slug, slug), eq(tools.submittedBy, userId)),
      }),
    );

    if (
      existingTool &&
      existingTool.adminApprovalStatus === "permanently_rejected"
    ) {
      return yield* Effect.fail(
        new ToolPermanentlyRejectedError({
          message:
            "This app has been permanently rejected and cannot be resubmitted.",
        }),
      );
    }
  });
}
