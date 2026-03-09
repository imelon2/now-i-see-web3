import type { AbiFunction, AbiEvent } from "viem";

// ─── ABI Archive ───────────────────────────────────────────────────────────────

export type AbiItem = AbiFunction | AbiEvent;

// ─── Transaction ───────────────────────────────────────────────────────────────

export interface TxInfo {
  hash: string;
  from: string;
  to: string | null;
  value: bigint;
  nonce: number;
  blockNumber: bigint | null;
  status: "success" | "reverted" | "pending" | null;
  input: string;
  chainName: string;
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
