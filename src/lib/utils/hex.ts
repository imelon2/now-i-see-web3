/**
 * 0x 접두사를 포함한 유효한 hex 문자열인지 검증합니다.
 */
export function isValidHex(value: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(value);
}

/**
 * hex 문자열을 앞 N자 + … + 뒤 M자 형태로 축약합니다.
 * 문자열이 짧으면 그대로 반환합니다.
 */
export function truncateHex(hex: string, head = 10, tail = 8): string {
  if (hex.length <= head + tail + 3) return hex;
  return `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

/**
 * calldata에서 function selector(첫 4바이트)를 추출합니다.
 * 반환값: "0x" + 8자리 hex (예: "0xa9059cbb")
 */
export function extractSelector(calldata: string): string | null {
  if (!isValidHex(calldata) || calldata.length < 10) return null;
  return calldata.slice(0, 10);
}
