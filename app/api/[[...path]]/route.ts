import { Hono } from "hono";
import { handle } from "hono/vercel";
import tools from "@/lib/tools";
import auth from "@/lib/auth";

const app = new Hono().basePath("/api");

app.route("/tools", tools);
app.route("/auth", auth);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
