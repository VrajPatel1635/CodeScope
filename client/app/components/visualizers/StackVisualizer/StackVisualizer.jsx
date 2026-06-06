"use client";

import styles from "./StackVisualizer.module.css";
import StackElement from "./StackElement";

/**
 * StackVisualizer — V1
 *
 * Consumes a stack collection contract from currentStep.collectionContracts
 * and renders a vertical stack visualization.
 *
 * Contract shape:
 * {
 *   collectionType: "stack",
 *   name: "stack",
 *   values: ["A", "B", "C"],
 *   size: 3,
 *   operation: { type: "push" | "pop" | "peek" | null, value: any }
 * }
 *
 * Props:
 *   contract — the stack collection contract object
 */
export default function StackVisualizer({ contract }) {
  if (!contract) return null;

  const { name, values = [], size = 0, operation = {} } = contract;
  const opType = operation?.type ?? null;
  const opValue = operation?.value ?? null;

  // ── Empty state ──────────────────────────────────────────────
  if (!values || values.length === 0) {
    return (
      <div className={styles.container}>
        <span className={styles.label}>
          Stack
          {name && <span className={styles.stackName}>{name}</span>}
        </span>

        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>∅</span>
          <span className={styles.emptyText}>Stack is empty</span>
        </div>

        {/* Show operation badge if there was an operation (e.g., pop that emptied the stack) */}
        {opType && (
          <OperationBadge opType={opType} opValue={opValue} />
        )}
      </div>
    );
  }

  // ── Render stack top-to-bottom ────────────────────────────────
  // values[0] is the bottom of the stack, values[values.length - 1] is the top.
  // We render top-first visually, so we reverse the display order.
  const reversedValues = [...values].reverse();
  const topIndex = values.length - 1; // original index of top element

  return (
    <div className={styles.container}>
      <span className={styles.label}>
        Stack
        {name && <span className={styles.stackName}>{name}</span>}
      </span>

      <div className={styles.stackBody}>
        {reversedValues.map((val, displayIdx) => {
          // Map display index back to original index
          const originalIndex = values.length - 1 - displayIdx;
          const isTop = originalIndex === topIndex;
          const isOnly = values.length === 1;

          // Determine if this element is affected by the current operation
          const isAffected = getIsAffected(
            originalIndex,
            topIndex,
            opType,
            opValue,
            val
          );

          return (
            <StackElement
              key={`stack-${originalIndex}`}
              value={val}
              index={originalIndex}
              isTop={isTop}
              isAffected={isAffected}
              operation={opType}
              isFirst={displayIdx === 0}
              isLast={displayIdx === reversedValues.length - 1}
              isOnly={isOnly}
            />
          );
        })}
      </div>

      {/* Size indicator */}
      <span className={styles.sizeLabel}>size: {size}</span>

      {/* Operation badge */}
      {opType && (
        <OperationBadge opType={opType} opValue={opValue} />
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Determine if a stack element is affected by the current operation.
 *
 * Push: the top element (newly pushed) is affected.
 * Pop:  the top element (about to be removed, shown in current values if still present) is affected.
 *       Note: after pop, the popped element is no longer in values.
 *       The contract shows the state AFTER the operation, so for pop we highlight
 *       the new top (if the user is looking at a post-pop state).
 *       Since the contract builder sets opType="pop" and opValue to the removed element,
 *       we don't have the removed element in values anymore. We highlight the new top.
 * Peek: the top element is affected.
 */
function getIsAffected(originalIndex, topIndex, opType, opValue, val) {
  if (!opType) return false;

  switch (opType) {
    case "push":
      // The pushed element is always the new top
      return originalIndex === topIndex;
    case "pop":
      // After pop, the element is gone. Highlight the new top to show
      // what's now exposed. If stack is empty after pop, nothing to highlight.
      return originalIndex === topIndex;
    case "peek":
      // Peek always refers to the top element
      return originalIndex === topIndex;
    default:
      return false;
  }
}

/**
 * OperationBadge — Small badge showing the current operation.
 */
function OperationBadge({ opType, opValue }) {
  const badgeClass = [
    styles.operationBadge,
    opType === "push" && styles.operationPush,
    opType === "pop" && styles.operationPop,
    opType === "peek" && styles.operationPeek,
  ]
    .filter(Boolean)
    .join(" ");

  const displayValue =
    opValue === null || opValue === undefined ? "" : ` (${String(opValue)})`;

  return (
    <span className={badgeClass}>
      {opType}{displayValue}
    </span>
  );
}
