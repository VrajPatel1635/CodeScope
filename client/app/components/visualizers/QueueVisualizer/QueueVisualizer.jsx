"use client";

import styles from "./QueueVisualizer.module.css";
import QueueElement from "./QueueElement";

/**
 * QueueVisualizer — V1
 *
 * Consumes a queue collection contract from currentStep.collectionContracts
 * and renders a horizontal queue visualization (left-to-right).
 *
 * Contract shape:
 * {
 *   collectionType: "queue",
 *   name: "queue",
 *   values: [10, 20, 30],
 *   front: 0,
 *   rear: 2,
 *   operation: { type: "offer" | "poll" | "peek" | null, value: any }
 * }
 *
 * Props:
 *   contract — the queue collection contract object
 */
export default function QueueVisualizer({ contract }) {
  if (!contract) return null;

  const { name, values = [], front = 0, rear = 0, operation = {} } = contract;
  const opType = operation?.type ?? null;
  const opValue = operation?.value ?? null;

  // ── Empty state ──────────────────────────────────────────────
  if (!values || values.length === 0) {
    return (
      <div className={styles.container}>
        <span className={styles.label}>
          Queue
          {name && <span className={styles.queueName}>{name}</span>}
        </span>

        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>∅</span>
          <span className={styles.emptyText}>Queue is empty</span>
        </div>

        {/* Show operation badge if there was an operation (e.g., poll that emptied the queue) */}
        {opType && (
          <OperationBadge opType={opType} opValue={opValue} />
        )}
      </div>
    );
  }

  // ── Derive front/rear indices ────────────────────────────────
  const frontIndex = front ?? 0;
  const rearIndex = rear ?? Math.max(0, values.length - 1);
  const isOnly = values.length === 1;

  return (
    <div className={styles.container}>
      <span className={styles.label}>
        Queue
        {name && <span className={styles.queueName}>{name}</span>}
      </span>

      <div className={styles.queueBody}>
        {values.map((val, idx) => {
          const isFront = idx === frontIndex;
          const isRear = idx === rearIndex;

          // Determine if this element is affected by the current operation
          const isAffected = getIsAffected(idx, frontIndex, rearIndex, opType);

          return (
            <QueueElement
              key={`queue-${idx}`}
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
 * Determine if a queue element is affected by the current operation.
 *
 * Offer: the rear element (newly added) is affected.
 * Poll:  the front element (being removed / just removed) is affected.
 *        After poll, the element is gone from values. We highlight the new front.
 * Peek:  the front element is affected.
 */
function getIsAffected(idx, frontIndex, rearIndex, opType) {
  if (!opType) return false;

  switch (opType) {
    case "offer":
      // The offered element is always the new rear
      return idx === rearIndex;
    case "poll":
      // After poll, the removed element is gone. Highlight the new front.
      return idx === frontIndex;
    case "peek":
      // Peek always refers to the front element
      return idx === frontIndex;
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
    opType === "offer" && styles.operationOffer,
    opType === "poll" && styles.operationPoll,
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
