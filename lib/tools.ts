import { Hono } from "hono";
import { ToolSubmissionFormSchema } from "@/lib/schema";
import { Effect, Schema } from "effect";

const app = new Hono();

app.post("/submit", async (ctx) => {
  const body = await ctx.req.parseBody();

  console.log("Raw body:", body);
  console.log("Body type:", typeof body);
  console.log("Body constructor:", body.constructor.name);
  console.log("Categories value:", body["categories"]);
  console.log("Categories type:", typeof body["categories"]);

  const program = Effect.gen(function* () {
    const validatedData = yield* Schema.decodeUnknown(ToolSubmissionFormSchema)(
      body
    );
  });

  return await Effect.runPromise(program);
});

export default app;
