import { Hono } from "hono";

const app = new Hono();

app.post("/submit", async (ctx) => {
  const body = await ctx.req.parseBody();
  console.log("Form data body type: ", typeof body);
});

export default app;
