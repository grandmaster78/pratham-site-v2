import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * GET /api/auth/session
 * Returns whether the user is authenticated (without exposing tokens).
 */
export async function GET() {
  const session = await getSession();

  return NextResponse.json({
    authenticated: !!session.accessToken,
    profileId: session.profileId ?? null,
    profileName: session.profileName ?? null,
  });
}

/**
 * DELETE /api/auth/session
 * Logs the user out by destroying the session.
 */
export async function DELETE() {
  const session = await getSession();
  session.destroy();

  return NextResponse.json({ ok: true });
}
