import { Effect, Config, Data } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { tools } from "@/db/schema";

export type SaveToolParams = {
  name: string;
  website: string;
  tagline: string;
  description: string;
  categories: readonly string[];
  pricing: "Free" | "Paid" | "Freemium";
  logoKey?: string;
  homepageScreenshotKey: string;
};

class SaveToolError extends Data.TaggedError("SaveToolError")<{
  cause: unknown;
  message: string;
}> {}

export function saveTool(body: SaveToolParams) {
  return Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const s3BucketName = yield* Config.string("S3_BUCKET_NAME");
    const awsRegion = yield* Config.string("AWS_REGION");

    const s3BaseUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com`;
    const homepageScreenshotUrl = `${s3BaseUrl}/${body.homepageScreenshotKey}`;
    const logoUrl = body.logoKey ? `${s3BaseUrl}/${body.logoKey}` : null;

    const result = yield* dbService
      .use((db) =>
        db
          .insert(tools)
          .values({
            name: body.name,
            website: body.website,
            tagline: body.tagline,
            description: body.description,
            categories: body.categories,
            pricing: body.pricing,
            logoUrl,
            homepageScreenshotUrl,
            status: "pending",
          })
          .returning()
      )
      .pipe(
        Effect.tapErrorTag("DatabaseError", (error) =>
          Effect.logError("SaveToolError: ", error)
        ),
        Effect.mapError(
          (error) =>
            new SaveToolError({
              cause: error,
              message: "Failed to save tool to the database. Please try again.",
            })
        )
      );
  });
}
