"use client";

import { ChevronRight, LayoutGrid } from "lucide-react";

interface BreadcrumbsProps {
  accountName?: string;
  onBackToAccounts: () => void;
}

export function Breadcrumbs({ accountName, onBackToAccounts }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 font-mono text-xs text-zinc-500">
      <button
        onClick={onBackToAccounts}
        className="flex items-center gap-1.5 transition-colors hover:text-white"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Accounts
      </button>
      {accountName && (
        <>
          <ChevronRight className="h-3 w-3 text-zinc-700" />
          <span className="text-white">{accountName}</span>
          <ChevronRight className="h-3 w-3 text-zinc-700" />
          <span className="text-zinc-400">Campaigns</span>
        </>
      )}
    </nav>
  );
}
