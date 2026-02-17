const LWA_AUTH_URL = "https://www.amazon.com/ap/oa";
const LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";

const CLIENT_ID = process.env.AMAZON_ADS_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.AMAZON_ADS_CLIENT_SECRET ?? "";

function getRedirectUri() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return `${base}/api/auth/amazon/callback`;
}

/**
 * Build the LWA authorization URL for the OAuth2 Authorization Code Grant.
 * LWA uses standard scopes (profile, profile:user_id, postal_code).
 * Advertising API permissions are granted through the API app registration,
 * not through the OAuth scope parameter.
 */
export function buildAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: "profile",
    response_type: "code",
    redirect_uri: getRedirectUri(),
    state,
  });
  return `${LWA_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens.
 */
export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(LWA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresIn: data.expires_in as number,
  };
}

/**
 * Refresh an expired access token using the refresh token.
 */
export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(LWA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresIn: data.expires_in as number,
  };
}

/**
 * Get a valid access token, refreshing if necessary.
 * Returns null if no session tokens exist.
 */
export async function getValidAccessToken(session: {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  save: () => Promise<void>;
}): Promise<string | null> {
  if (!session.accessToken || !session.refreshToken) return null;

  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = 300; // refresh 5 min before expiry

  if (session.expiresAt && session.expiresAt - bufferSeconds > now) {
    return session.accessToken;
  }

  // Token expired or about to expire — refresh
  const tokens = await refreshAccessToken(session.refreshToken);
  session.accessToken = tokens.accessToken;
  session.refreshToken = tokens.refreshToken;
  session.expiresAt = now + tokens.expiresIn;
  await session.save();

  return tokens.accessToken;
}
