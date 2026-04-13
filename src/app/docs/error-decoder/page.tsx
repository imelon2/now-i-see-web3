import type { Metadata } from "next";
import { AdSenseAd } from "@/components/ui/AdSenseAd";

export const metadata: Metadata = {
  title: "Error Decoder Guide",
  description:
    "Complete guide to decoding Solidity revert errors. Learn about Error(string), Panic(uint256), custom errors, and how to use the Error Decoder tool.",
  openGraph: {
    title: "Error Decoder Guide | Now I See Web3",
    description:
      "Complete guide to decoding Solidity revert errors — Error(string), Panic codes, and custom errors.",
    url: "https://nowiseeweb3.xyz/docs/error-decoder",
  },
};

export default function ErrorDecoderGuidePage() {
  return (
    <main>
      <div className="prose-content">
        <h1>Error Decoder Guide</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "-8px 0 16px" }}>Last updated: April 2026</p>

        <h2>Why does a Solidity transaction revert?</h2>
        <p>
          When a Solidity smart contract transaction fails, the EVM reverts the state changes and returns encoded
          revert data. This revert data contains information about why the transaction failed, but like calldata, it
          is encoded in a binary format that is not human-readable without decoding.
        </p>
        <p>
          A typical raw revert data string looks like this:
        </p>
        <pre>
          <code>0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a4e6f7420656e6f75676820746f6b656e20616c6c6f77616e636500000000000000</code>
        </pre>
        <p>
          The Error Decoder translates this into the readable message: <code>Error: &quot;Not enough token allowance&quot;</code>.
          Understanding how to decode these errors is essential for debugging smart contract failures quickly and
          effectively.
        </p>

        <h2>What types of Solidity errors exist?</h2>
        <p>
          Solidity supports three categories of errors, each with a different encoding format:
        </p>
        <ul>
          <li>
            <strong>Error(string)</strong> — The most common type. Triggered by <code>require(condition, &quot;message&quot;)</code>{" "}
            or <code>revert(&quot;message&quot;)</code>. The revert data starts with the function selector{" "}
            <code>0x08c379a0</code>, followed by the ABI-encoded string message.
          </li>
          <li>
            <strong>Panic(uint256)</strong> — Triggered automatically by the Solidity compiler for internal errors
            such as arithmetic overflow, array out-of-bounds access, division by zero, or failed assertions. The
            revert data starts with <code>0x4e487b71</code>, followed by a numeric panic code that identifies the
            specific type of error.
          </li>
          <li>
            <strong>Custom Errors</strong> — Introduced in Solidity 0.8.4. Defined with the <code>error</code>{" "}
            keyword, custom errors are more gas-efficient than string errors and can carry structured data. They are
            ABI-encoded like function calls, using the first 4 bytes as an error selector.
          </li>
        </ul>

        <h2>What do Solidity Panic error codes mean?</h2>
        <p>
          When you encounter a <code>Panic(uint256)</code> error, the numeric code tells you what went wrong:
        </p>
        <ul>
          <li><code>0x01</code> — Failed assertion (<code>assert(false)</code>)</li>
          <li><code>0x11</code> — Arithmetic overflow or underflow</li>
          <li><code>0x12</code> — Division or modulo by zero</li>
          <li><code>0x21</code> — Enum conversion out of bounds</li>
          <li><code>0x31</code> — Pop on an empty array</li>
          <li><code>0x32</code> — Array index out of bounds</li>
          <li><code>0x41</code> — Out of memory (too much memory allocated)</li>
          <li><code>0x51</code> — Called an uninitialized internal function</li>
        </ul>

        <h2>How do I decode Solidity revert data?</h2>
        <p>Follow these steps to decode any Solidity revert error:</p>
        <ul>
          <li>
            <strong>Step 1:</strong> Navigate to the{" "}
            <a href="/error-decoder">Error Decoder</a> page.
          </li>
          <li>
            <strong>Step 2:</strong> Paste the raw revert data hex string into the input field. This is typically
            found in the transaction receipt or in the error output from your Ethereum node or block explorer.
          </li>
          <li>
            <strong>Step 3:</strong> For custom errors that are not standard <code>Error(string)</code> or{" "}
            <code>Panic(uint256)</code>, you may also paste the ABI fragment (the custom error definition from your
            contract) to enable decoding.
          </li>
          <li>
            <strong>Step 4:</strong> Click decode. The tool will identify the error type and display the decoded
            message or structured data in a readable format.
          </li>
        </ul>

        <h2>Decoding Custom Errors</h2>
        <p>
          Custom errors require the contract&apos;s ABI to decode because their selectors are not stored in any
          universal registry. To decode a custom error, you have two options:
        </p>
        <ul>
          <li>
            <strong>Paste the ABI fragment</strong> — If you have the contract ABI, paste the specific error
            definition. For example:{" "}
            <code>{`error InsufficientBalance(uint256 available, uint256 required)`}</code>. The decoder will use
            this to match the 4-byte error selector and decode the parameters.
          </li>
          <li>
            <strong>Use the full ABI</strong> — Paste the complete ABI JSON array and the decoder will automatically
            match the error selector against all error definitions.
          </li>
        </ul>

        <h2>Example: Decoding an ERC-20 InsufficientBalance Error</h2>
        <p>
          Consider an ERC-20 contract that uses a custom error for insufficient balance checks:
        </p>
        <pre>
          <code>{`error InsufficientBalance(uint256 available, uint256 required);`}</code>
        </pre>
        <p>When this error is triggered, the revert data looks like:</p>
        <pre>
          <code>0xcf4791810000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000008ac7230489e80000000</code>
        </pre>
        <p>
          After pasting the revert data and the error ABI fragment into the Error Decoder, you will see:
        </p>
        <ul>
          <li>Error name: <code>InsufficientBalance</code></li>
          <li>available: <code>1000000000000000000</code> (1 ETH in wei)</li>
          <li>required: <code>160000000000000000000</code> (160 ETH in wei)</li>
        </ul>
        <p>
          This immediately tells you that the account had only 1 ETH but the operation required 160 ETH.
        </p>

        <AdSenseAd />

        <h2>Debugging Workflow</h2>
        <p>
          An effective workflow for debugging a failed transaction using the Error Decoder:
        </p>
        <ul>
          <li>
            <strong>Step 1 — Get the revert data:</strong> Find the failed transaction on a block explorer
            (Etherscan, for example) and copy the revert data from the transaction details. Alternatively, use the
            Transaction Analyzer on this site to find both the revert data and the decoded calldata in one place.
          </li>
          <li>
            <strong>Step 2 — Identify the error type:</strong> Paste the revert data into the Error Decoder. If it
            starts with <code>0x08c379a0</code> or <code>0x4e487b71</code>, the tool decodes it automatically.
          </li>
          <li>
            <strong>Step 3 — For custom errors, provide the ABI:</strong> If the error selector does not match a
            known standard, paste the relevant ABI fragment. Check the contract&apos;s verified source code on the
            block explorer to find the error definition.
          </li>
          <li>
            <strong>Step 4 — Interpret the result:</strong> Use the decoded error name and parameters to understand
            the exact condition that caused the failure. This is usually enough to pinpoint the bug or misconfigured
            parameter.
          </li>
        </ul>
      </div>
    </main>
  );
}
