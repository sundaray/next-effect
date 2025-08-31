import "server-only";
import { Effect, Config, Data } from "effect";
import { StorageService } from "@/lib/services/storage-service";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

class S3DeletionError extends Data.TaggedError("S3DeletionError")<{
  cause: unknown;
  message: string;
}> {}

export function deleteImageAssetsFromS3(keys: string[]) {
  if (keys.length === 0) {
    return Effect.succeed(void 0);
  }

  return Effect.gen(function* () {
    const storageService = yield* StorageService;
    const bucketName = yield* Config.string("S3_BUCKET_NAME");

    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });

    yield* storageService
      .use((s3Client) => s3Client.send(command))
      .pipe(
        Effect.tapErrorTag("StorageError", (error) =>
          Effect.logError("S3 Deletion Error:", error)
        ),
        Effect.mapError(
          (error) =>
            new S3DeletionError({
              cause: error,
              message: "Failed to delete old images from storage.",
            })
        )
      );
  });
}
