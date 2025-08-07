import { Hono } from "hono";
import { handle } from "hono/vercel";
import tools from "@/lib/tools";

const app = new Hono().basePath("/api");

app.route("/tools", tools);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
