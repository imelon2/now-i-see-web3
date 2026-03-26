import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Guides and documentation for Now I See Web3 tools — learn how to decode calldata, debug Solidity errors, and analyze transactions.",
  openGraph: {
    title: "Documentation | Now I See Web3",
    description:
      "Guides and documentation for Now I See Web3 tools.",
    url: "https://nowiseeweb3.xyz/docs",
  },
};

const guides = [
  {
    href: "/docs/calldata-decoder",
    title: "Calldata Decoder Guide",
    description:
      "Learn how Ethereum calldata encoding works and how to use the Calldata Decoder to convert raw hex strings into human-readable function calls.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5,4 1,8 5,12" />
        <polyline points="11,4 15,8 11,12" />
      </svg>
    ),
  },
  {
    href: "/docs/error-decoder",
    title: "Error Decoder Guide",
    description:
      "Understand Solidity error types and learn how to decode revert data including Error(string), Panic(uint256), and custom contract errors.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2L14.5 13H1.5L8 2Z" />
        <line x1="8" y1="7" x2="8" y2="9.5" />
        <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/docs/tx-analyzer",
    title: "Transaction Analyzer Guide",
    description:
      "Discover how to search and inspect Ethereum transactions across multiple chains — view decoded calldata, event logs, and full transaction details.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6.5" cy="6.5" r="4.5" />
        <line x1="10.5" y1="10.5" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    href: "/docs/special-format-decoder",
    title: "Special Format Decoder Guide",
    description:
      "Learn about special format decoders that handle non-standard calldata encoding used by specific protocols like Optimism.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="12" height="12" rx="2" />
        <line x1="5" y1="6" x2="11" y2="6" />
        <line x1="5" y1="10" x2="9" y2="10" />
      </svg>
    ),
  },
];

export default function DocsPage() {
  return (
    <main>
      <div className="prose-content">
        <h1>Documentation</h1>
        <p>
          Learn how to use the Now I See Web3 tools to decode on-chain data, debug smart contract errors, and inspect
          Ethereum transactions. Select a guide below to get started.
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 40px" }}>
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            style={{ textDecoration: "none" }}
          >
            <div
              className="panel"
              style={{
                marginBottom: 16,
                padding: 20,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ color: "var(--muted)", flexShrink: 0, marginTop: 2 }}>
                {guide.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: "var(--foreground)", marginBottom: 6 }}>
                  {guide.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                  {guide.description}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
