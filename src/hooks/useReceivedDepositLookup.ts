"use client";

import { useCallback, useRef, useState } from "react";
import {
  concat,
  keccak256,
  pad,
  toHex,
  type Chain,
} from "viem";
import {
  extractTransactionDepositedLogs,
  getSourceHash,
  opaqueDataToDepositData,
  serializeTransaction,
} from "viem/op-stack";
import { createClient } from "@/lib/utils/viemClient";
import {
  fetchL1BlockFromSystemTx,
  findOriginalDeposit,
  getPortalForL2Chain,
} from "@/lib/opstack/receivedDeposit";
import type { DepositDerivation, DepositOpaque } from "./useDepositStatus";

export interface UseReceivedDepositLookupInput {
  sourceHash: `0x${string}` | null;
  l2BlockNumber: bigint | null;
  l2Chain: Chain | null;
  l1Chain: Chain | null;
  enabled: boolean;
}

export interface UseReceivedDepositLookupResult {
  l1TxHash: `0x${string}` | null;
  portalAddress: `0x${string}` | null;
  derivation: DepositDerivation | null;
  opaque: DepositOpaque | null;
  mint: bigint | null;
  relayDurationSeconds: number | null;
  loading: boolean;
  error: string | null;
  /** Trigger the reverse lookup manually. Returns the L1 tx hash on success. */
  lookup: () => Promise<`0x${string}` | null>;
}

/**
 * Lazy reverse-lookup hook: given a "received" deposit tx on L2 (type 126),
 * traces back to the original L1 deposit transaction on demand.
 *
 * Does NOT auto-run. Call `lookup()` to trigger the search.
 */
export function useReceivedDepositLookup(
  input: UseReceivedDepositLookupInput,
): UseReceivedDepositLookupResult {
  const { sourceHash, l2BlockNumber, l2Chain, l1Chain, enabled } = input;

  const [l1TxHash, setL1TxHash] = useState<`0x${string}` | null>(null);
  const [portalAddress, setPortalAddress] = useState<`0x${string}` | null>(null);
  const [derivation, setDerivation] = useState<DepositDerivation | null>(null);
  const [opaque, setOpaque] = useState<DepositOpaque | null>(null);
  const [mint, setMint] = useState<bigint | null>(null);
  const [relayDurationSeconds, setRelayDurationSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef(false);

  const lookup = useCallback(async (): Promise<`0x${string}` | null> => {
    if (!enabled || !sourceHash || !l2BlockNumber || !l2Chain || !l1Chain) return null;
    if (runningRef.current) return null;

    const portal = getPortalForL2Chain(l2Chain, l1Chain.id);
    if (!portal) {
      setError("Could not find portal address for this L2 chain.");
      return null;
    }

    runningRef.current = true;
    setPortalAddress(portal);
    setLoading(true);
    setError(null);

    try {
      const l2Client = createClient(l2Chain);
      const l1Client = createClient(l1Chain);

      // Step 1: Get L1 block info from system tx
      const l1Info = await fetchL1BlockFromSystemTx(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        l2Client as any,
        l2BlockNumber,
      );

      if (!l1Info) {
        setError("Could not extract L1 block info from the system transaction in this L2 block.");
        setLoading(false);
        runningRef.current = false;
        return null;
      }

      // Step 2: Find original deposit on L1 by sourceHash
      const original = await findOriginalDeposit(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        l1Client as any,
        l1Info.l1BlockNumber,
        sourceHash,
        portal,
      );

      if (!original) {
        setError("Could not find the original deposit event on L1.");
        setLoading(false);
        runningRef.current = false;
        return null;
      }

      setL1TxHash(original.l1TxHash);

      // Step 3: Reconstruct derivation + opaque
      try {
        const extracted = extractTransactionDepositedLogs({ logs: [original.log] });
        const first = extracted[0];
        if (first?.args?.opaqueData && first.args.from) {
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

          const depositIdHash = keccak256(
            concat([
              original.l1BlockHash,
              pad(toHex(original.l1LogIndex), { size: 32 }),
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
            l1BlockHash: original.l1BlockHash,
            l1LogIndex: original.l1LogIndex,
            version: (first.args.version ?? BigInt(0)) as bigint,
            opaqueData: first.args.opaqueData,
          });
        }
      } catch {
        // best-effort
      }

      // Step 4: Relay duration
      const diff = Number(l1Info.l2Timestamp - l1Info.timestamp);
      if (diff >= 0) setRelayDurationSeconds(diff);

      setLoading(false);
      setError(null);
      runningRef.current = false;
      return original.l1TxHash;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to look up the original deposit.");
      setLoading(false);
      runningRef.current = false;
      return null;
    }
  }, [enabled, sourceHash, l2BlockNumber, l2Chain, l1Chain]);

  return { l1TxHash, portalAddress, derivation, opaque, mint, relayDurationSeconds, loading, error, lookup };
}
