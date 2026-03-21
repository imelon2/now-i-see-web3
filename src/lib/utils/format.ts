/**
 * Converts a decoded parameter value to a human-readable string.
 */
export function formatParamValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return `[${(value as unknown[]).map(formatParamValue).join(", ")}]`;
  }
  try {
    return JSON.stringify(value, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    );
  } catch {
    return String(value);
  }
}

/**
 * Converts a bigint wei value to an ETH string.
 */
export function formatEtherValue(value: bigint, symbol = "ETH"): string {
  const eth = Number(value) / 1e18;
  if (eth === 0) return `0 ${symbol}`;
  if (eth < 0.000001) return `${value.toString()} wei`;
  return `${eth.toFixed(6).replace(/\.?0+$/, "")} ${symbol}`;
}

/**
 * Formats a number with thousands separator.
 */
export function formatNumber(value: bigint | number): string {
  return value.toLocaleString("en-US");
}

/**
 * Converts wei to Gwei string (e.g. "1.5 Gwei").
 */
export function formatGasPrice(wei: bigint): string {
  const gwei = Number(wei) / 1e9;
  if (gwei === 0) return "0 Gwei";
  // Use up to 9 significant decimal places, trim trailing zeros
  const formatted = gwei.toPrecision(4).replace(/\.?0+$/, "");
  return `${formatted} Gwei`;
}

/**
 * Converts a Unix timestamp (bigint seconds) to a human-readable string.
 */
export function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
