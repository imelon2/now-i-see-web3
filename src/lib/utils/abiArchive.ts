import axios from "axios";
import type { AbiItem } from "@/types";

const BASE_URL =
  "https://raw.githubusercontent.com/imelon2/abi-archive-trie/refs/heads/main/archive";

const cache = new Map<string, AbiItem[]>();

/**
 * Fetches ABI by function selector (4 bytes with 0x) or event topic (32 bytes with 0x)
 * from the ABI archive.
 *
 * URL format: archive/{kind}/{selector[2..4]}/{selector[4..6]}/abi.json
 */
export async function fetchAbiBySelector(
  selector: string,
  kind: "function" | "event" | "error" = "function"
): Promise<AbiItem[] | null> {
  // selector must be at least 0x + 4 chars (2 bytes)
  if (!selector.startsWith("0x") || selector.length < 6) return null;

  const hex = selector.slice(2); // strip '0x'
  const prefix = hex.slice(0, 2); // first byte
  const suffix = hex.slice(2, 4); // second byte

  const cacheKey = `${kind}:${prefix}${suffix}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const url = `${BASE_URL}/${kind}/${prefix}/${suffix}/abi.json`;

  try {
    const response = await axios.get<AbiItem[]>(url, { timeout: 8000 });
    const items = response.data;
    cache.set(cacheKey, items);
    return items;
  } catch {
    cache.set(cacheKey, []); // cache failure to prevent retry
    return null;
  }
}
