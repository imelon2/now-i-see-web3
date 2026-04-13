"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/**
 * Deep blue used when a TreeGroup's line is being hovered. Chosen to be
 * visible against the neutral `var(--border)` default while still reading
 * as "deep", not neon. Fades in/out slowly via the `border-color`
 * transition on TreeNode branch/arm elements.
 */
const TREE_HOVER_COLOR = "#2563eb";
const TREE_HOVER_TRANSITION =
  "color 0.6s ease, border-color 0.6s ease, filter 0.6s ease";

/**
 * Vertical pixel skip when extending the arm upward through a parent row.
 * Skips the first N pixels (≈ label text line) of the anchor row so the
 * connector line does not visually cut through label text.
 */
const ARM_UPWARD_SKIP = 25;

/**
 * Context scoped to a single `TreeGroup` instance. Only immediate child
 * `TreeNode`s whose `depth` matches the group's depth read the hover
 * state; nested groups override the context for their own subtree, so
 * the feedback stays isolated per group.
 */
const TreeGroupContext = createContext<{
  hovered: boolean;
  depth: number;
} | null>(null);

/**
 * Shared primitive for rendering ASCII-tree style data panels
 * (MessagePassed, OpaqueData, L2HashDerivation, …).
 *
 * Usage:
 *
 *   <DataTree>
 *     <TreeRoot label="withdrawalHash" value={hash} labelCh={14} />
 *     <TreeGroup depth={0} info="keccak256(abi.encode(...))">
 *       <TreeNode depth={0} isLast={false}>
 *         <TreeRow label="sender" value={sender} labelCh={12} />
 *       </TreeNode>
 *       <TreeNode depth={0} isLast>
 *         <TreeRow label="nonce" value={nonce} labelCh={12} />
 *         <TreeGroup depth={1} info="(version << 240) | msgNonce">
 *           <TreeNode depth={1} isLast={false}>
 *             <TreeRow label="msgNonce" value={n} labelCh={10} />
 *           </TreeNode>
 *           <TreeNode depth={1} isLast>
 *             <TreeRow label="version" value={v} labelCh={10} />
 *           </TreeNode>
 *         </TreeGroup>
 *       </TreeNode>
 *     </TreeGroup>
 *   </DataTree>
 *
 * Convention:
 *   - Siblings at the same depth should share the same `labelCh` so value
 *     columns align. Depths are independent.
 *   - `TreeGroup` wraps a set of sibling `TreeNode`s and optionally attaches
 *     an encoding/formula tooltip to the vertical connector line produced
 *     by those siblings. Hovering the line reveals the tooltip.
 */
export function DataTree({
  children,
  empty,
}: {
  children?: ReactNode;
  empty?: ReactNode;
}) {
  const hasChildren = Array.isArray(children)
    ? children.some(Boolean)
    : Boolean(children);
  return (
    <div
      style={{
        fontSize: 13,
        fontFamily: "var(--font-mono)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {hasChildren ? children : empty}
    </div>
  );
}

/**
 * Unindented root row. Follow it with `TreeGroup` (optionally carrying an
 * encoding/formula tooltip) wrapping the child `TreeNode`s.
 */
export function TreeRoot(props: TreeRowProps) {
  return <TreeRow {...props} padding={props.padding ?? "6px 0"} />;
}

/**
 * Wraps a set of sibling `TreeNode`s at the same depth and optionally
 * attaches an encoding/formula tooltip to the vertical connector line
 * those siblings produce. The line position is deterministic
 * (`left = 8 + depth * 16`), so the hover target stays in a consistent
 * column regardless of label length or value content.
 */
export function TreeGroup({
  depth,
  info,
  row,
  children,
}: {
  depth: number;
  info?: string;
  /**
   * Parent row (usually a `TreeRoot`/`TreeRow`) that this group explains.
   * When the line is hovered, the row's label is co-highlighted via a
   * cloned `highlighted` prop, so the user sees "this formula produces
   * that row" at a glance.
   */
  row?: ReactElement;
  children: ReactNode;
}) {
  const [show, setShow] = useState(false);

  const rowElement =
    row && isValidElement(row)
      ? cloneElement(
          row as ReactElement<{
            highlighted?: boolean;
            onHoverChange?: (h: boolean) => void;
          }>,
          {
            highlighted: show,
            onHoverChange: (h: boolean) => setShow(h),
          },
        )
      : row;

  if (!info) {
    return (
      <>
        {rowElement}
        {children}
      </>
    );
  }

  // Line sits at TreeNode's marginLeft (8 + depth*16). We center a ~9px
  // invisible hover strip around that column. The strip stops `15px` from
  // the bottom so it does not overlap the last child's elbow area.
  const lineLeft = 8 + depth * 16;

  // Extend the hover strip upward to cover the arm extension that reaches
  // through the parent row's wrapped area. We measure the wrapper's
  // previousElementSibling (the rowElement) to mirror the same offset the
  // first child TreeNode uses for its arm extension (ARM_UPWARD_SKIP).
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [stripTop, setStripTop] = useState(0);
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const anchor = wrapper.previousElementSibling;
    if (!anchor) return;
    const measure = () => {
      const anchorH = anchor.getBoundingClientRect().height;
      setStripTop(-Math.max(0, anchorH - ARM_UPWARD_SKIP));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(anchor);
    return () => ro.disconnect();
  }, []);

  return (
    <TreeGroupContext.Provider value={{ hovered: show, depth }}>
      {rowElement}
      <div ref={wrapperRef} style={{ position: "relative" }}>
        {children}
        <div
          style={{
            position: "absolute",
            left: lineLeft - 4,
            top: stripTop,
            bottom: 15,
            width: 9,
            cursor: "help",
            zIndex: 2,
          }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          aria-describedby={show ? "tree-group-tooltip" : undefined}
        />
        {show && (
          <div
            id="tree-group-tooltip"
            role="tooltip"
            style={{
              position: "absolute",
              left: lineLeft + 14,
              top: 0,
              background: "color-mix(in srgb, #394950 5%, var(--panel))",
              border:
                "1px solid color-mix(in srgb, #7dd3fc 20%, var(--border))",
              padding: "4px 10px",
              fontSize: 11,
              color: "var(--foreground)",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            {info}
          </div>
        )}
      </div>
    </TreeGroupContext.Provider>
  );
}

/**
 * Indented branch with a 90° arm connector. Children can include a
 * `TreeRow`, further nested `TreeNode`s, or a `TreeGroup` wrapping
 * nested siblings.
 */
export function TreeNode({
  depth,
  isLast,
  children,
}: {
  depth: number;
  isLast: boolean;
  children: ReactNode;
}) {
  const marginLeft = 8 + depth * 16;
  // Only respond to hover of the group that directly owns this TreeNode.
  // Nested TreeGroups override the context for their own subtree, so
  // cross-group bleed is impossible as long as depth is monotonic.
  const ctx = useContext(TreeGroupContext);
  const active = !!ctx?.hovered && ctx.depth === depth;
  const lineColor = active ? TREE_HOVER_COLOR : "var(--border)";

  // Measure how far the connector arm should stretch upward so it
  // visually spans any wrapped row above us (e.g. a long rlpEncoded hex
  // that wraps over many lines). Only the *first* child in a wrapper
  // needs the extension — subsequent siblings already sit flush against
  // the preceding TreeNode's borderLeft, so upward = 0 there.
  //
  // For the first child we locate the wrapper's previousElementSibling
  // (typically the `rowElement` a `TreeGroup` rendered just before its
  // inner wrapper div) and measure the pixel gap via
  // getBoundingClientRect so the extension naturally grows/shrinks as
  // the parent row wraps or unwraps.
  const containerRef = useRef<HTMLDivElement>(null);
  const [upwardHeight, setUpwardHeight] = useState(0);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      let upward = 0;
      if (!el.previousElementSibling) {
        const anchor = el.parentElement?.previousElementSibling;
        if (anchor) {
          upward = Math.max(
            0,
            el.getBoundingClientRect().top -
              anchor.getBoundingClientRect().top,
          );
        }
      }
      setUpwardHeight(upward);
    };
    measure();
    const parent = el.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    const anchor = parent.previousElementSibling;
    if (anchor) ro.observe(anchor);
    Array.from(parent.children).forEach((c) => {
      if (c instanceof Element) ro.observe(c);
    });
    return () => ro.disconnect();
  }, []);

  // Arm stays anchored at the node's own column (original geometry).
  // Only the vertical stroke is stretched upward by `upwardHeight` so the
  // connector passes through the wrapped area of a tall parent row. This
  // preserves the per-depth tree indentation AND keeps the `TreeGroup`
  // hover strip (positioned at `8 + depth*16`) aligned with the visible
  // line — both fixes for the earlier regression where a depth-based arm
  // shift broke hover detection and cluttered the layout.
  const branchStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    marginLeft,
    position: "relative",
    borderLeft: isLast ? "none" : `1px solid ${lineColor}`,
    transition: TREE_HOVER_TRANSITION,
  };
  // Skip the first 15px of the anchor row (the label text line). The
  // connector only needs to span the wrapped-value area on lines 2+ —
  // those lines are empty at the nested connector column because the
  // value text starts at `labelCh + marginLeft` further to the right.
  const effectiveUpward = Math.max(0, upwardHeight - ARM_UPWARD_SKIP);
  // Subtle glow on the arm line — just enough to hint "this is hoverable"
  // without being distracting. On hover the glow shifts to the deep blue
  // accent to reinforce the active state.
  const armGlow = active
    ? "drop-shadow(0 0 4px rgba(37, 99, 232, 0.45))"
    : "drop-shadow(0 0 3px rgba(100, 170, 255, 0.2))";
  const armStyle: CSSProperties = {
    position: "absolute",
    left: isLast ? 0 : -1,
    top: -effectiveUpward,
    width: 10,
    height: effectiveUpward + 15,
    borderLeft: `1px solid ${lineColor}`,
    borderBottom: `1px solid ${lineColor}`,
    filter: armGlow,
    transition: TREE_HOVER_TRANSITION,
    pointerEvents: "none",
  };
  return (
    <div ref={containerRef} style={branchStyle}>
      <div style={armStyle} />
      <div style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

export interface TreeRowProps {
  label: string;
  value: ReactNode;
  /** Fixed label column width in `ch` units (monospace char widths). */
  labelCh?: number;
  /** Use mono font for the label (default true). */
  mono?: boolean;
  /** Dim the value color (for tuple/placeholder rows). */
  muted?: boolean;
  /** Override the vertical padding of the row. */
  padding?: string;
  /**
   * When true, the label is tinted with the shared tree hover color. Set
   * automatically by the owning `TreeGroup` when its line is hovered.
   */
  highlighted?: boolean;
  /**
   * Called when the label span's hover state changes. Used by `TreeGroup`
   * to trigger line highlight when the user hovers the parent key only
   * (not the value).
   */
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * Single label → value row. Used at the root level (via `TreeRoot`) or
 * inside a `TreeNode` branch.
 */
export function TreeRow({
  label,
  value,
  labelCh,
  mono = true,
  muted,
  padding = "5px 0",
  highlighted,
  onHoverChange,
}: TreeRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding,
        // Establish a local stacking context so the row always renders on
        // top of a sibling `TreeNode`'s extended arm line (which uses
        // `z-index: -1`). Without this the extension would visually cut
        // through the label text.
        position: "relative",
        zIndex: 1,
      }}
    >
      <span
        style={{
          color: highlighted ? TREE_HOVER_COLOR : "var(--muted)",
          transition: TREE_HOVER_TRANSITION,
          flexShrink: 0,
          fontSize: 12,
          whiteSpace: "nowrap",
          width: labelCh ? `${labelCh}ch` : undefined,
          fontFamily: mono ? "var(--font-mono)" : undefined,
          cursor: onHoverChange ? "help" : undefined,
        }}
        onMouseEnter={onHoverChange ? () => onHoverChange(true) : undefined}
        onMouseLeave={onHoverChange ? () => onHoverChange(false) : undefined}
      >
        {label}
      </span>
      <span
        style={{
          color: muted ? "var(--muted)" : "var(--foreground)",
          wordBreak: "break-all",
          marginLeft: 10,
        }}
      >
        {value}
      </span>
    </div>
  );
}
