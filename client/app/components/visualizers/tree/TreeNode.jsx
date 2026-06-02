"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/styles/tree-visualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * LAYER 1 — Tree Node
 * Renders a single tree node with its value.
 * Registers its DOM element with NodeRegistryContext so semantic overlays
 * (pointers, mutations, rewires) can position themselves correctly.
 *
 * Zero semantic logic — overlays handle pointer colors, mutations, etc.
 *
 * Props:
 *   value      — the node's display value
 *   nodeId     — unique backend node ID (e.g. "treeNode_1")
 *   x          — computed x position (px)
 *   y          — computed y position (px)
 *   isFocused  — LAYER 3: execution references this node
 *   isMutating — (CSS Hook) node value is being mutated this step
 *   isVisited  — node has been visited during traversal
 *   isActive   — node is being processed this exact step
 *   isRoot     — this node is the tree root
 */
export default function TreeNode({
  value,
  nodeId,
  x,
  y,
  isFocused = false,
  isMutating = false,
  isVisited = false,
  isActive = false,
  isRoot = false,
}) {
  const { registerNode, unregisterNode } = useNodeRegistry();
  const nodeRef = useRef(null);

  useEffect(() => {
    const registryId = `tree-node-${nodeId}`;
    if (nodeRef.current) {
      registerNode(registryId, nodeRef.current);
    }
    return () => {
      unregisterNode(registryId);
    };
  }, [nodeId, registerNode, unregisterNode]);

  const nodeClasses = [
    styles.node,
    isActive && styles.nodeActive,
    isFocused && !isActive && styles.nodeFocused,
    isMutating && styles.nodeMutating,
    isVisited && !isActive && !isFocused && !isMutating && styles.nodeVisited,
    isRoot && !isActive && !isFocused && !isMutating && styles.nodeRoot,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={nodeRef}
      className={nodeClasses}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {value}
    </div>
  );
}
