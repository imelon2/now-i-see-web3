import type { Metadata } from "next";
import { AdSenseAd } from "@/components/ui/AdSenseAd";

export const metadata: Metadata = {
  title: "What is Now I See Web3",
  description:
    "Now I See Web3 is a free, open-source on-chain data analyzer for Web3 developers. Decode calldata, inspect transactions, and debug Solidity errors — no wallet, no setup required.",
  keywords: [
    "what is now i see web3",
    "now i see web3",
    "on-chain data analyzer",
    "web3 developer tool",
    "calldata decoder",
    "ethereum transaction analyzer",
    "solidity error decoder",
    "evm debugger",
    "blockchain developer tools",
    "decode calldata online",
  ],
  openGraph: {
    title: "What is Now I See Web3?",
    description:
      "Now I See Web3 is a free, open-source on-chain data analyzer — decode calldata, inspect transactions, and debug Solidity errors without any wallet connection or setup.",
    url: "https://nowiseeweb3.xyz/about",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "What is Now I See Web3?",
    url: "https://nowiseeweb3.xyz/about",
    description:
      "Now I See Web3 is a free, open-source on-chain data analyzer for Web3 developers. It decodes calldata, inspects transactions, and debugs Solidity errors.",
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "Now I See Web3",
      url: "https://nowiseeweb3.xyz",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Now I See Web3?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Now I See Web3 is a free, open-source on-chain data analyzer designed for Ethereum and EVM-compatible blockchain developers. It converts raw hexadecimal calldata, encoded error responses, and transaction hashes into clear, human-readable information.",
        },
      },
      {
        "@type": "Question",
        name: "What tools does Now I See Web3 provide?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Now I See Web3 provides three core tools: Transaction Analyzer (decode any tx hash across chains), Calldata Decoder (decode raw calldata hex into function name and parameters), and Error Decoder (translate Solidity revert data into readable error messages).",
        },
      },
      {
        "@type": "Question",
        name: "Is Now I See Web3 free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Now I See Web3 is completely free and open-source. No wallet connection, no API key, no account required. All operations are read-only.",
        },
      },
    ],
  },
];

export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/"),
        }}
      />
      <div className="prose-content">
        <h1>What is Now I See Web3?</h1>

        <p>
          Now I See Web3 is a free, open-source on-chain data analyzer designed for Ethereum and EVM-compatible
          blockchain developers. The platform converts raw, unreadable on-chain data — hexadecimal calldata,
          encoded error responses, and transaction hashes — into clear, human-readable information.
        </p>
        <p>
          Whether you are debugging a failed transaction, inspecting a smart contract call, or trying to understand
          what a transaction actually did on-chain, Now I See Web3 gives you the visibility you need without requiring
          you to manually decode ABI-encoded data or write custom scripts.
        </p>

        <h2>The Tools</h2>
        <p>
          Now I See Web3 provides three core tools, each focused on a specific aspect of on-chain data analysis:
        </p>
        <ul>
          <li>
            <strong>Transaction Analyzer</strong> — Enter any transaction hash and select a network. The analyzer
            searches across multiple EVM chains in parallel and returns full transaction details, including decoded
            calldata and event logs. This is the fastest way to understand what happened in a transaction without
            opening a block explorer and manually tracing each step.
          </li>
          <li>
            <strong>Calldata Decoder</strong> — Paste any raw calldata hex string and instantly see the decoded
            function name, parameter types, and values. This tool uses the 4Byte directory and ABI decoding to
            interpret the first four bytes as a function selector and decode the remaining bytes as ABI-encoded
            parameters.
          </li>
          <li>
            <strong>Error Decoder</strong> — When a Solidity transaction reverts, the EVM returns encoded revert
            data. The Error Decoder translates this data into a readable error message, whether it is a standard
            <code>Error(string)</code>, a <code>Panic(uint256)</code> code, or a custom error defined in a contract
            ABI.
          </li>
        </ul>

        <h2>Developer Tool Only — No Financial Features</h2>
        <p>
          Now I See Web3 is strictly a developer debugging and inspection tool. It contains no cryptocurrency
          investment features, no payment processing, no token transfers, and no trading functionality of any
          kind. There is no wallet connection, no private key handling, no API key requirement, and no
          collection of personal data. All operations are read-only: the tools only read and decode data
          that already exists on public blockchains.
        </p>
        <p>
          If you are looking for a platform to buy, sell, or transfer cryptocurrency, this is not it.
          Now I See Web3 exists solely to help developers understand what raw on-chain data means.
        </p>

        <h2>Why We Built This</h2>
        <p>
          Working with on-chain data is a fundamental part of Web3 development, but the raw data format — ABI-encoded
          hexadecimal strings — is designed for machines, not humans. Developers regularly encounter transaction hashes
          they cannot read, calldata they cannot interpret, and error messages that are completely opaque without the
          right tools.
        </p>
        <p>
          Now I See Web3 was built to close that gap. The goal is simple: give Web3 developers a fast, reliable, and
          free tool that makes on-chain data immediately understandable. No setup, no wallet connection, no API keys.
          Just paste the data and see what it means.
        </p>

        <h2>Open Source</h2>
        <p>
          Now I See Web3 is fully open source. The source code is available on{" "}
          <a
            href="https://github.com/imelon2/now-i-see-web3"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . Contributions, bug reports, and feature requests are welcome. If you find a bug or have an idea for
          improving the tools, please open an issue or submit a pull request.
        </p>
        <p>
          The project is created and maintained by{" "}
          <a
            href="https://github.com/imelon2"
            target="_blank"
            rel="noopener noreferrer"
          >
            choi.eth
          </a>
          , a blockchain developer specializing in EVM infrastructure and smart contract tooling. With hands-on
          experience building on Ethereum, Arbitrum, Optimism, and other OP Stack chains, choi.eth has worked
          extensively with ABI encoding, cross-chain messaging, and L2 withdrawal/deposit flows. Now I See Web3
          was born from the daily frustration of manually decoding hex data during development and debugging —
          a problem every EVM developer faces but few tools solve well.
        </p>

        <AdSenseAd />
      </div>
    </main>
  );
}
