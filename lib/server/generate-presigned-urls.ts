import "server-only";
import { Effect, Option, Config, Data } from "effect";
import { randomUUID } from "node:crypto";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StorageService } from "@/lib/services/storage-service";

class PresignedUrlGenerationError extends Data.TaggedError(
  "PresignedUrlGenerationError"
)<{ cause: unknown; message: string }> {}

export function generatePresignedUrls(
  validatedFormData: ToolSubmissionFormSchemaType
) {
  return Effect.gen(function* () {
    const storageService = yield* StorageService;
    const bucketName = yield* Config.string("S3_BUCKET_NAME");

    // --- Generate homepage screenshot upload URL ---
    const showcaseImageFile = validatedFormData.showcaseImage;
    const showcaseImageKey = `showcase-image/${randomUUID()}.${showcaseImageFile.name
      .split(".")
      .pop()}`;

    const showcaseImageUploadUrl = yield* storageService
      .use((s3Client) =>
        getSignedUrl(
          s3Client,
          new PutObjectCommand({
            Bucket: bucketName,
            Key: showcaseImageKey,
            ContentType: showcaseImageFile.type,
          }),
          { expiresIn: 600 } // 10 minutes
        )
      )
      .pipe(
        Effect.tapErrorTag("StorageError", (error) =>
          Effect.logError("PresignedUrlGenerationError: ", error)
        ),
        Effect.mapError(
          (error) =>
            new PresignedUrlGenerationError({
              cause: error,
              message: "Failed to generate presigned URLs. Please try again.",
            })
        )
      );

    // --- Generate logo upload URL (If logo is available) ---

    let logoUploadDetails: Option.Option<{
      logoUploadUrl: string;
      logoKey: string;
    }> = Option.none();

    if (validatedFormData.logo) {
      const logoFile = validatedFormData.logo;
      const logoKey = `logos/${randomUUID()}.${logoFile.name.split(".").pop()}`;

      const logoUploadUrl = yield* storageService
        .use((s3) =>
          getSignedUrl(
            s3,
            new PutObjectCommand({
              Bucket: bucketName,
              Key: logoKey,
              ContentType: logoFile.type,
            }),
            { expiresIn: 600 }
          )
        )
        .pipe(
          Effect.tapErrorTag("StorageError", (error) =>
            Effect.logError("PresignedUrlGenerationError: ", error)
          ),
          Effect.mapError(
            (error) =>
              new PresignedUrlGenerationError({
                cause: error,
                message: "Failed to generate presigned URLs. Please try again.",
              })
          )
        );

      logoUploadDetails = Option.some({ logoUploadUrl, logoKey });
    }

    return {
      showcaseImageUploadUrl,
      showcaseImageKey,
      ...Option.getOrNull(
        Option.map(logoUploadDetails, (details) => ({
          logoUploadUrl: details.logoUploadUrl,
          logoKey: details.logoKey,
        }))
      ),
    };
  });
}
