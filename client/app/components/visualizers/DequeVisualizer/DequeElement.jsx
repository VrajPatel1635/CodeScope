"use client";

import styles from "./DequeVisualizer.module.css";

/**
 * DequeElement — Presentational component for a single deque item.
 *
 * Props:
 *   value      — the value to display
 *   index      — position in the deque (0 = front)
 *   isFront    — true if this element is the front of the deque
 *   isRear     — true if this element is the rear of the deque
 *   isAffected — true if this element is affected by the current operation
 *   operation  — the current operation type ("addFirst" | "addLast" | "removeFirst" | "removeLast" | null)
 *   isFirst    — true if this is the first rendered element (left end)
 *   isLast     — true if this is the last rendered element (right end)
 *   isOnly     — true if this is the only element in the deque
 */
export default function DequeElement({
  value,
  index,
  isFront = false,
  isRear = false,
  isAffected = false,
  operation = null,
  isFirst = false,
  isLast = false,
  isOnly = false,
}) {
  const isAddOp = operation === "addFirst" || operation === "addLast";
  const isRemoveOp = operation === "removeFirst" || operation === "removeLast";

  // Build element class list
  const elementClasses = [
    styles.element,
    isFirst && !isOnly && styles.elementFirst,
    isLast && !isOnly && styles.elementLast,
    isOnly && styles.elementOnly,
    isAffected && isAddOp && styles.elementAdd,
    isAffected && isRemoveOp && styles.elementRemove,
  ]
    .filter(Boolean)
    .join(" ");

  // Format value for display — handle all supported types generically
  const displayValue =
    value === null || value === undefined
      ? "null"
      : typeof value === "boolean"
      ? String(value)
      : String(value);

  return (
    <div className={styles.elementColumn}>
      {/* The deque cell */}
      <div className={elementClasses}>{displayValue}</div>

      {/* FRONT / REAR indicators below the cell */}
      <div className={styles.positionIndicator}>
        {isFront && (
          <>
            <span className={`${styles.positionArrow} ${styles.frontArrow}`}>↑</span>
            <span className={`${styles.positionBadge} ${styles.frontBadge}`}>FRONT</span>
          </>
        )}
        {isRear && !isFront && (
          <>
            <span className={`${styles.positionArrow} ${styles.rearArrow}`}>↑</span>
            <span className={`${styles.positionBadge} ${styles.rearBadge}`}>REAR</span>
          </>
        )}
        {isFront && isRear && (
          /* When only one element, show both labels stacked */
          <>
            <span className={`${styles.positionBadge} ${styles.rearBadge}`}>REAR</span>
          </>
        )}
      </div>
    </div>
  );
}
