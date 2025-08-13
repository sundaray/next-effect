import { Hono } from "hono";
import { Effect, pipe, ParseResult } from "effect";
import { serverRuntime } from "@/lib/server-runtime";
import { validateToolSubmissionFormData } from "@/lib/validate-tool-submission-formdata";
import { generatePresignedUrls } from "@/lib/server/generate-presigned-urls";
import { createHomepageScreenshotWebPVariants } from "@/lib/create-homepage-screenshot-webp-variants";
import { saveTool } from "@/lib/server/save-tool";
import { ToolSubmissionFormSchemaType, saveToolPayload } from "@/lib/schema";

const app = new Hono();

// -----------------------------------------------

//  POST /presigned-url

// -----------------------------------------------
app.post("/presigned-url", async (ctx) => {
  const body = await ctx.req.parseBody();
  const parsedBody = {
    ...body,
    categories: JSON.parse(body.categories as string),
  } as ToolSubmissionFormSchemaType;

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
    Effect.catchAll(() =>
      Effect.succeed(
        ctx.json(
          {
            _tag: "InternalServerError",
            message:
              "Tool submission failed due to a server error. Please try again.",
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

app.post("/save", async (ctx) => {
  const body = (await ctx.req.json()) as saveToolPayload;

  const program = Effect.gen(function* () {
    yield* createHomepageScreenshotWebPVariants(body.homepageScreenshotKey);

    const tool = yield* saveTool(body);
    return ctx.json({
      tool: tool[0],
    });
  });

  const handledProgram = pipe(
    program,
    Effect.catchAll(() =>
      Effect.succeed(
        ctx.json(
          {
            _tag: "InternalServerError",
            message:
              "Tool submission failed due to a server error. Please try again.",
          },
          { status: 500 }
        )
      )
    ),
    Effect.ensureErrorType<never>()
  );

  return await serverRuntime.runPromise(handledProgram);
});

export default app;
