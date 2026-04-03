import { toFunctionSelector, toEventSelector } from "viem";

// ─── Solidity Type Validation ─────────────────────────────────────────────────

const BASE_TYPES = new Set([
  "address",
  "bool",
  "string",
  "bytes",
  "function",
]);

/** uint8..uint256 (step 8), int8..int256 (step 8) */
function isValidIntType(type: string): boolean {
  const match = type.match(/^(u?int)(\d+)?$/);
  if (!match) return false;
  if (!match[2]) return true; // plain int / uint
  const bits = Number(match[2]);
  return bits >= 8 && bits <= 256 && bits % 8 === 0;
}

/** bytes1..bytes32 */
function isValidFixedBytesType(type: string): boolean {
  const match = type.match(/^bytes(\d+)$/);
  if (!match) return false;
  const n = Number(match[1]);
  return n >= 1 && n <= 32;
}

/**
 * Validate a single Solidity type (including tuples and arrays).
 * Examples: "address", "uint256", "(address,uint256)", "uint256[]", "(bool,bytes32)[]"
 */
export function isValidSolidityType(type: string): boolean {
  const trimmed = type.trim();
  if (!trimmed) return false;

  // Strip trailing array notation: [], [N]
  const base = trimmed.replace(/(\[\d*\])+$/, "");

  // Tuple: (type1,type2,...)
  if (base.startsWith("(") && base.endsWith(")")) {
    const inner = base.slice(1, -1);
    const components = splitTupleComponents(inner);
    if (components.length === 0) return false;
    return components.every((c) => isValidSolidityType(c));
  }

  if (BASE_TYPES.has(base)) return true;
  if (isValidIntType(base)) return true;
  if (isValidFixedBytesType(base)) return true;

  return false;
}

/** Split comma-separated tuple components, respecting nested parentheses */
function splitTupleComponents(inner: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "(") depth++;
    else if (inner[i] === ")") depth--;
    else if (inner[i] === "," && depth === 0) {
      parts.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(inner.slice(start).trim());
  return parts.filter((p) => p.length > 0);
}

// ─── Type Normalization ───────────────────────────────────────────────────────

/**
 * Normalize Solidity type aliases to their canonical form.
 * - `uint` → `uint256`, `int` → `int256`
 * - Recursively normalizes tuple components
 * - Preserves array notation
 */
export function normalizeSolidityType(type: string): string {
  const trimmed = type.trim();
  if (!trimmed) return trimmed;

  // Extract array suffix
  const arrayMatch = trimmed.match(/(\[\d*\])+$/);
  const arraySuffix = arrayMatch ? arrayMatch[0] : "";
  const base = arraySuffix ? trimmed.slice(0, -arraySuffix.length) : trimmed;

  // Tuple: recursively normalize components
  if (base.startsWith("(") && base.endsWith(")")) {
    const inner = base.slice(1, -1);
    const components = splitTupleComponents(inner);
    const normalized = components.map(normalizeSolidityType).join(",");
    return `(${normalized})${arraySuffix}`;
  }

  // Normalize uint → uint256, int → int256
  if (base === "uint") return `uint256${arraySuffix}`;
  if (base === "int") return `int256${arraySuffix}`;

  return `${base}${arraySuffix}`;
}

// ─── Signature Parsing ────────────────────────────────────────────────────────

export interface ParsedSignature {
  name: string;
  params: string[];
}

/**
 * Parse a function signature like "transfer(address,uint256)" into name + params.
 * Returns null if the signature format is invalid.
 */
export function parseSignature(sig: string): ParsedSignature | null {
  const trimmed = sig.trim();
  const openParen = trimmed.indexOf("(");
  if (openParen === -1) return null;

  // Must end with )
  if (!trimmed.endsWith(")")) return null;

  const name = trimmed.slice(0, openParen).trim();
  if (!name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return null;

  const inner = trimmed.slice(openParen + 1, -1).trim();
  if (!inner) return { name, params: [] };

  const params = splitTupleComponents(inner);
  return { name, params };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
  canonicalSignature?: string;
}

/** Validate a full signature string and return canonical form */
export function validateSignature(sig: string, kind: "function" | "event" = "function"): ValidationResult {
  const trimmed = sig.trim();
  if (!trimmed) {
    return { valid: false, error: `Please enter ${kind === "event" ? "an event" : "a function"} signature.` };
  }

  const parsed = parseSignature(trimmed);
  if (!parsed) {
    return { valid: false, error: `Invalid format. Expected: ${kind === "event" ? "EventName" : "functionName"}(type1,type2,...)` };
  }

  // Validate each parameter type
  for (const param of parsed.params) {
    if (!isValidSolidityType(param)) {
      return { valid: false, error: `Invalid Solidity type: '${param}'` };
    }
  }

  // Normalize aliases (uint → uint256, int → int256) for canonical form
  const normalizedParams = parsed.params.map(normalizeSolidityType);
  const canonical = `${parsed.name}(${normalizedParams.join(",")})`;
  return { valid: true, canonicalSignature: canonical };
}

// ─── Selector Generation ──────────────────────────────────────────────────────

/**
 * Generate a 4-byte function selector from a canonical signature.
 * Returns the selector as "0x..." hex string (10 chars).
 */
export function generateSelector(signature: string): string {
  return toFunctionSelector(signature);
}

/**
 * Generate a 32-byte event topic hash from a canonical signature.
 * Returns the topic as "0x..." hex string (66 chars).
 */
export function generateEventSelector(signature: string): string {
  return toEventSelector(signature);
}

/** Build a canonical signature from function name + parameter type list */
export function buildSignature(name: string, params: string[]): string {
  return `${name}(${params.join(",")})`;
}
