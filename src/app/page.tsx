import Link from "next/link";
import { AnimatedEyes } from "@/components/ui/AnimatedEyes";

const TOOLS = [
  {
    href: "/tx-analyzer",
    name: "Transaction Analyzer",
    description:
      "Search a tx hash across chains in parallel. Displays tx details, decoded calldata, and event logs.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6.5" cy="6.5" r="4.5" />
        <line x1="10.5" y1="10.5" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    href: "/calldata-decoder",
    name: "Calldata Decoder",
    description:
      "Paste raw calldata hex and get a human-readable function name, signature, and parameters.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="5,4 1,8 5,12" />
        <polyline points="11,4 15,8 11,12" />
      </svg>
    ),
  },
  {
    href: "/error-decoder",
    name: "Error Decoder",
    description:
      "Paste revert data to decode Error(string), Panic(uint256), or any custom Solidity error.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2L14.5 13H1.5L8 2Z" />
        <line x1="8" y1="7" x2="8" y2="9.5" />
        <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <main style={{ padding: "158px 24px 64px", position: "relative" }}>
      {/* ── Background gradient ── */}
      <div className="fixed inset-0 -z-10" style={{ background: "var(--background)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_560px_at_50%_200px,#2a2a2a,transparent)]" />
      </div>
      {/* ── Hero ── */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: 56,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-pixel)",
            color: "var(--foreground)",
            fontSize: 30,
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          Now I See Web3
        </h1>
        <p
          style={{
            fontFamily: "var(--font-pixel)",
            color: "var(--muted)",
            fontSize: 16,
            marginTop: 12,
            marginBottom: 90,
            letterSpacing: "0.05em",
          }}
        >
          on-chain data analyzer
        </p>

        <AnimatedEyes size={70} />

        <div
          style={{
            width: 40,
            height: 1,
            background: "var(--border)",
            margin: "50px 0",
          }}
        />

        {/* Intro copy */}
        <div
          style={{
            maxWidth: 520,
            fontSize: 16,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 0", color: "var(--foreground)", fontWeight: 400 }}>
            Onchain data is complex.
          </p>
          <div style={{ width: 2, height: 28, borderLeft: "2px dotted var(--muted)", margin: "14px auto" }} />
          <p style={{ margin: "0 0 16px", color: "var(--muted)" }}>
            Strange strings beginning with <code style={{ fontSize: 13 }}>0x</code>,
            <br />
            hashes that conceal their meaning,
            <br />
            encoded values, and layers upon layers of structured JSON.
          </p>
          <p style={{ margin: "0 0 6px", color: "var(--muted)", fontStyle: "italic" }}>
            Ever wondered what kind of data is actually living onchain in Web3?
          </p>
          <p style={{ margin: "0 0 20px", color: "var(--foreground)", fontStyle: "italic" }}>
            Now I See Web3 turns unreadable onchain data into something humans
            can finally inspect, understand, and work with...!
          </p>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.7, opacity: 0.7 }}>
            This is a pure developer debugging tool. It has no wallet connection,
            no token transfers, no payments, and no cryptocurrency investment
            features — only on-chain data inspection.
          </p>
        </div>
      </section>

      {/* ── Tool Cards ── */}
      <section className="landing-tools">
        {TOOLS.map(({ href, name, description, icon }) => (
          <div key={href} className="panel landing-card">
            <div style={{ color: "var(--muted)", marginBottom: 12 }}>{icon}</div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: "var(--foreground)",
                margin: "0 0 8px",
              }}
            >
              {name}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.6,
                margin: "0 0 20px",
                flexGrow: 1,
              }}
            >
              {description}
            </p>
            <Link
              href={href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--foreground)",
                textDecoration: "none",
              }}
            >
              OPEN →
            </Link>
          </div>
        ))}
      </section>

      {/* ── SEO Content Section ── */}
      <section
        style={{
          maxWidth: 640,
          margin: "56px auto 0",
          fontSize: 14,
          lineHeight: 1.8,
          color: "var(--muted)",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 400, color: "var(--foreground)", marginBottom: 16 }}>
          On-Chain Developer Tools for EVM Blockchains
        </h2>
        <p>
          Now I See Web3 is a free, open-source suite of on-chain data analysis tools built for Ethereum and
          EVM-compatible blockchain developers. Every tool on this platform is designed to solve a specific pain
          point in the developer workflow: inspecting transactions, decoding calldata, understanding revert errors,
          and looking up function selectors.
        </p>
        <p>
          When you interact with smart contracts on Ethereum, Arbitrum, Optimism, Base, or any EVM chain, the
          underlying data is ABI-encoded into compact hexadecimal strings. These raw bytes are designed for the
          EVM to process, not for humans to read. Now I See Web3 bridges that gap by converting opaque hex data
          into structured, human-readable output.
        </p>
        <p>
          The <strong style={{ color: "var(--foreground)" }}>Transaction Analyzer</strong> searches a transaction
          hash across 14+ EVM chains simultaneously, returning decoded calldata, event logs, gas usage, and
          cross-message status for OP Stack withdrawals and deposits. The{" "}
          <strong style={{ color: "var(--foreground)" }}>Calldata Decoder</strong> takes raw calldata hex and
          identifies the function being called along with all its parameters. The{" "}
          <strong style={{ color: "var(--foreground)" }}>Error Decoder</strong> translates Solidity revert data
          into readable error messages, supporting standard Error(string), Panic(uint256), and custom error types.
        </p>
        <p>
          For developers who need to work with function selectors directly, the{" "}
          <strong style={{ color: "var(--foreground)" }}>Function Selector Generator</strong> computes 4-byte
          selectors from Solidity signatures, and the{" "}
          <strong style={{ color: "var(--foreground)" }}>Search Function Selector</strong> performs reverse lookups
          to find all known functions matching a given selector from our ABI archive. The{" "}
          <strong style={{ color: "var(--foreground)" }}>Event Topic Hash Generator</strong> calculates 32-byte
          keccak256 topic hashes for Solidity event signatures.
        </p>
        <p>
          All tools are completely free with no wallet connection, no API keys, and no account required. The
          project is open-source and available on{" "}
          <a
            href="https://github.com/imelon2/now-i-see-web3"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--foreground)", textDecoration: "underline" }}
          >
            GitHub
          </a>. Whether you are debugging a failed transaction, auditing a smart contract interaction, or learning
          how ABI encoding works, Now I See Web3 gives you instant visibility into what is happening on-chain.
        </p>
      </section>
    </main>
  );
}
