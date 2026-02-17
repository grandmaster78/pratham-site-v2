import type { AdsAccount } from "@/app/api/ads/accounts/route";
import type { Campaign } from "@/app/api/ads/campaigns/route";

const DEMO_ACCOUNTS: AdsAccount[] = [
  { accountId: "demo-us-seller-01", name: "Sarin Home Essentials", marketplace: "US", type: "seller", currency: "USD" },
  { accountId: "demo-us-seller-02", name: "PeakFit Supplements", marketplace: "US", type: "seller", currency: "USD" },
  { accountId: "demo-us-vendor-01", name: "LuminaTech Electronics", marketplace: "US", type: "vendor", currency: "USD" },
  { accountId: "demo-uk-seller-01", name: "BritishBrew Co.", marketplace: "UK", type: "seller", currency: "GBP" },
  { accountId: "demo-uk-vendor-01", name: "GardenPrime UK", marketplace: "UK", type: "vendor", currency: "GBP" },
  { accountId: "demo-de-seller-01", name: "AlpenFresh GmbH", marketplace: "DE", type: "seller", currency: "EUR" },
  { accountId: "demo-de-vendor-01", name: "TechHaus Berlin", marketplace: "DE", type: "vendor", currency: "EUR" },
  { accountId: "demo-jp-seller-01", name: "SakuraCraft Japan", marketplace: "JP", type: "seller", currency: "JPY" },
  { accountId: "demo-ca-seller-01", name: "MapleLeaf Outdoors", marketplace: "CA", type: "seller", currency: "CAD" },
  { accountId: "demo-us-seller-03", name: "UrbanPet Supply Co.", marketplace: "US", type: "seller", currency: "USD" },
  { accountId: "demo-us-seller-04", name: "CleanSlate Skincare", marketplace: "US", type: "seller", currency: "USD" },
  { accountId: "demo-in-seller-01", name: "SpicePath India", marketplace: "IN", type: "seller", currency: "INR" },
];

/**
 * Campaign templates keyed by account ID prefix.
 * Each account gets a unique set of campaigns with varied performance.
 */
const CAMPAIGN_TEMPLATES: Record<string, Campaign[]> = {
  "demo-us-seller-01": [
    { campaignId: "c-001", name: "Brand Defense - Sarin Home", state: "enabled", budget: 150, budgetType: "daily", spend: 142.30, impressions: 89400, clicks: 2680, acos: 12.1, roas: 8.26, ctr: 3.0, cpc: 0.53 },
    { campaignId: "c-002", name: "SP - Kitchen Organizers - Exact", state: "enabled", budget: 75, budgetType: "daily", spend: 74.50, impressions: 45200, clicks: 1356, acos: 18.4, roas: 5.43, ctr: 3.0, cpc: 0.55 },
    { campaignId: "c-003", name: "SP - Storage Bins - Broad", state: "enabled", budget: 100, budgetType: "daily", spend: 98.20, impressions: 112000, clicks: 2240, acos: 32.7, roas: 3.06, ctr: 2.0, cpc: 0.44 },
    { campaignId: "c-004", name: "SP - Bathroom Accessories - Auto", state: "enabled", budget: 50, budgetType: "daily", spend: 49.80, impressions: 67300, clicks: 673, acos: 45.2, roas: 2.21, ctr: 1.0, cpc: 0.74 },
    { campaignId: "c-005", name: "SB - Home Essentials Brand Video", state: "enabled", budget: 200, budgetType: "daily", spend: 187.60, impressions: 234000, clicks: 4680, acos: 15.8, roas: 6.33, ctr: 2.0, cpc: 0.40 },
    { campaignId: "c-006", name: "SP - Closet Systems - Phrase", state: "enabled", budget: 60, budgetType: "daily", spend: 58.40, impressions: 38900, clicks: 778, acos: 22.1, roas: 4.52, ctr: 2.0, cpc: 0.75 },
    { campaignId: "c-007", name: "SD - Retargeting - Home Decor", state: "enabled", budget: 40, budgetType: "daily", spend: 39.10, impressions: 156000, clicks: 468, acos: 38.9, roas: 2.57, ctr: 0.3, cpc: 0.84 },
    { campaignId: "c-008", name: "SP - Seasonal - Holiday Decor", state: "paused", budget: 120, budgetType: "daily", spend: 0, impressions: 0, clicks: 0, acos: 0, roas: 0, ctr: 0, cpc: 0 },
    { campaignId: "c-009", name: "SP - Shelf Liners - Exact", state: "enabled", budget: 30, budgetType: "daily", spend: 28.90, impressions: 19200, clicks: 576, acos: 14.3, roas: 6.99, ctr: 3.0, cpc: 0.50 },
    { campaignId: "c-010", name: "SP - Laundry Organization - Auto", state: "enabled", budget: 45, budgetType: "daily", spend: 44.70, impressions: 52100, clicks: 521, acos: 52.8, roas: 1.89, ctr: 1.0, cpc: 0.86 },
    { campaignId: "c-011", name: "SB - Headline Search - Kitchen", state: "enabled", budget: 80, budgetType: "daily", spend: 76.30, impressions: 98700, clicks: 1974, acos: 19.6, roas: 5.10, ctr: 2.0, cpc: 0.39 },
    { campaignId: "c-012", name: "SP - Garage Storage - Broad", state: "enabled", budget: 55, budgetType: "daily", spend: 53.90, impressions: 71200, clicks: 712, acos: 61.4, roas: 1.63, ctr: 1.0, cpc: 0.76 },
    { campaignId: "c-013", name: "SP - Competitor ASIN Targeting", state: "enabled", budget: 90, budgetType: "daily", spend: 88.50, impressions: 64300, clicks: 1929, acos: 25.3, roas: 3.95, ctr: 3.0, cpc: 0.46 },
    { campaignId: "c-014", name: "SP - New Launch - Drawer Dividers", state: "enabled", budget: 70, budgetType: "daily", spend: 69.20, impressions: 41500, clicks: 830, acos: 68.2, roas: 1.47, ctr: 2.0, cpc: 0.83 },
    { campaignId: "c-015", name: "Clearance Push - End of Season", state: "paused", budget: 25, budgetType: "daily", spend: 0, impressions: 0, clicks: 0, acos: 0, roas: 0, ctr: 0, cpc: 0 },
  ],
  "demo-us-seller-02": [
    { campaignId: "c-101", name: "Brand Defense - PeakFit", state: "enabled", budget: 200, budgetType: "daily", spend: 195.40, impressions: 124000, clicks: 4960, acos: 10.5, roas: 9.52, ctr: 4.0, cpc: 0.39 },
    { campaignId: "c-102", name: "SP - Protein Powder - Exact", state: "enabled", budget: 120, budgetType: "daily", spend: 118.30, impressions: 78200, clicks: 3128, acos: 16.2, roas: 6.17, ctr: 4.0, cpc: 0.38 },
    { campaignId: "c-103", name: "SP - Pre-Workout - Broad", state: "enabled", budget: 80, budgetType: "daily", spend: 78.50, impressions: 95400, clicks: 1908, acos: 28.9, roas: 3.46, ctr: 2.0, cpc: 0.41 },
    { campaignId: "c-104", name: "SP - Creatine - Auto", state: "enabled", budget: 60, budgetType: "daily", spend: 59.10, impressions: 43100, clicks: 862, acos: 35.4, roas: 2.82, ctr: 2.0, cpc: 0.69 },
    { campaignId: "c-105", name: "SB - Supplement Stack Video", state: "enabled", budget: 175, budgetType: "daily", spend: 168.20, impressions: 267000, clicks: 5340, acos: 13.8, roas: 7.25, ctr: 2.0, cpc: 0.32 },
    { campaignId: "c-106", name: "SP - BCAAs - Phrase", state: "enabled", budget: 45, budgetType: "daily", spend: 43.80, impressions: 31200, clicks: 624, acos: 41.7, roas: 2.40, ctr: 2.0, cpc: 0.70 },
    { campaignId: "c-107", name: "SD - Retargeting - Fitness", state: "enabled", budget: 55, budgetType: "daily", spend: 52.90, impressions: 198000, clicks: 594, acos: 33.1, roas: 3.02, ctr: 0.3, cpc: 0.89 },
    { campaignId: "c-108", name: "SP - New Launch - Electrolytes", state: "enabled", budget: 90, budgetType: "daily", spend: 88.70, impressions: 52300, clicks: 1046, acos: 55.2, roas: 1.81, ctr: 2.0, cpc: 0.85 },
    { campaignId: "c-109", name: "SP - Vitamins - Exact", state: "enabled", budget: 65, budgetType: "daily", spend: 63.40, impressions: 47800, clicks: 1434, acos: 19.1, roas: 5.24, ctr: 3.0, cpc: 0.44 },
    { campaignId: "c-110", name: "SP - Competitor ASIN - Whey", state: "enabled", budget: 100, budgetType: "daily", spend: 97.60, impressions: 68900, clicks: 2067, acos: 23.4, roas: 4.27, ctr: 3.0, cpc: 0.47 },
    { campaignId: "c-111", name: "SP - Fat Burners - Auto", state: "paused", budget: 40, budgetType: "daily", spend: 0, impressions: 0, clicks: 0, acos: 0, roas: 0, ctr: 0, cpc: 0 },
    { campaignId: "c-112", name: "SB - Headline Search - Protein", state: "enabled", budget: 70, budgetType: "daily", spend: 67.30, impressions: 89100, clicks: 1782, acos: 17.5, roas: 5.71, ctr: 2.0, cpc: 0.38 },
  ],
};

/**
 * Generate deterministic campaigns for accounts without explicit templates.
 */
function generateCampaigns(accountId: string): Campaign[] {
  const account = DEMO_ACCOUNTS.find((a) => a.accountId === accountId);
  const name = account?.name ?? "Unknown Brand";
  const seed = accountId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  const categories = [
    "Core Products", "Brand Defense", "Category Expansion",
    "Competitor Targeting", "Auto Discovery", "New Launch",
    "Retargeting", "Seasonal Push", "Top Performers",
    "Long Tail Keywords", "Video Ads", "Headline Search",
    "Product Targeting", "Clearance", "Cross-Sell",
  ];

  return categories.map((cat, i) => {
    const r = ((seed * (i + 1) * 7) % 100) / 100;
    const enabled = r > 0.15;
    const budget = Math.round(20 + r * 180);
    const spend = enabled ? Math.round(budget * (0.85 + r * 0.14) * 100) / 100 : 0;
    const impressions = enabled ? Math.round(10000 + r * 200000) : 0;
    const clicks = enabled ? Math.round(impressions * (0.005 + r * 0.035)) : 0;
    const sales = enabled ? spend * (0.8 + r * 8) : 0;

    return {
      campaignId: `${accountId}-c${String(i).padStart(3, "0")}`,
      name: `${cat} - ${name}`,
      state: enabled ? "enabled" : "paused",
      budget,
      budgetType: "daily",
      spend,
      impressions,
      clicks,
      acos: sales > 0 ? Math.round((spend / sales) * 10000) / 100 : 0,
      roas: spend > 0 ? Math.round((sales / spend) * 100) / 100 : 0,
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
      cpc: clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0,
    };
  });
}

export function getDemoAccounts(): AdsAccount[] {
  return DEMO_ACCOUNTS;
}

export function getDemoCampaigns(accountId: string): Campaign[] {
  return CAMPAIGN_TEMPLATES[accountId] ?? generateCampaigns(accountId);
}

/**
 * Get a summary of demo campaigns for an account,
 * formatted as context for the AI chat system prompt.
 */
export function getDemoCampaignSummary(accountId: string): string {
  const campaigns = getDemoCampaigns(accountId);
  const account = DEMO_ACCOUNTS.find((a) => a.accountId === accountId);

  const lines = campaigns.map(
    (c) =>
      `- ${c.name} | State: ${c.state} | Budget: $${c.budget}/day | Spend: $${c.spend} | Impressions: ${c.impressions} | Clicks: ${c.clicks} | ACOS: ${c.acos}% | ROAS: ${c.roas}x | CTR: ${c.ctr}% | CPC: $${c.cpc}`,
  );

  return `Account: ${account?.name ?? accountId} (${account?.marketplace ?? "US"}, ${account?.type ?? "seller"})\n\nCampaigns:\n${lines.join("\n")}`;
}
