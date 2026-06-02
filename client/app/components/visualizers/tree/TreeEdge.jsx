"use client";

import styles from "@/app/styles/tree-visualizer.module.css";

/**
 * Tree Edge — SVG line from parent to child.
 * Rendered within the tree's SVG overlay layer.
 *
 * Props:
 *   parentX    — parent node center X
 *   parentY    — parent node center Y
 *   childX     — child node center X
 *   childY     — child node center Y
 *   isMutating — CSS hook: this edge is being rewired this step
 */
export default function TreeEdge({
  parentX,
  parentY,
  childX,
  childY,
  isMutating = false,
}) {
  const NODE_RADIUS = 22; // half of 44px node size

  // Start from bottom of parent circle, end at top of child circle
  const dx = childX - parentX;
  const dy = childY - parentY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return null;

  // Unit vector from parent to child
  const ux = dx / dist;
  const uy = dy / dist;

  // Start point: edge of parent circle towards child
  const x1 = parentX + ux * NODE_RADIUS;
  const y1 = parentY + uy * NODE_RADIUS;

  // End point: edge of child circle towards parent
  const x2 = childX - ux * NODE_RADIUS;
  const y2 = childY - uy * NODE_RADIUS;

  const edgeClasses = [
    styles.edge,
    isMutating && styles.edgeMutating,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={edgeClasses}
    />
  );
}
