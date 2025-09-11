import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import { StorageService } from "@/lib/services/storage-service";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Config, Data, Effect } from "effect";
import { randomUUID } from "node:crypto";
import "server-only";

class PresignedUrlGenerationError extends Data.TaggedError(
  "PresignedUrlGenerationError",
)<{ cause: unknown; message: string }> {}

export function generatePresignedUrls(
  validatedFormData: ToolSubmissionFormSchemaType,
) {
  return Effect.gen(function* () {
    const storageService = yield* StorageService;
    const bucketName = yield* Config.string("S3_BUCKET_NAME");

    const createPresignedUrl = (file: File, keyPrefix: string) => {
      const key = `${keyPrefix}/${randomUUID()}.${file.name.split(".").pop()}`;
      const urlEffect = storageService
        .use((s3Client) =>
          getSignedUrl(
            s3Client,
            new PutObjectCommand({
              Bucket: bucketName,
              Key: key,
              ContentType: file.type,
            }),
            { expiresIn: 600 }, // 10 minutes
          ),
        )
        .pipe(
          Effect.tapErrorTag("StorageError", (error) =>
            Effect.logError("PresignedUrlGenerationError: ", error),
          ),
          Effect.mapError(
            (error) =>
              new PresignedUrlGenerationError({
                cause: error,
                message: "Failed to generate presigned URLs. Please try again.",
              }),
          ),
        );
      return Effect.map(urlEffect, (url) => ({ key, url }));
    };

    const showcaseImageEffect = validatedFormData.showcaseImage
      ? createPresignedUrl(validatedFormData.showcaseImage, "showcase-image")
      : Effect.succeed(undefined);

    const logoEffect = validatedFormData.logo
      ? createPresignedUrl(validatedFormData.logo, "logos")
      : Effect.succeed(undefined);

    const [showcaseImageResult, logoResult] = yield* Effect.all(
      [showcaseImageEffect, logoEffect],
      { concurrency: 2 },
    );

    return {
      showcaseImageUploadUrl: showcaseImageResult?.url,
      showcaseImageKey: showcaseImageResult?.key,
      logoUploadUrl: logoResult?.url,
      logoKey: logoResult?.key,
    };
  });
}
