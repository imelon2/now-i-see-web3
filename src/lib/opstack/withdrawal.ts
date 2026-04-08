import {
  decodeFunctionData,
  encodeAbiParameters,
  keccak256,
  parseAbi,
  type Chain,
  type TransactionReceipt,
} from "viem";
import { type GetWithdrawalStatusReturnType, getWithdrawals } from "viem/op-stack";
import { crossMessageChains } from "@/lib/chains/chainList";
import type { TxInfo } from "@/types";

// L2ToL1MessagePasser predeploy
export const L2_TO_L1_MESSAGE_PASSER = "0x4200000000000000000000000000000000000016";

// keccak256("initiateWithdrawal(address,uint256,bytes)")[:4]
export const WITHDRAWAL_SELECTOR = "0xc2b3e5ac";

// Selectors for L1 OptimismPortal calls
export const PROVE_WITHDRAWAL_SELECTOR = "0x4870496f";
export const FINALIZE_WITHDRAWAL_SELECTOR = "0x8c3152e9";

export type WithdrawalTxOrigin = "initiate" | "prove" | "finalize";

export interface OpStackPortalEntry {
  l2Chain: Chain;
  l1ChainId: number;
  portalAddress: `0x${string}`;
}

/**
 * Build the (L1 chainId, portalAddress) → L2 chain reverse map from
 * `crossMessageChains`. Each L2 chain in the allowlist exposes its portal
 * proxy address keyed by the paired L1 chain id (viem chain config).
 */
export function getOpStackPortalEntries(): OpStackPortalEntry[] {
  const out: OpStackPortalEntry[] = [];
  for (const l2 of crossMessageChains) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portals = (l2 as any).contracts?.portal as
      | Record<number, { address: `0x${string}` }>
      | undefined;
    if (!portals) continue;
    for (const [l1IdStr, contract] of Object.entries(portals)) {
      out.push({
        l2Chain: l2 as Chain,
        l1ChainId: Number(l1IdStr),
        portalAddress: (contract.address.toLowerCase() as `0x${string}`),
      });
    }
  }
  return out;
}

function detectByPortalSelector(
  txInfo: Pick<TxInfo, "to" | "input"> | null | undefined,
  chain: Chain | null | undefined,
  selector: string,
): { l2Chain: Chain; portalAddress: `0x${string}` } | null {
  if (!txInfo || !chain) return null;
  const to = txInfo.to?.toLowerCase() ?? "";
  if (!to) return null;
  const input = txInfo.input?.toLowerCase() ?? "";
  if (!input.startsWith(selector)) return null;
  for (const e of getOpStackPortalEntries()) {
    if (e.l1ChainId !== chain.id) continue;
    if (e.portalAddress !== to) continue;
    return { l2Chain: e.l2Chain, portalAddress: e.portalAddress };
  }
  return null;
}

/**
 * Detects an L1 OptimismPortal.proveWithdrawalTransaction call. Returns the
 * paired L2 chain when matched, otherwise null.
 */
export function detectOpStackProveTx(
  txInfo: Pick<TxInfo, "to" | "input"> | null | undefined,
  chain: Chain | null | undefined,
) {
  return detectByPortalSelector(txInfo, chain, PROVE_WITHDRAWAL_SELECTOR);
}

/**
 * Detects an L1 OptimismPortal.finalizeWithdrawalTransaction call. Returns
 * the paired L2 chain when matched, otherwise null.
 */
export function detectOpStackFinalizeTx(
  txInfo: Pick<TxInfo, "to" | "input"> | null | undefined,
  chain: Chain | null | undefined,
) {
  return detectByPortalSelector(txInfo, chain, FINALIZE_WITHDRAWAL_SELECTOR);
}

const proveAbi = parseAbi([
  "function proveWithdrawalTransaction((uint256 nonce, address sender, address target, uint256 value, uint256 gasLimit, bytes data) _tx, uint256 _l2OutputIndex, (bytes32 version, bytes32 stateRoot, bytes32 messagePasserStorageRoot, bytes32 latestBlockhash) _outputRootProof, bytes[] _withdrawalProof)",
]);

export interface WithdrawalTransactionTuple {
  nonce: bigint;
  sender: `0x${string}`;
  target: `0x${string}`;
  value: bigint;
  gasLimit: bigint;
  data: `0x${string}`;
}

/** Decodes the WithdrawalTransaction tuple from a proveWithdrawalTransaction calldata. */
export function parseProveTxCalldata(
  input: `0x${string}` | string,
): WithdrawalTransactionTuple | null {
  try {
    const decoded = decodeFunctionData({
      abi: proveAbi,
      data: input as `0x${string}`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tuple = (decoded.args as any)[0];
    return {
      nonce: tuple.nonce as bigint,
      sender: tuple.sender as `0x${string}`,
      target: tuple.target as `0x${string}`,
      value: tuple.value as bigint,
      gasLimit: tuple.gasLimit as bigint,
      data: tuple.data as `0x${string}`,
    };
  } catch {
    return null;
  }
}

/**
 * Computes the canonical OP Stack withdrawal hash from a WithdrawalTransaction
 * tuple. Mirrors `Hashing.hashWithdrawal` in the OP Stack contracts:
 *   keccak256(abi.encode(nonce, sender, target, value, gasLimit, data))
 *
 * NOTE: encoded as **flat parameters**, not as a wrapped tuple. The two
 * differ when any field is dynamic (e.g. `bytes`), so wrapping would yield
 * a different hash than the on-chain definition.
 */
export function computeWithdrawalHash(tx: WithdrawalTransactionTuple): `0x${string}` {
  const encoded = encodeAbiParameters(
    [
      { type: "uint256" },
      { type: "address" },
      { type: "address" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "bytes" },
    ],
    [tx.nonce, tx.sender, tx.target, tx.value, tx.gasLimit, tx.data],
  );
  return keccak256(encoded);
}

/** Minimal portal ABI fragment for direct status reads. */
export const portalReadAbi = parseAbi([
  "function finalizedWithdrawals(bytes32) view returns (bool)",
]);

export const STATUS_LABELS: Record<GetWithdrawalStatusReturnType, string> = {
  "waiting-to-prove": "Waiting to Prove",
  "ready-to-prove": "Ready to Prove",
  "waiting-to-finalize": "Waiting to Finalize",
  "ready-to-finalize": "Ready to Finalize",
  finalized: "Finalized",
};

export const STATUS_PHASE: Record<GetWithdrawalStatusReturnType, number> = {
  "waiting-to-prove": 1,
  "ready-to-prove": 1,
  "waiting-to-finalize": 2,
  "ready-to-finalize": 2,
  finalized: 3,
};

export const STATUS_DESCRIPTIONS: Record<
  GetWithdrawalStatusReturnType,
  { text: string; color: string; icon: "info" | "action" | "check" }
> = {
  "waiting-to-prove": {
    text: "Waiting for the dispute game window. The withdrawal will be provable once the challenge period passes.",
    color: "var(--warning)",
    icon: "info",
  },
  "ready-to-prove": {
    text: "The challenge period has passed. This withdrawal can now be proved on L1.",
    color: "var(--accent)",
    icon: "action",
  },
  "waiting-to-finalize": {
    text: "Withdrawal has been proved. Waiting for the finalization period to complete.",
    color: "var(--warning)",
    icon: "info",
  },
  "ready-to-finalize": {
    text: "Finalization period complete. This withdrawal can now be finalized on L1.",
    color: "var(--accent)",
    icon: "action",
  },
  finalized: {
    text: "Withdrawal has been finalized and funds have been released on L1.",
    color: "var(--success)",
    icon: "check",
  },
};

/**
 * Returns true when a transaction is an OP Stack L2→L1 withdrawal initiate call
 * on a supported L2 chain (optimism / optimism-sepolia).
 *
 * Conditions (all must hold):
 *   1. Chain is in `crossMessageChains` (L2 allowlist)
 *   2. tx.to (lowercased) === L2ToL1MessagePasser predeploy
 *   3. tx.input (lowercased) starts with the initiateWithdrawal selector
 */
export function isOpStackWithdrawalTx(
  txInfo: Pick<TxInfo, "to" | "input" | "chainId"> | null | undefined,
  chain: Chain | null | undefined,
): boolean {
  if (!txInfo || !chain) return false;
  const allowed = crossMessageChains.some((c) => c.id === chain.id);
  if (!allowed) return false;
  const to = txInfo.to?.toLowerCase() ?? "";
  if (to !== L2_TO_L1_MESSAGE_PASSER) return false;
  const input = txInfo.input?.toLowerCase() ?? "";
  return input.startsWith(WITHDRAWAL_SELECTOR);
}

export interface InitiateData {
  withdrawalHash: `0x${string}`;
  sender: `0x${string}`;
  target: `0x${string}`;
  value: bigint;
  gasLimit: bigint;
  data: `0x${string}`;
  nonce: bigint;
  msgNonce: bigint;
  version: bigint;
}

/**
 * Parse the MessagePassed event from a withdrawal receipt.
 * Decodes the versioned nonce: version = nonce >> 240, msgNonce = nonce & ((1<<240)-1).
 */
export function parseInitiateData(
  receipt: TransactionReceipt | null | undefined,
): InitiateData | null {
  if (!receipt) return null;
  const withdrawals = getWithdrawals({ logs: receipt.logs });
  if (withdrawals.length === 0) return null;
  const w = withdrawals[0];
  const nonceBig = BigInt(w.nonce.toString());
  const version = nonceBig >> BigInt(240);
  const mask = (BigInt(1) << BigInt(240)) - BigInt(1);
  const msgNonce = nonceBig & mask;
  return {
    withdrawalHash: w.withdrawalHash,
    sender: w.sender,
    target: w.target,
    value: w.value,
    gasLimit: w.gasLimit,
    data: w.data,
    nonce: nonceBig,
    msgNonce,
    version,
  };
}
