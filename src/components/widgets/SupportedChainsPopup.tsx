"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supportedChains as defaultSupportedChains } from "@/lib/chains/chainList";
import { useUserChains, type UserChainData } from "@/hooks/useUserChains";
import type { Chain } from "viem";

type Tab = "chains" | "add";

function ChainItem({
  name,
  chainId,
  symbol,
  rpcUrl,
  onDelete,
}: {
  name: string;
  chainId: number;
  symbol: string;
  rpcUrl: string;
  onDelete?: () => void;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
          {name}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <code style={{ fontSize: 11, color: "var(--muted)" }}>{chainId}</code>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{symbol}</span>
          {onDelete && (
            <button
              onClick={onDelete}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--error)",
                cursor: "pointer",
                padding: "0 2px",
                fontSize: 14,
                lineHeight: 1,
              }}
              title="Delete chain"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {rpcUrl}
      </div>
    </div>
  );
}

function AddChainForm({
  onAdded,
}: {
  onAdded: (chain: UserChainData) => void;
}) {
  const [rpcUrl, setRpcUrl] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const handleFetchChainId = async () => {
    if (!rpcUrl.trim()) {
      setError("Please enter an RPC URL.");
      return;
    }
    setFetching(true);
    setError("");
    try {
      const res = await fetch(rpcUrl.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
      });
      const json = await res.json();
      if (json.result) {
        setChainId(parseInt(json.result, 16));
      } else {
        setError("Failed to fetch chain ID. Check the RPC URL.");
      }
    } catch {
      setError("Could not connect to the RPC endpoint.");
    } finally {
      setFetching(false);
    }
  };

  const handleAdd = () => {
    if (!rpcUrl.trim() || chainId === null || !name.trim() || !symbol.trim()) {
      setError("Please fill in all fields and fetch the Chain ID first.");
      return;
    }
    onAdded({ id: chainId, name: name.trim(), symbol: symbol.trim(), rpcUrl: rpcUrl.trim() });
    setRpcUrl("");
    setChainId(null);
    setName("");
    setSymbol("");
    setError("");
  };

  const fieldStyle = {
    width: "100%",
    fontSize: 13,
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: 11,
    color: "var(--muted)",
    marginBottom: 4,
    fontWeight: 600 as const,
  };

  return (
    <div style={{ padding: "12px", display: "flex", flexDirection: "column" as const, gap: 12 }}>
      {/* RPC URL + Fetch */}
      <div>
        <label style={labelStyle}>RPC URL</label>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="text"
            placeholder="https://rpc.example.com"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            style={{ ...fieldStyle, flex: 1 }}
          />
          <button
            onClick={handleFetchChainId}
            disabled={fetching}
            style={{
              background: fetching ? "var(--muted)" : "var(--accent)",
              color: "var(--background)",
              border: "none",
              fontWeight: 600,
              fontSize: 12,
              padding: "0 12px",
              cursor: fetching ? "default" : "pointer",
              borderRadius: 9999,
              whiteSpace: "nowrap",
            }}
          >
            {fetching ? "..." : "Fetch ID"}
          </button>
        </div>
      </div>

      {/* Chain ID (read-only) */}
      <div>
        <label style={labelStyle}>Chain ID</label>
        <input
          type="text"
          value={chainId !== null ? chainId : ""}
          readOnly
          placeholder="Auto-filled after fetch"
          style={{
            ...fieldStyle,
            color: chainId !== null ? "var(--foreground)" : "var(--muted)",
            background: "var(--panel)",
          }}
        />
      </div>

      {/* Chain Name */}
      <div>
        <label style={labelStyle}>Chain Name</label>
        <input
          type="text"
          placeholder="e.g. My Custom Chain"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={fieldStyle}
        />
      </div>

      {/* Symbol */}
      <div>
        <label style={labelStyle}>Native Currency Symbol</label>
        <input
          type="text"
          placeholder="e.g. ETH"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={fieldStyle}
        />
      </div>

      {error && (
        <div style={{ fontSize: 12, color: "var(--error)" }}>{error}</div>
      )}

      <button
        onClick={handleAdd}
        style={{
          background: "var(--accent)",
          color: "var(--background)",
          border: "none",
          fontWeight: 600,
          fontSize: 13,
          padding: "8px 0",
          cursor: "pointer",
          borderRadius: 9999,
        }}
      >
        Add Chain
      </button>
    </div>
  );
}

function Modal({ onClose, chains }: { onClose: () => void; chains: readonly Chain[] }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("chains");
  const { userChains, addChain, removeChain } = useUserChains();

  const filteredSupported = chains.filter((chain) =>
    chain.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredUser = userChains.filter((chain) =>
    chain.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalChains = chains.length + userChains.length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAddChain = (chain: UserChainData) => {
    addChain(chain);
    setActiveTab("chains");
  };

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: "8px 0",
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid var(--foreground)" : "2px solid transparent",
    color: active ? "var(--foreground)" : "var(--muted)",
    fontWeight: active ? (600 as const) : (400 as const),
    fontSize: 13,
    cursor: "pointer" as const,
  });

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          zIndex: 900,
          animation: "fadeIn 0.15s ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "15vh",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 901,
          background: "var(--panel-header)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          width: "min(420px, calc(100vw - 32px))",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.18s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="8" r="6" />
              <path d="M8 2 C5 5 5 11 8 14 C11 11 11 5 8 2Z" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--foreground)",
              }}
            >
              Chains
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--foreground)",
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 9999,
                padding: "1px 8px",
              }}
            >
              {totalChains}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: 4,
              lineHeight: 1,
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTab("chains")}
            style={tabStyle(activeTab === "chains")}
          >
            Chains
          </button>
          <button
            onClick={() => setActiveTab("add")}
            style={tabStyle(activeTab === "add")}
          >
            Add Chain
          </button>
        </div>

        {activeTab === "chains" && (
          <>
            {/* Search input */}
            <div style={{ padding: "10px 12px 0", flexShrink: 0 }}>
              <input
                autoFocus
                type="text"
                placeholder="Search chains..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Chain list */}
            <div style={{ overflowY: "auto", padding: "8px 12px 12px" }}>
              {filteredSupported.length === 0 && filteredUser.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 13,
                    padding: "20px 0",
                  }}
                >
                  No chains found
                </div>
              )}

              {/* Supported Chains Section */}
              {filteredSupported.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontWeight: 600,
                      padding: "8px 0 4px",
                    }}
                  >
                    Supported Chains ({filteredSupported.length})
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {filteredSupported.map((chain) => (
                      <ChainItem
                        key={chain.id}
                        name={chain.name}
                        chainId={chain.id}
                        symbol={chain.nativeCurrency.symbol}
                        rpcUrl={chain.rpcUrls.default.http[0] ?? ""}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* User Defined Chains Section */}
              {filteredUser.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontWeight: 600,
                      padding: "12px 0 4px",
                    }}
                  >
                    User Defined Chains ({filteredUser.length})
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {filteredUser.map((chain) => (
                      <ChainItem
                        key={chain.id}
                        name={chain.name}
                        chainId={chain.id}
                        symbol={chain.symbol}
                        rpcUrl={chain.rpcUrl}
                        onDelete={() => removeChain(chain.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {activeTab === "add" && <AddChainForm onAdded={handleAddChain} />}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>,
    document.body
  );
}

export function SupportedChainsPopup({ chains = defaultSupportedChains }: { chains?: readonly Chain[] } = {}) {
  const [open, setOpen] = useState(false);
  const { userChains } = useUserChains();
  const totalChains = chains.length + userChains.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: 12,
          padding: "4px 10px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          borderRadius: 9999,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M8 2 C5 5 5 11 8 14 C11 11 11 5 8 2Z" />
          <line x1="2" y1="8" x2="14" y2="8" />
        </svg>
        Supported Chains ({totalChains})
      </button>

      {open && <Modal onClose={() => setOpen(false)} chains={chains} />}
    </>
  );
}
