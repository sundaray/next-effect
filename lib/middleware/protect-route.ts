import { Data } from "effect";
import { createMiddleware } from "hono/factory";
import type { Next, Context } from "hono";
import { AuthType } from "@/lib/services/auth-service";

type MiddlewareContext = Context<{
  Variables: AuthType;
}>;

// -----------------------------------------------
//
//  Route Guard Middleware
//
//  This middleware acts as a gatekeeper for routes that require
//  a user to be authenticated. Use this middleware to protect
//  any route or group of routes selectively.
//
//  It works by checking the Hono context for a user object.
//  It assumes an upstream middleware (like `sessionMiddleware`)
//  has already attempted to populate the context.
//
//  - If a user is found, the request is allowed to proceed.
//  - If no user is found, the request is blocked, and a
//    `401 Unauthorized` JSON error is returned to the client.
//
// -----------------------------------------------

export class UserSessionNotFoundError extends Data.TaggedError(
  "UserSessionNotFoundError"
)<{
  message: string;
}> {}

export async function protectRouteHandler(ctx: MiddlewareContext, next: Next) {
  const user = ctx.get("user");

  if (!user) {
    return ctx.json(
      new UserSessionNotFoundError({
        message: "No active user session found.",
      }),
      { status: 401 }
    );
  }

  await next();
}

export const protectRouteMiddleware = createMiddleware(protectRouteHandler);
