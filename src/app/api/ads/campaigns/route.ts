import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getValidAccessToken } from "@/lib/amazon-auth";
import { mcpToolCall } from "@/lib/mcp-client";
import { hashToken, getCached, setCache, TTL } from "@/lib/dynamo-cache";
import { getDemoCampaigns } from "@/lib/demo-data";

export interface Campaign {
  campaignId: string;
  name: string;
  state: string;
  budget: number;
  budgetType: string;
  spend: number;
  impressions: number;
  clicks: number;
  acos: number;
  roas: number;
  ctr: number;
  cpc: number;
}

interface CampaignsResponse {
  campaigns: Campaign[];
  totalCount: number;
  page: number;
  pageSize: number;
  accountId: string;
  source: "mcp" | "demo" | "cache";
}

/**
 * GET /api/ads/campaigns?accountId=xxx&page=1&pageSize=10
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
  const accountId = searchParams.get("accountId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)),
  );

  if (!accountId) {
    return NextResponse.json(
      { error: "accountId query parameter is required." },
      { status: 400 },
    );
  }

  const userHash = await hashToken(accessToken);
  const cacheSK = `CAMPAIGNS#${accountId}`;

  // --- Tier 1: DynamoDB cache (only serve if it came from live MCP data) ---
  const cached = await getCached<Campaign[]>(userHash, cacheSK);
  if (cached && cached.source === "mcp") {
    const totalCount = cached.data.length;
    const start = (page - 1) * pageSize;
    return NextResponse.json({
      campaigns: cached.data.slice(start, start + pageSize),
      totalCount,
      page,
      pageSize,
      accountId,
      source: "cache" as const,
    } satisfies CampaignsResponse);
  }

  // --- Tier 2: MCP server ---
  let campaigns: Campaign[] = [];
  let source: "mcp" | "demo" = "mcp";

  try {
    const result = await mcpToolCall(accessToken, "listCampaigns", {
      profileId: accountId,
    });
    console.log("[campaigns] MCP listCampaigns response:", JSON.stringify(result).slice(0, 500));

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
            const rawCampaigns = Array.isArray(parsed)
              ? parsed
              : parsed.campaigns ?? [];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            campaigns = rawCampaigns.map((c: any) => {
              const metrics = c.metrics ?? c;
              const spend = Number(metrics.spend ?? metrics.cost ?? 0);
              const sales = Number(
                metrics.sales ?? metrics.revenue ?? 0,
              );
              const impressions = Number(metrics.impressions ?? 0);
              const clicks = Number(metrics.clicks ?? 0);
              const budgetObj =
                typeof c.budget === "object" && c.budget !== null
                  ? c.budget
                  : {};

              return {
                campaignId: String(c.campaignId ?? c.id ?? ""),
                name: String(c.name ?? c.campaignName ?? "Unnamed"),
                state: String(c.state ?? c.status ?? "enabled"),
                budget: Number(
                  budgetObj.budget ?? c.budget ?? c.dailyBudget ?? 0,
                ),
                budgetType: String(
                  budgetObj.budgetType ?? c.budgetType ?? "daily",
                ),
                spend,
                impressions,
                clicks,
                acos:
                  sales > 0
                    ? Math.round((spend / sales) * 10000) / 100
                    : 0,
                roas:
                  spend > 0
                    ? Math.round((sales / spend) * 100) / 100
                    : 0,
                ctr:
                  impressions > 0
                    ? Math.round(
                        (clicks / impressions) * 10000,
                      ) / 100
                    : 0,
                cpc:
                  clicks > 0
                    ? Math.round((spend / clicks) * 100) / 100
                    : 0,
              };
            });
          } catch {
            // Not JSON, skip
          }
        }
      }
    }

    if (campaigns.length > 0) {
      await setCache(userHash, cacheSK, campaigns, "mcp", TTL.CAMPAIGNS_LIVE);
    }
  } catch (error) {
    console.warn("MCP listCampaigns failed, falling back to demo:", error);
    source = "demo";
  }

  // --- Tier 3: Demo fallback ---
  if (campaigns.length === 0) {
    campaigns = getDemoCampaigns(accountId);
    source = source === "mcp" ? "demo" : source;
    await setCache(userHash, cacheSK, campaigns, "demo", TTL.DEMO);
  }

  const totalCount = campaigns.length;
  const start = (page - 1) * pageSize;

  return NextResponse.json({
    campaigns: campaigns.slice(start, start + pageSize),
    totalCount,
    page,
    pageSize,
    accountId,
    source,
  } satisfies CampaignsResponse);
}
