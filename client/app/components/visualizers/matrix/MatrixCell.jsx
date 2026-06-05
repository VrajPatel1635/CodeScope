"use client";

import styles from "@/app/styles/MatrixVisualizer.module.css";

/**
 * MatrixCell — V1
 * 
 * Renders a single cell in the matrix grid.
 * Pure display component with no business logic.
 *
 * Props:
 *   value      — cell value to display
 *   row        — row index
 *   col        — column index
 *   isActive   — whether this is the current active cell
 *   isMutated  — whether this cell is being mutated this step
 */
export default function MatrixCell({
  value,
  row,
  col,
  isActive = false,
  isMutated = false,
}) {
  const cellClasses = [
    styles.cell,
    isActive && styles.cellActive,
    isMutated && styles.cellMutated,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div id={`matrix-cell-${row}-${col}`} className={cellClasses}>
        {typeof value === "boolean" ? String(value) : value}
      </div>
      {isActive && (
        <span className={styles.coordinateText}>
          [{row},{col}]
        </span>
      )}
    </div>
  );
}
