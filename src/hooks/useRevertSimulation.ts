"use client";

import { useCallback, useEffect, useState } from "react";
import { BaseError, type Chain } from "viem";
import { createClient } from "@/lib/utils/viemClient";
import { decodeErrorAll } from "@/lib/utils/decoder";
import type { DecodedError, TxInfo } from "@/types";

export type SimStatus = "idle" | "loading" | "done" | "error";

function extractRevertData(err: unknown): string | null {
  if (!(err instanceof BaseError)) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walked = err.walk((e: any) => typeof e.data === "string" || typeof e.data?.data === "string");
  if (!walked) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (walked as any).data;
  const data = typeof raw === "object" && raw !== null ? raw.data : raw;
  return typeof data === "string" && data.startsWith("0x") && data.length >= 10 ? data : null;
}

export interface UseRevertSimulationResult {
  status: SimStatus;
  decodedList: DecodedError[];
  abiIndex: number;
  setAbiIndex: (updater: (i: number) => number) => void;
  failReason: "no-abi" | "decode-failed" | undefined;
  error: string | null;
  rawData: string;
  usedLatest: boolean;
  simulate: () => Promise<void>;
}

/**
 * Replays a reverted transaction locally via `client.call` and decodes the
 * revert reason. Automatically resets state whenever the provided tx hash
 * changes (new search result).
 */
export function useRevertSimulation({
  txInfo,
  chain,
}: {
  txInfo: TxInfo | null | undefined;
  chain: Chain | null | undefined;
}): UseRevertSimulationResult {
  const [status, setStatus] = useState<SimStatus>("idle");
  const [decodedList, setDecodedList] = useState<DecodedError[]>([]);
  const [abiIndex, setAbiIndexState] = useState(0);
  const [failReason, setFailReason] = useState<"no-abi" | "decode-failed" | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState("");
  const [usedLatest, setUsedLatest] = useState(false);

  const txHash = txInfo?.hash ?? "";

  // Reset when the tx under inspection changes.
  useEffect(() => {
    setStatus("idle");
    setDecodedList([]);
    setAbiIndexState(0);
    setFailReason(undefined);
    setError(null);
    setRawData("");
    setUsedLatest(false);
  }, [txHash]);

  const setAbiIndex = useCallback((updater: (i: number) => number) => {
    setAbiIndexState(updater);
  }, []);

  const simulate = useCallback(async () => {
    if (!txInfo || !chain) return;

    const inputBytes = (txInfo.input.length - 2) / 2;
    if (inputBytes > 128 * 1024) {
      setError("Calldata is too large to simulate in the browser.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);
    setUsedLatest(false);

    try {
      const client = createClient(chain);
      let revertData: string | null = null;
      let latestUsed = false;

      const simBlockNumber = txInfo.blockNumber ? txInfo.blockNumber - BigInt(1) : undefined;
      try {
        await client.call({
          account: txInfo.from as `0x${string}`,
          to: txInfo.to as `0x${string}`,
          data: txInfo.input as `0x${string}`,
          value: txInfo.value,
          gas: txInfo.gas ?? undefined,
          blockNumber: simBlockNumber,
        });

        setError(
          "Simulation succeeded at the original block\n1. The RPC may not have returned the revert error.\n2. The contract state may have changed since the original revert.",
        );
        setStatus("error");
        return;
      } catch (err) {
        revertData = extractRevertData(err);
        if (!revertData && txInfo.blockNumber) {
          try {
            await client.call({
              account: txInfo.from as `0x${string}`,
              to: txInfo.to as `0x${string}`,
              data: txInfo.input as `0x${string}`,
              value: txInfo.value,
              gas: txInfo.gas ?? undefined,
            });
            setError(
              "Simulation succeeded at latest block:\n1. The RPC may not have returned the revert error.\n2. The contract state may have changed, so the revert no longer occurs.",
            );
            setStatus("error");
            return;
          } catch (latestErr) {
            revertData = extractRevertData(latestErr);
            latestUsed = true;
          }
        }
      }

      if (!revertData) {
        setDecodedList([]);
        setAbiIndexState(0);
        setRawData("");
        setFailReason(undefined);
        setUsedLatest(latestUsed);
        setStatus("done");
        return;
      }

      const { results, failureReason } = await decodeErrorAll(revertData);
      setDecodedList(results);
      setAbiIndexState(0);
      setRawData(revertData);
      setFailReason(results.length > 0 ? undefined : failureReason);
      setUsedLatest(latestUsed);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed.");
      setStatus("error");
    }
  }, [txInfo, chain]);

  return {
    status,
    decodedList,
    abiIndex,
    setAbiIndex,
    failReason,
    error,
    rawData,
    usedLatest,
    simulate,
  };
}
