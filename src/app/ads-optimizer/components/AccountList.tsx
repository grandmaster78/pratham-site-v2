"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Store,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface AdsAccount {
  accountId: string;
  name: string;
  marketplace: string;
  type: string;
  currency: string;
}

interface AccountListProps {
  onSelectAccount: (account: AdsAccount) => void;
}

const PAGE_SIZE = 8;

const marketplaceFlags: Record<string, string> = {
  US: "US",
  CA: "CA",
  UK: "UK",
  GB: "GB",
  DE: "DE",
  FR: "FR",
  IT: "IT",
  ES: "ES",
  JP: "JP",
  AU: "AU",
  IN: "IN",
  MX: "MX",
  BR: "BR",
};

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

export function AccountList({ onSelectAccount }: AccountListProps) {
  const [accounts, setAccounts] = useState<AdsAccount[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource | null>(null);

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

  useEffect(() => {
    fetchAccounts(1);
  }, [fetchAccounts]);

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
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">
            Advertising Accounts
          </h2>
          <SourceBadge source={source} />
        </div>
        {!loading && (
          <span className="font-mono text-xs text-zinc-600">
            {totalCount} account{totalCount !== 1 ? "s" : ""}
          </span>
        )}
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
          <div className="space-y-2">
            {accounts.map((account, i) => (
              <motion.button
                key={account.accountId}
                onClick={() => onSelectAccount(account)}
                className="group flex w-full items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-left transition-all hover:border-[#FF9900]/30 hover:bg-zinc-900/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-[#FF9900] transition-colors group-hover:border-[#FF9900]/30">
                  <Store className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {account.name}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-600">
                      <Globe className="h-3 w-3" />
                      {marketplaceFlags[account.marketplace] ??
                        account.marketplace}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-700">
                      {account.type}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-700">
                      {account.currency}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-700 transition-colors group-hover:text-[#FF9900]" />
              </motion.button>
            ))}
          </div>

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
