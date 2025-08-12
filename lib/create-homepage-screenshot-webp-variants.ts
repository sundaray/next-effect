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

type breakpointsWidthInPixels = (typeof breakpoints)[keyof typeof breakpoints];

export function createHomepageScreenshotWebPVariants(
  homepageScreenshotKey: string
) {
  return Effect.gen(function* () {
    const storageService = yield* StorageService;
    const bucketName = yield* Config.string("S3_BUCKET_NAME");

    const homepageScreenshotKeyWithoutExtension =
      homepageScreenshotKey.substring(
        0,
        homepageScreenshotKey.lastIndexOf(".")
      );

    const homepageScreenshotFile = yield* storageService.use((s3Client) =>
      s3Client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: homepageScreenshotKey })
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

    const createWebPVariantEffect = (
      width: breakpointsWidthInPixels,
      quality: number = 85
    ) => {
      return Effect.tryPromise({
        try: () =>
          sharpInstance
            .resize(width, null, { withoutEnlargement: true })
            .webp({ quality })
            .toBuffer(),
        catch: () => new Error("Hello"),
      });
    };

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

    yield* Effect.all(
      [
        uploadToS3(
          `${homepageScreenshotKeyWithoutExtension}-sm.webp`,
          smWebPImage
        ),
        uploadToS3(
          `${homepageScreenshotKeyWithoutExtension}-md.webp`,
          mdWebPImage
        ),
        uploadToS3(
          `${homepageScreenshotKeyWithoutExtension}-lg.webp`,
          lgWebPImage
        ),
        uploadToS3(
          `${homepageScreenshotKeyWithoutExtension}-xl.webp`,
          xlWebPImage
        ),
        uploadToS3(
          `${homepageScreenshotKeyWithoutExtension}-original.webp`,
          originalWebPImage
        ),
      ],
      { concurrency: 5 }
    );

    // Delete the original image
  });
}
