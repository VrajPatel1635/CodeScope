"use client";

import styles from "./DequeVisualizer.module.css";
import DequeElement from "./DequeElement";

/**
 * DequeVisualizer — V1
 *
 * Consumes a deque collection contract from currentStep.collectionContracts
 * and renders a horizontal deque visualization (left-to-right).
 *
 * Contract shape:
 * {
 *   collectionType: "deque",
 *   name: "dq",
 *   values: ["A", "B", "C"],
 *   operation: { type: "addFirst" | "addLast" | "removeFirst" | "removeLast" | null, value: any }
 * }
 *
 * Props:
 *   contract — the deque collection contract object
 */
export default function DequeVisualizer({ contract }) {
  if (!contract) return null;

  const { name, values = [], operation = {} } = contract;
  const opType = operation?.type ?? null;
  const opValue = operation?.value ?? null;

  // ── Empty state ──────────────────────────────────────────────
  if (!values || values.length === 0) {
    return (
      <div className={styles.container}>
        <span className={styles.label}>
          Deque
          {name && <span className={styles.dequeName}>{name}</span>}
        </span>

        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>∅</span>
          <span className={styles.emptyText}>Deque is empty</span>
        </div>

        {/* Show operation badge if there was an operation (e.g., remove that emptied the deque) */}
        {opType && (
          <OperationBadge opType={opType} opValue={opValue} />
        )}
      </div>
    );
  }

  // ── Derive front/rear indices ────────────────────────────────
  const frontIndex = 0;
  const rearIndex = values.length - 1;
  const isOnly = values.length === 1;

  return (
    <div className={styles.container}>
      <span className={styles.label}>
        Deque
        {name && <span className={styles.dequeName}>{name}</span>}
      </span>

      <div className={styles.dequeBody}>
        {values.map((val, idx) => {
          const isFront = idx === frontIndex;
          const isRear = idx === rearIndex;

          // Determine if this element is affected by the current operation
          const isAffected = getIsAffected(idx, frontIndex, rearIndex, opType);

          return (
            <DequeElement
              key={`deque-${idx}`}
              value={val}
              index={idx}
              isFront={isFront}
              isRear={isRear}
              isAffected={isAffected}
              operation={opType}
              isFirst={idx === 0}
              isLast={idx === values.length - 1}
              isOnly={isOnly}
            />
          );
        })}
      </div>

      {/* Size indicator */}
      <span className={styles.sizeLabel}>size: {values.length}</span>

      {/* Operation badge */}
      {opType && (
        <OperationBadge opType={opType} opValue={opValue} />
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Determine if a deque element is affected by the current operation.
 */
function getIsAffected(idx, frontIndex, rearIndex, opType) {
  if (!opType) return false;

  switch (opType) {
    case "addFirst":
      return idx === frontIndex;
    case "addLast":
      return idx === rearIndex;
    case "removeFirst":
      // After remove, the element is gone. Highlight the new front.
      return idx === frontIndex;
    case "removeLast":
      // After remove, the element is gone. Highlight the new rear.
      return idx === rearIndex;
    default:
      return false;
  }
}

/**
 * OperationBadge — Small badge showing the current operation.
 */
function OperationBadge({ opType, opValue }) {
  const isAdd = opType === "addFirst" || opType === "addLast";
  const isRemove = opType === "removeFirst" || opType === "removeLast";

  const badgeClass = [
    styles.operationBadge,
    isAdd && styles.operationAdd,
    isRemove && styles.operationRemove,
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
