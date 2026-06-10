"use client";

import styles from "@/app/styles/rewire-overlay.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * Rewire Overlay — Edge Mutation Visualization
 * Draws SVG arcs showing old edge (fading out) and new edge (appearing)
 * when a node's .next pointer is changed.
 *
 * Uses NodeRegistryContext for coordinate resolution.
 * This is a general-purpose overlay, reusable for trees/graphs.
 *
 * Props:
 *   sourceNodeId    — the node whose .next was changed (e.g. "ll-node-node_2")
 *   oldTargetNodeId — the previous .next target (e.g. "ll-node-node_3"), or null
 *   newTargetNodeId — the new .next target (e.g. "ll-node-node_1"), or null
 */
export default function RewireOverlay({ sourceNodeId, oldTargetNodeId, newTargetNodeId }) {
  const { nodes } = useNodeRegistry();
  const sourceRect = nodes.get(sourceNodeId);

  if (!sourceRect) return null;

  // At least one target must be resolvable
  const oldRect = oldTargetNodeId ? nodes.get(oldTargetNodeId) : null;
  const newRect = newTargetNodeId ? nodes.get(newTargetNodeId) : null;

  if (!oldRect && !newRect) return null;

  // Source point: right edge center of the source node
  const sx = sourceRect.right;
  const sy = sourceRect.cy;

  return (
    <svg className={styles.rewireSvg}>
      <defs>
        <marker
          id="rewire-arrow-new"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,3 L0,6 Z" className={styles.newEdgeArrow} />
        </marker>
        <marker
          id="rewire-arrow-old"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,3 L0,6 Z" fill="var(--exec-error)" opacity="0.5" />
        </marker>
      </defs>

      {/* Old edge — fading dashed arc */}
      {oldRect && (
        <path
          d={computeArc(sx, sy, oldRect.left, oldRect.cy, -25)}
          className={styles.oldEdge}
          markerEnd="url(#rewire-arrow-old)"
        />
      )}

      {/* New edge — appearing solid arc */}
      {newRect && (
        <>
          <path
            d={computeArc(sx, sy, newRect.left, newRect.cy, 25)}
            className={styles.newEdge}
            markerEnd="url(#rewire-arrow-new)"
          />
          {/* "rewired" label at midpoint */}
          <text
            x={(sx + newRect.left) / 2}
            y={Math.max(sy, newRect.cy) + 35}
            textAnchor="middle"
            className={styles.rewireLabel}
          >
            rewired
          </text>
        </>
      )}
    </svg>
  );
}

/**
 * Compute a curved arc path between two points.
 * offset > 0 curves below, offset < 0 curves above.
 */
function computeArc(x1, y1, x2, y2, offset) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 + offset;
  return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
}
