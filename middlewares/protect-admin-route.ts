import { Data } from "effect";
import { createMiddleware } from "hono/factory";
import type { Next, Context } from "hono";
import { AuthType } from "@/lib/services/auth-service";

type MiddlewareContext = Context<{
  Variables: AuthType;
}>;

export class AdminAccessError extends Data.TaggedError("AdminAccessError")<{
  message: string;
}> {}

export async function protectAdminRouteHandler(
  ctx: MiddlewareContext,
  next: Next
) {
  const user = ctx.get("user");

  if (!user || user.role !== "admin") {
    return ctx.json(
      new AdminAccessError({
        message: "You do not have permission to perform this action.",
      }),
      { status: 403 }
    );
  }

  await next();
}

export const protectAdminRouteMiddleware = createMiddleware(
  protectAdminRouteHandler
);
