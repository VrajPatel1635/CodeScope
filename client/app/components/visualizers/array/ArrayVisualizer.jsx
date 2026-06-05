"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/styles/array-visualizer.module.css";
import ArrayCell from "@/app/components/visualizers/array/ArrayCell";

/**
 * Array Visualizer — G.3.1 Redesign
 * 
 * A layered visual debugger for array execution.
 * 
 * LAYER 1: Premium cell rendering with design-system tokens
 * LAYER 3: Execution focus highlighting
 *
 * Props:
 *   currentStep              — current execution state object
 *   pointers                 — array of { name, index } for variable ownership
 *   mutationEvents           — array of { index, oldValue, newValue } (for css hook)
 *   comparisonIndices        — [indexA, indexB] | [indexA] | null (for css hook)
 *   executionFocus           — Set<number> of focused cell indices
 *   matrixVisualizationData  — { matrix, mutationEvents, activeCell } data contract
 */
export default function ArrayVisualizer({
  currentStep,
  pointers = [],
  mutationEvents = [],
  comparisonIndices = null,
  executionFocus = null,
  matrixVisualizationData = null,
}) {
  const array = currentStep?.array || [];
  const matrix = currentStep?.matrix || null;

  // For matrix: keep last valid cell so highlight doesn't flicker
  const lastValidMatrixPtrRef = useRef(null);

  // Use coordinate model from data contract (no hardcoded i/j)
  const activeCell = matrixVisualizationData?.activeCell ?? null;
  const hasValidCell = Boolean(matrix) && activeCell !== null;

  useEffect(() => {
    if (hasValidCell) {
      lastValidMatrixPtrRef.current = { row: activeCell.row, col: activeCell.col };
    }
  }, [hasValidCell, activeCell]);

  if (!matrix && (!array || array.length === 0)) return null;

  // ── 2D MATRIX RENDERER ──────────────────────────────────────────
  if (matrix) {
    return renderMatrix(matrix, hasValidCell, activeCell, lastValidMatrixPtrRef, matrixVisualizationData);
  }

  // ── Responsive cell sizing ──────────────────────────────────────
  const { cellSize, fontSize, gap } = getCellDimensions(array.length);

  // Build focus set for O(1) lookup
  const focusSet = executionFocus || new Set();

  // Comparison set for O(1) lookup
  const compareSet = new Set(comparisonIndices || []);

  return (
    <div className={styles.container}>
      <span className={styles.label}>Array</span>

      <div
        className={styles.arrayRow}
        style={{
          "--av-cell-size": `${cellSize}px`,
          "--av-font-size": `${fontSize}px`,
          "--av-gap": `${gap}px`,
        }}
      >
        {/* Cell columns */}
        {array.map((val, idx) => {
          const cellMutation = mutationEvents.find(m => m.index === idx);
          const isMutating = !!cellMutation;
          const isComparing = compareSet.has(idx);
          const isFocused = focusSet.has(idx);

          return (
            <div key={idx} className={styles.cellColumn}>
              {/* Structural Cell */}
              <ArrayCell
                value={val}
                index={idx}
                isFocused={isFocused}
                isMutating={isMutating}
                isComparing={isComparing}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function getCellDimensions(length) {
  if (length <= 10) return { cellSize: 48, fontSize: 15, gap: 10 };
  if (length <= 20) return { cellSize: 42, fontSize: 14, gap: 8 };
  if (length <= 30) return { cellSize: 36, fontSize: 12, gap: 6 };
  return { cellSize: 28, fontSize: 10, gap: 4 };
}

function renderMatrix(matrix, hasValidCell, activeCell, lastValidMatrixPtrRef, matrixVisualizationData) {
  const cellRow = hasValidCell ? activeCell.row : lastValidMatrixPtrRef.current?.row;
  const cellCol = hasValidCell ? activeCell.col : lastValidMatrixPtrRef.current?.col;

  // Build a set of mutating cells for O(1) lookup
  const mutatingCells = new Set();
  if (matrixVisualizationData?.mutationEvents) {
    matrixVisualizationData.mutationEvents.forEach(m => {
      mutatingCells.add(`${m.row},${m.col}`);
    });
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>Matrix</span>

      <div className={styles.matrixContainer}>
        {matrix.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className={styles.matrixRow}>
            {row.map((val, cIdx) => {
              const isActive = rIdx === cellRow && cIdx === cellCol;
              const isMutating = mutatingCells.has(`${rIdx},${cIdx}`);
              const cellClasses = [
                styles.matrixCell,
                isActive && styles.matrixCellActive,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={`col-${cIdx}`} id={`matrix-cell-${rIdx}-${cIdx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className={cellClasses}>{val}</div>
                  {isActive && (
                    <div className={styles.matrixPointer}>
                      <span className={styles.matrixPointerText}>
                        [{cellRow}, {cellCol}]
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

