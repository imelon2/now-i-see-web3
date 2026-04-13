"use client";

import { useCallback, useRef, useState } from "react";
import { parseAbiItem, type Chain } from "viem";
import { createClient } from "@/lib/utils/viemClient";
import {
  L2_TO_L1_MESSAGE_PASSER,
  type WithdrawalTransactionTuple,
} from "@/lib/opstack/withdrawal";

const messagePassedEvent = parseAbiItem(
  "event MessagePassed(uint256 indexed nonce, address indexed sender, address indexed target, uint256 value, uint256 gasLimit, bytes data, bytes32 withdrawalHash)",
);

/** Max blocks to scan below the upper bound. ~7 days at 2s/block. */
const BLOCK_RANGE = BigInt(302_400);
/** Chunk size per getLogs call to avoid public RPC limits. */
const CHUNK_SIZE = BigInt(5_000);

export interface UseInitiateTxLookupInput {
  withdrawalTx: WithdrawalTransactionTuple | null;
  l2UpperBlockHash: `0x${string}` | null;
  l2Chain: Chain | null;
  enabled: boolean;
}

export interface UseInitiateTxLookupResult {
  initiateTxHash: `0x${string}` | null;
  loading: boolean;
  error: string | null;
  lookup: () => Promise<`0x${string}` | null>;
}

/**
 * Lazy reverse-lookup hook: finds the L2 initiate withdrawal tx from a
 * prove or finalize tx on L1.
 *
 * Pipeline:
 *   1. Get L2 upper-bound block number from latestBlockhash (prove) or latest block (finalize)
 *   2. Search MessagePassed event by nonce on L2ToL1MessagePasser in [upper - 100k, upper]
 *   3. Return the initiate tx hash
 */
export function useInitiateTxLookup(
  input: UseInitiateTxLookupInput,
): UseInitiateTxLookupResult {
  const { withdrawalTx, l2UpperBlockHash, l2Chain, enabled } = input;

  const [initiateTxHash, setInitiateTxHash] = useState<`0x${string}` | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef(false);

  const lookup = useCallback(async (): Promise<`0x${string}` | null> => {
    if (!enabled || !withdrawalTx || !l2Chain) return null;
    if (runningRef.current) return null;

    runningRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const l2Client = createClient(l2Chain);

      // Step 1: Determine upper bound block number
      let upperBlock: bigint;
      if (l2UpperBlockHash) {
        const block = await l2Client.getBlock({ blockHash: l2UpperBlockHash });
        upperBlock = block.number;
      } else {
        const block = await l2Client.getBlock({ blockTag: "latest" });
        upperBlock = block.number;
      }

      // Step 2: Compute total scan range
      const lowerBlock = upperBlock > BLOCK_RANGE ? upperBlock - BLOCK_RANGE : BigInt(0);

      // Step 3: Search MessagePassed event by nonce in chunks (newest → oldest)
      let cursor = upperBlock;
      while (cursor > lowerBlock) {
        const chunkFrom = cursor > CHUNK_SIZE ? cursor - CHUNK_SIZE : BigInt(0);
        const from = chunkFrom > lowerBlock ? chunkFrom : lowerBlock;

        const logs = await l2Client.getLogs({
          address: L2_TO_L1_MESSAGE_PASSER as `0x${string}`,
          event: messagePassedEvent,
          args: { nonce: withdrawalTx.nonce },
          fromBlock: from,
          toBlock: cursor,
        });

        if (logs.length > 0) {
          const matched = logs[0];
          if (!matched.transactionHash) {
            setError("Initiate transaction event found but missing transaction hash.");
            setLoading(false);
            runningRef.current = false;
            return null;
          }

          setInitiateTxHash(matched.transactionHash);
          setLoading(false);
          setError(null);
          runningRef.current = false;
          return matched.transactionHash;
        }

        cursor = from > BigInt(0) ? from - BigInt(1) : BigInt(0);
        if (from === BigInt(0)) break;
      }

      setError("Initiate transaction not found in the expected L2 block range. Details: Only initiate transactions within the last ~7 days can be found.");
      setLoading(false);
      runningRef.current = false;
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to look up initiate transaction.");
      setLoading(false);
      runningRef.current = false;
      return null;
    }
  }, [enabled, withdrawalTx, l2UpperBlockHash, l2Chain]);

  return { initiateTxHash, loading, error, lookup };
}
