import "server-only";

import { Effect, Config, Data } from "effect";
import { StorageService } from "@/lib/services/storage-service";
import sharp from "sharp";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export function createHomepageScreenshotWebPVariants(
  homepageScreenshotkey: string
) {
  return Effect.gen(function* () {
    const storageService = yield* StorageService;
    const bucketName = yield* Config.string("S3_BUCKET_NAME");

    const homepageScreenshotFile = yield* storageService.use((s3Client) =>
      s3Client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: homepageScreenshotkey })
      )
    );

    const homepageScreenshotByteArray = yield* Effect.tryPromise({
      try: () => homepageScreenshotFile.Body!.transformToByteArray(),
      catch: (e) =>
        new ApiError({
          message: "Failed to read screenshot from S3",
          cause: e,
          status: 500,
        }),
    });

    const homepageScreenshotBuffer = Buffer.from(homepageScreenshotByteArray);

    const sharpInstance = sharp(homepageScreenshotBuffer);

    const createWebPVariantEffect = (width, quality: number = 85) => {
      return Effect.tryPromise({
        try: () =>
          sharpInstance
            .resize(width, null, { withoutEnlargement: true })
            .webp({ quality })
            .toBuffer(),
        catch: () => new Error("Hello"),
      });
    };

    const smWebPEffect = createWebPVariantEffect({
      width: breakpoints.sm,
    });
    const mdWebPEffect = createWebPVariantEffect({
      width: breakpoints.md,
    });
    const lgWebPEffect = createWebPVariantEffect({
      width: breakpoints.lg,
    });
    const xlWebPEffect = createWebPVariantEffect({
      width: breakpoints.lg,
    });
    const originalWebPEffect = createWebPVariantEffect();

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
      originalWebPEffect,
    ]);

    yield* Effect.all(
      [
        uploadToS3(`${baseKey}-sm.webp`, smWebPImage),
        uploadToS3(`${baseKey}-md.webp`, mdWebPImage),
        uploadToS3(`${baseKey}-lg.webp`, lgWebPImage),
        uploadToS3(`${baseKey}-xl.webp`, xlWebPImage),
        uploadToS3(`${baseKey}-original.webp`, originalWebPImage),
      ],
      { concurrency: 5 }
    );
  });
}
