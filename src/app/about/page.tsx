import type { Metadata } from "next";
import { AdSenseAd } from "@/components/ui/AdSenseAd";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Now I See Web3 — an open-source on-chain data analyzer built for Web3 developers to decode calldata, errors, and transactions.",
  openGraph: {
    title: "About | Now I See Web3",
    description:
      "Learn about Now I See Web3 — an open-source on-chain data analyzer built for Web3 developers.",
    url: "https://nowiseeweb3.xyz/about",
  },
};

export default function AboutPage() {
  return (
    <main>
      <div className="prose-content">
        <h1>About Now I See Web3</h1>

        <h2>What Is Now I See Web3?</h2>
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
          The project is maintained by{" "}
          <a
            href="https://github.com/imelon2"
            target="_blank"
            rel="noopener noreferrer"
          >
            choi.eth
          </a>
          , a Web3 developer focused on making Ethereum development more accessible.
        </p>

        <AdSenseAd />
      </div>
    </main>
  );
}
