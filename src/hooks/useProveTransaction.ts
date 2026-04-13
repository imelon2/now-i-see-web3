"use client";

import { useCallback, useState } from "react";
import { type Chain, type TransactionReceipt, createPublicClient, http } from "viem";
import { type GetWithdrawalStatusReturnType, getWithdrawals } from "viem/op-stack";
import { portal2Abi } from "@/lib/utils/abi";
import { getL1Chain } from "@/lib/chains/chainList";

const PROVE_STATUSES: GetWithdrawalStatusReturnType[] = [
  "waiting-to-finalize",
  "ready-to-finalize",
  "finalized",
];

async function findBlockByTimestamp(
  client: ReturnType<typeof createPublicClient>,
  targetTimestamp: bigint,
): Promise<bigint> {
  const latest = await client.getBlock({ blockTag: "latest" });
  let lo = BigInt(0);
  let hi = latest.number;

  while (lo < hi) {
    const mid = (lo + hi) / BigInt(2);
    const block = await client.getBlock({ blockNumber: mid });
    if (block.timestamp < targetTimestamp) {
      lo = mid + BigInt(1);
    } else {
      hi = mid;
    }
  }

  return lo;
}

export function useProveTransaction({
  receipt,
  l2Chain,
  withdrawalStatus,
}: {
  receipt: TransactionReceipt | null;
  l2Chain: Chain | null;
  withdrawalStatus: GetWithdrawalStatusReturnType | null;
}) {
  const [proveTxHash, setProveTxHash] = useState<`0x${string}` | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (): Promise<`0x${string}` | null> => {
    if (!receipt || !l2Chain || !withdrawalStatus) return null;
    if (!PROVE_STATUSES.includes(withdrawalStatus)) return null;

    const l1Chain = getL1Chain(l2Chain);
    if (!l1Chain) return null;

    const portalContracts = (l2Chain as unknown as { contracts?: { portal?: Record<number, { address: `0x${string}` }> } }).contracts?.portal;
    const portalAddress = portalContracts?.[l1Chain.id]?.address;
    if (!portalAddress) return null;

    setLoading(true);
    setError(null);
    setProveTxHash(null);

    try {
      const l1Client = createPublicClient({ chain: l1Chain, transport: http() });

      // Step 1: Extract withdrawalHash from receipt
      const withdrawals = getWithdrawals({ logs: receipt.logs });
      if (withdrawals.length === 0) {
        setError("No withdrawal data found in the receipt.");
        return null;
      }
      const { withdrawalHash } = withdrawals[0];

      // Step 2a: Get number of proof submitters
      const numProofSubmitters = await l1Client.readContract({
        abi: portal2Abi,
        address: portalAddress,
        functionName: "numProofSubmitters",
        args: [withdrawalHash],
      }).catch(() => BigInt(1)) as bigint;

      if (numProofSubmitters === BigInt(0)) {
        setError("This withdrawal has not been proved yet.");
        return null;
      }

      // Step 2b: Get the latest proof submitter
      const proofSubmitter = await l1Client.readContract({
        abi: portal2Abi,
        address: portalAddress,
        functionName: "proofSubmitters",
        args: [withdrawalHash, numProofSubmitters - BigInt(1)],
      }).catch(() => undefined) as `0x${string}` | undefined;

      if (!proofSubmitter) {
        setError("Failed to retrieve proof submitter address.");
        return null;
      }

      // Step 2c: Get prove timestamp
      const [, proveTimestamp] = await l1Client.readContract({
        abi: portal2Abi,
        address: portalAddress,
        functionName: "provenWithdrawals",
        args: [withdrawalHash, proofSubmitter],
      }) as [string, bigint];

      if (proveTimestamp === BigInt(0)) {
        setError("provenWithdrawals was called but no record was found.");
        return null;
      }

      // Step 3: Find block number by proveTimestamp
      const proveBlock = await findBlockByTimestamp(l1Client, proveTimestamp);

      // Step 4: Search WithdrawalProven event in +-495 block range (max 990 total)
      const latestBlock = await l1Client.getBlock({ blockTag: "latest" });
      const fromBlock = proveBlock > BigInt(495) ? proveBlock - BigInt(495) : BigInt(0);
      const toBlock = proveBlock + BigInt(495) > latestBlock.number ? latestBlock.number : proveBlock + BigInt(495);

      const logs = await l1Client.getLogs({
        address: portalAddress,
        event: {
          type: "event",
          name: "WithdrawalProven",
          inputs: [
            { type: "bytes32", name: "withdrawalHash", indexed: true },
            { type: "address", name: "from", indexed: true },
            { type: "address", name: "to", indexed: true },
          ],
        },
        args: {
          withdrawalHash,
        },
        fromBlock,
        toBlock,
      });

      if (logs.length === 0) {
        setError("WithdrawalProven event not found.");
        return null;
      }

      // When multiple proofs exist, pick the log closest to proveTimestamp block
      const targetLog = logs.length === 1
        ? logs[0]
        : logs.reduce((closest, log) => {
            const closestDist = closest.blockNumber
              ? (closest.blockNumber > proveBlock ? closest.blockNumber - proveBlock : proveBlock - closest.blockNumber)
              : proveBlock;
            const logDist = log.blockNumber
              ? (log.blockNumber > proveBlock ? log.blockNumber - proveBlock : proveBlock - log.blockNumber)
              : proveBlock;
            return logDist < closestDist ? log : closest;
          });

      setProveTxHash(targetLog.transactionHash);
      return targetLog.transactionHash ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to look up prove transaction.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [receipt, l2Chain, withdrawalStatus]);

  return { proveTxHash, loading, error, lookup };
}
