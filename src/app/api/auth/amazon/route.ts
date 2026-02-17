import { NextResponse } from "next/server";
import { buildAuthorizationUrl } from "@/lib/amazon-auth";

export async function GET() {
  // Generate a random state parameter for CSRF protection
  const state = crypto.randomUUID();

  const authUrl = buildAuthorizationUrl(state);

  const response = NextResponse.redirect(authUrl);

  // Store state in a short-lived cookie to verify on callback
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
