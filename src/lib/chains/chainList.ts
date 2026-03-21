import { defineChain } from "viem";
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
