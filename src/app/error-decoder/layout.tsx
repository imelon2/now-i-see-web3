import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error Decoder",
  description:
    "Decode Solidity revert data into human-readable error messages. Supports Error(string), Panic(uint256), and custom errors.",
  keywords: [
    "solidity error decoder",
    "revert decoder",
    "panic code decoder",
    "custom error decoder",
    "evm error parser",
    "smart contract error",
    "transaction revert reason",
    "web3 developer tools",
  ],
  openGraph: {
    title: "Error Decoder | Now I See Web3",
    description:
      "Decode Solidity revert data into human-readable error messages. Supports Error(string), Panic(uint256), and custom errors.",
    url: "https://nowiseeweb3.xyz/error-decoder",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Error Decoder | Now I See Web3",
    description:
      "Decode Solidity revert data into human-readable error messages. Supports Error(string), Panic(uint256), and custom errors.",
  },
  alternates: {
    canonical: "https://nowiseeweb3.xyz/error-decoder",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Error Decoder",
  url: "https://nowiseeweb3.xyz/error-decoder",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "Decode Solidity revert data into human-readable error messages. Supports Error(string), Panic(uint256), and custom errors.",
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

export default function ErrorDecoderLayout({
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
