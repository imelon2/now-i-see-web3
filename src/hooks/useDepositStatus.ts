"use client";

import { useEffect, useState } from "react";
import {
  TransactionReceiptNotFoundError,
  concat,
  keccak256,
  pad,
  toHex,
  type Chain,
  type TransactionReceipt,
} from "viem";
import {
  extractTransactionDepositedLogs,
  getL2TransactionHashes,
  getSourceHash,
  opaqueDataToDepositData,
  serializeTransaction,
} from "viem/op-stack";
import { createClient } from "@/lib/utils/viemClient";

export type DepositStatus = "deposited" | "wait-receive" | "received";

/**
 * Full derivation trace for the L2 transaction hash of an L1 deposit.
 * Mirrors every intermediate value consumed by viem's internal
 * `getL2TransactionHash` pipeline so the UI can show the full chain:
 *   sourceLog → sourceHash → depositTx tuple → RLP → 0x7e || RLP → keccak256
 */
export interface DepositDerivation {
  // Final
  l2TxHash: `0x${string}`;
  txType: "0x7e";
  rlpEncoded: `0x${string}`; // 0x7e || toRlp(depositTx)
  // depositTx tuple (as consumed by serializeTransaction for type='deposit')
  sourceHash: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}` | null;
  mint: bigint;
  value: bigint;
  gas: bigint;
  isSystemTx: boolean;
  data: `0x${string}`;
  isCreation: boolean;
  // sourceHash sub-chain
  domain: "userDeposit";
  depositIdHash: `0x${string}`;
  l1BlockHash: `0x${string}`;
  l1LogIndex: number;
  // sourceLog meta
  version: bigint;
  opaqueData: `0x${string}`;
}

export interface DepositOpaque {
  /** Raw opaque bytes emitted in the TransactionDeposited event. */
  opaqueData: `0x${string}`;
  /** ETH locked on L1, minted on L2 (from msg.value). */
  mint: bigint;
  /** Value forwarded to the target on L2. */
  value: bigint;
  /** L2 gas limit for the deposit tx. */
  gas: bigint;
  /** Whether the deposit creates a new contract on L2. */
  isCreation: boolean;
  /** Calldata forwarded to the target on L2. */
  data: `0x${string}`;
}

export interface UseDepositStatusInput {
  receipt: TransactionReceipt | null;
  l1Chain: Chain | null;
  l2Chain: Chain | null;
  portalAddress: `0x${string}` | null;
  enabled: boolean;
}

export interface UseDepositStatusResult {
  status: DepositStatus;
  l2Hash: `0x${string}` | null;
  l2Receipt: TransactionReceipt | null;
  /** Amount minted on L2 in wei (from opaqueData). null until extracted. */
  mint: bigint | null;
  /** Full decoded opaque data (mint, value, gas, isCreation, data). */
  opaque: DepositOpaque | null;
  /** L2 tx hash derivation trace for the visualization panel. */
  derivation: DepositDerivation | null;
  /** Seconds between L1 deposit block and L2 received block. */
  relayDurationSeconds: number | null;
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 5000;

/**
 * Tracks the L1→L2 relay of an OP Stack deposit.
 *
 * Phase machine:
 *   - deposited:   L1 receipt is in — this is the entry state as soon as
 *                  `getL2TransactionHashes` produces a hash.
 *   - wait-receive: polling the target L2 for `getTransactionReceipt`.
 *   - received:    the L2 receipt has been fetched — polling stops.
 *
 * The L1 receipt's logs are filtered to the detected OptimismPortal before
 * being passed to `getL2TransactionHashes`, so batched txs emitting multiple
 * `TransactionDeposited` events on different portals stay disambiguated.
 * `TransactionReceiptNotFoundError` is treated as "not yet landed" (normal
 * polling state); any other RPC error is surfaced via `error` but does not
 * stop the poll — RPC flakiness should self-resolve on the next tick.
 */
export function useDepositStatus(
  input: UseDepositStatusInput,
): UseDepositStatusResult {
  const { receipt, l1Chain, l2Chain, portalAddress, enabled } = input;

  const [status, setStatus] = useState<DepositStatus>("deposited");
  const [l2Hash, setL2Hash] = useState<`0x${string}` | null>(null);
  const [l2Receipt, setL2Receipt] = useState<TransactionReceipt | null>(null);
  const [mint, setMint] = useState<bigint | null>(null);
  const [opaque, setOpaque] = useState<DepositOpaque | null>(null);
  const [derivation, setDerivation] = useState<DepositDerivation | null>(null);
  const [relayDurationSeconds, setRelayDurationSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus("deposited");
    setL2Hash(null);
    setL2Receipt(null);
    setMint(null);
    setOpaque(null);
    setDerivation(null);
    setRelayDurationSeconds(null);
    setError(null);
    setLoading(false);

    if (!enabled || !receipt || !l2Chain || !portalAddress) return;

    const portalAddressLower = portalAddress.toLowerCase();
    const portalLogs = receipt.logs.filter(
      (log) => log.address?.toLowerCase() === portalAddressLower,
    );

    // Decode the opaqueData on the first TransactionDeposited log to obtain
    // the L2 mint amount (ETH locked in the portal on L1 → minted on L2).
    try {
      const extracted = extractTransactionDepositedLogs({ logs: portalLogs });
      const first = extracted[0];
      if (first?.args?.opaqueData) {
        const parsed = opaqueDataToDepositData(first.args.opaqueData);
        setMint(parsed.mint);
        setOpaque({
          opaqueData: first.args.opaqueData,
          mint: parsed.mint,
          value: parsed.value,
          gas: parsed.gas,
          isCreation: parsed.isCreation,
          data: parsed.data,
        });

        // Reproduce the viem getL2TransactionHash pipeline so the UI can
        // show every intermediate value. We reuse viem's public helpers
        // (getSourceHash + serializeTransaction for type='deposit') so the
        // displayed derivation is byte-for-byte identical to what viem
        // computes internally.
        try {
          if (
            first.blockHash &&
            typeof first.logIndex === "number" &&
            first.args.from
          ) {
            const sourceHash = getSourceHash({
              domain: "userDeposit",
              l1BlockHash: first.blockHash,
              l1LogIndex: first.logIndex,
            });
            // depositIdHash is the inner keccak256 used inside getSourceHash.
            // We recompute it locally so the UI can display it as a sub-node
            // of sourceHash; viem does not export it directly.
            const depositIdHash = keccak256(
              concat([
                first.blockHash,
                pad(toHex(first.logIndex), { size: 32 }),
              ]),
            );

            const rlpEncoded = serializeTransaction({
              type: "deposit",
              sourceHash,
              from: first.args.from,
              to: parsed.isCreation ? undefined : first.args.to,
              mint: parsed.mint,
              value: parsed.value,
              gas: parsed.gas,
              isSystemTx: false,
              data: parsed.data,
            });
            const l2TxHash = keccak256(rlpEncoded);

            setDerivation({
              l2TxHash,
              txType: "0x7e",
              rlpEncoded,
              sourceHash,
              from: first.args.from,
              to: parsed.isCreation ? null : first.args.to ?? null,
              mint: parsed.mint,
              value: parsed.value,
              gas: parsed.gas,
              isSystemTx: false,
              data: parsed.data,
              isCreation: parsed.isCreation,
              domain: "userDeposit",
              depositIdHash,
              l1BlockHash: first.blockHash,
              l1LogIndex: first.logIndex,
              version: (first.args.version ?? BigInt(0)) as bigint,
              opaqueData: first.args.opaqueData,
            });
          }
        } catch {
          // best-effort: leave derivation null
        }
      }
    } catch {
      // best-effort: leave mint as null
    }

    let hashes: readonly `0x${string}`[];
    try {
      hashes = getL2TransactionHashes({ logs: portalLogs });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to derive L2 tx hash.",
      );
      return;
    }

    const hash = hashes[0] ?? null;
    if (!hash) {
      setError("No TransactionDeposited log found on the matched portal.");
      return;
    }

    setL2Hash(hash);
    setLoading(true);
    // NOTE: stay on "deposited" until the first probe actually fails with a
    // not-found error. Flipping to "wait-receive" up-front causes a warning
    // color flash on deposits that are already relayed (first probe resolves
    // so fast that the user briefly sees the orange wait state before the
    // green received state). Waiting for the first probe result avoids it.

    const client = createClient(l2Chain);
    let cancelled = false;

    // Pre-fetch L1 block timestamp so the relay duration can be shown
    // simultaneously with the "received" state (no second render delay).
    let l1Timestamp: bigint | null = null;
    if (l1Chain && receipt) {
      createClient(l1Chain)
        .getBlock({ blockNumber: receipt.blockNumber })
        .then((b) => {
          l1Timestamp = b.timestamp;
        })
        .catch(() => {});
    }

    const probe = async () => {
      try {
        const r = await client.getTransactionReceipt({ hash });
        if (cancelled) return;

        // Compute relay duration in the SAME tick as "received" so the
        // timer appears at the same time as the status change.
        let duration: number | null = null;
        if (l1Timestamp !== null) {
          try {
            const l2Block = await client.getBlock({
              blockNumber: r.blockNumber,
            });
            const diff = Number(l2Block.timestamp - l1Timestamp);
            if (diff >= 0) duration = diff;
          } catch {
            // non-critical
          }
        }

        if (cancelled) return;
        setL2Receipt(r);
        setStatus("received");
        if (duration !== null) setRelayDurationSeconds(duration);
        setError(null);
        setLoading(false);
        clearInterval(timer);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof TransactionReceiptNotFoundError) {
          // The L2 relay has not landed yet. Transition to wait-receive now
          // that we have confirmed the tx is not on-chain.
          setStatus((prev) => (prev === "received" ? prev : "wait-receive"));
          return;
        }
        // Transient RPC error. Surface it but keep polling.
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    void probe();
    const timer = setInterval(() => {
      void probe();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled, receipt, l2Chain, portalAddress]);

  return { status, l2Hash, l2Receipt, mint, opaque, derivation, relayDurationSeconds, loading, error };
}
