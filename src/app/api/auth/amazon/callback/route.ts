import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/amazon-auth";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/ads-optimizer?error=${encodeURIComponent(error)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/ads-optimizer?error=missing_code`,
    );
  }

  // Verify CSRF state
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      `${baseUrl}/ads-optimizer?error=invalid_state`,
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const session = await getSession();

    session.accessToken = tokens.accessToken;
    session.refreshToken = tokens.refreshToken;
    session.expiresAt =
      Math.floor(Date.now() / 1000) + tokens.expiresIn;

    await session.save();

    const response = NextResponse.redirect(`${baseUrl}/ads-optimizer`);
    // Clear the state cookie
    response.cookies.delete("oauth_state");
    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/ads-optimizer?error=token_exchange_failed`,
    );
  }
}
