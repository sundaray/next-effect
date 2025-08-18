import { NextRequest, NextResponse } from "next/server";

const guestOnlyPaths = ["/signin"];
const adminOnlyPaths = ["/admin"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const cookieHeader = request.headers.get("cookie");

  const isOnGuestPath = guestOnlyPaths.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isOnAdminPath = adminOnlyPaths.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  const response = await fetch(new URL("/api/session", request.url), {
    headers: {
      cookie: cookieHeader ?? "",
    },
  });

  if (!response.ok) {
    return NextResponse.next();
  }

  const { user } = await response.json();

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

  // 2. Handle guest-only paths
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
