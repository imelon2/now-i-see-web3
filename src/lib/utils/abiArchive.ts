import axios from "axios";
import type { AbiItem } from "@/types";

const BASE_URL =
  "https://raw.githubusercontent.com/imelon2/abi-archive-trie/refs/heads/main/archive";

const cache = new Map<string, AbiItem[]>();

/**
 * function selector(0x포함 4바이트) 또는 event topic(0x포함 32바이트)으로
 * ABI archive에서 ABI 항목 목록을 조회합니다.
 *
 * URL 형식: archive/{kind}/{selector[2..4]}/{selector[4..6]}/abi.json
 */
export async function fetchAbiBySelector(
  selector: string,
  kind: "function" | "event" = "function"
): Promise<AbiItem[] | null> {
  // selector는 최소 0x + 4자(2바이트 이상) 필요
  if (!selector.startsWith("0x") || selector.length < 6) return null;

  const hex = selector.slice(2); // '0x' 제거
  const prefix = hex.slice(0, 2); // 앞 1바이트
  const suffix = hex.slice(2, 4); // 다음 1바이트

  const cacheKey = `${kind}:${prefix}${suffix}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const url = `${BASE_URL}/${kind}/${prefix}/${suffix}/abi.json`;

  try {
    const response = await axios.get<AbiItem[]>(url, { timeout: 8000 });
    const items = response.data;
    cache.set(cacheKey, items);
    return items;
  } catch {
    cache.set(cacheKey, []); // 실패도 캐싱하여 재조회 방지
    return null;
  }
}
