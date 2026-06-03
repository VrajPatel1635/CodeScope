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
  i:     { bg: "rgba(79, 140, 255, 0.15)", border: "#4F8CFF", text: "#4F8CFF" },
  j:     { bg: "rgba(255, 176, 32, 0.15)",  border: "#FFB020", text: "#FFB020" },
  k:     { bg: "rgba(179, 136, 255, 0.15)", border: "#B388FF", text: "#B388FF" },
  left:  { bg: "rgba(45, 212, 191, 0.15)",  border: "#2DD4BF", text: "#2DD4BF" },
  right: { bg: "rgba(255, 93, 93, 0.15)",   border: "#FF5D5D", text: "#FF5D5D" },
  mid:   { bg: "rgba(0, 208, 132, 0.15)",   border: "#00D084", text: "#00D084" },
  start: { bg: "rgba(45, 212, 191, 0.15)",  border: "#2DD4BF", text: "#2DD4BF" },
  end:   { bg: "rgba(255, 93, 93, 0.15)",   border: "#FF5D5D", text: "#FF5D5D" },
  low:   { bg: "rgba(45, 212, 191, 0.15)",  border: "#2DD4BF", text: "#2DD4BF" },
  high:  { bg: "rgba(255, 93, 93, 0.15)",   border: "#FF5D5D", text: "#FF5D5D" },
  lo:    { bg: "rgba(45, 212, 191, 0.15)",  border: "#2DD4BF", text: "#2DD4BF" },
  hi:    { bg: "rgba(255, 93, 93, 0.15)",   border: "#FF5D5D", text: "#FF5D5D" },
  l:     { bg: "rgba(45, 212, 191, 0.15)",  border: "#2DD4BF", text: "#2DD4BF" },
  r:     { bg: "rgba(255, 93, 93, 0.15)",   border: "#FF5D5D", text: "#FF5D5D" },
  // ── Linked list ownership pointers ──
  head:    { bg: "rgba(79, 140, 255, 0.15)",  border: "#4F8CFF", text: "#4F8CFF" },
  tail:    { bg: "rgba(255, 93, 93, 0.15)",   border: "#FF5D5D", text: "#FF5D5D" },
  curr:    { bg: "rgba(0, 208, 132, 0.15)",   border: "#00D084", text: "#00D084" },
  prev:    { bg: "rgba(179, 136, 255, 0.15)", border: "#B388FF", text: "#B388FF" },
  next:    { bg: "rgba(255, 176, 32, 0.15)",  border: "#FFB020", text: "#FFB020" },
  slow:    { bg: "rgba(45, 212, 191, 0.15)",  border: "#2DD4BF", text: "#2DD4BF" },
  fast:    { bg: "rgba(232, 164, 74, 0.15)",  border: "#E8A44A", text: "#E8A44A" },
  temp:    { bg: "rgba(139, 149, 167, 0.15)", border: "#8B95A7", text: "#8B95A7" },
  newhead: { bg: "rgba(107, 191, 160, 0.15)", border: "#6BBFA0", text: "#6BBFA0" },
  // ── Tree ownership pointers ──
  root:    { bg: "rgba(79, 140, 255, 0.15)",  border: "#4F8CFF", text: "#4F8CFF" },
  node:    { bg: "rgba(0, 208, 132, 0.15)",   border: "#00D084", text: "#00D084" },
  current: { bg: "rgba(0, 208, 132, 0.15)",   border: "#00D084", text: "#00D084" },
  parent:  { bg: "rgba(179, 136, 255, 0.15)", border: "#B388FF", text: "#B388FF" },
  p:       { bg: "rgba(45, 212, 191, 0.15)",  border: "#2DD4BF", text: "#2DD4BF" },
  q:       { bg: "rgba(232, 164, 74, 0.15)",  border: "#E8A44A", text: "#E8A44A" },
  // ── Graph ownership pointers ──
  neighbor:{ bg: "rgba(255, 176, 32, 0.15)",  border: "#FFB020", text: "#FFB020" },
  src:     { bg: "rgba(45, 212, 191, 0.15)",  border: "#2DD4BF", text: "#2DD4BF" },
  dest:    { bg: "rgba(255, 93, 93, 0.15)",   border: "#FF5D5D", text: "#FF5D5D" },
  u:       { bg: "rgba(79, 140, 255, 0.15)",  border: "#4F8CFF", text: "#4F8CFF" },
  v:       { bg: "rgba(0, 208, 132, 0.15)",   border: "#00D084", text: "#00D084" },
  w:       { bg: "rgba(179, 136, 255, 0.15)", border: "#B388FF", text: "#B388FF" },
};

const DEFAULT_COLOR = { bg: "rgba(168, 170, 187, 0.12)", border: "#8B95A7", text: "#A8AABB" };

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
export default function PointerOverlay({ targetNodeId, activePointers = [] }) {
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
        top: `${rect.bottom}px`,
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
