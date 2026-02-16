"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

const API_URL =
  "https://h0gumluamh.execute-api.us-east-1.amazonaws.com/Prod/hello";

/* ─────────────────────────── Types ─────────────────────────── */

interface QuarterData {
  date: string;
  revenue: number;
  profit: number;
  eps: number;
  gross_profit_ratio?: number;
  operating_income?: number;
  net_income_margin?: number;
  revenue_qoq_pct?: number | null;
  profit_qoq_pct?: number | null;
  eps_qoq_pct?: number | null;
}

interface Valuation {
  stock_price: number;
  pe_ratio: number;
  market_cap_b: number;
  day_change_pct: number;
}

interface DashboardData {
  ticker: string;
  company: string;
  chartData: QuarterData[];
  valuation: Valuation;
  analysis: string | null;
}

/* ──────────────────── Shimmer skeleton primitives ──────────────────── */

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative overflow-hidden rounded bg-zinc-800/60 ${className ?? ""}`} style={style}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
        animate={{ translateX: ["-100%", "100%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function ScanLine() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
      initial={{ top: "0%" }}
      animate={{ top: "100%" }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ──────────────────── Terminal skeleton loader ──────────────────────── */

function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="mt-10 space-y-6"
    >
      {/* Terminal status bar */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="font-mono text-xs tracking-wider text-emerald-400">
          SCANNING 10-Q SIGNALS…
        </span>
        <span className="ml-auto font-mono text-[10px] text-zinc-600">FMP + BEDROCK</span>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl"
          >
            <Shimmer className="mb-3 h-3 w-16" />
            <Shimmer className="mb-2 h-10 w-32" />
            <Shimmer className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Chart + analysis skeleton */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl lg:col-span-3">
          <ScanLine />
          <Shimmer className="mb-6 h-4 w-56" />
          <div className="flex items-end gap-3" style={{ height: 260 }}>
            {[55, 70, 45, 80].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <Shimmer className="w-full rounded-md" style={{ height: `${h}%` }} />
                <Shimmer className="h-2.5 w-12" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl lg:col-span-2">
          <ScanLine />
          <div className="mb-5 flex items-center gap-2">
            <Shimmer className="h-6 w-6 rounded-md" />
            <Shimmer className="h-4 w-40" />
          </div>
          <div className="space-y-3">
            {[92, 78, 88, 65, 82, 72, 95, 58, 85, 68, 90, 60].map((w, i) => (
              <Shimmer key={i} className="h-2.5" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────── Error state ──────────────────────────── */

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mt-10"
    >
      <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-8 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-300">Analysis Failed</h3>
            <p className="mt-1 text-sm text-red-400/80">{message}</p>
            <button
              onClick={onRetry}
              className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
            >
              Retry Audit
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────── No data state ─────────────────────────── */

function NoDataState({ ticker }: { ticker?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mt-10"
    >
      <div className="rounded-2xl border border-zinc-700/30 bg-zinc-900/30 p-10 text-center backdrop-blur-xl">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-zinc-600" />
        <h3 className="text-lg font-semibold text-zinc-300">No Data Available</h3>
        <p className="mt-2 text-sm text-zinc-500">
          {ticker
            ? `Couldn\u2019t find financial data for \u201c${ticker}\u201d. Check the ticker and try again.`
            : "The API returned an incomplete response. Please try again."}
        </p>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Executive stat card ──────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
  change,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  change?: number;
  delay?: number;
}) {
  const positive = change !== undefined && change >= 0;
  const ChangeIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 shadow-[0_4px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-colors hover:border-emerald-500/20"
    >
      <div className="pointer-events-none absolute top-0 left-0 h-12 w-12 rounded-tl-2xl border-t border-l border-emerald-500/0 transition-colors group-hover:border-emerald-500/20" />

      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-zinc-500" />
        <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
          {label}
        </span>
      </div>

      <p
        className={`text-3xl font-extrabold tracking-tight md:text-4xl ${
          accent
            ? "bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent"
            : "text-white"
        }`}
      >
        {value}
      </p>

      {change !== undefined && (
        <div
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            positive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          <ChangeIcon className="h-3 w-3" />
          {positive ? "+" : ""}
          {change.toFixed(2)}%
        </div>
      )}

      {sub && change === undefined && (
        <p className="mt-2 text-xs text-zinc-600">{sub}</p>
      )}
    </motion.div>
  );
}

/* ──────────────── Custom chart tooltip ────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const labelMap: Record<string, string> = {
    revenue: "Revenue",
    profit: "Net Income",
  };

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-[#0c0c0c]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-2 font-mono text-[11px] tracking-wider text-zinc-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-400">{labelMap[entry.dataKey] ?? entry.dataKey}:</span>
          <span className="font-bold text-white">${entry.value}B</span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────── Revenue bar + profit line chart ─────────────── */

function FinancialChart({ data }: { data: QuarterData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 shadow-[0_4px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute top-0 left-0 h-12 w-12 rounded-tl-2xl border-t border-l border-emerald-500/10" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-12 w-12 rounded-br-2xl border-r border-b border-emerald-500/10" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          <h3 className="font-mono text-xs tracking-wider text-zinc-400 uppercase">
            QoQ Revenue &amp; Net Income ($B)
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span className="font-mono text-[10px] text-zinc-500">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-teal-400" />
            <span className="font-mono text-[10px] text-zinc-500">Net Income</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="revenue"
            tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v}B`}
          />
          <YAxis
            yAxisId="profit"
            orientation="right"
            tick={{ fill: "#5eead4", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v}B`}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />
          <Legend content={() => null} />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            name="Revenue"
          />
          <Line
            yAxisId="profit"
            type="monotone"
            dataKey="profit"
            stroke="#2dd4bf"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#2dd4bf", stroke: "#0c0c0c", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#2dd4bf", stroke: "#0c0c0c", strokeWidth: 2 }}
            name="Net Income"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/* ──────────────── Strategic audit side panel ──────────────────── */

function AnalysisPanel({
  analysis,
  ticker,
}: {
  analysis: string | null;
  ticker: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="relative flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_4px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute top-0 left-0 h-12 w-12 rounded-tl-2xl border-t border-l border-emerald-500/10" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-12 w-12 rounded-br-2xl border-r border-b border-emerald-500/10" />

      {/* Panel header with verdict badge */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-6 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          <h3 className="font-mono text-xs tracking-wider text-zinc-400 uppercase">
            Strategic Audit — {ticker}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
          <Shield className="h-3 w-3 text-amber-400" />
          <span className="font-mono text-[10px] font-bold tracking-wider text-amber-400">
            PRINCIPAL&apos;S VERDICT
          </span>
        </div>
      </div>

      {/* Scrollable analysis content */}
      <div className="flex-1 overflow-y-auto px-6 py-5" style={{ maxHeight: "640px" }}>
        {analysis ? (
          <article className="analyst-markdown prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-sm prose-h3:text-emerald-400 prose-h4:text-xs prose-h4:text-teal-300 prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-zinc-300 prose-strong:text-white prose-ul:text-[13px] prose-ul:text-zinc-300 prose-li:marker:text-emerald-600 prose-hr:border-zinc-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysis}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-sm text-zinc-500">
                Generating strategic analysis…
              </span>
            </div>
            <div className="space-y-3">
              {[88, 72, 90, 60, 80, 65, 85].map((w, i) => (
                <Shimmer key={i} className="h-2.5" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel footer */}
      <div className="flex items-center justify-between border-t border-zinc-800/60 px-6 py-3">
        <p className="font-mono text-[10px] tracking-wider text-zinc-600 uppercase">
          AI-Generated — Not Investment Advice
        </p>
        <div className="flex items-center gap-1.5 text-emerald-500/50">
          <TrendingUp className="h-3 w-3" />
          <span className="font-mono text-[10px]">Claude 3.5 Sonnet</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════ Dashboard ══════════════════════════════ */

function Dashboard({ data }: { data: DashboardData }) {
  const hasChart = Array.isArray(data.chartData) && data.chartData.length > 0;
  const val = data.valuation;
  const hasValuation = val != null && typeof val.stock_price === "number";

  if (!hasChart && !hasValuation) {
    return <NoDataState ticker={data.ticker} />;
  }

  const latestQ = hasChart ? data.chartData[data.chartData.length - 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-10 space-y-6"
    >
      {/* ── Terminal status bar ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-sm font-bold tracking-wider text-emerald-400">
          {data.ticker}
        </span>
        <span className="text-sm text-zinc-400">{data.company}</span>
        {latestQ && (
          <span className="ml-auto font-mono text-[11px] text-zinc-600">
            Latest filing: {latestQ.date}
          </span>
        )}
      </div>

      {/* ── Executive stat grid: Price, P/E, EPS ── */}
      {hasValuation && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={DollarSign}
            label="Stock Price"
            value={`$${val.stock_price?.toFixed(2) ?? "—"}`}
            change={val.day_change_pct}
            accent
            delay={0.05}
          />
          <StatCard
            icon={BarChart3}
            label="P/E Ratio"
            value={val.pe_ratio?.toFixed(1) ?? "—"}
            sub="Trailing twelve months"
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            label="Latest EPS"
            value={latestQ?.eps != null ? `$${latestQ.eps.toFixed(2)}` : "—"}
            sub={latestQ ? latestQ.date : ""}
            delay={0.15}
          />
        </div>
      )}

      {/* ── Chart + AI Analysis ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {hasChart ? (
            <FinancialChart data={data.chartData} />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-zinc-800/40 bg-zinc-900/20">
              <p className="text-sm text-zinc-600">No quarterly data available</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <AnalysisPanel analysis={data.analysis} ticker={data.ticker} />
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════ Main Page ══════════════════════════════ */

export default function AnalystPage() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runAudit = useCallback(async () => {
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) return;

    setLoading(true);
    setData(null);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/?ticker=${encodeURIComponent(symbol)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message ?? `API returned ${res.status}: ${res.statusText}`
        );
      }

      const json = await res.json();
      const parsed: DashboardData = {
        ticker: json.ticker ?? symbol,
        company: json.company ?? "Unknown",
        chartData: Array.isArray(json.chartData) ? json.chartData : [],
        valuation: json.valuation ?? {
          stock_price: 0,
          pe_ratio: 0,
          market_cap_b: 0,
          day_change_pct: 0,
        },
        analysis: json.analysis ?? null,
      };

      setData(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) runAudit();
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/[0.03] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20">
        {/* Back link */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </Link>

        {/* ── Header ── */}
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="font-mono text-xs tracking-widest text-emerald-500 uppercase">
              Financial Terminal
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Earnings{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-zinc-400">
            MBA-led AI analysis of quarterly performance vs. strategic intent.
          </p>
        </header>

        {/* ── Search bar ── */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="group relative flex-1">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-emerald-500" />
            <input
              ref={inputRef}
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter ticker — NVDA, AMZN, AAPL …"
              spellCheck={false}
              disabled={loading}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-4 pr-4 pl-12 font-mono text-lg tracking-wider text-white placeholder-zinc-600 outline-none backdrop-blur-sm transition-all focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
            />
          </div>
          <button
            onClick={runAudit}
            disabled={loading || !ticker.trim()}
            className="relative flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-8 py-4 font-semibold text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <motion.div
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                Auditing…
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Run Audit
              </>
            )}
          </button>
        </div>

        {/* ── Content area ── */}
        <AnimatePresence mode="wait">
          {loading && <DashboardSkeleton key="skeleton" />}
          {error && !loading && (
            <ErrorState key="error" message={error} onRetry={runAudit} />
          )}
          {data && !loading && <Dashboard key="dashboard" data={data} />}
        </AnimatePresence>

        {/* ── Empty state ── */}
        {!loading && !data && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
              <Search className="h-7 w-7 text-zinc-700" />
            </div>
            <p className="text-sm text-zinc-600">
              Enter a ticker to generate a strategic earnings audit
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META"].map(
                (sym) => (
                  <button
                    key={sym}
                    onClick={() => setTicker(sym)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-mono text-xs text-zinc-500 transition-all hover:border-emerald-500/30 hover:text-emerald-400"
                  >
                    {sym}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
