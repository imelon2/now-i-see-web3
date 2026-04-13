import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Function Selector",
  description:
    "Look up EVM function selectors (4-byte identifiers) by hex value. Find matching Solidity function names, parameters, and ABI details for any 0x selector.",
  keywords: [
    "function selector lookup",
    "4byte selector search",
    "evm function selector",
    "solidity function hash lookup",
    "0x function selector",
    "smart contract function search",
    "reverse function selector",
    "function selector database",
    "web3 developer tools",
  ],
  openGraph: {
    title: "Search Function Selector | Now I See Web3",
    description:
      "Look up EVM function selectors by hex value. Find matching Solidity function names, parameters, and ABI details.",
    url: "https://nowiseeweb3.xyz/search-function-selector",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Search Function Selector | Now I See Web3",
    description:
      "Look up EVM function selectors by hex value. Find matching Solidity function names, parameters, and ABI details.",
  },
  alternates: {
    canonical: "https://nowiseeweb3.xyz/search-function-selector",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://nowiseeweb3.xyz/search-function-selector#app",
  name: "Search Function Selector",
  url: "https://nowiseeweb3.xyz/search-function-selector",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Look up EVM function selectors (4-byte identifiers) by hex value. Find matching Solidity function names, parameters, and ABI details.",
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
    { "@type": "ListItem", position: 2, name: "Search Function Selector", item: "https://nowiseeweb3.xyz/search-function-selector" },
  ],
};

export default function SearchFunctionSelectorLayout({
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
