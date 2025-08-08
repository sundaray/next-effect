import { Hono } from "hono";
import { ToolSubmissionFormSchema } from "@/lib/schema";
import { Effect, Schema, pipe, ParseResult } from "effect";

const app = new Hono();

app.post("/submit", async (ctx) => {
  const body = await ctx.req.parseBody();
  const parsedBody = {
    ...body,
    categories: JSON.parse(body.categories as string),
  };

  const program = Effect.gen(function* () {
    yield* Schema.decodeUnknown(ToolSubmissionFormSchema)(parsedBody);

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

export default app;
