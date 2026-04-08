import { defineChain, type Chain } from "viem";
import {
  mainnet,
  sepolia,
  arbitrum,
  arbitrumSepolia,
  kaia,
  polygon,
  localhost,
  base,
  baseSepolia,
  avalanche,
  optimism,
  optimismSepolia
} from "viem/chains";

const dkargoWarehouse = defineChain({
  id: 61022448,
  name: "Dkargo Warehouse",
  nativeCurrency: {
    name: "dkargo warehouse",
    symbol: "DKA",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.warehouse.dkargo.io"] },
    public: { http: ["https://rpc.warehouse.dkargo.io"] },
  },
});

const dkargo = defineChain({
  id: 61022894,
  name: "Dkargo",
  nativeCurrency: {
    name: "dkargo",
    symbol: "DKA",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://mainnet-rpc.dkargo.io"] },
    public: { http: ["https://mainnet-rpc.dkargo.io"] },
  },
});

/**
 * L2 allowlist for OP Stack withdrawal (cross message) detection.
 * Only transactions on these chains are eligible for the Withdrawal UI.
 */
export const crossMessageChains = [
  optimism,
  optimismSepolia,
] as const;

export type CrossMessageChain = (typeof crossMessageChains)[number];

/** Find the L1 chain paired with a given L2 chain via sourceId */
export function getL1Chain(l2Chain: Chain): Chain | undefined {
  if (!("sourceId" in l2Chain) || typeof l2Chain.sourceId !== "number") return undefined;
  return supportedChains.find((c) => c.id === l2Chain.sourceId);
}

export const supportedChains = [
  mainnet,
  sepolia,
  arbitrum,
  arbitrumSepolia,
  kaia,
  polygon,
  dkargoWarehouse,
  dkargo,
  localhost,
  base,
  baseSepolia,
  avalanche,
  optimism,
  optimismSepolia
] as const;

export type SupportedChain = (typeof supportedChains)[number];
