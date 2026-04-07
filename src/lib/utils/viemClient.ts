import { createPublicClient, http } from "viem";
import type { Chain, PublicClient } from "viem";
import { publicActionsL1 } from "viem/op-stack";

export function createClient(chain: Chain): PublicClient {
  return createPublicClient({
    chain,
    transport: http(),
  });
}

export function createOpStackL1Client(chain: Chain) {
  return createPublicClient({
    chain,
    transport: http(),
  }).extend(publicActionsL1());
}
