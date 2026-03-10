import {
  decodeFunctionData,
  decodeEventLog,
  type Abi,
  type Log,
} from "viem";
import type { AbiItem, DecodedCalldata, DecodedEvent, DecodedError, DecodedParam, DecodedEventParam } from "@/types";
import { fetchAbiBySelector } from "./abiArchive";
import { extractSelector } from "./hex";

/** Recursively expands tuple types to their component types (e.g. tuple[] → (address,uint256,...)[])  */
interface AbiInputLike {
  type: string;
  components?: readonly AbiInputLike[];
}

function expandType(input: AbiInputLike): string {
  if (input.type === "tuple" || input.type.startsWith("tuple[")) {
    const inner = (input.components ?? []).map(expandType).join(",");
    const suffix = input.type.slice("tuple".length); // "", "[]", "[5]", etc.
    return `(${inner})${suffix}`;
  }
  return input.type;
}

function formatValue(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(formatValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, formatValue(v)])
    );
  }
  return value;
}

// ─── Calldata decoding ────────────────────────────────────────────────────────────

export async function decodeCalldata(
  calldata: string
): Promise<DecodedCalldata | null> {
  const selector = extractSelector(calldata);
  if (!selector) return null;

  const abiItems = await fetchAbiBySelector(selector, "function");
  if (!abiItems || abiItems.length === 0) return null;

  const abi = abiItems as Abi;

  try {
    const { functionName, args } = decodeFunctionData({ abi, data: calldata as `0x${string}` });

    const matchedFn = abiItems.find(
      (item) => item.type === "function" && item.name === functionName
    ) as Extract<AbiItem, { type: "function" }> | undefined;

    const inputs = matchedFn?.inputs ?? [];
    const params: DecodedParam[] = inputs.map((input, i) => ({
      name: input.name ?? `arg${i}`,
      type: input.type,
      value: formatValue(args?.[i]),
    }));

    const signature = matchedFn
      ? `${functionName}(${inputs.map(expandType).join(",")})`
      : functionName;

    return {
      functionName,
      signature,
      params,
      rawCalldata: calldata,
    };
  } catch {
    return null;
  }
}

// ─── Event log decoding ─────────────────────────────────────────────────────────

export async function decodeLog(log: Log): Promise<DecodedEvent | null> {
  const topic0 = log.topics?.[0];
  if (!topic0) return null;

  const abiItems = await fetchAbiBySelector(topic0, "event");
  if (!abiItems || abiItems.length === 0) return null;

  const eventItems = abiItems.filter((item) => item.type === "event");
  if (eventItems.length === 0) return null;

  const abi = eventItems as Abi;

  try {
    const decoded = decodeEventLog({
      abi,
      data: (log.data ?? "0x") as `0x${string}`,
      topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      strict: false,
    });

    const matchedEvent = abiItems.find(
      (item) => item.type === "event" && item.name === decoded.eventName
    ) as Extract<AbiItem, { type: "event" }> | undefined;

    const inputs = matchedEvent?.inputs ?? [];
    const params: DecodedEventParam[] = inputs.map((input, i) => ({
      name: input.name ?? `arg${i}`,
      type: input.type,
      indexed: "indexed" in input ? (input.indexed ?? false) : false,
      value: formatValue((decoded.args as unknown as Record<string, unknown>)?.[input.name ?? `arg${i}`] ?? (decoded.args as unknown as unknown[])?.[i]),
    }));

    const eventName = decoded.eventName ?? "";
    const signature = matchedEvent
      ? `${eventName}(${inputs.map(expandType).join(",")})`
      : eventName;

    return {
      eventName,
      signature,
      params,
      address: log.address ?? "",
      rawTopics: [...(log.topics ?? [])] as string[],
      rawData: log.data as string,
    };
  } catch (err) {
    console.error("[decodeLog] failed:", topic0, err);
    return null;
  }
}

// ─── Error decoding ───────────────────────────────────────────────────────────────

export type ErrorDecodeResult =
  | { status: "success"; data: DecodedError }
  | { status: "no-abi" }
  | { status: "decode-failed" };

export async function decodeError(
  errorData: string
): Promise<ErrorDecodeResult> {
  const selector = extractSelector(errorData);
  if (!selector) return { status: "no-abi" };
  
  // Error ABI uses the same path as function
  const abiItems = await fetchAbiBySelector(selector, "error");
  if (!abiItems || abiItems.length === 0) return { status: "no-abi" };

  // Filter error-type items only
  const errorItems = abiItems.filter((item) => item.type === "error");
  if (errorItems.length === 0) return { status: "no-abi" };

  const { decodeErrorResult } = await import("viem");
  const abi = errorItems as Abi;

  try {
    const { errorName, args } = decodeErrorResult({
      abi,
      data: errorData as `0x${string}`,
    });

    const matchedError = errorItems.find(
      (item) => item.type === "error" && item.name === errorName
    ) as { type: "error"; name: string; inputs: { name?: string; type: string }[] } | undefined;

    const inputs = matchedError?.inputs ?? [];
    const params: DecodedParam[] = inputs.map((input, i) => ({
      name: input.name ?? `arg${i}`,
      type: input.type,
      value: formatValue(args?.[i]),
    }));

    const signature = matchedError
      ? `${errorName}(${inputs.map((i) => i.type).join(",")})`
      : errorName;

    return {
      status: "success",
      data: { errorName, signature, params, rawData: errorData },
    };
  } catch {
    return { status: "decode-failed" };
  }
}
