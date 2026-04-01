import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Function Selector Generator",
  description:
    "Generate EVM function selectors (4-byte identifiers) from Solidity function signatures. Compute keccak256 hashes for smart contract function calls.",
  openGraph: {
    title: "Function Selector Generator | Now I See Web3",
    description:
      "Generate EVM function selectors from Solidity function signatures. Supports tuple types and parameter validation.",
    url: "https://nowiseeweb3.xyz/function-selector",
  },
};

export default function FunctionSelectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
