"use client";

import styles from "./HashMapVisualizer.module.css";
import HashMapEntry from "./HashMapEntry";

/**
 * HashMapVisualizer — V1
 *
 * Consumes a hashmap collection contract from currentStep.collectionContracts
 * and renders a vertical list of key-value pairs.
 *
 * Contract shape:
 * {
 *   collectionType: "hashmap",
 *   name: "map",
 *   entries: [{ key: "A", value: 1 }, { key: "B", value: 2 }],
 *   operation: { type: "put" | "remove" | "replace" | null, key: any, value: any }
 * }
 *
 * Props:
 *   contract — the hashmap collection contract object
 */
export default function HashMapVisualizer({ contract }) {
  if (!contract) return null;

  const { name, entries = [], operation = {} } = contract;
  const opType = operation?.type ?? null;
  const opKey = operation?.key ?? null;
  const opValue = operation?.value ?? null;

  // ── Empty state ──────────────────────────────────────────────
  if (!entries || entries.length === 0) {
    return (
      <div className={styles.container}>
        <span className={styles.label}>
          HashMap
          {name && <span className={styles.mapName}>{name}</span>}
        </span>

        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>∅</span>
          <span className={styles.emptyText}>HashMap is empty</span>
        </div>

        {/* Show operation badge if there was an operation (e.g., remove that emptied the map) */}
        {opType && (
          <OperationBadge opType={opType} opKey={opKey} opValue={opValue} />
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>
        HashMap
        {name && <span className={styles.mapName}>{name}</span>}
      </span>

      <div className={styles.mapBody}>
        {entries.map((entry, idx) => {
          // Determine if this element is affected by the current operation
          // Match by key to highlight the correct entry
          const isAffected = getIsAffected(entry.key, opKey, opType);

          return (
            <HashMapEntry
              key={`hashmap-${idx}-${String(entry.key)}`}
              keyValue={entry.key}
              valueValue={entry.value}
              isAffected={isAffected}
              operation={opType}
            />
          );
        })}
      </div>

      {/* Size indicator */}
      <span className={styles.sizeLabel}>size: {entries.length}</span>

      {/* Operation badge */}
      {opType && (
        <OperationBadge opType={opType} opKey={opKey} opValue={opValue} />
      )}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Determine if a hashmap entry is affected by the current operation.
 */
function getIsAffected(entryKey, opKey, opType) {
  if (!opType || opKey === null || opKey === undefined) return false;

  // Since keys can be of different types, convert both to string for comparison if necessary,
  // or use direct equality. React keys often become strings.
  // We'll use a loose equality or strict string equality.
  return String(entryKey) === String(opKey);
}

/**
 * OperationBadge — Small badge showing the current operation.
 */
function OperationBadge({ opType, opKey, opValue }) {
  const isPut = opType === "put";
  const isRemove = opType === "remove";
  const isReplace = opType === "replace";

  const badgeClass = [
    styles.operationBadge,
    isPut && styles.operationPut,
    isRemove && styles.operationRemove,
    isReplace && styles.operationReplace,
  ]
    .filter(Boolean)
    .join(" ");

  const displayKey =
    opKey === null || opKey === undefined ? "" : String(opKey);
  const displayValue =
    opValue === null || opValue === undefined ? "" : ` → ${String(opValue)}`;

  return (
    <span className={badgeClass}>
      {opType} ({displayKey}{displayValue})
    </span>
  );
}
