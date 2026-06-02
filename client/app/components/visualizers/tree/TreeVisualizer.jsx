"use client";

import { useMemo } from "react";
import styles from "@/app/styles/tree-visualizer.module.css";
import TreeNode from "./TreeNode";
import TreeEdge from "./TreeEdge";

const H_SPACING = 52;   // horizontal spacing per in-order position (px)
const V_SPACING = 72;   // vertical spacing per depth level (px)
const PADDING_X = 40;   // left/right padding for the canvas
const PADDING_Y = 36;   // top padding for the canvas

/**
 * Compute subtree size (number of in-order positions) recursively.
 * Returns a Map<nodeId, { size, leftSize }> for layout computation.
 */
function computeSubtreeSizes(nodeId, nodes) {
  const sizeMap = new Map();
  const visited = new Set();

  function walk(id) {
    if (!id || !nodes[id] || visited.has(id)) {
      return 0;
    }
    visited.add(id);
    const node = nodes[id];
    const leftSize = walk(node.left);
    const rightSize = walk(node.right);
    const totalSize = leftSize + 1 + rightSize;
    sizeMap.set(id, { size: totalSize, leftSize });
    return totalSize;
  }

  walk(nodeId);
  return sizeMap;
}

/**
 * Compute (x, y) layout positions for every node.
 * Uses in-order position for x, depth for y.
 *
 * Returns:
 *   positions: Map<nodeId, { x, y }>
 *   width:  total canvas width
 *   height: total canvas height
 */
function computeTreeLayout(rootId, nodes) {
  if (!rootId || !nodes[rootId]) {
    return { positions: new Map(), width: 0, height: 0 };
  }

  const sizeMap = computeSubtreeSizes(rootId, nodes);
  const positions = new Map();
  const visited = new Set();
  let maxDepth = 0;

  function assign(id, offset, depth) {
    if (!id || !nodes[id] || visited.has(id)) return;
    visited.add(id);
    const info = sizeMap.get(id);
    if (!info) return;

    // x = offset + left subtree positions + self (center of in-order)
    const x = PADDING_X + (offset + info.leftSize) * H_SPACING;
    const y = PADDING_Y + depth * V_SPACING;

    positions.set(id, { x, y });
    if (depth > maxDepth) maxDepth = depth;

    const node = nodes[id];
    // Left child gets the left portion of the offset
    assign(node.left, offset, depth + 1);
    // Right child gets offset after self
    assign(node.right, offset + info.leftSize + 1, depth + 1);
  }

  assign(rootId, 0, 0);

  const rootInfo = sizeMap.get(rootId);
  const totalPositions = rootInfo ? rootInfo.size : 1;
  const width = PADDING_X * 2 + (totalPositions - 1) * H_SPACING;
  const height = PADDING_Y * 2 + maxDepth * V_SPACING;

  return { positions, width, height };
}

/**
 * Collect all parent→child edges from the tree.
 */
function collectEdges(rootId, nodes) {
  const edges = [];
  const visited = new Set();

  function walk(id) {
    if (!id || !nodes[id] || visited.has(id)) return;
    visited.add(id);
    const node = nodes[id];
    if (node.left && nodes[node.left]) {
      edges.push({ parentId: id, childId: node.left, dir: "left" });
      walk(node.left);
    }
    if (node.right && nodes[node.right]) {
      edges.push({ parentId: id, childId: node.right, dir: "right" });
      walk(node.right);
    }
  }

  walk(rootId);
  return edges;
}

/**
 * Tree Visualizer — G.3.3 Implementation
 *
 * STRUCTURE ONLY. Renders the tree topology as positioned circles and SVG edges.
 * All semantic rendering (pointers, mutations, rewiring, visit tracking) is
 * handled by the overlay and variable layers in VisualizationWorkspace.
 *
 * Props:
 *   currentStep     — current execution state object
 *   executionFocus  — Set<string> of nodeIds currently involved in execution
 *   visitedNodes    — Set<string> of nodeIds that have been visited
 *   activeNodeId    — nodeId being processed this exact step
 *   mutatingNodeId  — nodeId whose value is being mutated this step
 *   mutatingEdges   — Set<string> of parentNodeIds whose child edges are mutating
 */
export default function TreeVisualizer({
  currentStep,
  executionFocus = null,
  visitedNodes = null,
  activeNodeId = null,
  mutatingNodeId = null,
  mutatingEdges = null,
}) {
  const tree = currentStep?.tree;
  if (!tree || !tree.root || !tree.nodes) return null;

  const { root, nodes } = tree;
  if (!nodes[root]) return null;

  // ── Compute layout ─────────────────────────────────────────────
  const { positions, width, height } = useMemo(
    () => computeTreeLayout(root, nodes),
    [root, nodes]
  );

  // ── Collect edges ──────────────────────────────────────────────
  const edges = useMemo(
    () => collectEdges(root, nodes),
    [root, nodes]
  );

  const focusSet = executionFocus || new Set();
  const visitSet = visitedNodes || new Set();
  const mutEdgeSet = mutatingEdges || new Set();

  return (
    <div className={styles.container}>
      <span className={styles.label}>Tree</span>

      <div
        className={styles.treeCanvas}
        style={{ width: `${Math.max(width, 120)}px`, height: `${Math.max(height, 80)}px` }}
      >
        {/* ── SVG Edge Layer ── */}
        <svg className={styles.edgeSvg}>
          {edges.map(({ parentId, childId, dir }) => {
            const pPos = positions.get(parentId);
            const cPos = positions.get(childId);
            if (!pPos || !cPos) return null;
            return (
              <TreeEdge
                key={`edge-${parentId}-${dir}`}
                parentX={pPos.x}
                parentY={pPos.y}
                childX={cPos.x}
                childY={cPos.y}
                isMutating={mutEdgeSet.has(parentId)}
              />
            );
          })}
        </svg>

        {/* ── Node Layer ── */}
        {Array.from(positions.entries()).map(([nodeId, pos]) => (
          <TreeNode
            key={nodeId}
            value={nodes[nodeId].val}
            nodeId={nodeId}
            x={pos.x}
            y={pos.y}
            isFocused={focusSet.has(nodeId)}
            isMutating={nodeId === mutatingNodeId}
            isVisited={visitSet.has(nodeId)}
            isActive={nodeId === activeNodeId}
            isRoot={nodeId === root}
          />
        ))}
      </div>
    </div>
  );
}
