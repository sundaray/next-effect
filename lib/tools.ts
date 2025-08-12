import { Hono } from "hono";
import { Effect, Data, pipe, ParseResult, Config } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools } from "@/db/schema";
import { validateToolSubmissionFormData } from "@/lib/validate-tool-submission-formdata";
import { getPresignedUrls } from "@/lib/get-presigned";

const app = new Hono();

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
    const validatedToolSubmissionFormData =
      yield* validateToolSubmissionFormData(parsedBody);

    const {
      logoKey,
      logoUploadUrl,
      homepageScreenshotKey,
      homepageScreenshotUploadUrl,
    } = yield* getPresignedUrls(validatedToolSubmissionFormData);

    return ctx.json({
      logoKey,
      logoUploadUrl,
      homepageScreenshotKey,
      homepageScreenshotUploadUrl,
    });
  });

  const handledProgram = pipe(
    program,
    Effect.catchTag("ParseError", (error) => {
      const issues = ParseResult.ArrayFormatter.formatErrorSync(error);
      return Effect.succeed(
        ctx.json({ _tag: "ParseError", issues }, { status: 400 })
      );
    }),
    Effect.catchTag("ConfigError", () => {
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

//  POST /save

// -----------------------------------------------

class SaveToolError extends Data.TaggedError("SaveToolError")<{
  message: string;
  cause: unknown;
}> {}

app.post("/save", async (ctx) => {
  const body = await ctx.req.json();

  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const s3BucketName = yield* Config.string("S3_BUCKET_NAME");
    const awsRegion = yield* Config.string("AWS_REGION");

    const s3BaseUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com`;
    const homepageScreenshotUrl = `${s3BaseUrl}/${body.homepageScreenshotKey}`;
    const logoUrl = body.logoKey ? `${s3BaseUrl}/${body.logoKey}` : null;

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
            logoUrl,
            homepageScreenshotUrl,
            status: "pending",
          })
          .returning()
      )
      .pipe(
        Effect.tapErrorTag("DatabaseError", (error) =>
          Effect.logError("SaveToolError: ", error)
        ),
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
    Effect.catchTag("ConfigError", () => {
      return Effect.succeed(
        ctx.json(
          {
            _tag: "ConfigError",
            message:
              "S3_BUCKET_NAME or AWS_REGION environment variable is not found. Please try again.",
          },
          { status: 500 }
        )
      );
    }),
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
