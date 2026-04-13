import type { Metadata } from "next";
import { AdSenseAd } from "@/components/ui/AdSenseAd";

export const metadata: Metadata = {
  title: "Calldata Decoder Guide",
  description:
    "Complete guide to decoding Ethereum calldata. Learn what calldata is, how ABI encoding works, and how to use the Calldata Decoder tool step by step.",
  openGraph: {
    title: "Calldata Decoder Guide | Now I See Web3",
    description:
      "Complete guide to decoding Ethereum calldata — ABI encoding, function selectors, and step-by-step usage.",
    url: "https://nowiseeweb3.xyz/docs/calldata-decoder",
  },
};

export default function CalldataDecoderGuidePage() {
  return (
    <main>
      <div className="prose-content">
        <h1>Calldata Decoder Guide</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "-8px 0 16px" }}>Last updated: April 2026</p>

        <h2>What is Ethereum calldata and how is it encoded?</h2>
        <p>
          Calldata is the raw input data sent with an Ethereum transaction when a user or contract calls a function
          on another smart contract. Every smart contract call on the EVM (Ethereum Virtual Machine) encodes the
          function to call and its arguments into a compact binary format called ABI encoding. This encoded data is
          what you see in a transaction&apos;s input field on a block explorer — a long hexadecimal string that looks
          completely unreadable without the right tools.
        </p>
        <p>
          For example, a simple ERC-20 token transfer might appear as:
        </p>
        <pre>
          <code>0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000003635c9adc5dea00000</code>
        </pre>
        <p>
          Without decoding, this tells you almost nothing. With the Calldata Decoder, it becomes immediately clear
          that this is a <code>transfer(address,uint256)</code> call sending tokens to a specific address.
        </p>

        <h2>How does Ethereum ABI encoding work?</h2>
        <p>
          The Ethereum ABI (Application Binary Interface) specification defines how function calls and their
          parameters are encoded. Every ABI-encoded calldata follows the same structure:
        </p>
        <ul>
          <li>
            <strong>Function Selector (4 bytes)</strong> — The first 4 bytes of the calldata are the function
            selector. This is computed as the first 4 bytes of the Keccak-256 hash of the function signature. For
            example, <code>transfer(address,uint256)</code> hashes to{" "}
            <code>0xa9059cbb</code>.
          </li>
          <li>
            <strong>Encoded Parameters</strong> — The remaining bytes encode the function arguments using ABI
            encoding rules. Fixed-size types like <code>uint256</code> and <code>address</code> are padded to 32
            bytes. Dynamic types like <code>string</code> and <code>bytes</code> use a two-part encoding with an
            offset pointer followed by the actual data.
          </li>
        </ul>
        <p>
          The Calldata Decoder uses the 4byte.directory and on-chain ABI data to look up the function selector and
          then decodes the remaining bytes according to the matched function signature.
        </p>

        <h2>How do I decode raw calldata hex?</h2>
        <p>Follow these steps to decode any Ethereum calldata:</p>
        <ul>
          <li>
            <strong>Step 1:</strong> Navigate to the{" "}
            <a href="/calldata-decoder">Calldata Decoder</a> page.
          </li>
          <li>
            <strong>Step 2:</strong> Paste the raw calldata hex string into the input field. Make sure to include
            the <code>0x</code> prefix.
          </li>
          <li>
            <strong>Step 3:</strong> Click the decode button. The tool will extract the 4-byte function selector,
            look it up against known function signatures, and decode the parameters.
          </li>
          <li>
            <strong>Step 4:</strong> Review the decoded output, which shows the function name, parameter types, and
            their values in a human-readable format.
          </li>
        </ul>

        <h2>Supported Input Formats</h2>
        <p>The Calldata Decoder accepts the following input formats:</p>
        <ul>
          <li>
            <strong>Full calldata with <code>0x</code> prefix</strong> — The standard format copied from block
            explorers or wallet interfaces.
          </li>
          <li>
            <strong>Full calldata without <code>0x</code> prefix</strong> — The tool handles both formats
            automatically.
          </li>
          <li>
            <strong>Minimum 4 bytes</strong> — At least 4 bytes (8 hex characters) are required for the function
            selector. If no parameters are present, the tool will still identify the function name.
          </li>
        </ul>

        <h2>Example: Decoding a USDT Transfer Call</h2>
        <p>
          Let&apos;s walk through a real example. The following calldata represents a USDT (Tether USD) transfer on
          Ethereum mainnet:
        </p>
        <pre>
          <code>0xa9059cbb000000000000000000000000ab5801a7d398351b8be11c439e05c5b3259aec9b0000000000000000000000000000000000000000000000000000000077359400</code>
        </pre>
        <p>Breaking this down:</p>
        <ul>
          <li>
            <code>a9059cbb</code> — Function selector for <code>transfer(address,uint256)</code>
          </li>
          <li>
            <code>000...ab5801a7d398351b8be11c439e05c5b3259aec9b</code> — The recipient address, padded to 32 bytes
          </li>
          <li>
            <code>000...77359400</code> — The amount in the token&apos;s smallest unit (hex <code>77359400</code> =
            decimal <code>2000000000</code>, which is 2,000 USDT with 6 decimals)
          </li>
        </ul>
        <p>
          After pasting this into the Calldata Decoder, you will immediately see:
          <code>transfer(address to, uint256 amount)</code> with the recipient address and amount clearly displayed.
        </p>

        <AdSenseAd />

        <h2>When should I use a calldata decoder?</h2>
        <p>The Calldata Decoder is most useful when you need to:</p>
        <ul>
          <li>
            <strong>Debug a failed transaction</strong> — When a transaction fails, understanding exactly what
            function was called with what parameters helps identify why it reverted.
          </li>
          <li>
            <strong>Verify a pending transaction</strong> — Before approving a transaction in your wallet, decode
            the calldata to confirm what the contract will actually execute.
          </li>
          <li>
            <strong>Audit a smart contract interaction</strong> — When reviewing on-chain activity for a protocol or
            a suspicious transaction, decoding calldata reveals the exact function call.
          </li>
          <li>
            <strong>Learn ABI encoding</strong> — The decoded output with parameter types is a practical way to
            understand how the Ethereum ABI works in practice.
          </li>
          <li>
            <strong>Build developer tooling</strong> — Quickly prototype calldata parsing logic by verifying your
            expected decoding against the tool&apos;s output.
          </li>
        </ul>
      </div>
    </main>
  );
}
