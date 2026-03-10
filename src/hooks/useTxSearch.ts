"use client";

import { useState, useCallback } from "react";
import type { Log } from "viem";
import { supportedChains } from "@/lib/chains/chainList";
import { createClient } from "@/lib/utils/viemClient";
import { multiRace } from "@/lib/utils/multiRace";
import { decodeCalldata, decodeLog } from "@/lib/utils/decoder";
import { isValidHex } from "@/lib/utils/hex";
import type { TxInfo, DecodedCalldata, DecodedEvent } from "@/types";

export interface SearchResult {
  txInfo: TxInfo;
  decodedCalldata: DecodedCalldata | null;
  rawLogs: Log[];
  decodedEvents: (DecodedEvent | null)[];
}

export type SearchStatus = "idle" | "searching" | "found" | "not-found" | "error";

export function useTxSearch() {
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

      // Query all supported chains in parallel
      const promises = supportedChains.map((chain) => {
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
        status: receipt?.status ?? "pending",
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash ?? null,
        timestamp,
        from: tx.from,
        to: tx.to ?? null,
        value: tx.value,
        gasPrice: receipt?.effectiveGasPrice ?? tx.gasPrice ?? null,
        gasUsed: receipt?.gasUsed ?? null,
        nonce: tx.nonce,
        input: tx.input,
      };

      // Decode calldata if input exists
      let decodedCalldata: DecodedCalldata | null = null;
      if (tx.input && tx.input !== "0x" && tx.input.length >= 10) {
        decodedCalldata = await decodeCalldata(tx.input);
      }

      // Decode event logs
      const rawLogs: Log[] = receipt?.logs ?? [];
      const decodedEvents = await Promise.all(
        rawLogs.map((log) => decodeLog(log))
      );

      setResult({ txInfo, decodedCalldata, rawLogs, decodedEvents });
      setStatus("found");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, search, reset };
}
