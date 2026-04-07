"use client";

import { useState, useCallback } from "react";
import type { Log } from "viem";
import { supportedChains } from "@/lib/chains/chainList";
import { createClient } from "@/lib/utils/viemClient";
import { multiRace } from "@/lib/utils/multiRace";
import { decodeCalldataAll, decodeLogAll } from "@/lib/utils/decoder";
import { isValidHex } from "@/lib/utils/hex";
import type { Chain } from "viem";
import type { TransactionReceipt } from "viem";
import type { TxInfo, DecodedCalldata, DecodedEvent } from "@/types";

export interface SearchResult {
  txInfo: TxInfo;
  decodedCalldataVariants: DecodedCalldata[];
  rawLogs: Log[];
  decodedEventVariants: (DecodedEvent[] | null)[];
  receipt: TransactionReceipt | null;
  chain: Chain;
}

export type SearchStatus = "idle" | "searching" | "found" | "not-found" | "error";

export function useTxSearch(opts: { chains?: readonly Chain[]; extraChains?: Chain[] } = {}) {
  const { chains: baseChains, extraChains = [] } = opts;
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (hash: string) => {
    const trimmed = hash.trim();

    if (!isValidHex(trimmed) || trimmed.length !== 66) {
      setError("Invalid transaction hash. Enter a 66-char hex starting with 0x.");
      setStatus("error");
      return;
    }

    setStatus("searching");
    setResult(null);
    setError(null);

    try {
      const txHash = trimmed as `0x${string}`;

      // Query base chains (or all supported) + extra user chains in parallel
      const allChains = [...(baseChains ?? supportedChains), ...extraChains];
      const promises = allChains.map((chain) => {
        const client = createClient(chain);
        return client
          .getTransaction({ hash: txHash })
          .then((tx) => ({ result: tx, client }))
          .catch(() => ({ result: null, client }));
      });

      const found = await multiRace(promises);

      if (!found) {
        setStatus("not-found");
        return;
      }

      const { result: tx, client } = found;
      const chainName = client.chain?.name ?? "Unknown Chain";
      const chainId = client.chain?.id;
      const nativeCurrencySymbol = client.chain?.nativeCurrency?.symbol ?? "ETH";

      // Fetch receipt (ignore errors — pending or unsupported RPC)
      let receipt = null;
      try {
        receipt = await client.getTransactionReceipt({ hash: txHash });
      } catch {
        // Pending tx or unsupported RPC
      }

      // Fetch block timestamp
      let timestamp: bigint | null = null;
      if (tx.blockNumber) {
        try {
          const block = await client.getBlock({ blockNumber: tx.blockNumber });
          timestamp = block.timestamp;
        } catch {
          // ignore
        }
      }

      const txInfo: TxInfo = {
        hash: tx.hash,
        chainName,
        chainId,
        nativeCurrencySymbol,
        status: receipt?.status ?? "pending",
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash ?? null,
        timestamp,
        from: tx.from,
        to: tx.to ?? null,
        value: tx.value,
        gas: tx.gas ?? null,
        gasPrice: receipt?.effectiveGasPrice ?? tx.gasPrice ?? null,
        gasUsed: receipt?.gasUsed ?? null,
        nonce: tx.nonce,
        type: tx.type,
        input: tx.input,
      };

      // Decode calldata variants if input exists
      let decodedCalldataVariants: DecodedCalldata[] = [];
      if (tx.input && tx.input !== "0x" && tx.input.length >= 10) {
        decodedCalldataVariants = await decodeCalldataAll(tx.input);
      }

      // Decode event log variants
      const rawLogs: Log[] = receipt?.logs ?? [];
      const decodedEventVariants = await Promise.all(
        rawLogs.map((log) =>
          decodeLogAll(log).then((variants) =>
            variants.length > 0 ? variants : null
          )
        )
      );

      setResult({ txInfo, decodedCalldataVariants, rawLogs, decodedEventVariants, receipt, chain: client.chain! });
      setStatus("found");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setStatus("error");
    }
  }, [baseChains, extraChains]);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, search, reset };
}
