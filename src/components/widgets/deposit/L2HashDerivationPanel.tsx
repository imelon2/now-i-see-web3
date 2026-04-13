"use client";

import type { DepositDerivation } from "@/hooks/useDepositStatus";
import {
  DataTree,
  TreeGroup,
  TreeNode,
  TreeRoot,
  TreeRow,
} from "@/components/ui/DataTree";

/**
 * Visualizes every intermediate value that feeds the final L2 tx hash of an
 * OP Stack deposit. Mirrors the MessagePassed / OpaqueData ASCII-tree style
 * so the Cross Message tab keeps a consistent format across deposits.
 *
 * Tree shape (root = the final hash, children = the values that produced it):
 *
 *   l2TxHash
 *   ├ txType (0x7e)
 *   ├ rlpEncoded
 *   ├ depositTx
 *   │   ├ sourceHash
 *   │   │   ├ domain (userDeposit)
 *   │   │   └ depositIdHash
 *   │   │       ├ l1BlockHash
 *   │   │       └ l1LogIndex
 *   │   ├ from, to, mint, value, gas, isSystemTx, data
 *   └ sourceLog
 *       ├ version
 *       ├ logIndex
 *       ├ blockHash
 *       └ opaqueData
 */
export function L2HashDerivationPanel({
  derivation,
}: {
  derivation: DepositDerivation | null;
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span>L2 Tx Hash Derivation</span>
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
              No derivation data available.
            </div>
          }
        >
          {derivation && (
            <TreeGroup
              depth={0}
              info="keccak256(txType || rlpEncoded)"
              row={
                <TreeRoot
                  label="l2TxHash"
                  value={derivation.l2TxHash}
                  labelCh={12}
                />
              }
            >
              <TreeNode depth={0} isLast={false}>
                <TreeRow label="txType" value={derivation.txType} labelCh={12} />
              </TreeNode>
              <TreeNode depth={0} isLast>
                <TreeGroup
                  depth={1}
                  info="RLP([sourceHash, from, to, mint, value, gas, isSystemTx, data])"
                  row={
                    <TreeRow
                      label="rlpEncoded"
                      value={derivation.rlpEncoded}
                      labelCh={12}
                    />
                  }
                >
                  <TreeNode depth={1} isLast={false}>
                    <TreeGroup
                      depth={2}
                      info="keccak256((padding || domain)[32] || depositIdHash)"
                      row={
                        <TreeRow
                          label="[0] sourceHash"
                          value={derivation.sourceHash}
                          labelCh={16}
                        />
                      }
                    >
                      <TreeNode depth={2} isLast={false}>
                        <TreeRow
                          label="domain"
                          value={`${derivation.domain} (0)`}
                          labelCh={15}
                        />
                      </TreeNode>
                      <TreeNode depth={2} isLast>
                        <TreeGroup
                          depth={3}
                          info="keccak256(l1BlockHash || (padding || l1LogIndex)[32])"
                          row={
                            <TreeRow
                              label="depositIdHash"
                              value={derivation.depositIdHash}
                              labelCh={15}
                            />
                          }
                        >
                          <TreeNode depth={3} isLast={false}>
                            <TreeRow
                              label="l1BlockHash"
                              value={derivation.l1BlockHash}
                              labelCh={13}
                            />
                          </TreeNode>
                          <TreeNode depth={3} isLast>
                            <TreeRow
                              label="l1LogIndex"
                              value={String(derivation.l1LogIndex)}
                              labelCh={13}
                            />
                          </TreeNode>
                        </TreeGroup>
                      </TreeNode>
                    </TreeGroup>
                  </TreeNode>

                  <TreeNode depth={1} isLast={false}>
                    <TreeRow label="[1] from" value={derivation.from} labelCh={16} />
                  </TreeNode>
                  <TreeNode depth={1} isLast={false}>
                    <TreeRow
                      label="[2] to"
                      value={
                        derivation.isCreation
                          ? "(contract creation)"
                          : derivation.to ?? "—"
                      }
                      labelCh={16}
                    />
                  </TreeNode>
                  <TreeNode depth={1} isLast={false}>
                    <TreeRow
                      label="[3] mint"
                      value={derivation.mint.toString()}
                      labelCh={16}
                    />
                  </TreeNode>
                  <TreeNode depth={1} isLast={false}>
                    <TreeRow
                      label="[4] value"
                      value={derivation.value.toString()}
                      labelCh={16}
                    />
                  </TreeNode>
                  <TreeNode depth={1} isLast={false}>
                    <TreeRow
                      label="[5] gas"
                      value={derivation.gas.toString()}
                      labelCh={16}
                    />
                  </TreeNode>
                  <TreeNode depth={1} isLast={false}>
                    <TreeRow
                      label="[6] isSystemTx"
                      value={String(derivation.isSystemTx)}
                      labelCh={16}
                    />
                  </TreeNode>
                  <TreeNode depth={1} isLast>
                    <TreeRow label="[7] data" value={derivation.data} labelCh={16} />
                  </TreeNode>
                </TreeGroup>
              </TreeNode>
            </TreeGroup>
          )}
        </DataTree>
      </div>
    </div>
  );
}

