import { Hono } from "hono";
import { ToolSubmissionFormSchema } from "@/lib/schema";
import { Effect, Schema, pipe, ParseResult } from "effect";
import { DatabaseService } from "@/lib/services/database-service";

const app = new Hono();

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

  return await Effect.runPromise(handledProgram);
});

app.post("/upload", async (ctx) => {


  // Save the data in Supabase database
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const result = yield* dbService.use((db) => db.insert(tools). )

  });
});

export default app;
