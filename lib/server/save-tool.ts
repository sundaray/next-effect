import { Effect, Config, Data } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { tools } from "@/db/schema";
import { saveToolPayload } from "@/lib/schema";

class SaveToolError extends Data.TaggedError("SaveToolError")<{
  message: string;
}> {}

export function saveTool(body: saveToolPayload) {
  return Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const s3BucketName = yield* Config.string("S3_BUCKET_NAME");
    const awsRegion = yield* Config.string("AWS_REGION");

    const s3BaseUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com`;
    const logoUrl = body.logoKey ? `${s3BaseUrl}/${body.logoKey}` : null;
    const showcaseImageUrl = `${s3BaseUrl}/${body.showcaseImageKey}`;

    const result = yield* dbService
      .use((db) =>
        db
          .insert(tools)
          .values({
            name: body.name,
            website: body.website,
            tagline: body.tagline,
            description: body.description,
            // Create a new, mutable array from the readonly 'categories' array.
            // Drizzle's 'insert' method expects a mutable 'string[]' to match the database schema,
            categories: [...body.categories],
            pricing: body.pricing,
            logoUrl,
            showcaseImageUrl,
            adminApprovalStatus: "pending",
          })
          .returning({ id: tools.id })
      )
      .pipe(
        Effect.mapError(
          (error) =>
            new SaveToolError({
              message: "Failed to save tool to the database. Please try again.",
            })
        )
      );

    return result[0];
  });
}
