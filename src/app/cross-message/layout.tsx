import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cross Message Analyzer",
  description:
    "Analyze cross-chain messages between parent and child chains. Trace deposit and withdrawal message flows across L1/L2.",
  keywords: [
    "cross chain message",
    "L1 L2 message",
    "bridge message analyzer",
    "deposit withdrawal tracker",
    "optimism message",
    "cross chain bridge",
    "web3 developer tools",
  ],
  openGraph: {
    title: "Cross Message Analyzer | Now I See Web3",
    description:
      "Analyze cross-chain messages between parent and child chains. Trace deposit and withdrawal message flows.",
    url: "https://nowiseeweb3.xyz/cross-message",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cross Message Analyzer | Now I See Web3",
    description:
      "Analyze cross-chain messages between parent and child chains. Trace deposit and withdrawal message flows.",
  },
  alternates: {
    canonical: "https://nowiseeweb3.xyz/cross-message",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Cross Message Analyzer",
  url: "https://nowiseeweb3.xyz/cross-message",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Analyze cross-chain messages between parent and child chains. Trace deposit and withdrawal message flows across L1/L2.",
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

export default function CrossMessageLayout({
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
