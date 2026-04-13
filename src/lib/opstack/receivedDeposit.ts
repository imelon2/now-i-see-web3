import type { Chain, Log } from "viem";
import { getSourceHash } from "viem/op-stack";
import { crossMessageChains, getL1Chain } from "@/lib/chains/chainList";
import type { TxInfo } from "@/types";
import { DEPOSIT_EVENT_TOPIC, type OpStackPortalEntry, getOpStackPortalEntries } from "./withdrawal";

// ─── Constants ────────────────────────────────────────────────────────────────

/** L1Block predeploy address on OP Stack L2 chains. */
const L1_BLOCK_ADDRESS = "0x4200000000000000000000000000000000000015";

/** Depositor account (system tx sender) — 20-byte canonical address. */
const DEPOSITOR_ADDRESS = "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001";

/** setL1BlockValuesJovian function selector. */
const JOVIAN_SELECTOR = "0x3db6be2b";

// ─── Detection ────────────────────────────────────────────────────────────────

export interface ReceivedDepositMatch {
  l2Chain: Chain;
  l1Chain: Chain;
  l1ChainId: number;
}

/**
 * Detects whether the given transaction is a "received" deposit on an OP Stack
 * L2 — i.e., a type-126 deposit transaction that was relayed from L1.
 *
 * Conditions:
 *   1. `txInfo.type` is `"deposit"` (viem maps type 126 → "deposit")
 *   2. The chain is in `crossMessageChains` (known OP Stack L2)
 *   3. A paired L1 chain exists via `getL1Chain()`
 *
 * Excludes system transactions (from === DEPOSITOR_ADDRESS) since those are
 * L1Block attribute deposits, not user deposits.
 */
export function detectReceivedDepositTx(
  txInfo: Pick<TxInfo, "type" | "from"> | null | undefined,
  chain: Chain | null | undefined,
): ReceivedDepositMatch | null {
  if (!txInfo || !chain) return null;
  if (txInfo.type !== "deposit") return null;

  // Must be a user deposit, not a system deposit (setL1BlockValues*)
  if (txInfo.from.toLowerCase() === DEPOSITOR_ADDRESS) return null;

  const isKnownL2 = crossMessageChains.some((c) => c.id === chain.id);
  if (!isKnownL2) return null;

  const l1Chain = getL1Chain(chain);
  if (!l1Chain) return null;

  return {
    l2Chain: chain,
    l1Chain,
    l1ChainId: l1Chain.id,
  };
}

// ─── L1 Block Info from System Tx ─────────────────────────────────────────────

export interface L1BlockInfo {
  l1BlockNumber: bigint;
  l1BlockHash: `0x${string}`;
  timestamp: bigint;
}

/**
 * Fetches the L1 block info from the `setL1BlockValuesJovian` system
 * transaction in the same L2 block.
 *
 * The system tx is always the first transaction in the block, sent by
 * `0xDeaD...0001` to the L1Block predeploy (`0x420...0015`).
 */
export async function fetchL1BlockFromSystemTx(
  l2Client: { getBlock: (args: { blockNumber: bigint; includeTransactions: true }) => Promise<{ timestamp: bigint; transactions: readonly { from: string; to: string | null; input: string }[] }> },
  blockNumber: bigint,
): Promise<(L1BlockInfo & { l2Timestamp: bigint }) | null> {
  const block = await l2Client.getBlock({
    blockNumber,
    includeTransactions: true,
  });

  for (const tx of block.transactions) {
    if (
      tx.from.toLowerCase() !== DEPOSITOR_ADDRESS ||
      tx.to?.toLowerCase() !== L1_BLOCK_ADDRESS
    ) continue;

    const input = tx.input.toLowerCase();
    if (!input.startsWith(JOVIAN_SELECTOR)) continue;

    // Decode packed calldata (no ABI encoding — raw byte packing)
    // Layout: selector(4) + baseFeeScalar(4) + blobBaseFeeScalar(4) +
    //         sequenceNumber(8) + timestamp(8) + number(8) + basefee(32) +
    //         blobBaseFee(32) + hash(32) + batcherHash(32) + ...
    if (input.length < 358) return null; // 178 bytes min

    const hex = input;
    const sliceBytes = (start: number, end: number) =>
      hex.slice(2 + start * 2, 2 + end * 2);

    const timestamp = BigInt("0x" + sliceBytes(20, 28));
    const l1BlockNumber = BigInt("0x" + sliceBytes(28, 36));
    const l1BlockHash = ("0x" + sliceBytes(100, 132)) as `0x${string}`;

    return { l1BlockNumber, l1BlockHash, timestamp, l2Timestamp: block.timestamp };
  }

  return null;
}

// ─── Original Deposit Matching ────────────────────────────────────────────────

export interface OriginalDepositInfo {
  l1TxHash: `0x${string}`;
  log: Log;
  l1LogIndex: number;
  l1BlockHash: `0x${string}`;
}

/**
 * Finds the original L1 deposit transaction that produced the given L2
 * deposit, by matching `sourceHash`.
 *
 * Steps:
 *   1. Fetch all `TransactionDeposited` logs from the L1 block for the
 *      portal address.
 *   2. For each log, compute `getSourceHash({ domain: "userDeposit",
 *      l1BlockHash, l1LogIndex })`.
 *   3. Compare against the target `sourceHash` from the L2 tx.
 */
export async function findOriginalDeposit(
  l1Client: { getLogs: (args: { fromBlock: bigint; toBlock: bigint; address: `0x${string}`; event: undefined; topics: [`0x${string}`] }) => Promise<Log[]> },
  l1BlockNumber: bigint,
  sourceHash: `0x${string}`,
  portalAddress: `0x${string}`,
): Promise<OriginalDepositInfo | null> {
  const logs = await l1Client.getLogs({
    fromBlock: l1BlockNumber,
    toBlock: l1BlockNumber,
    address: portalAddress,
    event: undefined,
    topics: [DEPOSIT_EVENT_TOPIC],
  });

  for (const log of logs) {
    if (!log.blockHash || typeof log.logIndex !== "number") continue;

    const computed = getSourceHash({
      domain: "userDeposit",
      l1BlockHash: log.blockHash,
      l1LogIndex: log.logIndex,
    });

    if (computed === sourceHash) {
      return {
        l1TxHash: log.transactionHash!,
        log,
        l1LogIndex: log.logIndex,
        l1BlockHash: log.blockHash,
      };
    }
  }

  return null;
}

/**
 * Gets the portal address for a known L2 chain → L1 chain pair.
 */
export function getPortalForL2Chain(
  l2Chain: Chain,
  l1ChainId: number,
): `0x${string}` | null {
  const entries = getOpStackPortalEntries();
  const entry = entries.find(
    (e: OpStackPortalEntry) => e.l2Chain.id === l2Chain.id && e.l1ChainId === l1ChainId,
  );
  return entry?.portalAddress ?? null;
}
