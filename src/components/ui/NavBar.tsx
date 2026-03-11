"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/tx-analyzer",
    label: "Transaction Analyzer",
    icon: (
      // Search / magnifying glass
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6.5" cy="6.5" r="4.5" />
        <line x1="10.5" y1="10.5" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    href: "/calldata-decoder",
    label: "Calldata Decoder",
    icon: (
      // Code brackets
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5,4 1,8 5,12" />
        <polyline points="11,4 15,8 11,12" />
      </svg>
    ),
  },
  {
    href: "/error-decoder",
    label: "Error Decoder",
    icon: (
      // Warning triangle
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2L14.5 13H1.5L8 2Z" />
        <line x1="8" y1="7" x2="8" y2="9.5" />
        <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 220,
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
        <div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 20, letterSpacing: "-0.01em", marginBottom: 4 }}>
          Now I See Web3
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.01em" }}>
          Oh,, now I see web3 data... 👀
        </div>
      </div>

      {/* Navigation */}
      {LINKS.map(({ href, label, icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
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
            {icon}
            {label}
          </Link>
        );
      })}
      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <a
          href="https://github.com/imelon2/now-i-see-web3"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            color: "var(--muted)",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub
        </a>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          created by{" "}
          <a
            href="https://github.com/imelon2"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--muted)", textDecoration: "underline" }}
          >
            choi.eth
          </a>
        </span>
      </div>
    </nav>
  );
}
