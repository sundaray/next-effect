import { NextRequest, NextResponse } from "next/server";
import { Effect, pipe } from "effect";
import { AuthService } from "@/lib/services/auth-service";
import { serverRuntime } from "@/lib/server-runtime";

const guestOnlyPaths = ["/signin"];
const adminOnlyPaths = ["/admin"];

export async function middleware(request: NextRequest) {
  const program = Effect.gen(function* () {
    const auth = yield* AuthService;

    const path = request.nextUrl.pathname;

    const isOnGuestPath = guestOnlyPaths.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );
    const isOnAdminPath = adminOnlyPaths.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    const sessionOption = yield* Effect.option(
      Effect.tryPromise(() => auth.api.getSession({ headers: request.headers }))
    );

    const session = sessionOption._tag === "Some" ? sessionOption.value : null;

    // --- Core Routing Logic ---

    // 1. Handle admin-only paths
    if (isOnAdminPath) {
      if (!session?.user) {
        const redirectUrl = new URL("/signin", request.url);
        redirectUrl.searchParams.set("next", path);
        return NextResponse.redirect(redirectUrl);
      }
      if (session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // 2. Handle guest-only paths
    if (isOnGuestPath) {
      if (session?.user) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // 3. Default case: For all other routes, let the request proceed.
    return NextResponse.next();
  });

  const handledProgram = pipe(
    program,
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError("Next.js middleware error: ", error);
        return NextResponse.next();
      })
    )
  );

  return await serverRuntime.runPromise(handledProgram);
}

export const config = {
  matcher: [
    // Skip all static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
