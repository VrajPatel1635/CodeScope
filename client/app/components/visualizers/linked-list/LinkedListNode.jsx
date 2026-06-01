"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/styles/linked-list-visualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * LAYER 1 — Linked List Node
 * Renders a single node with its value.
 * Registers its DOM element with NodeRegistryContext so semantic overlays
 * (pointers, mutations, rewires) can position themselves correctly.
 *
 * Props:
 *   value      — the node's display value
 *   nodeId     — unique backend node ID (e.g. "node_0")
 *   isFocused  — LAYER 3: execution references this node
 *   isMutating — (CSS Hook) node value is being mutated this step
 */
export default function LinkedListNode({
  value,
  nodeId,
  isFocused = false,
  isMutating = false,
}) {
  const { registerNode, unregisterNode } = useNodeRegistry();
  const nodeRef = useRef(null);

  useEffect(() => {
    const registryId = `ll-node-${nodeId}`;
    if (nodeRef.current) {
      registerNode(registryId, nodeRef.current);
    }
    return () => {
      unregisterNode(registryId);
    };
  }, [nodeId, registerNode, unregisterNode]);

  const nodeClasses = [
    styles.node,
    isFocused && styles.nodeFocused,
    isMutating && styles.nodeMutating,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.nodeColumn}>
      <div ref={nodeRef} className={nodeClasses}>
        {value}
      </div>
    </div>
  );
}
