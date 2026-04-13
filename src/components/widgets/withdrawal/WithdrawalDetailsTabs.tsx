"use client";

import type { Chain, TransactionReceipt } from "viem";
import type { GetWithdrawalStatusReturnType } from "viem/op-stack";
import {
  DataTree,
  TreeGroup,
  TreeNode,
  TreeRoot,
  TreeRow,
} from "@/components/ui/DataTree";
import { parseInitiateData } from "@/lib/opstack/withdrawal";
import { PHASE_ICONS } from "./icons";

export function WithdrawalDetailsTabs({
  receipt,
  chain,
  withdrawalStatus,
}: {
  receipt: TransactionReceipt | null;
  chain: Chain | null;
  withdrawalStatus: GetWithdrawalStatusReturnType | null;
}) {
  const initiateData = parseInitiateData(receipt);

  if (!withdrawalStatus) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="panel">
        <div className="panel-header">
          <span>MessagePassed</span>
        </div>
        <div className="panel-body" style={{ padding: 16 }}>
          <DataTree
            empty={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 0",
                  gap: 8,
                }}
              >
                {PHASE_ICONS.initiate("var(--border)")}
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  No initiate data available.
                </span>
              </div>
            }
          >
            {initiateData && (
              <TreeGroup
                depth={0}
                info="keccak256(abi.encode(nonce, sender, target, value, gasLimit, data))"
                row={
                  <TreeRoot
                    label="withdrawalHash"
                    value={initiateData.withdrawalHash}
                    labelCh={15}
                  />
                }
              >
                <TreeNode depth={0} isLast={false}>
                  <TreeRow label="sender" value={initiateData.sender} labelCh={10} />
                </TreeNode>
                <TreeNode depth={0} isLast={false}>
                  <TreeRow label="target" value={initiateData.target} labelCh={10} />
                </TreeNode>
                <TreeNode depth={0} isLast={false}>
                  <TreeRow
                    label="value"
                    value={initiateData.value.toString()}
                    labelCh={10}
                  />
                </TreeNode>
                <TreeNode depth={0} isLast={false}>
                  <TreeRow
                    label="gasLimit"
                    value={initiateData.gasLimit.toString()}
                    labelCh={10}
                  />
                </TreeNode>
                <TreeNode depth={0} isLast={false}>
                  <TreeRow label="data" value={initiateData.data} labelCh={10} />
                </TreeNode>
                <TreeNode depth={0} isLast>
                  <TreeGroup
                    depth={1}
                    info="(version << 240) | msgNonce"
                    row={
                      <TreeRow
                        label="nonce"
                        value={initiateData.nonce.toString()}
                        labelCh={10}
                      />
                    }
                  >
                    <TreeNode depth={1} isLast={false}>
                      <TreeRow
                        label="msgNonce"
                        value={initiateData.msgNonce.toString()}
                        labelCh={10}
                      />
                    </TreeNode>
                    <TreeNode depth={1} isLast>
                      <TreeRow
                        label="version"
                        value={initiateData.version.toString()}
                        labelCh={10}
                      />
                    </TreeNode>
                  </TreeGroup>
                </TreeNode>
              </TreeGroup>
            )}
          </DataTree>
        </div>
      </div>

    </div>
  );
}
