import type { Abi } from "viem";

// ─── ABI Archive ───────────────────────────────────────────────────────────────

// Element type of viem Abi array (function | event | error | constructor | fallback | receive)
export type AbiItem = Abi[number];

// ─── Transaction ───────────────────────────────────────────────────────────────

export interface TxInfo {
  hash: string;
  chainName: string;
  chainId: number | undefined;
  status: "success" | "reverted" | "pending" | null;
  blockNumber: bigint | null;
  blockHash: string | null;
  timestamp: bigint | null;
  from: string;
  to: string | null;
  value: bigint;
  gasPrice: bigint | null;
  gasUsed: bigint | null;
  nonce: number;
  input: string;
}

// ─── Decoded Calldata ──────────────────────────────────────────────────────────

export interface DecodedParam {
  name: string;
  type: string;
  value: unknown;
}

export interface DecodedCalldata {
  functionName: string;
  signature: string;
  params: DecodedParam[];
  rawCalldata: string;
}

// ─── Decoded Event ─────────────────────────────────────────────────────────────

export interface DecodedEventParam extends DecodedParam {
  indexed: boolean;
}

export interface DecodedEvent {
  eventName: string;
  signature: string;
  params: DecodedEventParam[];
  address: string;
  rawTopics: string[];
  rawData: string;
}

// ─── Decoded Error ─────────────────────────────────────────────────────────────

export interface DecodedError {
  errorName: string;
  signature: string;
  params: DecodedParam[];
  rawData: string;
}

// ─── Dashboard Widgets ─────────────────────────────────────────────────────────

export type WidgetType =
  | "transaction-search"
  | "decoded-calldata"
  | "raw-calldata"
  | "event-log"
  | "error-decoder";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  label: string;
}
