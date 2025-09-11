import { checkForPermanentRejection } from "@/lib/check-for-permanent-rejection";
import { ToolSubmissionFormSchemaType, saveToolPayload } from "@/lib/schema";
import { serverRuntime } from "@/lib/server-runtime";
import { createShowcaseImageWebPVariants } from "@/lib/server/create-showcase-image-webp-variants";
import { generatePresignedUrls } from "@/lib/server/generate-presigned-urls";
import { saveTool } from "@/lib/server/save-tool";
import { validateToolSubmissionFormData } from "@/lib/server/validate-tool-submission-formdata";
import type { AuthType } from "@/lib/services/auth-service";
import { Data, Effect, ParseResult, pipe } from "effect";
import { Hono } from "hono";

class UserSessionNotFoundError extends Data.TaggedError(
  "UserSessionNotFoundError",
)<{
  message: string;
}> {}

const app = new Hono<{
  Variables: AuthType;
}>()

  // -----------------------------------------------

  //  POST /presigned-url

  // -----------------------------------------------
  .post("/presigned-url", async (ctx) => {
    const body = await ctx.req.parseBody();
    const user = ctx.get("user");

    const parseBody = {
      ...body,
      logo: body.logo === "undefined" ? undefined : body.logo,
      categories: JSON.parse(body.categories as string),
    } as ToolSubmissionFormSchemaType;

    const program = Effect.gen(function* () {
      if (!user)
        return yield* Effect.fail(
          new UserSessionNotFoundError({
            message: "No active user session found.",
          }),
        );

      // Step 2: Validate the tool submission form data against the schema.
      const validatedToolSubmissionFormData =
        yield* validateToolSubmissionFormData(parseBody);

      yield* checkForPermanentRejection(
        validatedToolSubmissionFormData.name,
        user.id,
      );

      // Step 3: Generate presigned URLs for client-side file upload to S3.
      const {
        logoKey,
        logoUploadUrl,
        showcaseImageKey,
        showcaseImageUploadUrl,
      } = yield* generatePresignedUrls(validatedToolSubmissionFormData);

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
      Effect.tapError((error) =>
        Effect.logError(
          "Tool submission error at /api/tools/presigned-url: ",
          error,
        ),
      ),
      Effect.catchTag("ParseError", (error) => {
        const issues = ParseResult.ArrayFormatter.formatErrorSync(error);
        return Effect.succeed(
          ctx.json({ _tag: "ParseError", issues }, { status: 400 }),
        );
      }),
      Effect.catchTag("ToolPermanentlyRejectedError", (error) => {
        return Effect.succeed(
          ctx.json(
            { _tag: "ToolPermanentlyRejectedError", message: error.message },
            { status: 403 },
          ),
        );
      }),
      Effect.catchAll(() => {
        return Effect.succeed(
          ctx.json(
            {
              _tag: "InternalServerError",
              message:
                "Tool submission failed due to a server error. Please try again.",
            },
            { status: 500 },
          ),
        );
      }),
      Effect.ensureErrorType<never>(),
    );

    return await serverRuntime.runPromise(handledProgram);
  })

  // -----------------------------------------------

  //  POST /save

  // -----------------------------------------------

  .post("/save", async (ctx) => {
    // Step 1: Parse the incoming JSON payload containing the final tool submission data.
    const body = (await ctx.req.json()) as saveToolPayload;

    const program = Effect.gen(function* () {
      const user = ctx.get("user");

      if (!user) {
        return ctx.json(
          new UserSessionNotFoundError({
            message: "No active user session found.",
          }),
          { status: 401 },
        );
      }

      // Step 2: Create and upload WebP variants of the homepage screenshot.
      yield* createShowcaseImageWebPVariants(body.showcaseImageKey);

      // Step 3: Save the final tool submission details to the database.
      const tool = yield* saveTool(body, user);

      // Step 4: Return the newly created tool record to the client.
      return ctx.json({
        tool,
      });
    });

    const handledProgram = pipe(
      program,
      Effect.tapError((error) =>
        Effect.logError("Tool submission error at /api/tools/save: ", error),
      ),
      Effect.catchAll(() =>
        Effect.succeed(
          ctx.json(
            {
              _tag: "InternalServerError",
              message:
                "Tool submission failed due to a server error. Please try again.",
            },
            { status: 500 },
          ),
        ),
      ),
      Effect.ensureErrorType<never>(),
    );

    return await serverRuntime.runPromise(handledProgram);
  });

export default app;
