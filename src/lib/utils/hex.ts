/**
 * Validates whether a string is a valid hex with 0x prefix.
 */
export function isValidHex(value: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(value);
}

/**
 * Truncates a hex string to first N chars + … + last M chars.
 * Returns the original string if it is short enough.
 */
export function truncateHex(hex: string, head = 10, tail = 8): string {
  if (hex.length <= head + tail + 3) return hex;
  return `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

/**
 * Extracts the function selector (first 4 bytes) from calldata.
 * Returns "0x" + 8-char hex (e.g. "0xa9059cbb")
 */
export function extractSelector(calldata: string): string | null {
  if (!isValidHex(calldata) || calldata.length < 10) return null;
  return calldata.slice(0, 10);
}
