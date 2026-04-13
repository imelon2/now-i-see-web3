"use client";

import { useCallback, useSyncExternalStore } from "react";
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
  if (typeof window === "undefined") return;
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

// ---- Module-scope global store ---------------------------------------------

let state: UserChainData[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function hydrateOnce() {
  if (hydrated || typeof window === "undefined") return;
  state = loadFromStorage();
  hydrated = true;
}

function setState(next: UserChainData[]) {
  state = next;
  saveToStorage(next);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  hydrateOnce();
  listeners.add(listener);
  // Cross-tab sync: other tabs updating localStorage should refresh us.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = loadFromStorage();
      listeners.forEach((l) => l());
    }
  };
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot(): UserChainData[] {
  hydrateOnce();
  return state;
}

const EMPTY_SNAPSHOT: UserChainData[] = [];
function getServerSnapshot(): UserChainData[] {
  return EMPTY_SNAPSHOT;
}

// ---- Public hook -----------------------------------------------------------

export function useUserChains() {
  const userChains = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const addChain = useCallback((chain: UserChainData) => {
    const next = [...state.filter((c) => c.id !== chain.id), chain];
    setState(next);
  }, []);

  const removeChain = useCallback((chainId: number) => {
    const next = state.filter((c) => c.id !== chainId);
    setState(next);
  }, []);

  const viemChains: Chain[] = userChains.map(toViemChain);

  return { userChains, viemChains, addChain, removeChain };
}
