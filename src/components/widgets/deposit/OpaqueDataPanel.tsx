"use client";

import type { DepositOpaque } from "@/hooks/useDepositStatus";
import {
  DataTree,
  TreeGroup,
  TreeNode,
  TreeRoot,
  TreeRow,
} from "@/components/ui/DataTree";

/**
 * Tree-style renderer for the opaqueData blob of a TransactionDeposited
 * event. Uses the shared DataTree primitive so that all cross-message
 * panels render in a consistent ASCII-tree format.
 */
export function OpaqueDataPanel({ opaque }: { opaque: DepositOpaque | null }) {
  const childFields: Array<{ label: string; value: string }> = opaque
    ? [
        { label: "mint (msg.value)", value: opaque.mint.toString() },
        { label: "value", value: opaque.value.toString() },
        { label: "gas", value: opaque.gas.toString() },
        { label: "isCreation", value: String(opaque.isCreation) },
        { label: "data", value: opaque.data },
      ]
    : [];

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Opaque Data</span>
      </div>
      <div className="panel-body" style={{ padding: 16 }}>
        <DataTree
          empty={
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              No opaque data available.
            </div>
          }
        >
          {opaque && (
            <TreeGroup
              depth={0}
              info="abi.encodePacked(mint, value, gas, isCreation, data)"
              row={
                <TreeRoot
                  label="opaqueData"
                  value={opaque.opaqueData}
                  labelCh={12}
                />
              }
            >
              {childFields.map((f, i) => (
                <TreeNode
                  key={f.label}
                  depth={0}
                  isLast={i === childFields.length - 1}
                >
                  <TreeRow label={f.label} value={f.value} labelCh={18} />
                </TreeNode>
              ))}
            </TreeGroup>
          )}
        </DataTree>
      </div>
    </div>
  );
}
