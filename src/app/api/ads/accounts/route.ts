import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getValidAccessToken } from "@/lib/amazon-auth";
import { hashToken, getCached, setCache, TTL } from "@/lib/dynamo-cache";
import { getDemoAccounts } from "@/lib/demo-data";

export interface AdsAccount {
  accountId: string;
  name: string;
  marketplace: string;
  type: string;
  currency: string;
  entityId?: string;
}

interface AccountsResponse {
  accounts: AdsAccount[];
  totalCount: number;
  page: number;
  pageSize: number;
  source: "mcp" | "demo" | "cache";
}

const CACHE_SK = "ACCOUNTS";
const PROFILES_API_HOST = "https://advertising-api.amazon.com";

/**
 * GET /api/ads/accounts?page=1&pageSize=10
 * Fetches profiles from the Amazon Ads REST API (/v2/profiles).
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  const accessToken = await getValidAccessToken(session);

  if (!accessToken) {
    return NextResponse.json(
      { error: "No valid session. Please log in." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)),
  );

  const userHash = await hashToken(accessToken);

  // --- Tier 1: DynamoDB cache ---
  const cached = await getCached<AdsAccount[]>(userHash, CACHE_SK);
  if (cached && cached.source === "mcp") {
    const totalCount = cached.data.length;
    const start = (page - 1) * pageSize;
    return NextResponse.json({
      accounts: cached.data.slice(start, start + pageSize),
      totalCount,
      page,
      pageSize,
      source: "cache" as const,
    } satisfies AccountsResponse);
  }

  // --- Tier 2: Profiles REST API ---
  let accounts: AdsAccount[] = [];
  let source: "mcp" | "demo" = "mcp";

  try {
    const clientId = process.env.AMAZON_ADS_CLIENT_ID ?? "";
    const res = await fetch(`${PROFILES_API_HOST}/v2/profiles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": clientId,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Profiles API ${res.status}: ${text.slice(0, 300)}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = await res.json();
    console.log("[accounts] Profiles API returned", data.length, "profiles");

    accounts = data.map((p) => {
      const info = p.accountInfo ?? {};
      return {
        accountId: String(p.profileId ?? ""),
        name: String(info.name ?? p.name ?? "Unnamed Account"),
        marketplace: String(p.countryCode ?? "US"),
        type: String(info.type ?? "seller"),
        currency: String(p.currencyCode ?? "USD"),
        entityId: String(info.id ?? ""),
      };
    });

    if (accounts.length > 0) {
      await setCache(userHash, CACHE_SK, accounts, "mcp", TTL.ACCOUNTS_LIVE);
    }
  } catch (error) {
    console.warn("[accounts] Profiles API failed, falling back to demo:", error);
    source = "demo";
  }

  // --- Tier 3: Demo fallback ---
  if (accounts.length === 0) {
    accounts = getDemoAccounts();
    source = "demo";
    await setCache(userHash, CACHE_SK, accounts, "demo", TTL.DEMO);
  }

  const totalCount = accounts.length;
  const start = (page - 1) * pageSize;

  return NextResponse.json({
    accounts: accounts.slice(start, start + pageSize),
    totalCount,
    page,
    pageSize,
    source,
  } satisfies AccountsResponse);
}
