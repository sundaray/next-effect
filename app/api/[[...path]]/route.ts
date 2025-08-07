import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/app");

app.get("/hello", (ctx) => {
  console.log("Request path: ", ctx.req.path);
  return ctx.json({ message: "Hello world!" });
});

export const GET = handle(app);
