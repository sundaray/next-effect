import { Hono } from "hono";
import { ToolSubmissionFormSchema } from "@/lib/schema";
import { Effect, Schema, Config, Data, pipe, ParseResult } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { StorageService } from "@/lib/services/storage-service";
import { serverRuntime } from "@/lib/server-runtime";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
const app = new Hono();

class PresignedUrlGenerationError extends Data.TaggedError(
  "PresignedUrlGenerationError"
)<{ cause: unknown }> {}

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
    const vercelOicdToken = process.env.VERCEL_OICD_TOKEN!;

    // --- Generate Homepage Screenshot Upload URL (Required) ---

    const homepageScreenshotFile = validatedFormData.homepageScreenshot;
    const homepageScreenshotKey = `homepage-screenshots/${randomUUID()}.${homepageScreenshotFile.name
      .split(".")
      .pop()}`;

    const homepageScreenshotUploadUrl = yield* storageService
      .use(vercelOicdToken, (client) =>
        getSignedUrl(
          client,
          new PutObjectCommand({
            Bucket: yield* Config.string("S3_BUCKET_NAME"),
            Key: homepageScreenshotKey,
            ContentType: homepageScreenshotFile.type,
          }),
          { expiresIn: 600 } // 10 minutes
        )
      )
      .pipe(
        Effect.mapError(
          (error) => new PresignedUrlGenerationError({ cause: error })
        )
      );

    // --- Generate Logo Upload URL (If logo exists) ---

    return ctx.json({
      message: "Tool submitted successfully!",
    });
  });

  const handledProgram = pipe(
    program,
    Effect.catchTag("ParseError", (error) => {
      const issues = ParseResult.ArrayFormatter.formatErrorSync(error);
      return Effect.succeed(ctx.json({ issues }));
    }),
    Effect.ensureErrorType<never>()
  );

  return await serverRuntime.runPromise(handledProgram);
});

// -----------------------------------------------

//  POST /upload

// -----------------------------------------------

app.post("/upload", async (ctx) => {
  const body = await ctx.req.json();

  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const result = yield* dbService.use((db) =>
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
    );

    return ctx.json({
      success: true as const,
      tool: result[0],
    });
  });

  const handledProgram = pipe(
    program,
    Effect.catchTag("DatabaseError", (error) => {
      return Effect.succeed(
        ctx.json({
          message: "Failed to save tool. Please try again.",
        })
      );
    }),
    Effect.ensureErrorType<never>()
  );

  return await serverRuntime.runPromise(handledProgram);
});

export default app;
