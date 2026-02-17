import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getValidAccessToken } from "@/lib/amazon-auth";
import { mcpToolCall } from "@/lib/mcp-client";
import { hashToken, getCached, setCache, TTL } from "@/lib/dynamo-cache";
import { getDemoAccounts } from "@/lib/demo-data";

export interface AdsAccount {
  accountId: string;
  name: string;
  marketplace: string;
  type: string;
  currency: string;
}

interface AccountsResponse {
  accounts: AdsAccount[];
  totalCount: number;
  page: number;
  pageSize: number;
  source: "mcp" | "demo" | "cache";
}

const CACHE_SK = "ACCOUNTS";

/**
 * GET /api/ads/accounts?page=1&pageSize=10
 * 3-tier: DynamoDB cache -> MCP server -> demo fallback
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
  if (cached) {
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

  // --- Tier 2: MCP server ---
  let profiles: AdsAccount[] = [];
  let source: "mcp" | "demo" = "mcp";

  try {
    const result = await mcpToolCall(accessToken, "listProfiles", {});

    if (result.content && Array.isArray(result.content)) {
      for (const item of result.content) {
        if (
          typeof item === "object" &&
          item !== null &&
          "text" in item &&
          typeof item.text === "string"
        ) {
          try {
            const parsed = JSON.parse(item.text);
            const rawProfiles = Array.isArray(parsed)
              ? parsed
              : parsed.profiles ?? [];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            profiles = rawProfiles.map((p: any) => {
              const info = p.accountInfo ?? {};
              return {
                accountId: String(
                  p.profileId ?? p.accountId ?? p.id ?? "",
                ),
                name: String(
                  info.name ?? p.name ?? p.accountName ?? "Unnamed Account",
                ),
                marketplace: String(
                  p.countryCode ?? p.marketplace ?? "US",
                ),
                type: String(info.type ?? p.type ?? "seller"),
                currency: String(
                  p.currencyCode ?? p.currency ?? "USD",
                ),
              };
            });
          } catch {
            // Not JSON, skip
          }
        }
      }
    }

    if (profiles.length > 0) {
      await setCache(userHash, CACHE_SK, profiles, "mcp", TTL.ACCOUNTS_LIVE);
    }
  } catch (error) {
    console.warn("MCP listProfiles failed, falling back to demo:", error);
    source = "demo";
  }

  // --- Tier 3: Demo fallback ---
  if (profiles.length === 0 && source !== "mcp") {
    profiles = getDemoAccounts();
    source = "demo";
    await setCache(userHash, CACHE_SK, profiles, "demo", TTL.DEMO);
  } else if (profiles.length === 0) {
    // MCP succeeded but returned empty -- still use demo for a good experience
    profiles = getDemoAccounts();
    source = "demo";
    await setCache(userHash, CACHE_SK, profiles, "demo", TTL.DEMO);
  }

  const totalCount = profiles.length;
  const start = (page - 1) * pageSize;

  return NextResponse.json({
    accounts: profiles.slice(start, start + pageSize),
    totalCount,
    page,
    pageSize,
    source,
  } satisfies AccountsResponse);
}
