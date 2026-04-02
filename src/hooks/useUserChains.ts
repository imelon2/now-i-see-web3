"use client";

import { useState, useCallback, useEffect } from "react";
import { defineChain } from "viem";
import type { Chain } from "viem";

export interface UserChainData {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
}

const STORAGE_KEY = "userDefinedChains";

function loadFromStorage(): UserChainData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(chains: UserChainData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chains));
}

export function toViemChain(data: UserChainData): Chain {
  return defineChain({
    id: data.id,
    name: data.name,
    nativeCurrency: { name: data.symbol, symbol: data.symbol, decimals: 18 },
    rpcUrls: {
      default: { http: [data.rpcUrl] },
    },
  });
}

export function useUserChains() {
  const [userChains, setUserChains] = useState<UserChainData[]>([]);

  useEffect(() => {
    setUserChains(loadFromStorage());
  }, []);

  const addChain = useCallback((chain: UserChainData) => {
    setUserChains((prev) => {
      const next = [...prev.filter((c) => c.id !== chain.id), chain];
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeChain = useCallback((chainId: number) => {
    setUserChains((prev) => {
      const next = prev.filter((c) => c.id !== chainId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const viemChains: Chain[] = userChains.map(toViemChain);

  return { userChains, viemChains, addChain, removeChain };
}
