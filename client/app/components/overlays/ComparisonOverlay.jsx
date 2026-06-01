"use client";

import styles from "@/app/styles/array-visualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * LAYER 5 — Comparison Connector
 * Draws an SVG bracket between two nodes being compared.
 * Positioned absolutely based on dynamic registry coordinates.
 *
 * Props:
 *   nodeIdA    — first compared node ID
 *   nodeIdB    — second compared node ID
 */
export default function ComparisonOverlay({ nodeIdA, nodeIdB }) {
  const { nodes } = useNodeRegistry();
  const rectA = nodes.get(nodeIdA);
  const rectB = nodes.get(nodeIdB);

  if (!rectA || !rectB) return null;

  // Center X of each node relative to the container
  const xA = rectA.cx;
  const xB = rectB.cx;
  
  // Calculate bracket Y position (drawn above the highest node)
  const minY = Math.min(rectA.top, rectB.top);
  const bracketBottom = minY - 10;
  const bracketTop = bracketBottom - 16;
  const midX = (xA + xB) / 2;

  // SVG path: from A up, across, and down to B
  const path = `M ${xA} ${bracketBottom} L ${xA} ${bracketTop} L ${xB} ${bracketTop} L ${xB} ${bracketBottom}`;

  return (
    <svg
      className={styles.comparisonSvg}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 50 
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="var(--accent-secondary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* "vs" label at midpoint */}
      <text
        x={midX}
        y={bracketTop - 2}
        textAnchor="middle"
        className={styles.comparisonLabel}
      >
        vs
      </text>
    </svg>
  );
}
