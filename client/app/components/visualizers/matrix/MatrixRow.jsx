"use client";

import MatrixCell from "./MatrixCell";

/**
 * MatrixRow — V1
 *
 * Renders a single row of the matrix as a sequence of MatrixCell components.
 * No business logic — receives pre-computed state per cell.
 *
 * Props:
 *   rowIndex        — row index in the matrix
 *   rowData         — array of values for this row
 *   activeCell      — { row, col } | null
 *   mutatingCells   — Set<string> of "row,col" keys
 */
export default function MatrixRow({
  rowIndex,
  rowData,
  activeCell,
  mutatingCells,
}) {
  return (
    <>
      {rowData.map((val, cIdx) => {
        const isActive = activeCell?.row === rowIndex && activeCell?.col === cIdx;
        const isMutated = mutatingCells.has(`${rowIndex},${cIdx}`);

        return (
          <MatrixCell
            key={`cell-${rowIndex}-${cIdx}`}
            value={val}
            row={rowIndex}
            col={cIdx}
            isActive={isActive}
            isMutated={isMutated}
          />
        );
      })}
    </>
  );
}
