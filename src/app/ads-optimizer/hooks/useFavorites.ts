"use client";

import { useState, useEffect, useCallback } from "react";

const ACCOUNTS_KEY = "ads-optimizer-favorite-accounts";
const CAMPAIGNS_KEY = "ads-optimizer-favorite-campaigns";

export interface FavoriteAccount {
  accountId: string;
  name: string;
  marketplace: string;
  type: string;
  currency: string;
}

export interface FavoriteCampaign {
  campaignId: string;
  accountId: string;
  name: string;
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useFavoriteAccounts() {
  // Initialize with fallback to avoid hydration mismatch (server has no window/localStorage)
  const [favorites, setFavorites] = useState<FavoriteAccount[]>([]);

  useEffect(() => {
    const stored = loadJson<FavoriteAccount[]>(ACCOUNTS_KEY, []);
    setFavorites(stored);
  }, []);

  const toggle = useCallback(
    (account: FavoriteAccount) => {
      const isFav = favorites.some((a) => a.accountId === account.accountId);
      const next = isFav
        ? favorites.filter((a) => a.accountId !== account.accountId)
        : [...favorites, account];
      setFavorites(next);
      saveJson(ACCOUNTS_KEY, next);
    },
    [favorites],
  );

  const isFavorite = useCallback(
    (accountId: string) => favorites.some((a) => a.accountId === accountId),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}

export function useFavoriteCampaigns(accountId: string) {
  // Initialize with fallback to avoid hydration mismatch (server has no window/localStorage)
  const [byAccount, setByAccount] = useState<Record<string, FavoriteCampaign[]>>(
    {},
  );

  useEffect(() => {
    const stored = loadJson<Record<string, FavoriteCampaign[]>>(CAMPAIGNS_KEY, {});
    setByAccount(stored);
  }, []);

  const favorites = byAccount[accountId] ?? [];

  const toggle = useCallback(
    (campaign: { campaignId: string; name: string }) => {
      const list = byAccount[accountId] ?? [];
      const isFav = list.some((c) => c.campaignId === campaign.campaignId);
      const next = isFav
        ? list.filter((c) => c.campaignId !== campaign.campaignId)
        : [
            ...list,
            {
              campaignId: campaign.campaignId,
              accountId,
              name: campaign.name,
            } as FavoriteCampaign,
          ];
      const nextByAccount = {
        ...byAccount,
        [accountId]: next,
      };
      setByAccount(nextByAccount);
      saveJson(CAMPAIGNS_KEY, nextByAccount);
    },
    [accountId, byAccount],
  );

  const isFavorite = useCallback(
    (campaignId: string) => favorites.some((c) => c.campaignId === campaignId),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}
