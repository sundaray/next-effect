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
    const logoUrl = body.logoKey ? `${s3BaseUrl}/${body.logoKey}` : null;
    const showcaseImageUrl = `${s3BaseUrl}/${body.showcaseImageKey}`;

    const userId = user!.id;

    if (body.toolId) {
      const [existingTool] = yield* dbService.use((db) =>
        db
          .select({
            logoUrl: tools.logoUrl,
            showcaseImageUrl: tools.showcaseImageUrl,
          })
          .from(tools)
          .where(eq(tools.id, body.toolId!)),
      );

      if (existingTool) {
        const keysToDelete: string[] = [];
        if (existingTool.logoUrl) {
          keysToDelete.push(existingTool.logoUrl.replace(`${s3BaseUrl}/`, ""));
        }
        if (existingTool.showcaseImageUrl) {
          const baseKey = existingTool.showcaseImageUrl
            .replace(`${s3BaseUrl}/`, "")
            .replace(/-original\.webp$/, "");
          ["sm", "md", "lg", "xl", "original"].forEach((variant) => {
            keysToDelete.push(`${baseKey}-${variant}.webp`);
          });
        }
        yield* deleteImageAssetsFromS3(keysToDelete);
      }

      const [updatedTool] = yield* dbService.use((db) =>
        db.transaction(async (tx) => {
          const fieldsToUpdate = {
            name: body.name,
            websiteUrl: body.websiteUrl,
            tagline: body.tagline,
            description: body.description,
            categories: [...body.categories],
            pricing: body.pricing,
            logoUrl,
            showcaseImageUrl,
          };

          if (user?.role !== "admin") {
            Object.assign(fieldsToUpdate, {
              adminApprovalStatus: "pending",
              submittedAt: new Date(),
            });
          }

          const result = await tx
            .update(tools)
            .set(fieldsToUpdate)
            .where(eq(tools.id, body.toolId!))
            .returning({ id: tools.id });

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

      const [insertedTool] = yield* dbService.use((db) =>
        db.transaction(async (tx) => {
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
              showcaseImageUrl,
              adminApprovalStatus: "pending",
              submittedBy: userId,
            })
            .returning({ id: tools.id });

          await tx.insert(toolHistory).values({
            toolId: result[0].id,
            userId: userId,
            eventType: "submitted",
          });

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
