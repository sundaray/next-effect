import { Effect, Config, Data } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { tools, users } from "@/db/schema";
import { saveToolPayload } from "@/lib/schema";
import { slugify } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

class SaveToolError extends Data.TaggedError("SaveToolError")<{
  message: string;
}> {}

export function saveTool(body: saveToolPayload, userId: string) {
  return Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const s3BucketName = yield* Config.string("S3_BUCKET_NAME");
    const awsRegion = yield* Config.string("AWS_REGION");

    const s3BaseUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com`;
    const logoUrl = body.logoKey ? `${s3BaseUrl}/${body.logoKey}` : null;
    const showcaseImageUrl = `${s3BaseUrl}/${body.showcaseImageKey}`;

    const slug = slugify(body.name);

    const result = yield* dbService
      .use((db) =>
        db.transaction(async (tx) => {
          const newTool = await tx
            .insert(tools)
            .values({
              name: body.name,
              slug,
              websiteUrl: body.websiteUrl,
              tagline: body.tagline,
              description: body.description,
              categories: [...body.categories],
              pricing: body.pricing,
              logoUrl,
              showcaseImageUrl,
              adminApprovalStatus: "pending",
              submittedBy: userId,
            })
            .returning({ id: tools.id });

          await tx
            .update(users)
            .set({
              submissionCount: sql`${users.submissionCount} + 1`,
            })
            .where(eq(users.id, userId));

          return newTool;
        })
      )
      .pipe(
        Effect.tapError((error) =>
          Effect.logError("Database error in saveTool(): ", error)
        ),
        Effect.mapError(
          () =>
            new SaveToolError({
              message: "Failed to save tool to the database. Please try again.",
            })
        )
      );

    return result[0];
  });
}
