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

const SP_API_HOST = "https://advertising-api.amazon.com";

/**
 * Fetch SP campaigns via the REST API (/sp/campaigns/list).
 */
async function fetchSpCampaigns(
  accessToken: string,
  profileId: string,
): Promise<Campaign[]> {
  const clientId = process.env.AMAZON_ADS_CLIENT_ID ?? "";
  const res = await fetch(`${SP_API_HOST}/sp/campaigns/list`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Amazon-Advertising-API-ClientId": clientId,
      "Amazon-Advertising-API-Scope": profileId,
      "Content-Type": "application/vnd.spCampaign.v3+json",
      Accept: "application/vnd.spCampaign.v3+json",
    },
    body: JSON.stringify({ maxResults: 100 }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SP Campaigns API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  console.log("[campaigns] SP REST API raw response:", JSON.stringify(data).slice(0, 1000));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCampaigns: any[] = data.campaigns ?? data ?? [];
  console.log("[campaigns] SP REST API returned", rawCampaigns.length, "campaigns");

  return rawCampaigns.map((c) => {
    const budgetObj =
      typeof c.budget === "object" && c.budget !== null ? c.budget : {};

    return {
      campaignId: String(c.campaignId ?? c.id ?? ""),
      name: String(c.name ?? "Unnamed"),
      state: String(c.state ?? c.extendedData?.servingStatus ?? "enabled"),
      budget: Number(budgetObj.budget ?? c.budget ?? c.dailyBudget ?? 0),
      budgetType: String(budgetObj.budgetType ?? c.budgetType ?? "DAILY"),
      spend: 0,
      impressions: 0,
      clicks: 0,
      acos: 0,
      roas: 0,
      ctr: 0,
      cpc: 0,
    };
  });
}

/**
 * Fetch campaigns via the MCP tool.
 */
async function fetchMcpCampaigns(
  accessToken: string,
  profileId: string,
): Promise<Campaign[]> {
  const result = await mcpToolCall(accessToken, "campaign_management-query_campaign", {
    body: {
      accessRequestedAccount: { profileId },
      adProductFilter: { include: ["SPONSORED_PRODUCTS"] },
    },
  });
  console.log("[campaigns] MCP query_campaign response:", JSON.stringify(result).slice(0, 2000));

  const campaigns: Campaign[] = [];

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
          for (const c of rawCampaigns as any[]) {
            const metrics = c.metrics ?? c;
            const spend = Number(metrics.spend ?? metrics.cost ?? 0);
            const sales = Number(metrics.sales ?? metrics.revenue ?? 0);
            const impressions = Number(metrics.impressions ?? 0);
            const clicks = Number(metrics.clicks ?? 0);
            const budgetObj =
              typeof c.budget === "object" && c.budget !== null ? c.budget : {};

            campaigns.push({
              campaignId: String(c.campaignId ?? c.id ?? ""),
              name: String(c.name ?? c.campaignName ?? "Unnamed"),
              state: String(c.state ?? c.status ?? "enabled"),
              budget: Number(budgetObj.budget ?? c.budget ?? c.dailyBudget ?? 0),
              budgetType: String(budgetObj.budgetType ?? c.budgetType ?? "daily"),
              spend,
              impressions,
              clicks,
              acos: sales > 0 ? Math.round((spend / sales) * 10000) / 100 : 0,
              roas: spend > 0 ? Math.round((sales / spend) * 100) / 100 : 0,
              ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
              cpc: clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0,
            });
          }
        } catch {
          // skip unparseable
        }
      }
    }
  }

  return campaigns;
}

/**
 * GET /api/ads/campaigns?accountId=<profileId>&page=1&pageSize=10
 * Tries MCP tool first, then SP REST API, then demo fallback.
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

  // --- Tier 1: DynamoDB cache ---
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

  // --- Tier 2: Try MCP first, then SP REST API ---
  let campaigns: Campaign[] = [];
  let source: "mcp" | "demo" = "mcp";

  // Try MCP tool
  try {
    campaigns = await fetchMcpCampaigns(accessToken, accountId);
    console.log("[campaigns] MCP returned", campaigns.length, "campaigns for profile", accountId);
  } catch (error) {
    console.warn("[campaigns] MCP query_campaign failed:", error);
  }

  // If MCP returned nothing, try SP REST API
  if (campaigns.length === 0) {
    try {
      campaigns = await fetchSpCampaigns(accessToken, accountId);
      console.log("[campaigns] SP REST API returned", campaigns.length, "campaigns for profile", accountId);
    } catch (error) {
      console.warn("[campaigns] SP REST API failed:", error);
    }
  }

  if (campaigns.length > 0) {
    await setCache(userHash, cacheSK, campaigns, "mcp", TTL.CAMPAIGNS_LIVE);
  }

  // --- Tier 3: Demo fallback ---
  if (campaigns.length === 0) {
    campaigns = getDemoCampaigns(accountId);
    source = "demo";
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
