import "server-only";
import { Effect, Config, Data } from "effect";
import { StorageService } from "@/lib/services/storage-service";
import sharp from "sharp";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

type breakpointsWidthInPixels = (typeof breakpoints)[keyof typeof breakpoints];

class S3ImageDownloadError extends Data.TaggedError("S3ImageDownloadError")<{
  cause: unknown;
  message: string;
}> {}

class S3ImageUploadError extends Data.TaggedError("S3ImageUploadError")<{
  cause: unknown;
  message: string;
}> {}

class S3ImageDeletionError extends Data.TaggedError("S3ImageDeletionError")<{
  cause: unknown;
  message: string;
}> {}

class WebPConversionError extends Data.TaggedError("WebPConversionError")<{
  cause: unknown;
  message: string;
}> {}

class ImageStreamToByteArrayConversionError extends Data.TaggedError(
  "ImageStreamToByteArrayConversionError"
)<{
  cause: unknown;
  message: string;
}> {}

export function createShowcaseImageWebPVariants(showcaseImageKey: string) {
  return Effect.gen(function* () {
    const storageService = yield* StorageService;
    const bucketName = yield* Config.string("S3_BUCKET_NAME");

    const showcaseImageKeyWithoutExtension = showcaseImageKey.substring(
      0,
      showcaseImageKey.lastIndexOf(".")
    );

    // Step 1: Download the original homepage screenshot file from S3.
    const showcaseImageFile = yield* storageService
      .use((s3Client) =>
        s3Client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: showcaseImageKey,
          })
        )
      )
      .pipe(
        Effect.tapErrorTag("StorageError", (error) =>
          Effect.logError("S3ImageDownloadError:", error)
        ),
        Effect.mapError(
          (error) =>
            new S3ImageDownloadError({
              cause: error,
              message:
                "Failed to download the original showcase image file from S3.",
            })
        )
      );

    // Step 2: Convert the homepage screenshot image stream to a byte array.
    const showcaseImageByteArray = yield* Effect.tryPromise({
      try: () => showcaseImageFile.Body!.transformToByteArray(),
      catch: (error) => {
        Effect.runSync(
          Effect.logError("ImageStreamToByteArrayConversionError: ", error)
        );
        return new ImageStreamToByteArrayConversionError({
          message:
            "Failed to convert the showcase image stream (from S3) to byte array.",
          cause: error,
        });
      },
    });

    const showcaseImageBuffer = Buffer.from(showcaseImageByteArray);

    const sharpInstance = sharp(showcaseImageBuffer);

    // Step 3: Helper to create a WebP variant.
    const createWebPVariantEffect = (
      width?: breakpointsWidthInPixels,
      quality: number = 85
    ) => {
      return Effect.tryPromise({
        try: () =>
          sharpInstance
            .resize(width, null, { withoutEnlargement: true })
            .webp({ quality })
            .toBuffer(),
        catch: (error) => {
          Effect.runSync(Effect.logError("WebPConversionError:", error));
          return new WebPConversionError({
            message: "Failed to convert showcase image to WebP format.",
            cause: error,
          });
        },
      });
    };

    // Step 4: Create all WebP variants of the showcase image in parallel.
    const smWebPEffect = createWebPVariantEffect(breakpoints.sm);
    const mdWebPEffect = createWebPVariantEffect(breakpoints.md);
    const lgWebPEffect = createWebPVariantEffect(breakpoints.lg);
    const xlWebPEffect = createWebPVariantEffect(breakpoints.lg);
    const originalSizeWebPEffect = createWebPVariantEffect();

    const [
      smWebPImage,
      mdWebPImage,
      lgWebPImage,
      xlWebPImage,
      originalWebPImage,
    ] = yield* Effect.all([
      smWebPEffect,
      mdWebPEffect,
      lgWebPEffect,
      xlWebPEffect,
      originalSizeWebPEffect,
    ]);

    // Step 5: Helper to upload a single WebP variant to S3.
    const uploadToS3 = (key: string, body: Buffer) => {
      return storageService
        .use((s3Client) =>
          s3Client.send(
            new PutObjectCommand({
              Bucket: bucketName,
              Key: key,
              Body: body,
              ContentType: "image/webp",
            })
          )
        )
        .pipe(
          Effect.tapErrorTag("StorageError", (error) =>
            Effect.logError("S3ImageUploadError:", error)
          ),
          Effect.mapError(
            (error) =>
              new S3ImageUploadError({
                cause: error,
                message:
                  "Failed to upload the homepage screenshot WebP variant to S3.",
              })
          )
        );
    };

    // Step 6: Upload all WebP variants to S3 in parallel.
    yield* Effect.all(
      [
        uploadToS3(`${showcaseImageKeyWithoutExtension}-sm.webp`, smWebPImage),
        uploadToS3(`${showcaseImageKeyWithoutExtension}-md.webp`, mdWebPImage),
        uploadToS3(`${showcaseImageKeyWithoutExtension}-lg.webp`, lgWebPImage),
        uploadToS3(`${showcaseImageKeyWithoutExtension}-xl.webp`, xlWebPImage),
        uploadToS3(
          `${showcaseImageKeyWithoutExtension}-original.webp`,
          originalWebPImage
        ),
      ],
      { concurrency: 5 }
    );

    // Step 7: Delete the original homepage screenshot file from S3.
    yield* storageService
      .use((s3Client) =>
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: showcaseImageKey,
          })
        )
      )
      .pipe(
        Effect.tapErrorTag("StorageError", (error) =>
          Effect.logError("S3ImageDeletionError:", error)
        ),
        Effect.mapError(
          (error) =>
            new S3ImageDeletionError({
              cause: error,
              message:
                "Failed to delete the original showcase image file from S3.",
            })
        )
      );
  });
}
