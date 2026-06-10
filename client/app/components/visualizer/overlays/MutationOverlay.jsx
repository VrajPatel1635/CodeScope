"use client";

import styles from "@/app/styles/array-visualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * LAYER 4 — Mutation Overlay
 * Floats an 'oldValue → newValue' animation above a mutating node.
 * Positioned absolutely based on dynamic registry coordinates.
 *
 * Props:
 *   targetNodeId — ID of the mutating node
 *   oldValue     — previous value
 *   newValue     — new value
 */
export default function MutationOverlay({ targetNodeId, oldValue, newValue }) {
  const { nodes } = useNodeRegistry();
  const rect = nodes.get(targetNodeId);

  if (!rect) return null;

  return (
    <div
      className={styles.mutationOverlay}
      style={{
        position: 'absolute',
        top: `${rect.top}px`, // This places it at the top edge of the cell. CSS transitions inside module will push it up via transform.
        left: `${rect.cx}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 60,
      }}
    >
      <span className={styles.oldValue}>{oldValue}</span>
      <span className={styles.arrow}>→</span>
      <span className={styles.newValue}>{newValue}</span>
    </div>
  );
}
