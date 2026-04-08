"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatedEyes } from "./AnimatedEyes";
import { MiniNavbar } from "./mini-navbar";

const ANALYZER_LINKS = [
  {
    href: "/tx-analyzer",
    label: "Transaction Analyzer",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6.5" cy="6.5" r="4.5" />
        <line x1="10.5" y1="10.5" x2="14" y2="14" />
      </svg>
    ),
  },
];

const DECODER_LINKS = [
  {
    href: "/calldata-decoder",
    label: "Calldata Decoder",
    icon: (
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
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2L14.5 13H1.5L8 2Z" />
        <line x1="8" y1="7" x2="8" y2="9.5" />
        <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

const TOOL_LINKS = [
  {
    href: "/function-selector",
    label: "Function Selector",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <text x="1" y="12" fontSize="11" fontWeight="700" fill="currentColor" stroke="none" fontFamily="monospace">#</text>
      </svg>
    ),
  },
  {
    href: "/event-topic",
    label: "Event Topic",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2L4 8h3v6l4-6H8V2Z" />
      </svg>
    ),
  },
];

const DOCS_LINKS = [
  {
    href: "/docs/calldata-decoder",
    label: "Calldata Decoder",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h6l4 4v10H4V2" />
        <polyline points="10,2 10,6 14,6" />
      </svg>
    ),
  },
  {
    href: "/docs/error-decoder",
    label: "Error Decoder",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h6l4 4v10H4V2" />
        <polyline points="10,2 10,6 14,6" />
      </svg>
    ),
  },
  {
    href: "/docs/tx-analyzer",
    label: "Tx Analyzer",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h6l4 4v10H4V2" />
        <polyline points="10,2 10,6 14,6" />
      </svg>
    ),
  },
  {
    href: "/docs/special-format-decoder",
    label: "Special Format",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h6l4 4v10H4V2" />
        <polyline points="10,2 10,6 14,6" />
      </svg>
    ),
  },
];

const INFO_LINKS = [
  {
    href: "/about",
    label: "About",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <line x1="8" y1="7" x2="8" y2="11" />
        <circle cx="8" cy="5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/contact",
    label: "Contact",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="12" height="9" rx="1" />
        <polyline points="2,4 8,9 14,4" />
      </svg>
    ),
  },
  {
    href: "/privacy",
    label: "Privacy",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2Z" />
      </svg>
    ),
  },
];

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "var(--border)",
  margin: "8px 16px",
};

const sectionLabelStyle: React.CSSProperties = {
  padding: "6px 16px 2px",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--muted)",
};

function NavLink({
  href,
  label,
  icon,
  pathname,
  onNavigate,
  indented,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  pathname: string;
  onNavigate?: () => void;
  indented?: boolean;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        marginInline: 6,
        paddingLeft: indented ? 18 : 10,
        borderRadius: 9999,
        background: isActive ? "var(--border)" : "transparent",
        color: isActive ? "var(--foreground)" : "var(--muted)",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 400,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

function NavGroups({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {/* Analyzer */}
      <div style={sectionLabelStyle}>Analyzer</div>
      {ANALYZER_LINKS.map(({ href, label, icon }) => (
        <NavLink key={href} href={href} label={label} icon={icon} pathname={pathname} onNavigate={onNavigate} indented />
      ))}

      {/* Decoder */}
      <div style={sectionLabelStyle}>Decoder</div>
      {DECODER_LINKS.map(({ href, label, icon }) => (
        <NavLink key={href} href={href} label={label} icon={icon} pathname={pathname} onNavigate={onNavigate} indented />
      ))}

      {/* Calculator */}
      <div style={sectionLabelStyle}>Calculator</div>
      {TOOL_LINKS.map(({ href, label, icon }) => (
        <NavLink key={href} href={href} label={label} icon={icon} pathname={pathname} onNavigate={onNavigate} indented />
      ))}

      {/* Divider + Docs section */}
      <div style={dividerStyle} />
      <div style={sectionLabelStyle}>Docs</div>
      {DOCS_LINKS.map(({ href, label, icon }) => (
        <NavLink key={href} href={href} label={label} icon={icon} pathname={pathname} onNavigate={onNavigate} indented />
      ))}

    </>
  );
}

function NavFooter() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <a
        href="https://github.com/imelon2/now-i-see-web3"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--muted)", textDecoration: "none", fontSize: 14 }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        GitHub
      </a>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>
        created by{" "}
        <a href="https://github.com/imelon2" target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)", textDecoration: "underline" }}>
          choi.eth
        </a>
      </span>
    </div>
  );
}

function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <AnimatedEyes size={28} />
      <div>
        <div style={{ fontFamily: "var(--font-pixel)", color: "var(--foreground)", fontSize: 14, lineHeight: 1.6 }}>
          Now I See Web3
        </div>
        <div style={{ fontSize: 7, fontFamily: "var(--font-pixel)", color: "var(--muted)", marginTop: 8, letterSpacing: "0.01em" }}>
          on-chain data analyzer
        </div>
      </div>
    </div>
  );
}

const ALL_NAV_LINKS = [
  ...ANALYZER_LINKS,
  ...DECODER_LINKS,
  ...TOOL_LINKS,
];

function TopHeaderLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      style={{
        padding: "5px 14px",
        borderRadius: 9999,
        background: isActive ? "var(--border)" : "transparent",
        color: isActive ? "var(--foreground)" : "var(--muted)",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 400,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Link>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <>
        <MiniNavbar />
        <style>{`.layout-content { margin-left: 0; }`}</style>
      </>
    );
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav className="nav-desktop">
        <div style={{ padding: "0 16px", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <BrandMark />
          </Link>
        </div>

        <NavGroups pathname={pathname} />

        <div style={{ marginTop: "auto", padding: "0 16px" }}>
          <NavFooter />
        </div>
      </nav>

      {/* ── Mobile top bar ── */}
      <div className="nav-mobile-bar">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <AnimatedEyes size={18} />
          <span style={{ fontFamily: "var(--font-pixel)", color: "var(--foreground)", fontSize: 8 }}>
            Now I See Web3
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--foreground)",
            padding: 6,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div className="nav-mobile-menu">
          <NavGroups pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <div style={{ marginTop: "auto", padding: "24px 16px 16px" }}>
            <NavFooter />
          </div>
        </div>
      )}
    </>
  );
}
