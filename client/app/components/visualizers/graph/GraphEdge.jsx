"use client";

import styles from "@/app/styles/graph-visualizer.module.css";

const NODE_RADIUS = 24; // half of 48px node size

/**
 * Graph Edge — SVG element for a directed or undirected edge.
 * Rendered within the graph's SVG overlay layer.
 *
 * Handles:
 *   - Standard directed edges (straight line with arrowhead)
 *   - Bidirectional edges (curved offset to avoid overlap)
 *   - Self-loops (circular arc back to the same node)
 *
 * Props:
 *   fromX          — source node center X
 *   fromY          — source node center Y
 *   toX            — target node center X
 *   toY            — target node center Y
 *   isDirected     — show arrowhead
 *   isBidirectional — curve the edge to avoid overlapping the reverse edge
 *   isSelfLoop     — edge from a node to itself
 *   isHighlighted  — CSS hook: this edge is being traversed
 *   edgeId         — unique identifier for marker deduplication
 */
export default function GraphEdge({
  fromX,
  fromY,
  toX,
  toY,
  isDirected = true,
  isBidirectional = false,
  isSelfLoop = false,
  isHighlighted = false,
  edgeId = "default",
}) {
  const markerId = `graph-arrow-${edgeId}`;

  // ── Self-loop: small arc above the node ──
  if (isSelfLoop) {
    const loopRadius = 18;
    const startX = fromX;
    const startY = fromY - NODE_RADIUS;
    // Arc going up and back to the same point
    const d = `M ${startX - 8} ${startY} 
               A ${loopRadius} ${loopRadius} 0 1 1 ${startX + 8} ${startY}`;
    return (
      <g>
        {isDirected && (
          <defs>
            <marker
              id={markerId}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L8,3 L0,6 Z"
                className={isHighlighted ? styles.edgeArrowHighlighted : styles.edgeArrow}
              />
            </marker>
          </defs>
        )}
        <path
          d={d}
          className={`${styles.edge} ${isHighlighted ? styles.edgeHighlighted : ""}`}
          markerEnd={isDirected ? `url(#${markerId})` : undefined}
        />
      </g>
    );
  }

  // ── Standard & bidirectional edges ──
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return null;

  // Unit vector from source to target
  const ux = dx / dist;
  const uy = dy / dist;

  // Start and end at circle edges
  const x1 = fromX + ux * NODE_RADIUS;
  const y1 = fromY + uy * NODE_RADIUS;
  const x2 = toX - ux * NODE_RADIUS;
  const y2 = toY - uy * NODE_RADIUS;

  const edgeClass = `${styles.edge} ${isHighlighted ? styles.edgeHighlighted : ""}`;

  if (isBidirectional) {
    // Curve offset perpendicular to the edge direction
    const perpX = -uy;
    const perpY = ux;
    const curveOffset = 12;
    const cpX = (x1 + x2) / 2 + perpX * curveOffset;
    const cpY = (y1 + y2) / 2 + perpY * curveOffset;
    const d = `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`;

    return (
      <g>
        {isDirected && (
          <defs>
            <marker
              id={markerId}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L8,3 L0,6 Z"
                className={isHighlighted ? styles.edgeArrowHighlighted : styles.edgeArrow}
              />
            </marker>
          </defs>
        )}
        <path
          d={d}
          className={edgeClass}
          markerEnd={isDirected ? `url(#${markerId})` : undefined}
        />
      </g>
    );
  }

  // Straight line
  return (
    <g>
      {isDirected && (
        <defs>
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L8,3 L0,6 Z"
              className={isHighlighted ? styles.edgeArrowHighlighted : styles.edgeArrow}
            />
          </marker>
        </defs>
      )}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={edgeClass}
        markerEnd={isDirected ? `url(#${markerId})` : undefined}
      />
    </g>
  );
}

