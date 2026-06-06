"use client";

import styles from "./HashMapVisualizer.module.css";

/**
 * HashMapEntry — Presentational component for a single hashmap key-value pair.
 *
 * Props:
 *   keyValue   — the key to display
 *   valueValue — the value to display
 *   isAffected — true if this entry is affected by the current operation
 *   operation  — the current operation type ("put" | "remove" | "replace" | null)
 */
export default function HashMapEntry({
  keyValue,
  valueValue,
  isAffected = false,
  operation = null,
}) {
  // Build element class list
  const rowClasses = [
    styles.entryRow,
    isAffected && operation === "put" && styles.entryPut,
    isAffected && operation === "remove" && styles.entryRemove,
    isAffected && operation === "replace" && styles.entryReplace,
  ]
    .filter(Boolean)
    .join(" ");

  // Format key and value for display generically
  const displayKey =
    keyValue === null || keyValue === undefined
      ? "null"
      : typeof keyValue === "boolean"
      ? String(keyValue)
      : String(keyValue);

  const displayValue =
    valueValue === null || valueValue === undefined
      ? "null"
      : typeof valueValue === "boolean"
      ? String(valueValue)
      : String(valueValue);

  return (
    <div className={rowClasses}>
      <div className={styles.keyBox}>{displayKey}</div>
      <div className={styles.arrowBox}>→</div>
      <div className={styles.valueBox}>{displayValue}</div>
    </div>
  );
}
