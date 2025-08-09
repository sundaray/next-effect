import { Hono } from "hono";
import { ToolSubmissionFormSchema } from "@/lib/schema";
import { Effect, Schema, pipe, ParseResult } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { serviceRuntime } from "@/lib/service-runtime";

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
    yield* Schema.decodeUnknown(ToolSubmissionFormSchema)(parsedBody);

    // create a presigned URL and send back

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

  return await serviceRuntime.runPromise(handledProgram);
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
      return Effect.succeed(ctx.json({ error: { message: "" } }));
    })
  );

  return await serviceRuntime.runPromise(handledProgram);
});

export default app;
