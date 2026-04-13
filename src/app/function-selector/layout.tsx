import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Function Selector Generator",
  description:
    "Generate EVM function selectors (4-byte identifiers) from Solidity function signatures. Compute keccak256 hashes for smart contract function calls.",
  keywords: [
    "function selector",
    "4byte selector",
    "solidity function hash",
    "keccak256 function",
    "evm function identifier",
    "smart contract selector",
    "function signature hash",
    "web3 developer tools",
  ],
  openGraph: {
    title: "Function Selector Generator | Now I See Web3",
    description:
      "Generate EVM function selectors from Solidity function signatures. Supports tuple types and parameter validation.",
    url: "https://nowiseeweb3.xyz/function-selector",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Function Selector Generator | Now I See Web3",
    description:
      "Generate EVM function selectors (4-byte identifiers) from Solidity function signatures. Compute keccak256 hashes for smart contract function calls.",
  },
  alternates: {
    canonical: "https://nowiseeweb3.xyz/function-selector",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://nowiseeweb3.xyz/function-selector#app",
  name: "Function Selector Generator",
  url: "https://nowiseeweb3.xyz/function-selector",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Generate EVM function selectors (4-byte identifiers) from Solidity function signatures. Compute keccak256 hashes for smart contract function calls.",
  isPartOf: { "@id": "https://nowiseeweb3.xyz/#app" },
  author: {
    "@type": "Person",
    name: "choi.eth",
    url: "https://github.com/imelon2",
  },
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "USD",
  },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nowiseeweb3.xyz" },
    { "@type": "ListItem", position: 2, name: "Function Selector", item: "https://nowiseeweb3.xyz/function-selector" },
  ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/<\//g, "<\\/") }}
      />
      {children}
    </>
  );
}
