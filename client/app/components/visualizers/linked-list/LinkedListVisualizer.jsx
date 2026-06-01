"use client";

import styles from "@/app/styles/linked-list-visualizer.module.css";
import LinkedListChain from "./LinkedListChain";

/**
 * Traverse from a given root following .next pointers.
 * Respects the `visited` set so nodes are never duplicated across components.
 */
function traverseFrom(startId, nodes, visited) {
  const sequence = [];
  let hasCycle = false;
  let cycleStartId = null;
  const localVisited = new Set();

  let currId = startId;
  while (currId && nodes[currId]) {
    if (visited.has(currId)) break;
    if (localVisited.has(currId)) {
      hasCycle = true;
      cycleStartId = currId;
      break;
    }
    localVisited.add(currId);
    visited.add(currId);
    sequence.push({ ...nodes[currId], id: currId });
    currId = nodes[currId].next;
  }

  return { sequence, hasCycle, cycleStartId };
}

/**
 * Linked List Visualizer — G.3.2 Redesign
 *
 * STRUCTURE ONLY. Renders the linked list topology as chains of nodes and edges.
 * All semantic rendering (pointers, mutations, rewiring) is handled by:
 *   - PointerOverlay (pointer ownership badges)
 *   - MutationOverlay (node value changes)
 *   - RewireOverlay (edge mutations)
 *   - SemanticChipOverlay (semantic annotations)
 *
 * Props:
 *   currentStep     — current execution state object
 *   executionFocus  — Set<string> of nodeIds currently involved in execution
 *   mutatingNodeId  — nodeId whose value is being mutated this step
 *   mutatingEdgeId  — nodeId whose .next edge is being rewired this step
 */
export default function LinkedListVisualizer({
  currentStep,
  executionFocus = null,
  mutatingNodeId = null,
  mutatingEdgeId = null,
}) {
  const linkedList = currentStep?.linkedList;
  if (!linkedList) return null;

  const nodes = linkedList.nodes || {};
  const vars = currentStep?.currentFrameVariables || {};

  // ── Discover all roots ──────────────────────────────────────────
  const roots = [];
  if (linkedList.head && nodes[linkedList.head]) {
    roots.push({ id: linkedList.head, label: "head" });
  }
  for (const [varName, value] of Object.entries(vars)) {
    if (typeof value === "string" && value.startsWith("node_") && nodes[value]) {
      if (!roots.some(r => r.id === value)) {
        roots.push({ id: value, label: varName });
      }
    }
  }
  if (roots.length === 0) return null;

  // ── Compute connected components ────────────────────────────────
  // Traverse each root independently so merge-points (Y-shapes) don't
  // truncate transient/dynamic structures.
  const allPaths = roots.map(root => {
    const { sequence, hasCycle, cycleStartId } = traverseFrom(root.id, nodes, new Set());
    return { root, sequence, hasCycle, cycleStartId };
  });

  // Sort by length (prefer longer standalone chains)
  allPaths.sort((a, b) => b.sequence.length - a.sequence.length);

  // Deduplicate: drop a component if its start node is already fully
  // embedded inside another component's chain.
  const components = [];
  for (const path of allPaths) {
    if (path.sequence.length === 0) continue;
    const startId = path.root.id;
    const isContained = components.some(kept =>
      kept.sequence.some(n => n.id === startId)
    );
    if (!isContained) {
      components.push(path);
    }
  }

  if (components.length === 0) return null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Linked List</span>

      {components.map((comp, compIdx) => (
        <LinkedListChain
          key={`chain-${compIdx}-${comp.root.id}`}
          sequence={comp.sequence}
          hasCycle={comp.hasCycle}
          cycleStartId={comp.cycleStartId}
          label={comp.root.label}
          isDetached={compIdx > 0}
          executionFocus={executionFocus}
          mutatingNodeId={mutatingNodeId}
          mutatingEdgeId={mutatingEdgeId}
        />
      ))}
    </div>
  );
}
