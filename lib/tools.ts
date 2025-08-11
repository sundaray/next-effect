import { Hono } from "hono";
import { ToolSubmissionFormSchema } from "@/lib/schema";
import {
  Effect,
  Schema,
  Data,
  pipe,
  ParseResult,
  Option,
  Config,
} from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { StorageService } from "@/lib/services/storage-service";
import { serverRuntime } from "@/lib/server-runtime";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { tools } from "@/db/schema";

const app = new Hono();

class PresignedUrlGenerationError extends Data.TaggedError(
  "PresignedUrlGenerationError"
)<{ cause: unknown; message: string }> {}

// -----------------------------------------------

//  POST /presigned-url

// -----------------------------------------------
app.post("/presigned-url", async (ctx) => {
  const body = await ctx.req.parseBody();
  const parsedBody = {
    ...body,
    categories: JSON.parse(body.categories as string),
  };

  const program = Effect.gen(function* () {
    const validatedFormData = yield* Schema.decodeUnknown(
      ToolSubmissionFormSchema
    )(parsedBody);

    const storageService = yield* StorageService;
    const bucketName = yield* Config.string("S3_BUCKET_NAME");

    // --- Generate homepage screenshot upload URL ---

    const homepageScreenshotFile = validatedFormData.homepageScreenshot;
    const homepageScreenshotKey = `homepage-screenshots/${randomUUID()}.${homepageScreenshotFile.name
      .split(".")
      .pop()}`;

    const homepageScreenshotUploadUrl = yield* storageService
      .use((s3Client) =>
        getSignedUrl(
          s3Client,
          new PutObjectCommand({
            Bucket: bucketName,
            Key: homepageScreenshotKey,
            ContentType: homepageScreenshotFile.type,
          }),
          { expiresIn: 600 } // 10 minutes
        )
      )
      .pipe(
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
      const logoFile = validatedFormData.logo as File;
      const logoKey = `logos/${randomUUID()}.${logoFile.name.split(".").pop()}`;

      const logoUploadUrl = yield* storageService
        .use((s3) =>
          getSignedUrl(
            s3,
            new PutObjectCommand({
              Bucket: "indie-ai-tools",
              Key: logoKey,
              ContentType: logoFile.type,
            }),
            { expiresIn: 600 }
          )
        )
        .pipe(
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

    const responsepayload = {
      homepageScreenshotUploadUrl,
      homepageScreenshotKey,
      ...Option.getOrUndefined(
        Option.map(logoUploadDetails, (details) => ({
          logoUploadUrl: details.logoUploadUrl,
          logoKey: details.logoKey,
        }))
      ),
    };

    return ctx.json(responsepayload);
  });

  const handledProgram = pipe(
    program,
    Effect.catchTag("ParseError", (error) => {
      const issues = ParseResult.ArrayFormatter.formatErrorSync(error);
      return Effect.succeed(
        ctx.json({ _tag: "ParseError", issues }, { status: 400 })
      );
    }),
    Effect.catchTag("ConfigError", (error) => {
      return Effect.succeed(
        ctx.json(
          {
            _tag: "ConfigError",
            message:
              "S3_BUCKET_NAME environment variable is not found. Please try again.",
          },
          { status: 500 }
        )
      );
    }),
    Effect.catchTag("PresignedUrlGenerationError", ({ _tag, message }) =>
      Effect.succeed(
        ctx.json(
          {
            _tag,
            message,
          },
          { status: 500 }
        )
      )
    ),

    Effect.ensureErrorType<never>()
  );

  return await serverRuntime.runPromise(handledProgram);
});

// -----------------------------------------------

//  POST /upload

// -----------------------------------------------

class SaveToolError extends Data.TaggedError("SaveToolError")<{
  message: string;
  cause: unknown;
}> {}

app.post("/save", async (ctx) => {
  const body = await ctx.req.json();

  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const result = yield* dbService
      .use((db) =>
        db
          .insert(tools)
          .values({
            name: body.name,
            website: body.website,
            tagline: body.tagline,
            description: body.description,
            categories: body.categories,
            pricing: body.pricing,
            logoUrl: body.logoUrl || null,
            homepageScreenshotUrl: body.homepageScreenshotUrl,
            status: "pending",
          })
          .returning()
      )
      .pipe(
        Effect.mapError(
          (error) =>
            new SaveToolError({
              cause: error,
              message: "Failed to save tool to the database. Please try again.",
            })
        )
      );

    return ctx.json({
      tool: result[0],
    });
  });

  const handledProgram = pipe(
    program,
    Effect.catchTag("SaveToolError", ({ _tag, message }) => {
      return Effect.succeed(
        ctx.json(
          {
            _tag,
            message,
          },
          { status: 500 }
        )
      );
    }),
    Effect.ensureErrorType<never>()
  );

  return await serverRuntime.runPromise(handledProgram);
});

export default app;
