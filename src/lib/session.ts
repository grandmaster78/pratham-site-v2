import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  profileId?: string;
  profileName?: string;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ?? "DEVELOPMENT_SECRET_MUST_BE_32_CHARS!",
  cookieName: "ads-optimizer-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
