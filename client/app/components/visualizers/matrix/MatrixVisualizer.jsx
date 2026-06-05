"use client";

import { useMemo } from "react";
import styles from "@/app/styles/MatrixVisualizer.module.css";
import MatrixRow from "./MatrixRow";

/**
 * MatrixVisualizer — V1
 *
 * Dedicated component-based visualizer for 2D arrays.
 * Receives the matrix visualization data contract and renders
 * a CSS Grid of MatrixRow > MatrixCell components.
 *
 * Props:
 *   matrixVisualizationData — { matrix, mutationEvents, activeCell }
 */
export default function MatrixVisualizer({ matrixVisualizationData }) {
  if (!matrixVisualizationData?.matrix) return null;

  const { matrix, mutationEvents, activeCell } = matrixVisualizationData;
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  if (rows === 0 || cols === 0) return null;

  // Pre-compute mutating cell set for O(1) lookup
  const mutatingCells = useMemo(() => {
    const cells = new Set();
    if (mutationEvents) {
      mutationEvents.forEach(m => cells.add(`${m.row},${m.col}`));
    }
    return cells;
  }, [mutationEvents]);

  // Responsive cell sizing based on matrix dimensions
  const { cellSize, fontSize } = getCellDimensions(rows, cols);

  return (
    <div className={styles.container}>
      <span className={styles.label}>Matrix</span>

      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${cols}, var(--matrix-cell-size, ${cellSize}px))`,
          "--matrix-cell-size": `${cellSize}px`,
          "--matrix-font-size": `${fontSize}px`,
        }}
      >
        {matrix.map((rowData, rIdx) => (
          <MatrixRow
            key={`row-${rIdx}`}
            rowIndex={rIdx}
            rowData={rowData}
            activeCell={activeCell}
            mutatingCells={mutatingCells}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function getCellDimensions(rows, cols) {
  const maxDim = Math.max(rows, cols);
  if (maxDim <= 5)  return { cellSize: 48, fontSize: 15 };
  if (maxDim <= 8)  return { cellSize: 42, fontSize: 14 };
  if (maxDim <= 10) return { cellSize: 36, fontSize: 12 };
  return { cellSize: 28, fontSize: 10 };
}
