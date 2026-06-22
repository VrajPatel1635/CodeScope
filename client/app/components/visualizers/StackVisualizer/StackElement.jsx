"use client";

import styles from "./StackVisualizer.module.css";

/**
 * StackElement — Presentational component for a single stack item.
 *
 * Props:
 *   value      — the value to display (any type: number, string, boolean, etc.)
 *   index      — position in the stack (0 = bottom)
 *   isTop      — true if this element is the top of the stack
 *   isAffected — true if this element is affected by the current operation
 *   operation  — the current operation type ("push" | "pop" | "peek" | null)
 *   isFirst    — true if this is the first rendered element (top of visual stack)
 *   isLast     — true if this is the last rendered element (bottom of visual stack)
 *   isOnly     — true if this is the only element in the stack
 */
export default function StackElement({
  value,
  index,
  isTop = false,
  isAffected = false,
  operation = null,
  isFirst = false,
  isLast = false,
  isOnly = false,
}) {
  // Build element class list
  const elementClasses = [
    styles.element,
    isFirst && !isOnly && styles.elementFirst,
    isLast && !isOnly && styles.elementLast,
    isOnly && styles.elementOnly,
    isAffected && operation === "push" && styles.elementPush,
    isAffected && operation === "pop" && styles.elementPop,
    isAffected && operation === "peek" && styles.elementPeek,
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
    <div className={styles.elementRow}>
      {/* TOP indicator — shown only for the top element */}
      {isTop ? (
        <div className={styles.topIndicator}>
          <span className={styles.topBadge}>TOP</span>
          <span className={styles.topArrow}>→</span>
        </div>
      ) : (
        /* Invisible spacer to keep alignment when TOP is not shown */
        <div className={styles.topIndicator} style={{ visibility: "hidden" }}>
          <span className={styles.topBadge}>TOP</span>
          <span className={styles.topArrow}>→</span>
        </div>
      )}

      {/* The stack cell itself */}
      <div className={elementClasses}>{displayValue}</div>
    </div>
  );
}
