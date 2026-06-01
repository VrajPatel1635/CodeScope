"use client";

import styles from "@/app/styles/linked-list-visualizer.module.css";
import LinkedListNode from "./LinkedListNode";
import LinkedListEdge from "./LinkedListEdge";

/**
 * Linked List Chain — renders a complete connected component.
 * A sequence of LinkedListNode + LinkedListEdge in a horizontal row,
 * terminated by either a null indicator or a cycle-back indicator.
 *
 * Props:
 *   sequence       — array of { id, val, next } node objects
 *   hasCycle       — whether this chain loops back
 *   cycleStartId   — the node ID the cycle loops back to
 *   label          — optional label for this component (e.g. "head", "Detached — curr")
 *   isDetached     — whether this is a secondary (non-primary) component
 *   executionFocus — Set<string> of nodeIds currently involved in execution
 *   mutatingNodeId — nodeId whose value is being mutated
 *   mutatingEdgeId — nodeId whose .next edge is being rewired
 */
export default function LinkedListChain({
  sequence = [],
  hasCycle = false,
  cycleStartId = null,
  label = null,
  isDetached = false,
  executionFocus = null,
  mutatingNodeId = null,
  mutatingEdgeId = null,
}) {
  if (sequence.length === 0) {
    return <span className={styles.nullTerminator}>null</span>;
  }

  const focusSet = executionFocus || new Set();

  return (
    <div>
      {/* Component label for detached chains */}
      {isDetached && label && (
        <div className={styles.chainLabel}>
          <span className={styles.chainLabelDot} />
          Detached — {label}
        </div>
      )}

      <div className={styles.chainContainer}>
        {sequence.map((node, idx) => {
          const isLast = idx === sequence.length - 1;
          const isFocused = focusSet.has(node.id);
          const isNodeMutating = node.id === mutatingNodeId;
          const isEdgeMutating = node.id === mutatingEdgeId;

          return (
            <div key={`${node.id}-${idx}`} style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
              {/* Node */}
              <LinkedListNode
                value={node.val}
                nodeId={node.id}
                isFocused={isFocused}
                isMutating={isNodeMutating}
              />

              {/* Edge (except after last node — that gets terminator) */}
              {!isLast && (
                <LinkedListEdge
                  sourceNodeId={node.id}
                  isMutating={isEdgeMutating}
                />
              )}
            </div>
          );
        })}

        {/* Terminator: null or cycle indicator */}
        {hasCycle ? (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <span className={styles.edge}>→</span>
            <span className={styles.cycleIndicator}>
              ↺ Loops to {cycleStartId}
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <span className={styles.edge}>→</span>
            <span className={styles.nullTerminator}>null</span>
          </div>
        )}
      </div>
    </div>
  );
}
