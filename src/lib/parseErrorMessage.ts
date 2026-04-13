/**
 * Parse a viem/RPC error string into a structured title + detail entries.
 *
 * Example input:
 *   "RPC Request failed. URL: https://sepolia.optimism.io Request body: {...} Details: Block range is too large Version: viem@2.47.0"
 *
 * Output:
 *   { title: "RPC Request failed", details: [{ key: "URL", value: "https://..." }, ...] }
 */

export interface ParsedError {
  title: string;
  details: { key: string; value: string }[] | null;
}

const KNOWN_KEYS = ["URL", "Request body", "Details", "Version", "Contract Call", "Docs", "Args"];

export function parseErrorMessage(message: string): ParsedError {
  if (!message) return { title: "Unknown error", details: null };

  // Try to find the first known key to split title from details
  let titleEnd = message.length;
  for (const key of KNOWN_KEYS) {
    const idx = message.indexOf(`${key}:`);
    if (idx !== -1 && idx < titleEnd) {
      titleEnd = idx;
    }
  }

  // If no known keys found, try splitting on first period
  if (titleEnd === message.length) {
    const dotIdx = message.indexOf(".");
    if (dotIdx !== -1 && dotIdx < 80) {
      return { title: message.slice(0, dotIdx).trim(), details: [{ key: "Details", value: message.slice(dotIdx + 1).trim() }] };
    }
    return { title: message, details: null };
  }

  const title = message.slice(0, titleEnd).replace(/\.\s*$/, "").trim();
  const rest = message.slice(titleEnd);

  // Parse "Key: value" pairs from the rest
  const details: { key: string; value: string }[] = [];
  const pattern = new RegExp(`(${KNOWN_KEYS.join("|")}):\\s*`, "g");
  const matches: { key: string; start: number; valueStart: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(rest)) !== null) {
    matches.push({ key: match[1], start: match.index, valueStart: match.index + match[0].length });
  }

  for (let i = 0; i < matches.length; i++) {
    const valueEnd = i + 1 < matches.length ? matches[i + 1].start : rest.length;
    const value = rest.slice(matches[i].valueStart, valueEnd).trim();
    if (value) details.push({ key: matches[i].key, value });
  }

  return { title, details: details.length > 0 ? details : null };
}
