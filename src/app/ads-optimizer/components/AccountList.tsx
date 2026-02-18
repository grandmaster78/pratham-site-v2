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
} from "lucide-react";
import { useFavoriteAccounts } from "../hooks/useFavorites";

interface AdsAccount {
  accountId: string;
  name: string;
  marketplace: string;
  type: string;
  currency: string;
  entityId?: string;
}

interface AccountListProps {
  onSelectAccount: (account: AdsAccount) => void;
}

const PAGE_SIZE = 12;

const countryNames: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  BR: "Brazil",
  GB: "United Kingdom",
  UK: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  SE: "Sweden",
  PL: "Poland",
  JP: "Japan",
  AU: "Australia",
  IN: "India",
  SG: "Singapore",
  AE: "UAE",
  SA: "Saudi Arabia",
  EG: "Egypt",
  BE: "Belgium",
};

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    vendor: { bg: "bg-purple-500/10 border-purple-500/30", text: "text-purple-400" },
    seller: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400" },
    agency: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400" },
  };
  const c = config[type.toLowerCase()] ?? { bg: "bg-zinc-500/10 border-zinc-500/30", text: "text-zinc-400" };
  return (
    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${c.bg} ${c.text}`}>
      {type}
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

type SortKey = "name" | "accountId" | "marketplace" | "type" | "currency";

export function AccountList({ onSelectAccount }: AccountListProps) {
  const [accounts, setAccounts] = useState<AdsAccount[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMarketplace, setFilterMarketplace] = useState<string>("all");
  const { toggle: toggleFavorite, isFavorite } = useFavoriteAccounts();

  const fetchAccounts = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/ads/accounts?page=${p}&pageSize=${PAGE_SIZE}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch accounts");
      }
      const data = await res.json();
      setAccounts(data.accounts);
      setTotalCount(data.totalCount);
      setPage(data.page);
      setSource(data.source ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when filters change; reset to page 1 (search is client-side only, no refetch)
  useEffect(() => {
    setPage(1);
    fetchAccounts(1);
  }, [filterType, filterMarketplace, favoritesOnly, fetchAccounts]);

  const filteredAndSorted = useMemo(() => {
    let list = accounts;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.accountId.toLowerCase().includes(q) ||
          a.marketplace.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          (countryNames[a.marketplace] ?? "").toLowerCase().includes(q),
      );
    }
    if (filterType !== "all") {
      list = list.filter((a) => a.type.toLowerCase() === filterType.toLowerCase());
    }
    if (filterMarketplace !== "all") {
      list = list.filter((a) => a.marketplace === filterMarketplace);
    }
    if (favoritesOnly) {
      list = list.filter((a) => isFavorite(a.accountId));
    }
    return [...list].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortKey] ?? "").toLowerCase();
      const bv = String((b as unknown as Record<string, unknown>)[sortKey] ?? "").toLowerCase();
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortAsc ? cmp : -cmp;
    });
  }, [accounts, search, filterType, filterMarketplace, favoritesOnly, sortKey, sortAsc, isFavorite]);

  // Use full country list for filter (not just current page) so user can filter by any marketplace
  const marketplaceOptions = useMemo(
    () => Object.keys(countryNames).sort(),
    [],
  );

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) setSortAsc((a) => !a);
      else setSortAsc(true);
      return key;
    });
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
          onClick={() => fetchAccounts(1)}
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
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Advertising Profiles</h2>
          <SourceBadge source={source} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 rounded-lg border border-zinc-800 bg-zinc-900/50 py-1.5 pl-8 pr-3 font-mono text-xs text-white placeholder-zinc-600 outline-none focus:border-[#FF9900]/30"
            />
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#FF9900]/30"
          >
            <option value="all">All types</option>
            <option value="vendor">Vendor</option>
            <option value="seller">Seller</option>
            <option value="agency">Agency</option>
          </select>
          <select
            value={filterMarketplace}
            onChange={(e) => setFilterMarketplace(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#FF9900]/30"
          >
            <option value="all">All countries</option>
            {marketplaceOptions.map((m) => (
              <option key={m} value={m}>
                {m} {countryNames[m] ? `(${countryNames[m]})` : ""}
              </option>
            ))}
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
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
            >
              <div className="h-10 w-10 rounded-lg bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-zinc-800" />
                <div className="h-3 w-32 rounded bg-zinc-800/60" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredAndSorted.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 py-12 text-center">
              <p className="font-mono text-sm text-zinc-600">
                {accounts.length === 0
                  ? "No profiles found"
                  : "No profiles match your filters"}
              </p>
            </div>
          )}
          {/* Mobile card layout */}
          {filteredAndSorted.length > 0 && (
          <div className="space-y-2 lg:hidden">
            {filteredAndSorted.map((account, i) => (
              <motion.div
                key={account.accountId}
                role="button"
                tabIndex={0}
                onClick={() => onSelectAccount(account)}
                onKeyDown={(e) => e.key === "Enter" && onSelectAccount(account)}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-left transition-all hover:border-[#FF9900]/30 hover:bg-zinc-900/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(account); }}
                  className="shrink-0 rounded p-1 text-zinc-600 transition-colors hover:text-[#FF9900]"
                  title={isFavorite(account.accountId) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={`h-4 w-4 ${isFavorite(account.accountId) ? "fill-[#FF9900] text-[#FF9900]" : ""}`}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{account.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-zinc-500">{account.marketplace}</span>
                    <TypeBadge type={account.type} />
                    <span className="font-mono text-[11px] text-zinc-600">{account.currency}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-700 transition-colors group-hover:text-[#FF9900]" />
              </motion.div>
            ))}
          </div>

          )}
          {/* Desktop table layout */}
          {filteredAndSorted.length > 0 && (
          <div className="hidden overflow-x-auto rounded-xl border border-zinc-800 lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="w-10 px-2 py-3" />
                  <th
                    className="cursor-pointer px-4 py-3 font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("name")}
                  >
                    <span className="flex items-center gap-1">
                      ACCOUNT NAME
                      {sortKey === "name" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("accountId")}
                  >
                    <span className="flex items-center gap-1">
                      PROFILE ID
                      {sortKey === "accountId" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("marketplace")}
                  >
                    <span className="flex items-center gap-1">
                      COUNTRY
                      {sortKey === "marketplace" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("type")}
                  >
                    <span className="flex items-center gap-1">
                      TYPE
                      {sortKey === "type" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-4 py-3 font-mono text-[10px] font-medium tracking-wider text-zinc-600 hover:text-zinc-400"
                    onClick={() => handleSort("currency")}
                  >
                    <span className="flex items-center gap-1">
                      CURRENCY
                      {sortKey === "currency" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </span>
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((account, i) => (
                  <motion.tr
                    key={account.accountId}
                    onClick={() => onSelectAccount(account)}
                    className="cursor-pointer border-b border-zinc-800/50 transition-colors hover:bg-[#FF9900]/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(account)}
                        className="rounded p-1 text-zinc-600 transition-colors hover:text-[#FF9900]"
                        title={isFavorite(account.accountId) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star
                          className={`h-4 w-4 ${isFavorite(account.accountId) ? "fill-[#FF9900] text-[#FF9900]" : ""}`}
                        />
                      </button>
                    </td>
                    <td className="max-w-[250px] truncate px-4 py-3 text-sm font-medium text-white">
                      {account.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {account.accountId}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      <span className="font-mono text-xs">{account.marketplace}</span>
                      <span className="ml-2 text-zinc-600">{countryNames[account.marketplace] ?? ""}</span>
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={account.type} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {account.currency}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-zinc-700" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => fetchAccounts(page - 1)}
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
                onClick={() => fetchAccounts(page + 1)}
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
