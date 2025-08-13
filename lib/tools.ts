import { Hono } from "hono";
import { Effect, Data, pipe, ParseResult, Config } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { serverRuntime } from "@/lib/server-runtime";
import { tools } from "@/db/schema";
import { validateToolSubmissionFormData } from "@/lib/validate-tool-submission-formdata";
import { generatePresignedUrls } from "@/lib/server/generate-presigned-urls";
import { createHomepageScreenshotWebPVariants } from "@/lib/create-homepage-screenshot-webp-variants";
import { saveTool } from "@/lib/server/save-tool";

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
    } = yield* generatePresignedUrls(validatedToolSubmissionFormData);

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
    yield* createHomepageScreenshotWebPVariants();
    const tool = yield* saveTool();

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
    Effect.catchTag("S3ImageDownloadError", ({ _tag, message }) => {
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
    Effect.catchTag("S3ImageUploadError", ({ _tag, message }) => {
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
    Effect.catchTag("S3ImageDeletionError", ({ _tag, message }) => {
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
    Effect.catchTag(
      "ImageStreamToByteArrayConversionError",
      ({ _tag, message }) => {
        return Effect.succeed(
          ctx.json(
            {
              _tag,
              message,
            },
            { status: 500 }
          )
        );
      }
    ),
    Effect.catchTag("WebPConversionError", ({ _tag, message }) => {
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
