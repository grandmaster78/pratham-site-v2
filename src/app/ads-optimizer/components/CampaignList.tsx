"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  CircleDot,
  Pause,
  Archive,
} from "lucide-react";
import { useFavoriteCampaigns } from "../hooks/useFavorites";

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

interface CampaignListProps {
  accountId: string;
  accountName: string;
  highlightedCampaignIds?: Set<string>;
  onCampaignsLoaded?: (campaigns: Campaign[]) => void;
}

const PAGE_SIZE = 10;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function StateIcon({ state }: { state: string }) {
  switch (state.toLowerCase()) {
    case "enabled":
      return <CircleDot className="h-3.5 w-3.5 text-emerald-400" />;
    case "paused":
      return <Pause className="h-3.5 w-3.5 text-amber-400" />;
    case "archived":
      return <Archive className="h-3.5 w-3.5 text-zinc-600" />;
    default:
      return <Minus className="h-3.5 w-3.5 text-zinc-600" />;
  }
}

function AcosIndicator({ acos }: { acos: number }) {
  if (acos === 0) return <span className="text-zinc-600">--</span>;
  if (acos < 20)
    return (
      <span className="flex items-center gap-1 text-emerald-400">
        <TrendingUp className="h-3 w-3" />
        {acos.toFixed(1)}%
      </span>
    );
  if (acos < 35)
    return (
      <span className="flex items-center gap-1 text-amber-400">
        <Minus className="h-3 w-3" />
        {acos.toFixed(1)}%
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-red-400">
      <TrendingDown className="h-3 w-3" />
      {acos.toFixed(1)}%
    </span>
  );
}

type DataSource = "mcp" | "demo" | "cache";

function SourceBadge({ source }: { source: DataSource | null }) {
  if (!source) return null;
  const config = {
    mcp: { label: "LIVE", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
    cache: { label: "CACHED", color: "border-blue-500/40 text-blue-400 bg-blue-500/10" },
    demo: { label: "DEMO DATA", color: "border-[#FF9900]/40 text-[#FF9900] bg-[#FF9900]/10" },
  };
  const c = config[source];
  return (
    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider ${c.color}`}>
      {c.label}
    </span>
  );
}

type CampaignSortKey = "name" | "state" | "budget" | "spend" | "acos" | "roas" | "ctr";

export function CampaignList({
  accountId,
  accountName,
  highlightedCampaignIds,
  onCampaignsLoaded,
}: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<CampaignSortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [filterState, setFilterState] = useState<string>("all");
  const { toggle: toggleFavorite, isFavorite } = useFavoriteCampaigns(accountId);

  const fetchCampaigns = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/ads/campaigns?accountId=${encodeURIComponent(accountId)}&page=${p}&pageSize=${PAGE_SIZE}`,
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to fetch campaigns");
        }
        const data = await res.json();
        setCampaigns(data.campaigns);
        setTotalCount(data.totalCount);
        setPage(data.page);
        setSource(data.source ?? null);
        onCampaignsLoaded?.(data.campaigns);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [accountId, onCampaignsLoaded],
  );

  // Fetch on mount and when filters change; reset to page 1 (search is client-side only, no refetch)
  useEffect(() => {
    setPage(1);
    fetchCampaigns(1);
  }, [filterState, favoritesOnly, fetchCampaigns]);

  const filteredAndSorted = useMemo(() => {
    let list = campaigns;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.campaignId.toLowerCase().includes(q),
      );
    }
    if (filterState !== "all") {
      list = list.filter((c) => c.state.toLowerCase() === filterState.toLowerCase());
    }
    if (favoritesOnly) {
      list = list.filter((c) => isFavorite(c.campaignId));
    }
    return [...list].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      const aNum = typeof av === "number" ? av : String(av ?? "").toLowerCase();
      const bNum = typeof bv === "number" ? bv : String(bv ?? "").toLowerCase();
      if (typeof aNum === "number" && typeof bNum === "number") {
        return sortAsc ? aNum - bNum : bNum - aNum;
      }
      const cmp = String(aNum).localeCompare(String(bNum), undefined, { numeric: true });
      return sortAsc ? cmp : -cmp;
    });
  }, [campaigns, search, filterState, favoritesOnly, sortKey, sortAsc, isFavorite]);

  const handleSort = useCallback((key: CampaignSortKey) => {
    setSortKey((prev) => {
      if (prev === key) setSortAsc((a) => !a);
      else setSortAsc(true);
      return key;
    });
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hl = highlightedCampaignIds ?? new Set<string>();

  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="mt-3 text-sm text-red-400">{error}</p>
        <button
          onClick={() => fetchCampaigns(1)}
          className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 font-mono text-xs text-zinc-400 transition-colors hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Campaigns</h2>
            <SourceBadge source={source} />
          </div>
          <p className="mt-0.5 font-mono text-xs text-zinc-600">{accountName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 rounded-lg border border-zinc-800 bg-zinc-900/50 py-1.5 pl-8 pr-3 font-mono text-xs text-white placeholder-zinc-600 outline-none focus:border-[#FF9900]/30"
            />
          </label>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#FF9900]/30"
          >
            <option value="all">All states</option>
            <option value="enabled">Enabled</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-zinc-500">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800"
            />
            Favorites only
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 py-16">
          <p className="text-sm text-zinc-600">No campaigns found</p>
        </div>
      ) : (
        <>
          {filteredAndSorted.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 py-12 text-center">
              <p className="font-mono text-sm text-zinc-600">
                {campaigns.length === 0
                  ? "No campaigns found"
                  : "No campaigns match your filters"}
              </p>
            </div>
          )}
          {/* Mobile card layout */}
          {filteredAndSorted.length > 0 && (
          <div className="space-y-2 xl:hidden">
            {filteredAndSorted.map((c, i) => {
              const isHighlighted = hl.has(c.campaignId);
              return (
                <motion.div
                  key={c.campaignId}
                  className={`rounded-xl border p-4 transition-all duration-300 ${
                    isHighlighted
                      ? "border-[#FF9900]/40 bg-[#FF9900]/5 border-l-2 border-l-[#FF9900]"
                      : "border-zinc-800 bg-zinc-900/30"
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(c); }}
                      className="shrink-0 rounded p-0.5 text-zinc-600 hover:text-[#FF9900]"
                      title={isFavorite(c.campaignId) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`h-3.5 w-3.5 ${isFavorite(c.campaignId) ? "fill-[#FF9900] text-[#FF9900]" : ""}`} />
                    </button>
                    <StateIcon state={c.state} />
                    <span className="truncate font-medium text-white">
                      {c.name}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div>
                      <p className="font-mono text-[10px] text-zinc-600">BUDGET</p>
                      <p className="font-mono text-xs text-white">{formatCurrency(c.budget)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-zinc-600">SPEND</p>
                      <p className="font-mono text-xs text-white">{formatCurrency(c.spend)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-zinc-600">ACOS</p>
                      <p className="font-mono text-xs"><AcosIndicator acos={c.acos} /></p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-zinc-600">IMPR.</p>
                      <p className="font-mono text-xs text-zinc-400">{formatNumber(c.impressions)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-zinc-600">CLICKS</p>
                      <p className="font-mono text-xs text-zinc-400">{formatNumber(c.clicks)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-zinc-600">ROAS</p>
                      <p className="font-mono text-xs text-zinc-400">{c.roas > 0 ? `${c.roas.toFixed(2)}x` : "--"}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          )}

          {/* Desktop table layout */}
          {filteredAndSorted.length > 0 && (
          <div className="hidden overflow-x-auto rounded-xl border border-zinc-800 xl:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="w-10 px-2 py-2.5" />
                  <th className="px-3 py-2.5 font-mono text-[10px] font-medium tracking-wider text-zinc-600">STATUS</th>
                  <th
                    className="cursor-pointer px-3 py-2.5 font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("name")}
                  >
                    <span className="flex items-center gap-1">
                      CAMPAIGN
                      {sortKey === "name" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2.5 text-right font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("budget")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      BUDGET
                      {sortKey === "budget" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2.5 text-right font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("spend")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      SPEND
                      {sortKey === "spend" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2.5 text-right font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("acos")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      ACOS
                      {sortKey === "acos" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2.5 text-right font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("roas")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      ROAS
                      {sortKey === "roas" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-3 py-2.5 text-right font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("ctr")}
                  >
                    <span className="flex items-center justify-end gap-1">
                      CTR
                      {sortKey === "ctr" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((c, i) => {
                  const isHighlighted = hl.has(c.campaignId);
                  return (
                    <motion.tr
                      key={c.campaignId}
                      className={`border-b border-zinc-800/50 transition-all duration-300 ${
                        isHighlighted
                          ? "bg-[#FF9900]/5 border-l-2 border-l-[#FF9900]"
                          : "hover:bg-zinc-900/30"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="px-2 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(c)}
                          className="rounded p-1 text-zinc-600 transition-colors hover:text-[#FF9900]"
                          title={isFavorite(c.campaignId) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={`h-4 w-4 ${isFavorite(c.campaignId) ? "fill-[#FF9900] text-[#FF9900]" : ""}`} />
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <StateIcon state={c.state} />
                      </td>
                      <td className={`max-w-[180px] truncate px-3 py-2.5 text-sm ${isHighlighted ? "text-[#FF9900] font-medium" : "text-white"}`}>
                        {c.name}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-400">
                        {formatCurrency(c.budget)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-white">
                        {formatCurrency(c.spend)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        <AcosIndicator acos={c.acos} />
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-400">
                        {c.roas > 0 ? `${c.roas.toFixed(2)}x` : "--"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-500">
                        {c.ctr > 0 ? `${c.ctr.toFixed(2)}%` : "--"}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => fetchCampaigns(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <span className="font-mono text-xs text-zinc-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => fetchCampaigns(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
