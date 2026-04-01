import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Function Selector Calculator & Generator",
  description:
    "Free online function selector calculator and generator — generate EVM function selectors (4-byte identifiers) from Solidity function signatures. Compute keccak256 hashes for smart contract function calls.",
  keywords: [
    "function selector calculator",
    "function selector generator",
    "function selector",
    "solidity function selector",
    "4-byte selector",
    "evm function selector",
    "keccak256 function signature",
    "solidity function hash",
    "smart contract function selector",
    "ethereum function selector calculator",
    "ethereum function selector generator",
    "abi function selector",
  ],
  openGraph: {
    title: "Function Selector Calculator & Generator | Now I See Web3",
    description:
      "Free online function selector calculator and generator — generate EVM 4-byte selectors from Solidity function signatures. Supports tuple types and parameter validation.",
    url: "https://nowiseeweb3.xyz/function-selector",
  },
  twitter: {
    card: "summary",
    title: "Function Selector Calculator & Generator | Now I See Web3",
    description:
      "Free online function selector calculator and generator — generate EVM 4-byte selectors from Solidity function signatures.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Function Selector Calculator & Generator",
  url: "https://nowiseeweb3.xyz/function-selector",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Free online function selector calculator and generator — generate EVM function selectors (4-byte identifiers) from Solidity function signatures using keccak256 hashing.",
  keywords:
    "function selector calculator, function selector generator, solidity function selector, 4-byte selector, evm function hash, keccak256",
  author: {
    "@type": "Person",
    name: "choi.eth",
    url: "https://github.com/imelon2",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function FunctionSelectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/"),
        }}
      />
      {children}
    </>
  );
}
