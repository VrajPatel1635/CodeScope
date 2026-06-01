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
 *   currentStep        — current execution state object
 *   pointers           — array of { name, index } for variable ownership (matrix only)
 *   mutationEvents     — array of { index, oldValue, newValue } (for css hook)
 *   comparisonIndices  — [indexA, indexB] | [indexA] | null (for css hook)
 *   executionFocus     — Set<number> of focused cell indices
 */
export default function ArrayVisualizer({
  currentStep,
  pointers = [],
  mutationEvents = [],
  comparisonIndices = null,
  executionFocus = null,
}) {
  const array = currentStep?.array || [];
  const matrix = currentStep?.matrix || null;

  // For matrix: keep last valid (i,j) so highlight doesn't flicker
  const lastValidMatrixPtrRef = useRef(null);
  const rawI = matrix ? pointers.find((p) => p.name.toLowerCase() === "i")?.index : undefined;
  const rawJ = matrix ? pointers.find((p) => p.name.toLowerCase() === "j")?.index : undefined;
  const hasValidIJ = Boolean(matrix) && typeof rawI === "number" && typeof rawJ === "number";

  useEffect(() => {
    if (hasValidIJ) {
      lastValidMatrixPtrRef.current = { i: rawI, j: rawJ };
    }
  }, [hasValidIJ, rawI, rawJ]);

  if (!matrix && (!array || array.length === 0)) return null;

  // ── 2D MATRIX RENDERER ──────────────────────────────────────────
  if (matrix) {
    return renderMatrix(matrix, hasValidIJ, rawI, rawJ, lastValidMatrixPtrRef);
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

function renderMatrix(matrix, hasValidIJ, rawI, rawJ, lastValidMatrixPtrRef) {
  const iVar = hasValidIJ ? rawI : lastValidMatrixPtrRef.current?.i;
  const jVar = hasValidIJ ? rawJ : lastValidMatrixPtrRef.current?.j;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Matrix</span>

      <div className={styles.matrixContainer}>
        {matrix.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className={styles.matrixRow}>
            {row.map((val, cIdx) => {
              const isActive = rIdx === iVar && cIdx === jVar;
              const cellClasses = [
                styles.matrixCell,
                isActive && styles.matrixCellActive,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={`col-${cIdx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className={cellClasses}>{val}</div>
                  {isActive && (
                    <div className={styles.matrixPointer}>
                      <span className={styles.matrixPointerText}>
                        i={iVar}, j={jVar}
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
