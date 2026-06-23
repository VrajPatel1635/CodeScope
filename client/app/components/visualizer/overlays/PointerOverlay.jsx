"use client";

import styles from "@/app/styles/array-visualizer.module.css";
import { useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";

/**
 * Variable-to-color mapping.
 * Uses design system execution colors — each variable gets a semantically
 * meaningful color so users build visual muscle memory.
 */
const VARIABLE_COLORS = {
  // ── Array index pointers ──
  i: { bg: "color-mix(in srgb, var(--exec-active) 15%, transparent)", border: "var(--exec-active)", text: "var(--exec-active)" },
  j: { bg: "color-mix(in srgb, var(--exec-mutation) 15%, transparent)", border: "var(--exec-mutation)", text: "var(--exec-mutation)" },
  k: { bg: "color-mix(in srgb, var(--exec-return) 15%, transparent)", border: "var(--exec-return)", text: "var(--exec-return)" },
  left: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "var(--exec-frontier)", text: "var(--exec-frontier)" },
  right: { bg: "color-mix(in srgb, var(--exec-error) 15%, transparent)", border: "var(--exec-error)", text: "var(--exec-error)" },
  mid: { bg: "color-mix(in srgb, var(--exec-node-active) 15%, transparent)", border: "var(--exec-node-active)", text: "var(--exec-node-active)" },
  start: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "var(--exec-frontier)", text: "var(--exec-frontier)" },
  end: { bg: "color-mix(in srgb, var(--exec-error) 15%, transparent)", border: "var(--exec-error)", text: "var(--exec-error)" },
  low: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "var(--exec-frontier)", text: "var(--exec-frontier)" },
  high: { bg: "color-mix(in srgb, var(--exec-error) 15%, transparent)", border: "var(--exec-error)", text: "var(--exec-error)" },
  lo: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "var(--exec-frontier)", text: "var(--exec-frontier)" },
  hi: { bg: "color-mix(in srgb, var(--exec-error) 15%, transparent)", border: "var(--exec-error)", text: "var(--exec-error)" },
  l: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "var(--exec-frontier)", text: "var(--exec-frontier)" },
  r: { bg: "color-mix(in srgb, var(--exec-error) 15%, transparent)", border: "var(--exec-error)", text: "var(--exec-error)" },
  // ── Linked list ownership pointers ──
  head: { bg: "color-mix(in srgb, var(--exec-active) 15%, transparent)", border: "var(--exec-active)", text: "var(--exec-active)" },
  tail: { bg: "color-mix(in srgb, var(--exec-error) 15%, transparent)", border: "var(--exec-error)", text: "var(--exec-error)" },
  curr: { bg: "color-mix(in srgb, var(--exec-node-active) 15%, transparent)", border: "var(--exec-node-active)", text: "var(--exec-node-active)" },
  prev: { bg: "color-mix(in srgb, var(--exec-return) 15%, transparent)", border: "var(--exec-return)", text: "var(--exec-return)" },
  next: { bg: "color-mix(in srgb, var(--exec-mutation) 15%, transparent)", border: "var(--exec-mutation)", text: "var(--exec-mutation)" },
  slow: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "var(--exec-frontier)", text: "var(--exec-frontier)" },
  fast: { bg: "color-mix(in srgb, var(--accent-primary) 15%, transparent)", border: "var(--accent-primary)", text: "var(--accent-primary)" },
  temp: { bg: "color-mix(in srgb, var(--exec-node-visited) 15%, transparent)", border: "var(--exec-node-visited)", text: "var(--exec-node-visited)" },
  newhead: { bg: "color-mix(in srgb, var(--exec-node-active) 15%, transparent)", border: "var(--exec-node-active)", text: "var(--exec-node-active)" },
  // ── Tree ownership pointers ──
  root: { bg: "color-mix(in srgb, var(--exec-active) 15%, transparent)", border: "var(--exec-active)", text: "var(--exec-active)" },
  node: { bg: "color-mix(in srgb, var(--exec-node-active) 15%, transparent)", border: "var(--exec-node-active)", text: "var(--exec-node-active)" },
  current: { bg: "color-mix(in srgb, var(--exec-node-active) 15%, transparent)", border: "var(--exec-node-active)", text: "var(--exec-node-active)" },
  parent: { bg: "color-mix(in srgb, var(--exec-return) 15%, transparent)", border: "var(--exec-return)", text: "var(--exec-return)" },
  p: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "var(--exec-frontier)", text: "var(--exec-frontier)" },
  q: { bg: "color-mix(in srgb, var(--accent-primary) 15%, transparent)", border: "var(--accent-primary)", text: "var(--accent-primary)" },
  // ── Graph ownership pointers ──
  neighbor: { bg: "color-mix(in srgb, var(--exec-mutation) 15%, transparent)", border: "var(--exec-mutation)", text: "var(--exec-mutation)" },
  src: { bg: "color-mix(in srgb, var(--exec-frontier) 15%, transparent)", border: "var(--exec-frontier)", text: "var(--exec-frontier)" },
  dest: { bg: "color-mix(in srgb, var(--exec-error) 15%, transparent)", border: "var(--exec-error)", text: "var(--exec-error)" },
  u: { bg: "color-mix(in srgb, var(--exec-active) 15%, transparent)", border: "var(--exec-active)", text: "var(--exec-active)" },
  v: { bg: "color-mix(in srgb, var(--exec-node-active) 15%, transparent)", border: "var(--exec-node-active)", text: "var(--exec-node-active)" },
  w: { bg: "color-mix(in srgb, var(--exec-return) 15%, transparent)", border: "var(--exec-return)", text: "var(--exec-return)" },
};

const DEFAULT_COLOR = { bg: "color-mix(in srgb, var(--text-secondary) 12%, transparent)", border: "var(--exec-node-visited)", text: "var(--text-secondary)" };

/**
 * LAYER 2 — Variable Ownership Markers
 * Displays variable badges below a node, indicating which variables
 * currently point to this index/node.
 * Positioned absolutely based on dynamic registry coordinates.
 *
 * Props:
 *   targetNodeId   — ID of the node to point to
 *   activePointers — array of { name: string } for pointers at this index
 */
export default function PointerOverlay({ targetNodeId, activePointers = [], offsetY = 0 }) {
  const { nodes } = useNodeRegistry();
  const rect = nodes.get(targetNodeId);

  if (activePointers.length === 0 || !rect) {
    return null;
  }

  return (
    <div
      className={styles.ownershipZone}
      style={{
        position: 'absolute',
        top: `${rect.bottom + offsetY}px`,
        left: `${rect.cx}px`,
        transform: 'translateX(-50%)',
        zIndex: 40
      }}
    >
      {/* Thin connector line from cell to badge */}
      <div
        className={styles.ownershipConnector}
        style={{ backgroundColor: getColor(activePointers[0].name).border }}
      />

      {/* Variable badges */}
      {activePointers.map((ptr) => {
        const color = getColor(ptr.name);
        return (
          <span
            key={ptr.name}
            className={styles.ownershipBadge}
            style={{
              backgroundColor: color.bg,
              borderColor: color.border,
              color: color.text,
            }}
          >
            {ptr.name}
          </span>
        );
      })}
    </div>
  );
}

function getColor(name) {
  return VARIABLE_COLORS[name.toLowerCase()] || DEFAULT_COLOR;
}
