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
    </main>
  );
}
