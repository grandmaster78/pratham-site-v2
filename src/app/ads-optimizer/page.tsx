"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  LogOut,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginButton } from "./components/LoginButton";
import { AccountList } from "./components/AccountList";
import { CampaignList } from "./components/CampaignList";
import type { Campaign } from "./components/CampaignList";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { ChatPanel } from "./components/ChatPanel";

interface SelectedAccount {
  accountId: string;
  name: string;
  marketplace: string;
  type: string;
  currency: string;
}

export default function AdsOptimizerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [selectedAccount, setSelectedAccount] =
    useState<SelectedAccount | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [highlightedCampaignIds, setHighlightedCampaignIds] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  // Sync URL -> state on mount and when searchParams change (e.g. back/forward)
  useEffect(() => {
    const accountId = searchParams.get("account");
    const name = searchParams.get("name");
    if (accountId && name) {
      let decodedName = name;
      try {
        decodedName = decodeURIComponent(name);
      } catch {
        // Malformed percent-encoding (e.g. %%) can throw
      }
      setSelectedAccount({
        accountId,
        name: decodedName,
        marketplace: searchParams.get("marketplace") ?? "US",
        type: searchParams.get("type") ?? "seller",
        currency: searchParams.get("currency") ?? "USD",
      });
    } else {
      setSelectedAccount(null);
      setCampaigns([]);
      setHighlightedCampaignIds(new Set());
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    setAuthenticated(false);
    setSelectedAccount(null);
    setCampaigns([]);
    router.replace("/ads-optimizer");
  };

  const handleSelectAccount = useCallback(
    (account: SelectedAccount) => {
      setSelectedAccount(account);
      setCampaigns([]);
      setHighlightedCampaignIds(new Set());
      const params = new URLSearchParams({
        account: account.accountId,
        name: account.name,
        marketplace: account.marketplace,
        type: account.type,
        currency: account.currency,
      });
      router.push(`/ads-optimizer?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleBackToAccounts = useCallback(() => {
    setSelectedAccount(null);
    setCampaigns([]);
    setHighlightedCampaignIds(new Set());
    router.push("/ads-optimizer", { scroll: false });
  }, [router]);

  const handleCampaignsLoaded = useCallback((loaded: Campaign[]) => {
    setCampaigns(loaded);
  }, []);

  const handleHighlight = useCallback((ids: Set<string>) => {
    setHighlightedCampaignIds((prev) => {
      // Only update if the set contents actually changed
      if (prev.size === ids.size && [...prev].every((id) => ids.has(id))) {
        return prev;
      }
      return ids;
    });
  }, []);

  const campaignRefs = useMemo(
    () => campaigns.map((c) => ({ campaignId: c.campaignId, name: c.name })),
    [campaigns],
  );

  // Loading state while checking auth
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#050505] font-sans text-white">
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            className="h-8 w-8 rounded-full border-2 border-[#FF9900]/30 border-t-[#FF9900]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] font-sans text-white">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/50 bg-[#050505]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-xs text-zinc-500 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              prathamsarin.com
            </Link>
            <div className="hidden h-4 w-px bg-zinc-800 sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <Zap className="h-4 w-4 text-[#FF9900]" />
              <span className="font-mono text-sm font-medium text-white">
                Ads Optimizer
              </span>
            </div>
          </div>

          {authenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-1.5 font-mono text-xs text-zinc-500 transition-colors hover:border-zinc-700 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Main area */}
      <div className="relative z-10 flex flex-1 flex-col">
        {!authenticated ? (
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
            <LoginButton />
          </main>
        ) : selectedAccount ? (
          <>
            {/* Breadcrumbs */}
            <div className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Breadcrumbs
                  accountName={selectedAccount.name}
                  onBackToAccounts={handleBackToAccounts}
                />
              </motion.div>
            </div>

            {/* Two-column layout: Campaigns + Chat */}
            <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-6 px-4 pb-8 sm:px-6">
              {/* Left: Campaigns table */}
              <motion.div
                className="min-w-0 flex-1"
                key={selectedAccount.accountId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CampaignList
                  accountId={selectedAccount.accountId}
                  accountName={selectedAccount.name}
                  highlightedCampaignIds={highlightedCampaignIds}
                  onCampaignsLoaded={handleCampaignsLoaded}
                />
              </motion.div>

              {/* Right: AI Chat (desktop only -- inline) */}
              <motion.div
                className="hidden w-[380px] shrink-0 xl:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{ height: "calc(100vh - 140px)", position: "sticky", top: "100px" }}
              >
                <ChatPanel
                  accountId={selectedAccount.accountId}
                  accountName={selectedAccount.name}
                  campaigns={campaignRefs}
                  onHighlight={handleHighlight}
                  inline
                />
              </motion.div>
            </div>

            {/* Mobile chat: bottom toggle bar + slide-up sheet */}
            <div className="xl:hidden">
              <ChatPanel
                accountId={selectedAccount.accountId}
                accountName={selectedAccount.name}
                campaigns={campaignRefs}
                onHighlight={handleHighlight}
              />
            </div>
          </>
        ) : (
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AccountList onSelectAccount={handleSelectAccount} />
            </motion.div>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-6">
        <p className="text-center font-mono text-xs text-zinc-700">
          Powered by Amazon Ads MCP Server + AWS Bedrock
        </p>
      </footer>
    </div>
  );
}
