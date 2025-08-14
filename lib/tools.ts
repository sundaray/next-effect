import { Hono } from "hono";
import { Effect, pipe, ParseResult } from "effect";
import { serverRuntime } from "@/lib/server-runtime";
import { validateToolSubmissionFormData } from "@/lib/validate-tool-submission-formdata";
import { generatePresignedUrls } from "@/lib/server/generate-presigned-urls";
import { createShowcaseImageWebPVariants } from "@/lib/server/create-showcase-image-webp-variants";
import { saveTool } from "@/lib/server/save-tool";
import { ToolSubmissionFormSchemaType, saveToolPayload } from "@/lib/schema";

const app = new Hono();

// -----------------------------------------------

//  POST /presigned-url

// -----------------------------------------------
app.post("/presigned-url", async (ctx) => {
  // Step 1: Parse the incoming tool submission form data.
  const body = await ctx.req.parseBody();
  const parsedBody = {
    ...body,
    categories: JSON.parse(body.categories as string),
  } as ToolSubmissionFormSchemaType;

  const program = Effect.gen(function* () {
    // Step 2: Validate the tool submission form data against the schema.
    const validatedToolSubmissionFormData =
      yield* validateToolSubmissionFormData(parsedBody);

    // Step 3: Generate presigned URLs for client-side file upload to S3.
    const { logoKey, logoUploadUrl, showcaseImageKey, showcaseImageUploadUrl } =
      yield* generatePresignedUrls(validatedToolSubmissionFormData);

    // Step 4: Return the presigned URLs and unique keys to the client.
    return ctx.json({
      logoKey,
      logoUploadUrl,
      showcaseImageKey,
      showcaseImageUploadUrl,
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
  // Step 1: Parse the incoming JSON payload containing the final tool submission data.
  const body = (await ctx.req.json()) as saveToolPayload;

  const program = Effect.gen(function* () {
    // Step 2: Create and upload WebP variants of the homepage screenshot.
    yield* createShowcaseImageWebPVariants(body.showcaseImageKey);

    // Step 3: Save the final tool submission details to the database.
    const tool = yield* saveTool(body);

    // Step 4: Return the newly created tool record to the client.
    return ctx.json({
      tool,
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
