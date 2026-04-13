import Link from "next/link";
import type { Metadata } from "next";
import { fetchAbiBySelector } from "@/lib/utils/abiArchive";
import { normalizeSelector, extractMatches } from "@/lib/utils/selectorSearch";
import { SelectorResultCard } from "@/components/ui/SelectorResultCard";
import { CopyButton } from "@/components/ui/CopyButton";
import { DetailsToggle } from "@/components/ui/DetailsToggle";

type Props = {
  params: Promise<{ selector: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { selector } = await params;
  const normalized = normalizeSelector(selector);
  const display = normalized ?? selector;

  const abiItems = normalized ? await fetchAbiBySelector(normalized, "function") : null;
  const matches = extractMatches(abiItems ?? []);
  const functionNames = matches.map((m) => m.functionName).join(", ");

  const title = `${display} Function Selector`;
  const description = matches.length > 0
    ? `Function selector ${display} matches: ${functionNames}. View full signatures, parameters, and ABI details.`
    : `Look up function selector ${display}. Find matching Solidity function names, parameters, and ABI details.`;

  return {
    title,
    description,
    keywords: [
      `${display} function selector`,
      `${display} selector`,
      "function selector lookup",
      "4byte selector",
      "evm function selector",
      ...matches.map((m) => m.functionName),
    ],
    openGraph: {
      title: `${title} | Now I See Web3`,
      description,
      url: `https://nowiseeweb3.xyz/search-function-selector/${display}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | Now I See Web3`,
      description,
    },
    alternates: {
      canonical: `https://nowiseeweb3.xyz/search-function-selector/${display}`,
    },
  };
}

export default async function SelectorResultPage({ params }: Props) {
  const { selector } = await params;
  const normalized = normalizeSelector(selector);

  if (!normalized) {
    return (
      <main style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <Link
              href="/search-function-selector"
              style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}
            >
              &larr; Back to search
            </Link>
          </div>
          <div className="panel">
            <div className="panel-header">
              <span style={{ color: "var(--error)" }}>Invalid Selector</span>
            </div>
            <div className="panel-body">
              <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
                <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{selector}</code> is not a valid
                4-byte function selector. Expected format:{" "}
                <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>0xNNNNNNNN</code> (8 hex characters).
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const abiItems = await fetchAbiBySelector(normalized, "function");
  const matches = extractMatches(abiItems ?? []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `Function Selector ${normalized}`,
    url: `https://nowiseeweb3.xyz/search-function-selector/${normalized}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    description: matches.length > 0
      ? `Lookup results for function selector ${normalized}: ${matches.map((m) => m.signature).join(", ")}`
      : `Lookup function selector ${normalized} — no matching functions found.`,
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

  return (
    <main style={{ padding: 20 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/") }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Back link + Page header */}
        <div>
          <Link
            href="/search-function-selector"
            style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 8 }}
          >
            &larr; Back to search
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: "1.5em", fontWeight: 400, margin: "0 0 6px", fontFamily: "var(--font-mono)" }}>
              {normalized} Function Selector
            </h1>
            <CopyButton text={normalized} size="sm" />
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            {matches.length > 0
              ? `Found ${matches.length} matching function${matches.length > 1 ? "s" : ""}`
              : "No matching functions found"}
          </p>
        </div>

        {/* Results */}
        {matches.length === 0 ? (
          <div className="panel">
            <div className="panel-body">
              <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
                No known functions match selector{" "}
                <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{normalized}</code>.
                The function may not be in the ABI archive yet.
              </p>
            </div>
          </div>
        ) : (
          matches.map((match, i) => (
            <SelectorResultCard key={i} match={match} index={i} />
          ))
        )}

        {/* About */}
        <DetailsToggle summary="About function selectors">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              A <strong style={{ color: "var(--foreground)" }}>function selector</strong> is the
              first 4 bytes of the keccak256 hash of a function&apos;s canonical signature.
              Multiple functions can share the same selector (hash collision).
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              This page shows all known functions from the{" "}
              <a
                href="https://github.com/imelon2/abi-archive-trie"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--foreground)", textDecoration: "underline" }}
              >
                ABI Archive
              </a>{" "}
              that match selector <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{normalized}</code>.
            </p>
          </div>
        </DetailsToggle>
      </div>
    </main>
  );
}
