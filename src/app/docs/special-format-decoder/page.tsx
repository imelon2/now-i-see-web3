import type { Metadata } from "next";
import { DecodingTag } from "@/components/ui/DecodingTag";

export const metadata: Metadata = {
  title: "Special Format Decoder Guide",
  description:
    "Learn about special format decoders that handle non-standard calldata encoding used by specific protocols like Optimism.",
  openGraph: {
    title: "Special Format Decoder Guide | Now I See Web3",
    description:
      "Guide to decoding non-standard calldata formats — packed calldata, protocol-specific encoding, and more.",
    url: "https://nowiseeweb3.xyz/docs/special-format-decoder",
  },
};

const supportedFormats = [
  {
    tagId: "optimism-format",
    functionName: "setL1BlockValuesJovian()",
    selector: "0x3db6be2b",
    chain: "Optimism",
    description:
      "Decodes the L1 block attributes transaction used by the Optimism Jovian upgrade. This system transaction is sent by the sequencer at the start of every L2 block to relay L1 state (base fee, blob fee, block hash, etc.) to L2.",
  },
];

export default function SpecialFormatDecoderGuidePage() {
  return (
    <main>
      <div className="prose-content">
        <h1>Special Format Decoder Guide</h1>

        <h2>What Is a Special Format?</h2>
        <p>
          Most smart contract calls on Ethereum use standard ABI encoding — a well-defined format where the function
          selector (first 4 bytes) identifies the function and the remaining bytes encode parameters padded to 32-byte
          boundaries. The Calldata Decoder handles these automatically by looking up the selector in the ABI archive.
        </p>
        <p>
          However, some protocols use <strong>non-standard encoding</strong> to optimize for gas or calldata size.
          Instead of ABI-encoded parameters, these functions pack values tightly into raw bytes with no padding. Standard
          ABI decoders cannot parse this data — the parameters have no ABI definition to match against.
        </p>
        <p>
          Now I See Web3 includes <strong>Special Format Decoders</strong> that recognize these non-standard selectors
          and apply protocol-specific parsing logic. When a special format is detected, a colored tag appears next to
          &quot;Decoded Calldata&quot; to indicate which protocol format was used. Standard ABI-decoded calldata is
          labeled with a neutral <DecodingTag tagId="abi" /> tag for distinction.
        </p>

        <h2>How It Works</h2>
        <p>
          When you submit calldata to the Calldata Decoder or Transaction Analyzer, the tool checks the 4-byte function
          selector against a registry of known special formats <em>before</em> attempting standard ABI decoding:
        </p>
        <ul>
          <li>
            <strong>Match found</strong> — The calldata is parsed using a dedicated decoder for that protocol format.
            The result shows all decoded fields with a protocol-specific tag.
          </li>
          <li>
            <strong>No match</strong> — The calldata flows through the standard ABI decoding pipeline as usual.
          </li>
        </ul>
        <p>
          This means you don&apos;t need to do anything special. Paste the calldata, and the tool automatically detects
          and applies the correct decoder.
        </p>

        <h2>Supported Formats</h2>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 40px" }}>
        {supportedFormats.map((fmt) => (
          <div
            key={fmt.selector}
            className="panel"
            style={{ marginBottom: 16, overflow: "hidden" }}
          >
            <div
              className="panel-header"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <DecodingTag tagId={fmt.tagId} />
              <code style={{ fontSize: 14 }}>{fmt.functionName}</code>
              <span style={{ color: "var(--muted)", fontSize: 13, marginLeft: "auto" }}>
                {fmt.selector}
              </span>
            </div>
            <div className="panel-body">
              <p style={{ margin: 0, fontSize: 14, color: "var(--foreground)", lineHeight: 1.7 }}>
                {fmt.description}
              </p>
            </div>
          </div>
        ))}

        <div className="prose-content" style={{ padding: 0 }}>
          <h2>Optimism: setL1BlockValuesJovian()</h2>
          <p>
            Optimism&apos;s <code>setL1BlockValuesJovian()</code> is a system transaction sent by the L2 sequencer at
            the beginning of every block. It relays critical L1 state to the L2 <code>L1Block</code> contract, enabling
            L2 contracts to access L1 block information like the base fee, blob base fee, and block hash.
          </p>
          <p>
            Unlike normal contract calls, this function takes <strong>no ABI-encoded parameters</strong>. Instead, all
            12 fields are tightly packed into raw <code>msg.data</code> to minimize calldata size and reduce L1 posting
            costs. This is why standard ABI decoders fail to parse it.
          </p>

          <h3>Calldata Layout (178 bytes)</h3>
        </div>

        <div style={{ overflowX: "auto", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600 }}>Bytes</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600 }}>Field</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600 }}>Type</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600 }}>Section</th>
              </tr>
            </thead>
            <tbody>
              {[
                { bytes: "[0–3]", field: "Function Selector", type: "bytes4", section: "—" },
                { bytes: "[4–7]", field: "baseFeeScalar", type: "uint32", section: "Ecotone" },
                { bytes: "[8–11]", field: "blobBaseFeeScalar", type: "uint32", section: "Ecotone" },
                { bytes: "[12–19]", field: "sequenceNumber", type: "uint64", section: "Ecotone" },
                { bytes: "[20–27]", field: "timestamp", type: "uint64", section: "Ecotone" },
                { bytes: "[28–35]", field: "number", type: "uint64", section: "Ecotone" },
                { bytes: "[36–67]", field: "basefee", type: "uint256", section: "Ecotone" },
                { bytes: "[68–99]", field: "blobBaseFee", type: "uint256", section: "Ecotone" },
                { bytes: "[100–131]", field: "hash", type: "bytes32", section: "Ecotone" },
                { bytes: "[132–163]", field: "batcherHash", type: "bytes32", section: "Ecotone" },
                { bytes: "[164–167]", field: "operatorFeeScalar", type: "uint32", section: "Jovian" },
                { bytes: "[168–175]", field: "operatorFeeConstant", type: "uint64", section: "Jovian" },
                { bytes: "[176–177]", field: "daFootprintGasScalar", type: "uint16", section: "Jovian" },
              ].map((row) => (
                <tr key={row.bytes} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 12px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>{row.bytes}</td>
                  <td style={{ padding: "6px 12px" }}><code>{row.field}</code></td>
                  <td style={{ padding: "6px 12px", color: "var(--muted)" }}>{row.type}</td>
                  <td style={{ padding: "6px 12px", color: "var(--muted)" }}>{row.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="prose-content" style={{ padding: 0 }}>
          <p>
            The first 164 bytes (Ecotone section) contain the base L1 block attributes introduced in the Ecotone
            upgrade. The last 14 bytes (Jovian section) add operator fee parameters and the DA footprint gas scalar
            introduced in the Jovian upgrade. All fields are big-endian with no padding between them.
          </p>

          <h3>Example</h3>
          <p>The following is a real <code>setL1BlockValuesJovian()</code> calldata from Optimism:</p>
        </div>

        <pre style={{ overflowX: "auto", padding: "12px 16px", background: "var(--background)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
          <code style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}>0x3db6be2b0000146b000f79c500000000000000040000000069c4e3cb00000000017981e2000000000000000000000000000000000000000000000000000000000224f1300000000000000000000000000000000000000000000000000000000000206311726031439452cc3d968be656b00b5912884ce0fb03a188684085ce7c6fa15bbf0000000000000000000000006887246668a3b87f54deb3b94ba47a6f63f329850000000000000000000000000190</code>
        </pre>

        <div className="prose-content" style={{ padding: 0 }}>
          <p>Decoded result:</p>
          <ul>
            <li><code>baseFeeScalar</code> = 5227</li>
            <li><code>blobBaseFeeScalar</code> = 1014213</li>
            <li><code>sequenceNumber</code> = 4</li>
            <li><code>timestamp</code> = 1774511051</li>
            <li><code>number</code> = 24740322</li>
            <li><code>basefee</code> = 35975472</li>
            <li><code>blobBaseFee</code> = 2122513</li>
            <li><code>hash</code> = 0x7260...5bbf</li>
            <li><code>batcherHash</code> = 0x0000...2985</li>
            <li><code>operatorFeeScalar</code> = 0</li>
            <li><code>operatorFeeConstant</code> = 0</li>
            <li><code>daFootprintGasScalar</code> = 400</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
