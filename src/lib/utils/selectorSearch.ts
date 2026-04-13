import type { AbiItem } from "@/types";
import { expandType, type AbiInputLike } from "./decoder";

export interface SelectorMatch {
  functionName: string;
  signature: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
  stateMutability: string;
}

/** Validate and normalize a selector input. Returns null if invalid. */
export function normalizeSelector(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-f]{8}$/.test(hex)) return null;
  return hex;
}

/** Extract display-ready matches from ABI items */
export function extractMatches(abiItems: AbiItem[]): SelectorMatch[] {
  return abiItems
    .filter((item): item is Extract<AbiItem, { type: "function" }> => {
      return "type" in item && item.type === "function";
    })
    .map((fn) => {
      const inputs = (fn.inputs ?? []).map((p) => ({
        name: p.name ?? "",
        type: expandType(p as AbiInputLike),
      }));
      const outputs = (fn.outputs ?? []).map((p) => ({
        name: p.name ?? "",
        type: expandType(p as AbiInputLike),
      }));
      const paramTypes = inputs.map((i) => i.type).join(",");
      const signature = `${fn.name}(${paramTypes})`;

      return {
        functionName: fn.name,
        signature,
        inputs,
        outputs,
        stateMutability: fn.stateMutability ?? "nonpayable",
      };
    });
}
