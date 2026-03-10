import {
  decodeFunctionData,
  decodeEventLog,
  type Abi,
  type Log,
} from "viem";
import type { AbiItem, DecodedCalldata, DecodedEvent, DecodedError, DecodedParam, DecodedEventParam } from "@/types";
import { fetchAbiBySelector } from "./abiArchive";
import { extractSelector } from "./hex";

function formatValue(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(formatValue);
  return value;
}

// ─── Calldata 디코딩 ────────────────────────────────────────────────────────────

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
      ? `${functionName}(${inputs.map((i) => i.type).join(",")})`
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

// ─── 이벤트 로그 디코딩 ─────────────────────────────────────────────────────────

export async function decodeLog(log: Log): Promise<DecodedEvent | null> {
  const topic0 = log.topics?.[0];
  if (!topic0) return null;

  const abiItems = await fetchAbiBySelector(topic0, "event");
  if (!abiItems || abiItems.length === 0) return null;

  const abi = abiItems as Abi;

  try {
    const decoded = decodeEventLog({
      abi,
      data: log.data,
      topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
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
      ? `${eventName}(${inputs.map((i) => i.type).join(",")})`
      : eventName;

    return {
      eventName,
      signature,
      params,
      address: log.address ?? "",
      rawTopics: [...(log.topics ?? [])] as string[],
      rawData: log.data as string,
    };
  } catch {
    return null;
  }
}

// ─── Error 디코딩 ───────────────────────────────────────────────────────────────

export type ErrorDecodeResult =
  | { status: "success"; data: DecodedError }
  | { status: "no-abi" }
  | { status: "decode-failed" };

export async function decodeError(
  errorData: string
): Promise<ErrorDecodeResult> {
  const selector = extractSelector(errorData);
  if (!selector) return { status: "no-abi" };

  // error ABI는 function과 같은 경로를 사용
  const abiItems = await fetchAbiBySelector(selector, "function");
  if (!abiItems || abiItems.length === 0) return { status: "no-abi" };

  // error 타입 항목만 필터
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
