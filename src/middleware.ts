import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to protect /api/ads/* routes.
 * Checks for the presence of the session cookie. Full token validation
 * happens in the route handlers via iron-session.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes under /api/ads/*
  if (pathname.startsWith("/api/ads/")) {
    const sessionCookie = request.cookies.get("ads-optimizer-session");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized — please log in with Amazon first." },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/ads/:path*"],
};
