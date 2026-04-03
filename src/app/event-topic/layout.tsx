import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Topic Hash Generator",
  description:
    "Generate EVM event topic hashes (32-byte keccak256) from Solidity event signatures. Calculate topic[0] for smart contract event logs — supports tuple types, arrays, and parameter validation.",
  keywords: [
    "event topic hash",
    "event topic generator",
    "solidity event signature",
    "keccak256 event hash",
    "evm event topic",
    "smart contract event log",
    "ethereum event decoder",
    "topic0 calculator",
    "web3 developer tools",
    "abi event hash",
  ],
  openGraph: {
    title: "Event Topic Hash Generator | Now I See Web3",
    description:
      "Generate 32-byte EVM event topic hashes from Solidity event signatures. Calculate topic[0] with tuple and array type support.",
    url: "https://nowiseeweb3.xyz/event-topic",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Event Topic Hash Generator | Now I See Web3",
    description:
      "Generate 32-byte EVM event topic hashes from Solidity event signatures. Calculate topic[0] for smart contract logs.",
  },
  alternates: {
    canonical: "https://nowiseeweb3.xyz/event-topic",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Event Topic Hash Generator",
  url: "https://nowiseeweb3.xyz/event-topic",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Generate EVM event topic hashes (32-byte keccak256) from Solidity event signatures. Calculate topic[0] for smart contract event logs.",
  isPartOf: {
    "@type": "SoftwareApplication",
    name: "Now I See Web3",
    url: "https://nowiseeweb3.xyz",
  },
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

export default function EventTopicLayout({
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
      {children}
    </>
  );
}
