"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/styles/graph-visualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * LAYER 1 — Graph Node
 * Renders a single graph node with its label.
 * Registers its DOM element with NodeRegistryContext so semantic overlays
 * (pointers, semantics) can position themselves correctly.
 *
 * Zero semantic logic — overlays handle pointer colors, ownership, etc.
 *
 * Props:
 *   nodeId     — unique backend node ID (e.g. "graphNode_0")
 *   label      — display label (e.g. "0")
 *   x          — computed x position (px)
 *   y          — computed y position (px)
 *   isVisited  — node has been marked visited
 *   isActive   — node is being processed this exact step
 *   isFrontier — node is in BFS frontier/pending queue
 *   isFocused  — execution references this node
 */
export default function GraphNode({
  nodeId,
  label,
  x,
  y,
  isVisited = false,
  isActive = false,
  isFrontier = false,
  isFocused = false,
}) {
  const { registerNode, unregisterNode } = useNodeRegistry();
  const nodeRef = useRef(null);

  useEffect(() => {
    const registryId = `graph-node-${nodeId}`;
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
    isFrontier && !isActive && !isFocused && styles.nodeFrontier,
    isVisited && !isActive && !isFocused && !isFrontier && styles.nodeVisited,
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
      {label}
    </div>
  );
}
