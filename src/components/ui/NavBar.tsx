"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/tx-analyzer", label: "TX Analyzer" },
  { href: "/calldata-decoder", label: "Calldata Decoder" },
  { href: "/error-decoder", label: "Error Decoder" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 200,
        flexShrink: 0,
        background: "var(--panel-header)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "0 16px", marginBottom: 32 }}>
        <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 16 }}>
          Now I See Web3
        </span>
      </div>

      {/* Navigation */}
      {LINKS.map(({ href, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              padding: "10px 16px",
              paddingLeft: 14,
              borderLeft: isActive
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              background: isActive
                ? "rgba(88,166,255,0.07)"
                : "transparent",
              color: isActive ? "var(--foreground)" : "var(--muted)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
