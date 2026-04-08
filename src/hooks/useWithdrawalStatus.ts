"use client";

import { useEffect, useState } from "react";
import type { Chain, TransactionReceipt } from "viem";
import { type GetWithdrawalStatusReturnType, getWithdrawals } from "viem/op-stack";
import { getL1Chain } from "@/lib/chains/chainList";
import { createOpStackL1Client } from "@/lib/utils/viemClient";
import { portalReadAbi, type WithdrawalTxOrigin } from "@/lib/opstack/withdrawal";

export interface UseWithdrawalStatusResult {
  status: GetWithdrawalStatusReturnType | null;
  timeToProve: { seconds: number } | null;
  timeToFinalize: { seconds: number } | null;
  loading: boolean;
  error: string | null;
}

export type UseWithdrawalStatusInput =
  | {
      source: "initiate";
      receipt: TransactionReceipt | null;
      chain: Chain | null;
      enabled: boolean;
    }
  | {
      source: "prove";
      withdrawalHash: `0x${string}` | null;
      l2Chain: Chain | null;
      portalAddress: `0x${string}` | null;
      enabled: boolean;
    }
  | {
      source: "finalize";
      enabled: boolean;
    }
  | { source: null; enabled: false };

/**
 * Fetches OP Stack withdrawal status for one of three input sources:
 *   - initiate: L2 receipt (existing path)
 *   - prove:    L1 prove tx → withdrawalHash + L2 chain (portal-direct lookup)
 *   - finalize: L1 finalize tx → status hardcoded to "finalized"
 *
 * Race-protected via cleanup flag. 1s countdown timers for time-to-prove /
 * time-to-finalize. Pass `source: null` or `enabled: false` to skip.
 */
export function useWithdrawalStatus(input: UseWithdrawalStatusInput): UseWithdrawalStatusResult {
  const [status, setStatus] = useState<GetWithdrawalStatusReturnType | null>(null);
  const [timeToProve, setTimeToProve] = useState<{ seconds: number } | null>(null);
  const [initialProveSeconds, setInitialProveSeconds] = useState<number | null>(null);
  const [timeToFinalize, setTimeToFinalize] = useState<{ seconds: number } | null>(null);
  const [initialFinalizeSeconds, setInitialFinalizeSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable dependency keys per source variant.
  const enabled = input.enabled;
  const source: WithdrawalTxOrigin | null = input.source ?? null;
  const receipt = input.source === "initiate" ? input.receipt : null;
  const chain =
    input.source === "initiate"
      ? input.chain
      : input.source === "prove"
        ? input.l2Chain
        : null;
  const withdrawalHash = input.source === "prove" ? input.withdrawalHash : null;
  const portalAddress = input.source === "prove" ? input.portalAddress : null;

  useEffect(() => {
    setStatus(null);
    setTimeToProve(null);
    setInitialProveSeconds(null);
    setTimeToFinalize(null);
    setInitialFinalizeSeconds(null);
    setError(null);

    if (!enabled || !source) {
      setLoading(false);
      return;
    }

    // Finalize tx: by definition the withdrawal is finalized.
    if (source === "finalize") {
      setStatus("finalized");
      setLoading(false);
      return;
    }

    if (source === "initiate") {
      if (!receipt || !chain) {
        setLoading(false);
        return;
      }
      const l1Chain = getL1Chain(chain);
      if (!l1Chain) {
        setLoading(false);
        return;
      }

      let cancelled = false;
      setLoading(true);

      (async () => {
        try {
          const l1Client = createOpStackL1Client(l1Chain);
          const wdStatus = await l1Client.getWithdrawalStatus({
            receipt,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            targetChain: chain as any,
          });
          if (cancelled) return;
          setStatus(wdStatus);

          if (wdStatus === "waiting-to-prove" || wdStatus === "ready-to-prove") {
            try {
              const t = await l1Client.getTimeToNextGame({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                targetChain: chain as any,
                l2BlockNumber: receipt.blockNumber,
              });
              if (cancelled) return;
              const secs = Number(t.seconds);
              setTimeToProve({ seconds: secs });
              setInitialProveSeconds(secs);
            } catch {
              if (cancelled) return;
              setTimeToProve({ seconds: 0 });
              setInitialProveSeconds(0);
            }
          }

          if (wdStatus === "waiting-to-finalize") {
            try {
              const withdrawals = getWithdrawals({ logs: receipt.logs });
              if (withdrawals.length > 0) {
                const t = await l1Client.getTimeToFinalize({
                  withdrawalHash: withdrawals[0].withdrawalHash,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  targetChain: chain as any,
                });
                if (cancelled) return;
                const secs = Number(t.seconds);
                setTimeToFinalize({ seconds: secs });
                setInitialFinalizeSeconds(secs);
              }
            } catch {
              if (cancelled) return;
              setTimeToFinalize({ seconds: 0 });
              setInitialFinalizeSeconds(0);
            }
          }
        } catch (err) {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : "Failed to fetch withdrawal status.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    // source === "prove" — fetch via portal direct.
    if (source === "prove") {
      if (!withdrawalHash || !chain || !portalAddress) {
        setLoading(false);
        return;
      }
      const l1Chain = getL1Chain(chain);
      if (!l1Chain) {
        setLoading(false);
        return;
      }

      let cancelled = false;
      setLoading(true);

      (async () => {
        try {
          const l1Client = createOpStackL1Client(l1Chain);

          // 1. Check if already finalized.
          let isFinalized = false;
          try {
            isFinalized = (await l1Client.readContract({
              abi: portalReadAbi,
              address: portalAddress,
              functionName: "finalizedWithdrawals",
              args: [withdrawalHash],
            })) as boolean;
          } catch {
            // ignore — fall through to time-to-finalize probe
          }
          if (cancelled) return;

          if (isFinalized) {
            setStatus("finalized");
            return;
          }

          // 2. Not finalized — probe time-to-finalize for ready vs waiting.
          try {
            const t = await l1Client.getTimeToFinalize({
              withdrawalHash,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              targetChain: chain as any,
            });
            if (cancelled) return;
            const secs = Number(t.seconds);
            if (secs > 0) {
              setStatus("waiting-to-finalize");
              setTimeToFinalize({ seconds: secs });
              setInitialFinalizeSeconds(secs);
            } else {
              setStatus("ready-to-finalize");
              setTimeToFinalize({ seconds: 0 });
              setInitialFinalizeSeconds(0);
            }
          } catch {
            if (cancelled) return;
            // Fallback: assume ready-to-finalize so phase 2 shows complete.
            setStatus("ready-to-finalize");
            setTimeToFinalize({ seconds: 0 });
            setInitialFinalizeSeconds(0);
          }
        } catch (err) {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : "Failed to fetch withdrawal status.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }
  }, [enabled, source, receipt, chain, withdrawalHash, portalAddress]);

  // Countdown timers
  useEffect(() => {
    if (initialProveSeconds === null || initialProveSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeToProve((prev) => {
        if (!prev || prev.seconds <= 1) {
          clearInterval(interval);
          return { seconds: 0 };
        }
        return { seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [initialProveSeconds]);

  useEffect(() => {
    if (initialFinalizeSeconds === null || initialFinalizeSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeToFinalize((prev) => {
        if (!prev || prev.seconds <= 1) {
          clearInterval(interval);
          return { seconds: 0 };
        }
        return { seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [initialFinalizeSeconds]);

  return { status, timeToProve, timeToFinalize, loading, error };
}
