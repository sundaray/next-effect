import "server-only";
import { Effect, Data } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { tools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";

export class ToolAlreadyExistsError extends Data.TaggedError(
  "ToolAlreadyExistsError"
)<{
  message: string;
}> {}

export function checkForDuplicateTool(toolName: string) {
  return Effect.gen(function* () {
    const dbService = yield* DatabaseService;
    const slug = slugify(toolName);

    const existingTool = yield* dbService.use((db) =>
      db.query.tools.findFirst({ where: eq(tools.slug, slug) })
    );

    console.log(
      "[DEBUG] Database check result for existing tool:",
      existingTool
    );

    if (existingTool) {
      return yield* Effect.fail(
        new ToolAlreadyExistsError({
          message: `An app with the same name (${toolName}) already exists.`,
        })
      );
    }
  });
}
