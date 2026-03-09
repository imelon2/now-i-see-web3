/**
 * 디코딩된 파라미터 값을 사람이 읽기 좋은 문자열로 변환합니다.
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
 * bigint wei 값을 ETH 단위 문자열로 변환합니다.
 */
export function formatEtherValue(value: bigint): string {
  const eth = Number(value) / 1e18;
  if (eth === 0) return "0 ETH";
  if (eth < 0.000001) return `${value.toString()} wei`;
  return `${eth.toFixed(6).replace(/\.?0+$/, "")} ETH`;
}

/**
 * 숫자를 천 단위 콤마 형식으로 표시합니다.
 */
export function formatNumber(value: bigint | number): string {
  return value.toLocaleString("en-US");
}
