import { toolHistory, tools, users } from "@/db/schema";
import { deleteImageAssetsFromS3 } from "@/lib/delete-image-assets-from-s3";
import { saveToolPayload } from "@/lib/schema";
import type { User } from "@/lib/services/auth-service";
import { DatabaseService } from "@/lib/services/database-service";
import { slugify } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";
import { Config, Data, Effect } from "effect";
import "server-only";

class SaveToolError extends Data.TaggedError("SaveToolError")<{
  message: string;
}> {}

export function saveTool(body: saveToolPayload, user: User) {
  return Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const s3BucketName = yield* Config.string("S3_BUCKET_NAME");
    const awsRegion = yield* Config.string("AWS_REGION");

    const s3BaseUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com`;
    const userId = user!.id;

    if (body.toolId) {
      // First, get the URLs of the images currently in the database.
      const [existingTool] = yield* dbService.use((db) =>
        db
          .select({
            logoUrl: tools.logoUrl,
            showcaseImageUrl: tools.showcaseImageUrl,
          })
          .from(tools)
          .where(eq(tools.id, body.toolId!)),
      );

      // If the tool exists, check if we need to clean up old images from S3.
      if (existingTool) {
        const keysToDelete: string[] = [];
        // Only delete old images if new ones are being uploaded to replace them.
        if (body.logoKey && existingTool.logoUrl) {
          keysToDelete.push(existingTool.logoUrl.replace(`${s3BaseUrl}/`, ""));
        }
        if (body.showcaseImageKey && existingTool.showcaseImageUrl) {
          const baseKey = existingTool.showcaseImageUrl
            .replace(`${s3BaseUrl}/`, "")
            .replace(/-original\.webp$/, "");
          ["sm", "md", "lg", "xl", "original"].forEach((variant) => {
            keysToDelete.push(`${baseKey}-${variant}.webp`);
          });
        }
        // If there are images to delete, call the S3 deletion function.
        if (keysToDelete.length > 0) {
          yield* deleteImageAssetsFromS3(keysToDelete);
        }
      }

      const [updatedTool] = yield* dbService.use((db) =>
        db.transaction(async (tx) => {
          // Build the update object dynamically with only the text fields first.
          const fieldsToUpdate: Record<string, any> = {
            name: body.name,
            websiteUrl: body.websiteUrl,
            tagline: body.tagline,
            description: body.description,
            categories: [...body.categories],
            pricing: body.pricing,
          };
          // Only add image URLs to the update object if new image keys were provided from the form.
          // This prevents overwriting existing URLs with null/undefined.

          if (body.logoKey) {
            fieldsToUpdate.logoUrl = `${s3BaseUrl}/${body.logoKey}`;
          }
          if (body.showcaseImageKey) {
            fieldsToUpdate.showcaseImageUrl = `${s3BaseUrl}/${body.showcaseImageKey}`;
          }
          // If a regular user edits their submission, it must be re-approved.
          if (user?.role !== "admin") {
            Object.assign(fieldsToUpdate, {
              adminApprovalStatus: "pending",
              submittedAt: new Date(),
            });
          }
          // Execute the database update.
          const result = await tx
            .update(tools)
            .set(fieldsToUpdate)
            .where(eq(tools.id, body.toolId!))
            .returning({ id: tools.id });
          // Log this update event in the tool's history.
          await tx.insert(toolHistory).values({
            toolId: body.toolId!,
            userId: userId,
            eventType: "updated",
          });
          return result;
        }),
      );
      return updatedTool;
    } else {
      // This block handles CREATING a new tool submission.
      // Generate a unique slug for the tool to avoid URL conflicts.
      const baseSlug = slugify(body.name);
      let finalSlug = baseSlug;
      let counter = 2;
      while (true) {
        const toolWithSlug = yield* dbService.use((db) =>
          db.query.tools.findFirst({
            where: eq(tools.slug, finalSlug),
          }),
        );
        if (!toolWithSlug) {
          break;
        }
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const logoUrl = body.logoKey ? `${s3BaseUrl}/${body.logoKey}` : null;
      const showcaseImageUrl = body.showcaseImageKey
        ? `${s3BaseUrl}/${body.showcaseImageKey}`
        : undefined;
      // Insert the new tool in a transaction.
      const [insertedTool] = yield* dbService.use((db) =>
        db.transaction(async (tx) => {
          // Insert the new tool data.
          const result = await tx
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
              showcaseImageUrl: showcaseImageUrl!,
              adminApprovalStatus: "pending",
              submittedBy: userId,
            })
            .returning({ id: tools.id });
          // Log the initial submission event.
          await tx.insert(toolHistory).values({
            toolId: result[0].id,
            userId: userId,
            eventType: "submitted",
          });
          // Increment the user's total submission count.
          await tx
            .update(users)
            .set({ submissionCount: sql`${users.submissionCount} + 1` })
            .where(eq(users.id, userId));
          return result;
        }),
      );
      return insertedTool;
    }
  }).pipe(
    Effect.mapError(
      () =>
        new SaveToolError({
          message: "Failed to save tool to the database. Please try again.",
        }),
    ),
  );
}
