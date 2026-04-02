"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DetailsToggle } from "@/components/ui/DetailsToggle";
import {
  validateSignature,
  generateSelector,
  buildSignature,
  isValidSolidityType,
  normalizeSolidityType,
} from "@/lib/utils/selector";

type Tab = "signature" | "builder";

interface ParamEntry {
  id: number;
  type: string;
  isTuple: boolean;
  components: ParamEntry[];
  tupleArrayNotation: string;
}

let nextParamId = 1;

function createParam(): ParamEntry {
  return { id: nextParamId++, type: "", isTuple: false, components: [], tupleArrayNotation: "" };
}

function createTupleParam(): ParamEntry {
  return {
    id: nextParamId++,
    type: "",
    isTuple: true,
    components: [createParam()],
    tupleArrayNotation: "",
  };
}

function paramToTypeString(p: ParamEntry): string {
  if (p.isTuple) {
    const inner = p.components.map(paramToTypeString).join(",");
    return `(${inner})${p.tupleArrayNotation}`;
  }
  return p.type.trim();
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 20px",
        fontSize: 13,
        fontWeight: 600,
        border: "none",
        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        background: "transparent",
        color: active ? "var(--foreground)" : "var(--muted)",
        cursor: "pointer",
        transition: "color 0.15s, border-color 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ─── Param Row (recursive for tuples) ─────────────────────────────────────────

function ParamRow({
  param,
  index,
  depth,
  onChange,
  onRemove,
  onToggleTuple,
}: {
  param: ParamEntry;
  index: number;
  depth: number;
  onChange: (updated: ParamEntry) => void;
  onRemove: () => void;
  onToggleTuple: () => void;
}) {
  const updateComponent = (ci: number, updated: ParamEntry) => {
    const next = [...param.components];
    next[ci] = updated;
    onChange({ ...param, components: next });
  };

  const removeComponent = (ci: number) => {
    const next = param.components.filter((_, i) => i !== ci);
    onChange({ ...param, components: next });
  };

  const addComponent = () => {
    onChange({ ...param, components: [...param.components, createParam()] });
  };

  const addTupleComponent = () => {
    onChange({ ...param, components: [...param.components, createTupleParam()] });
  };

  const toggleChildTuple = (ci: number) => {
    const child = param.components[ci];
    if (child.isTuple) {
      const next = [...param.components];
      next[ci] = { ...child, isTuple: false, components: [], type: "", tupleArrayNotation: "" };
      onChange({ ...param, components: next });
    } else {
      const next = [...param.components];
      next[ci] = { ...child, isTuple: true, components: [createParam()], type: "", tupleArrayNotation: "" };
      onChange({ ...param, components: next });
    }
  };

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0, marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 20, fontFamily: "var(--font-mono)" }}>
          {index + 1}.
        </span>

        {param.isTuple ? (
          <>
            <span
              style={{
                fontSize: 13,
                color: "var(--accent)",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              tuple
            </span>
            <input
              type="text"
              placeholder="[]"
              value={param.tupleArrayNotation}
              onChange={(e) => onChange({ ...param, tupleArrayNotation: e.target.value })}
              style={{ width: 56, textAlign: "center", fontSize: 13, fontFamily: "var(--font-mono)" }}
              title="Array notation for tuple: [], [5], [][], etc."
            />
          </>
        ) : (
          <input
            type="text"
            placeholder="e.g. uint256"
            value={param.type}
            onChange={(e) => onChange({ ...param, type: e.target.value })}
            style={{ flex: 1, maxWidth: 200, fontFamily: "var(--font-mono)", fontSize: 13 }}
          />
        )}

        <button
          onClick={onToggleTuple}
          title={param.isTuple ? "Convert to plain type" : "Convert to tuple"}
          style={{
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: param.isTuple ? "rgba(88,166,255,0.15)" : "transparent",
            color: param.isTuple ? "var(--accent)" : "var(--muted)",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {param.isTuple ? "( )" : "tuple"}
        </button>

        <button
          onClick={onRemove}
          title="Remove parameter"
          aria-label="Remove parameter"
          style={{
            padding: "4px 8px",
            fontSize: 14,
            border: "none",
            background: "transparent",
            color: "var(--muted)",
            cursor: "pointer",
            borderRadius: 4,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--error)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          ×
        </button>
      </div>

      {/* Tuple children */}
      {param.isTuple && (
        <div
          style={{
            marginTop: 8,
            marginLeft: 12,
            paddingLeft: 12,
            borderLeft: "2px solid var(--border)",
          }}
        >
          {param.components.map((child, ci) => (
            <ParamRow
              key={child.id}
              param={child}
              index={ci}
              depth={depth + 1}
              onChange={(u) => updateComponent(ci, u)}
              onRemove={() => removeComponent(ci)}
              onToggleTuple={() => toggleChildTuple(ci)}
            />
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              onClick={addComponent}
              style={{
                fontSize: 12,
                color: "var(--accent)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "4px 10px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              + Param
            </button>
            <button
              onClick={addTupleComponent}
              style={{
                fontSize: 12,
                color: "var(--accent)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "4px 10px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              + Tuple
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FunctionSelectorPage() {
  const [tab, setTab] = useState<Tab>("signature");

  // Signature tab state
  const [signatureInput, setSignatureInput] = useState("");

  // Builder tab state
  const [fnName, setFnName] = useState("");
  const [params, setParams] = useState<ParamEntry[]>([]);

  // Reactive result computation
  const computed = useMemo((): {
    selector: string | null;
    signature: string | null;
    error: string | null;
  } => {
    if (tab === "signature") {
      const trimmed = signatureInput.trim();
      if (!trimmed) return { selector: null, signature: null, error: null };

      const validation = validateSignature(trimmed);
      if (!validation.valid) {
        return { selector: null, signature: null, error: validation.error! };
      }
      try {
        const selector = generateSelector(validation.canonicalSignature!);
        return { selector, signature: validation.canonicalSignature!, error: null };
      } catch {
        return { selector: null, signature: null, error: "Failed to generate selector." };
      }
    } else {
      const name = fnName.trim();
      if (!name) return { selector: null, signature: null, error: null };

      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        return { selector: null, signature: null, error: "Invalid function name. Use letters, numbers, and underscores." };
      }

      const typeStrings = params.map(paramToTypeString);
      for (const ts of typeStrings) {
        if (ts && !isValidSolidityType(ts)) {
          return { selector: null, signature: null, error: `Invalid Solidity type: '${ts}'` };
        }
      }

      const nonEmpty = typeStrings.filter((ts) => ts.length > 0).map(normalizeSolidityType);
      const sig = buildSignature(name, nonEmpty);
      try {
        const selector = generateSelector(sig);
        return { selector, signature: sig, error: null };
      } catch {
        return { selector: null, signature: null, error: "Failed to generate selector." };
      }
    }
  }, [tab, signatureInput, fnName, params]);

  const updateParam = (index: number, updated: ParamEntry) => {
    const next = [...params];
    next[index] = updated;
    setParams(next);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const toggleTuple = (index: number) => {
    const p = params[index];
    const next = [...params];
    if (p.isTuple) {
      next[index] = { ...p, isTuple: false, components: [], type: "", tupleArrayNotation: "" };
    } else {
      next[index] = { ...p, isTuple: true, components: [createParam()], type: "", tupleArrayNotation: "" };
    }
    setParams(next);
  };

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Page header */}
        <div>
          <h1 style={{ fontSize: "2em", fontWeight: 700, margin: "0 0 6px" }}>
            Function Selector
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Calculate EVM function selectors from Solidity function signatures.
          </p>
        </div>

        {/* Input panel */}
        <div className="panel">
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 0,
              borderBottom: "1px solid var(--border)",
              paddingLeft: 12,
              background: "var(--panel-header)",
            }}
          >
            <TabButton
              label="Signature"
              active={tab === "signature"}
              onClick={() => setTab("signature")}
            />
            <TabButton
              label="Builder"
              active={tab === "builder"}
              onClick={() => setTab("builder")}
            />
          </div>

          <div className="panel-body">
            {/* Signature tab */}
            {tab === "signature" && (
              <div>
                <label
                  htmlFor="sig-input"
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--muted)",
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  Function Signature
                </label>
                <input
                  id="sig-input"
                  type="text"
                  placeholder="transfer(address,uint256)"
                  value={signatureInput}
                  onChange={(e) => setSignatureInput(e.target.value)}
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                  }}
                />
              </div>
            )}

            {/* Builder tab */}
            {tab === "builder" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label
                    htmlFor="fn-name"
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--muted)",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Function Name
                  </label>
                  <input
                    id="fn-name"
                    type="text"
                    placeholder="transfer"
                    value={fnName}
                    onChange={(e) => setFnName(e.target.value)}
                    style={{
                      width: "100%",
                      maxWidth: 300,
                      fontFamily: "var(--font-mono)",
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--muted)",
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                  >
                    Parameters
                  </label>
                  {params.length === 0 && (
                    <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 8px", fontStyle: "italic" }}>
                      No parameters. Add one below or leave empty for a no-arg function.
                    </p>
                  )}
                  {params.map((p, i) => (
                    <ParamRow
                      key={p.id}
                      param={p}
                      index={i}
                      depth={0}
                      onChange={(u) => updateParam(i, u)}
                      onRemove={() => removeParam(i)}
                      onToggleTuple={() => toggleTuple(i)}
                    />
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => setParams([...params, createParam()])}
                      style={{
                        fontSize: 13,
                        color: "var(--accent)",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        padding: "6px 14px",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      + Add Param
                    </button>
                    <button
                      onClick={() => setParams([...params, createTupleParam()])}
                      style={{
                        fontSize: 13,
                        color: "var(--accent)",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        padding: "6px 14px",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      + Add Tuple
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {computed.error && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 4,
                  background: "rgba(248,81,73,0.1)",
                  border: "1px solid rgba(248,81,73,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--error)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <line x1="8" y1="5.5" x2="8" y2="8.5" />
                  <circle cx="8" cy="10.5" r="0.5" fill="var(--error)" />
                </svg>
                <span style={{ color: "var(--error)", fontSize: 13 }}>
                  {computed.error}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Result — always visible */}
        <div className="panel">
          <div className="panel-header">
            <span>Result</span>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Signature
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <code
                  style={{
                    fontSize: 14,
                    color: computed.signature ? "var(--foreground)" : "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    transition: "color 0.15s",
                  }}
                >
                  {computed.signature || "—"}
                </code>
                {computed.signature && <CopyButton text={computed.signature} />}
              </div>
            </div>
            <div
              style={{
                padding: "12px 0 0",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Selector (4 bytes)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <code
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: computed.selector ? "var(--accent)" : "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.02em",
                    transition: "color 0.15s",
                  }}
                >
                  {computed.selector || "0x________"}
                </code>
                {computed.selector && <CopyButton text={computed.selector} />}
              </div>
            </div>
          </div>
        </div>
        {/* About this tool */}
        <DetailsToggle summary="About this tool">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              Generate EVM function selectors (4-byte identifiers) from Solidity
              function signatures. The selector is the first 4 bytes of the
              keccak256 hash of the canonical function signature.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "var(--foreground)" }}>How to use:</strong>{" "}
              Use the <strong style={{ color: "var(--foreground)" }}>Signature</strong> tab
              to enter a full signature string, or the{" "}
              <strong style={{ color: "var(--foreground)" }}>Builder</strong> tab to
              construct one from function name and parameter types.
            </p>
          </div>
        </DetailsToggle>
      </div>
    </main>
  );
}
