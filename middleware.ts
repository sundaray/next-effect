import { NextRequest, NextResponse } from "next/server";
import { hc } from "hono/client";
import type { ApiRoutes } from "@/app/api/[[...path]]/route";

const guestOnlyPaths = ["/signin"];
const adminOnlyPaths = ["/admin"];
const protectedPaths = ["/submit"];

export async function middleware(request: NextRequest) {
  const baseUrl = new URL(request.url).origin;

  const client = hc<ApiRoutes>(baseUrl);

  const path = request.nextUrl.pathname;

  const cookieHeader = request.headers.get("cookie");

  const isOnGuestPath = guestOnlyPaths.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isOnAdminPath = adminOnlyPaths.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  const isOnProtectedPath = protectedPaths.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  let user = null;

  try {
    const response = await client.api.user.$get(
      {},
      {
        headers: {
          cookie: cookieHeader ?? "",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      user = data.user;
    } else {
      user = null;
    }
  } catch (error) {
    console.error(
      "[Next.js middleware] Failed to fetch from /api/user:",
      error
    );
    user = null;
  }

  // --- Core Routing Logic ---

  // 1. Handle admin-only paths
  if (isOnAdminPath) {
    if (!user) {
      const redirectUrl = new URL("/signin", request.url);
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 2. Handle protected paths for regular users
  if (isOnProtectedPath && !user) {
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Handle guest-only paths
  if (isOnGuestPath) {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Default case: For all other routes, let the request proceed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all static files and Next.js internals
    "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
