import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaction Analyzer",
  description:
    "Inspect Ethereum transactions across multiple chains. View decoded calldata, event logs, and full transaction details in one place.",
  keywords: [
    "ethereum transaction analyzer",
    "tx decoder",
    "transaction inspector",
    "evm transaction viewer",
    "calldata viewer",
    "event log decoder",
    "multi-chain transaction",
    "web3 developer tools",
  ],
  openGraph: {
    title: "Transaction Analyzer | Now I See Web3",
    description:
      "Inspect Ethereum transactions across multiple chains. View decoded calldata, event logs, and full transaction details.",
    url: "https://nowiseeweb3.xyz/tx-analyzer",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Transaction Analyzer | Now I See Web3",
    description:
      "Inspect Ethereum transactions across multiple chains. View decoded calldata, event logs, and transaction details.",
  },
  alternates: {
    canonical: "https://nowiseeweb3.xyz/tx-analyzer",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Transaction Analyzer",
  url: "https://nowiseeweb3.xyz/tx-analyzer",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Inspect Ethereum transactions across multiple chains. View decoded calldata, event logs, and full transaction details.",
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

export default function TxAnalyzerLayout({
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
