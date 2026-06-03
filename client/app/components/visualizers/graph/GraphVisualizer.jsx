"use client";

import { useMemo } from "react";
import styles from "@/app/styles/graph-visualizer.module.css";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";

const MIN_RADIUS = 80;
const RADIUS_PER_NODE = 30;
const PADDING = 60;

/**
 * Compute circular layout positions for all nodes.
 * Deterministic: same node set → same positions.
 *
 * Returns:
 *   positions: Map<nodeId, { x, y }>
 *   width:  total canvas width
 *   height: total canvas height
 */
function computeCircularLayout(nodeIds) {
  const positions = new Map();
  const count = nodeIds.length;

  if (count === 0) return { positions, width: 0, height: 0 };

  if (count === 1) {
    const cx = PADDING + MIN_RADIUS;
    const cy = PADDING + MIN_RADIUS;
    positions.set(nodeIds[0], { x: cx, y: cy });
    return {
      positions,
      width: cx * 2,
      height: cy * 2,
    };
  }

  const R = Math.max(MIN_RADIUS, RADIUS_PER_NODE * count);
  const cx = PADDING + R;
  const cy = PADDING + R;

  for (let i = 0; i < count; i++) {
    // Start from top (-π/2) and go clockwise
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    positions.set(nodeIds[i], { x, y });
  }

  return {
    positions,
    width: (PADDING + R) * 2,
    height: (PADDING + R) * 2,
  };
}

/**
 * Collect all edges from the adjacency list.
 * Detects bidirectional pairs and self-loops.
 * Purely iterative — no recursion, inherently cycle-safe.
 *
 * Returns array of edge descriptors.
 */
function collectEdges(adjacency) {
  const edges = [];
  const edgeSet = new Set(); // Track "from->to" to detect bidirectional pairs

  // First pass: collect all raw edges
  const rawEdges = [];
  for (const [from, neighbors] of Object.entries(adjacency)) {
    if (!Array.isArray(neighbors)) continue;
    for (const to of neighbors) {
      rawEdges.push({ from, to: String(to).startsWith("graphNode_") ? to : `graphNode_${to}` });
      edgeSet.add(`${from}->${String(to).startsWith("graphNode_") ? to : `graphNode_${to}`}`);
    }
  }

  // Second pass: classify edges
  const processedPairs = new Set();
  for (const { from, to } of rawEdges) {
    const isSelfLoop = from === to;
    const reverseKey = `${to}->${from}`;
    const isBidirectional = edgeSet.has(reverseKey) && !isSelfLoop;

    // For bidirectional pairs, avoid double-processing the pair
    const pairKey = [from, to].sort().join("<->");
    if (isBidirectional && processedPairs.has(pairKey)) {
      // This is the second edge of a bidirectional pair — still render it
      // but mark it so it curves the other way
      edges.push({
        from,
        to,
        isSelfLoop: false,
        isBidirectional: true,
        edgeId: `${from}-${to}`,
      });
      continue;
    }

    if (isBidirectional) {
      processedPairs.add(pairKey);
    }

    edges.push({
      from,
      to,
      isSelfLoop,
      isBidirectional,
      edgeId: `${from}-${to}`,
    });
  }

  return edges;
}

/**
 * Extract a readable label from a graph node ID.
 * "graphNode_0" → "0", "graphNode_12" → "12"
 */
function nodeLabel(nodeId) {
  if (nodeId.startsWith("graphNode_")) {
    return nodeId.slice("graphNode_".length);
  }
  return nodeId;
}

/**
 * Graph Visualizer — G.3.4 Implementation
 *
 * STRUCTURE ONLY. Renders graph topology as positioned circles and SVG edges.
 * All semantic rendering (pointers, visited state labels, queue panels) is
 * handled by the overlay and variable layers in VisualizationWorkspace.
 *
 * Props:
 *   currentStep     — current execution state object
 *   executionFocus  — Set<string> of nodeIds currently involved in execution
 *   activeNodeId    — nodeId being processed this exact step
 */
export default function GraphVisualizer({
  currentStep,
  executionFocus = null,
  activeNodeId = null,
}) {
  const graph = currentStep?.graph;
  if (!graph || !graph.nodes || graph.nodes.length === 0) return null;

  const { nodes: nodeIds, adjacency = {}, visitedState = {}, frontier: rawFrontier = [] } = graph;

  // Deterministic sort for stable layout
  const sortedNodeIds = useMemo(
    () => [...nodeIds].sort((a, b) => {
      const numA = parseInt(a.replace("graphNode_", ""), 10);
      const numB = parseInt(b.replace("graphNode_", ""), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    }),
    [nodeIds]
  );

  // ── Compute layout ─────────────────────────────────────────────
  const { positions, width, height } = useMemo(
    () => computeCircularLayout(sortedNodeIds),
    [sortedNodeIds]
  );

  // ── Collect edges (cycle-safe, iterative) ──────────────────────
  const edges = useMemo(
    () => collectEdges(adjacency),
    [adjacency]
  );

  const focusSet = executionFocus || new Set();
  const frontierSet = useMemo(() => new Set(rawFrontier), [rawFrontier]);

  return (
    <div className={styles.container}>
      <span className={styles.label}>Graph</span>

      <div
        className={styles.graphCanvas}
        style={{ width: `${Math.max(width, 160)}px`, height: `${Math.max(height, 160)}px` }}
      >
        {/* ── SVG Edge Layer ── */}
        <svg className={styles.edgeSvg}>
          {edges.map((edge) => {
            const fromPos = positions.get(edge.from);
            const toPos = positions.get(edge.to);
            if (!fromPos || !toPos) return null;
            return (
              <GraphEdge
                key={`edge-${edge.edgeId}`}
                fromX={fromPos.x}
                fromY={fromPos.y}
                toX={toPos.x}
                toY={toPos.y}
                isDirected={true}
                isBidirectional={edge.isBidirectional}
                isSelfLoop={edge.isSelfLoop}
                isHighlighted={false}
                edgeId={edge.edgeId}
              />
            );
          })}
        </svg>

        {/* ── Node Layer ── */}
        {sortedNodeIds.map((nId) => {
          const pos = positions.get(nId);
          if (!pos) return null;
          return (
            <GraphNode
              key={nId}
              nodeId={nId}
              label={nodeLabel(nId)}
              x={pos.x}
              y={pos.y}
              isVisited={visitedState[nId] === true}
              isActive={nId === activeNodeId}
              isFrontier={frontierSet.has(nId)}
              isFocused={focusSet.has(nId)}
            />
          );
        })}
      </div>
    </div>
  );
}
