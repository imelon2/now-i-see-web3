import { createPublicClient, http } from "viem";
import type { Chain, PublicClient } from "viem";

export function createClient(chain: Chain): PublicClient {
  return createPublicClient({
    chain,
    transport: http(),
  });
}
