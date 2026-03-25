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

// ─── Calldata decoding (all variants) ────────────────────────────────────────────

export async function decodeCalldataAll(
  calldata: string
): Promise<DecodedCalldata[]> {
  const selector = extractSelector(calldata);
  if (!selector) return [];

  const abiItems = await fetchAbiBySelector(selector, "function");
  if (!abiItems || abiItems.length === 0) return [];

  const results: DecodedCalldata[] = [];

  for (const item of abiItems) {
    if (item.type !== "function") continue;
    try {
      const { functionName, args } = decodeFunctionData({
        abi: [item] as Abi,
        data: calldata as `0x${string}`,
      });
      const inputs = "inputs" in item ? (item.inputs ?? []) : [];
      const params: DecodedParam[] = inputs.map((input, i) => ({
        name: input.name ?? `arg${i}`,
        type: input.type,
        value: formatValue(args?.[i]),
      }));
      const signature = `${functionName}(${inputs.map(expandType).join(",")})`;
      results.push({ functionName, signature, params, rawCalldata: calldata });
    } catch {
      // skip this variant
    }
  }

  return results;
}

// ─── Event log decoding (all variants) ───────────────────────────────────────────

export async function decodeLogAll(log: Log): Promise<DecodedEvent[]> {
  const topic0 = log.topics?.[0];
  if (!topic0) return [];

  const abiItems = await fetchAbiBySelector(topic0, "event");
  if (!abiItems || abiItems.length === 0) return [];

  const eventItems = abiItems.filter((item) => item.type === "event");
  if (eventItems.length === 0) return [];

  const results: DecodedEvent[] = [];

  for (const item of eventItems) {
    try {
      const decoded = decodeEventLog({
        abi: [item] as Abi,
        data: (log.data ?? "0x") as `0x${string}`,
        topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
        strict: false,
      });

      const inputs = "inputs" in item ? (item.inputs ?? []) : [];
      const params: DecodedEventParam[] = inputs.map((input, i) => ({
        name: input.name ?? `arg${i}`,
        type: input.type,
        indexed: "indexed" in input ? (input.indexed ?? false) : false,
        value: formatValue(
          (decoded.args as unknown as Record<string, unknown>)?.[input.name ?? `arg${i}`] ??
            (decoded.args as unknown as unknown[])?.[i]
        ),
      }));

      const eventName = decoded.eventName ?? "";
      const signature = `${eventName}(${inputs.map(expandType).join(",")})`;

      results.push({
        eventName,
        signature,
        params,
        address: log.address ?? "",
        rawTopics: [...(log.topics ?? [])] as string[],
        rawData: log.data as string,
      });
    } catch {
      // skip this variant
    }
  }

  return results;
}

// ─── Error decoding ───────────────────────────────────────────────────────────────

export type ErrorDecodeResult =
  | { status: "success"; data: DecodedError }
  | { status: "no-abi" }
  | { status: "decode-failed" };

// Built-in EVM error selectors (no ABI lookup needed)
const STANDARD_ERROR_SELECTOR = "0x08c379a0"; // Error(string)
const PANIC_SELECTOR = "0x4e487b71";           // Panic(uint256)

export async function decodeError(
  errorData: string
): Promise<ErrorDecodeResult> {
  const selector = extractSelector(errorData);
  if (!selector) return { status: "no-abi" };

  const { decodeAbiParameters } = await import("viem");

  // Case 1: Standard revert — Error(string)
  if (selector.toLowerCase() === STANDARD_ERROR_SELECTOR) {
    try {
      const encoded = `0x${errorData.slice(10)}` as `0x${string}`;
      const [message] = decodeAbiParameters([{ type: "string" }], encoded);
      return {
        status: "success",
        data: {
          errorName: "Error",
          signature: "Error(string)",
          params: [{ name: "message", type: "string", value: String(message) }],
          rawData: errorData,
        },
      };
    } catch {
      return { status: "decode-failed" };
    }
  }

  // Case 2: Panic(uint256)
  if (selector.toLowerCase() === PANIC_SELECTOR) {
    try {
      const encoded = `0x${errorData.slice(10)}` as `0x${string}`;
      const [code] = decodeAbiParameters([{ type: "uint256" }], encoded);
      return {
        status: "success",
        data: {
          errorName: "Panic",
          signature: "Panic(uint256)",
          params: [{ name: "code", type: "uint256", value: formatValue(code) }],
          rawData: errorData,
        },
      };
    } catch {
      return { status: "decode-failed" };
    }
  }

  // Case 3: Custom error — look up ABI archive
  const abiItems = await fetchAbiBySelector(selector, "error");
  if (!abiItems || abiItems.length === 0) return { status: "no-abi" };

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

// ─── Error decoding (all variants) ────────────────────────────────────────────────

export interface DecodeErrorAllResult {
  results: DecodedError[];
  failureReason?: "no-abi" | "decode-failed";
}

export async function decodeErrorAll(
  errorData: string
): Promise<DecodeErrorAllResult> {
  const selector = extractSelector(errorData);
  if (!selector) return { results: [], failureReason: "no-abi" };

  const { decodeAbiParameters } = await import("viem");

  // Standard Error(string)
  if (selector.toLowerCase() === STANDARD_ERROR_SELECTOR) {
    try {
      const encoded = `0x${errorData.slice(10)}` as `0x${string}`;
      const [message] = decodeAbiParameters([{ type: "string" }], encoded);
      return {
        results: [
          {
            errorName: "Error",
            signature: "Error(string)",
            params: [{ name: "message", type: "string", value: String(message) }],
            rawData: errorData,
          },
        ],
      };
    } catch {
      return { results: [], failureReason: "decode-failed" };
    }
  }

  // Panic(uint256)
  if (selector.toLowerCase() === PANIC_SELECTOR) {
    try {
      const encoded = `0x${errorData.slice(10)}` as `0x${string}`;
      const [code] = decodeAbiParameters([{ type: "uint256" }], encoded);
      return {
        results: [
          {
            errorName: "Panic",
            signature: "Panic(uint256)",
            params: [{ name: "code", type: "uint256", value: formatValue(code) }],
            rawData: errorData,
          },
        ],
      };
    } catch {
      return { results: [], failureReason: "decode-failed" };
    }
  }

  // Custom errors — try each ABI item individually
  const abiItems = await fetchAbiBySelector(selector, "error");
  if (!abiItems || abiItems.length === 0) return { results: [], failureReason: "no-abi" };

  const errorItems = abiItems.filter((item) => item.type === "error");
  if (errorItems.length === 0) return { results: [], failureReason: "no-abi" };

  const { decodeErrorResult } = await import("viem");
  const decodedResults: DecodedError[] = [];

  for (const item of errorItems) {
    try {
      const { errorName, args } = decodeErrorResult({
        abi: [item] as Abi,
        data: errorData as `0x${string}`,
      });

      const inputs =
        "inputs" in item
          ? (item.inputs as { name?: string; type: string }[]) ?? []
          : [];
      const params: DecodedParam[] = inputs.map((input, i) => ({
        name: input.name ?? `arg${i}`,
        type: input.type,
        value: formatValue(args?.[i]),
      }));

      const signature = `${errorName}(${inputs.map((inp) => inp.type).join(",")})`;
      decodedResults.push({ errorName, signature, params, rawData: errorData });
    } catch {
      // skip this variant
    }
  }

  if (decodedResults.length === 0) return { results: [], failureReason: "decode-failed" };
  return { results: decodedResults };
}
