import "server-only";
import { Effect, Data } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { tools } from "@/db/schema";

export class ToolPermanentlyRejectedError extends Data.TaggedError(
  "ToolPermanentlyRejectedError"
)<{
  message: string;
}> {}

export function checkForPermanentRejection(toolName: string) {
  return Effect.gen(function* () {
    const dbService = yield* DatabaseService;
    const slug = slugify(toolName);

    const existingTool = yield* dbService.use((db) =>
      db.query.tools.findFirst({
        where: eq(tools.slug, slug),
      })
    );

    if (
      existingTool &&
      existingTool.adminApprovalStatus === "permanently_rejected"
    ) {
      return yield* Effect.fail(
        new ToolPermanentlyRejectedError({
          message:
            "This app has been permanently rejected and cannot be resubmitted.",
        })
      );
    }
  });
}
