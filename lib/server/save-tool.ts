import "server-only";
import { Effect, Config, Data } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { tools, users } from "@/db/schema";
import { saveToolPayload } from "@/lib/schema";
import { slugify } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";
import { deleteImageAssetsFromS3 } from "@/lib/delete-image-assets-from-s3";

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

    const baseSlug = slugify(body.name);

    const existingTool = yield* dbService.use((db) =>
      db.query.tools.findFirst({
        where: eq(tools.slug, baseSlug),
      })
    );

    if (existingTool) {
      if (
        existingTool.submittedBy === userId &&
        existingTool.adminApprovalStatus === "rejected"
      ) {
        // MODIFICATION START: Improved logic to delete all old S3 objects
        const keysToDelete: string[] = [];
        const variants = ["sm", "md", "lg", "xl", "original"];

        // Extract and process the old showcase image key from its URL
        if (existingTool.showcaseImageUrl) {
          const urlParts = existingTool.showcaseImageUrl.split("/");
          const baseKeyWithExtension = urlParts.slice(-2).join("/");
          const baseKey = baseKeyWithExtension.substring(
            0,
            baseKeyWithExtension.lastIndexOf(".")
          );

          // Generate all WebP variant keys to delete
          variants.forEach((variant) => {
            keysToDelete.push(`${baseKey}-${variant}.webp`);
          });
        }
        // Extract the old logo key from its URL (logos are not resized, so it's a direct key)
        if (existingTool.logoUrl) {
          const urlParts = existingTool.logoUrl.split("/");
          keysToDelete.push(urlParts.slice(-2).join("/"));
        }

        // Run the database update and S3 deletion in parallel
        const [updateResult] = yield* Effect.all([
          dbService
            .use((db) =>
              db
                .update(tools)
                .set({
                  name: body.name,
                  websiteUrl: body.websiteUrl,
                  tagline: body.tagline,
                  description: body.description,
                  categories: [...body.categories],
                  pricing: body.pricing,
                  logoUrl,
                  showcaseImageUrl,
                  adminApprovalStatus: "pending",
                  submittedAt: new Date(),
                })
                .where(eq(tools.id, existingTool.id))
                .returning({ id: tools.id })
            )
            .pipe(
              Effect.tapError((error) =>
                Effect.logError(
                  "Database error updating rejected tool: ",
                  error
                )
              ),
              Effect.mapError(
                () =>
                  new SaveToolError({
                    message:
                      "Failed to update your submission. Please try again.",
                  })
              )
            ),
          deleteImageAssetsFromS3(keysToDelete),
        ]);

        return updateResult[0];
      }
    }

    let finalSlug = baseSlug;
    let counter = 2;

    while (true) {
      const toolWithSlug = yield* dbService.use((db) =>
        db.query.tools.findFirst({
          where: eq(tools.slug, finalSlug),
        })
      );
      if (!toolWithSlug) {
        break;
      }
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = yield* dbService
      .use((db) =>
        db.transaction(async (tx) => {
          const insertedTool = await tx
            .insert(tools)
            .values({
              name: body.name,
              slug: finalSlug,
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
            .set({ submissionCount: sql`${users.submissionCount} + 1` })
            .where(eq(users.id, userId));

          return insertedTool;
        })
      )
      .pipe(
        Effect.tapError((error) =>
          Effect.logError("Database error in saveTool transaction: ", error)
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
