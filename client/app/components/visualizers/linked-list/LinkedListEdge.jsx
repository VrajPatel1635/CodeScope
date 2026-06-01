"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/styles/linked-list-visualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * Linked List Edge — arrow between two nodes.
 * Registers with NodeRegistryContext so RewireOverlay can target the edge.
 *
 * Props:
 *   sourceNodeId — the node this edge originates from (for registry)
 *   isMutating   — CSS hook: this edge is being rewired this step
 */
export default function LinkedListEdge({
  sourceNodeId,
  isMutating = false,
}) {
  const { registerNode, unregisterNode } = useNodeRegistry();
  const edgeRef = useRef(null);

  useEffect(() => {
    const registryId = `ll-edge-${sourceNodeId}`;
    if (edgeRef.current) {
      registerNode(registryId, edgeRef.current);
    }
    return () => {
      unregisterNode(registryId);
    };
  }, [sourceNodeId, registerNode, unregisterNode]);

  const edgeClasses = [
    styles.edge,
    isMutating && styles.edgeMutating,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={edgeRef} className={edgeClasses}>
      →
    </span>
  );
}
