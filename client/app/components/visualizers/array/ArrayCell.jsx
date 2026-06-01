"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/styles/array-visualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * LAYER 1 + 3 — Array Cell
 * Renders a single cell with value. 
 * Registers its DOM node with NodeRegistryContext so semantic overlays 
 * can float over it correctly.
 * 
 * Props:
 *   value        — cell value to display
 *   index        — array index
 *   isFocused    — LAYER 3: execution references this cell
 *   isMutating   — (CSS Hook only)
 *   isComparing  — (CSS Hook only)
 */
export default function ArrayCell({
  value,
  index,
  isFocused = false,
  isMutating = false,
  isComparing = false,
}) {
  const { registerNode, unregisterNode } = useNodeRegistry();
  const cellRef = useRef(null);

  useEffect(() => {
    const nodeId = `array-cell-${index}`;
    if (cellRef.current) {
      registerNode(nodeId, cellRef.current);
    }
    return () => {
      unregisterNode(nodeId);
    };
  }, [index, registerNode, unregisterNode]);

  const cellClasses = [
    styles.cell,
    isMutating && styles.cellMutating,
    isComparing && styles.cellComparing,
    isFocused && !isMutating && !isComparing && styles.cellFocused,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.cellColumn}>
      {/* Structural Cell */}
      <div ref={cellRef} className={cellClasses}>
        {value}
      </div>

      {/* Index label below cell */}
      <span className={styles.indexLabel}>{index}</span>
    </div>
  );
}
