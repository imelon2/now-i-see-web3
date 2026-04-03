import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calldata Decoder",
  description:
    "Decode Ethereum calldata hex into human-readable function names, signatures, and parameters. Supports all EVM-compatible chains.",
  keywords: [
    "calldata decoder",
    "ethereum calldata",
    "abi decoder",
    "function signature decoder",
    "hex decoder",
    "evm calldata parser",
    "smart contract decoder",
    "web3 developer tools",
  ],
  openGraph: {
    title: "Calldata Decoder | Now I See Web3",
    description:
      "Decode Ethereum calldata hex into human-readable function names, signatures, and parameters.",
    url: "https://nowiseeweb3.xyz/calldata-decoder",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Calldata Decoder | Now I See Web3",
    description:
      "Decode Ethereum calldata hex into human-readable function names, signatures, and parameters. Supports all EVM-compatible chains.",
  },
  alternates: {
    canonical: "https://nowiseeweb3.xyz/calldata-decoder",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calldata Decoder",
  url: "https://nowiseeweb3.xyz/calldata-decoder",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Decode Ethereum calldata hex into human-readable function names, signatures, and parameters. Supports all EVM-compatible chains.",
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

export default function CalldataDecoderLayout({
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
