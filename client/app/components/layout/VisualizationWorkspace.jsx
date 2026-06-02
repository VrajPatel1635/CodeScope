"use client";

import React, { useMemo } from "react";
import ArrayVisualizer from "@/app/components/visualizers/array/ArrayVisualizer";
import LinkedListVisualizer from "@/app/components/visualizers/linked-list/LinkedListVisualizer";
import TreeVisualizer from "@/app/components/visualizers/tree/TreeVisualizer";

import VariableSemanticsLayer from "@/app/components/variables/VariableSemanticsLayer";

import { NodeRegistryProvider, useNodeRegistry } from "@/app/components/shared/NodeRegistryContext";
import ComparisonOverlay from "@/app/components/overlays/ComparisonOverlay";
import PointerOverlay from "@/app/components/overlays/PointerOverlay";
import MutationOverlay from "@/app/components/overlays/MutationOverlay";
import RewireOverlay from "@/app/components/overlays/RewireOverlay";
import SemanticChipOverlay from "@/app/components/overlays/SemanticChipOverlay";

/**
 * Array index pointer name whitelist.
 * Only integer variables with these names are treated as array index pointers.
 */
const ARRAY_POINTER_NAMES = [
  "i", "j", "k",
  "left", "right",
  "start", "end",
  "low", "high",
  "mid",
  "lo", "hi",
  "l", "r",
];

/**
 * Linked list ownership pointer name whitelist.
 * Variables with these names whose values are "node_*" strings are treated
 * as linked list ownership pointers.
 */
const LL_POINTER_NAMES = [
  "head", "tail",
  "curr", "prev", "next",
  "slow", "fast",
  "temp", "newhead",
  "runner", "walker",
];

/**
 * Tree ownership pointer name whitelist.
 * Variables with these names whose values are "treeNode_*" strings are treated
 * as tree node ownership pointers.
 */
const TREE_POINTER_NAMES = [
  "root", "node", "current",
  "left", "right", "parent",
  "p", "q",
];

const ACC_NAMES = ["sum", "product", "score", "total"];
const TEMP_NAMES = ["temp", "swap", "nextvalue", "tmp"];

/**
 * Combined set of all pointer names (for variable classification exclusion)
 */
const ALL_POINTER_NAMES = new Set([
  ...ARRAY_POINTER_NAMES,
  ...LL_POINTER_NAMES,
  ...TREE_POINTER_NAMES,
]);

/**
 * Resolve an index expression (from a COND expr like arr[j+1]) to a number.
 * Handles: literal numbers, variable names, simple var±N arithmetic.
 */
function resolveIndex(indexExpr, variables) {
  if (!indexExpr) return null;
  const trimmed = indexExpr.trim();

  // Literal number
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && String(num) === trimmed) return num;

  // Simple variable lookup
  if (typeof variables[trimmed] === "number") return variables[trimmed];

  // Simple arithmetic: var+N or var-N
  const arithMatch = trimmed.match(/^(\w+)\s*([+-])\s*(\d+)$/);
  if (arithMatch) {
    const base = variables[arithMatch[1]];
    if (typeof base === "number") {
      const offset = parseInt(arithMatch[3], 10);
      return arithMatch[2] === "+" ? base + offset : base - offset;
    }
  }

  return null;
}

/**
 * LAYER 5 — Parse a COND expression for array comparison patterns.
 * Returns [indexA, indexB] for two-element comparisons,
 *         [indexA] for single-element comparisons,
 *         or null if no array comparison is found.
 */
function parseComparisonFromExpr(expr, variables) {
  if (!expr) return null;

  // Two array accesses compared: arr[i] < arr[j]
  const twoMatch = expr.match(/(\w+)\[([^\]]+)\]\s*[<>=!]+\s*(\w+)\[([^\]]+)\]/);
  if (twoMatch) {
    const idxA = resolveIndex(twoMatch[2], variables);
    const idxB = resolveIndex(twoMatch[4], variables);
    if (idxA !== null && idxB !== null) return [idxA, idxB];
  }

  // Single array access compared to something: arr[mid] == target
  const oneMatch = expr.match(/(\w+)\[([^\]]+)\]\s*[<>=!]+/);
  if (oneMatch) {
    const idx = resolveIndex(oneMatch[2], variables);
    if (idx !== null) return [idx];
  }

  return null;
}

export default function VisualizationWorkspace(props) {
  return (
    <NodeRegistryProvider>
      <InnerWorkspace {...props} />
    </NodeRegistryProvider>
  );
}

function InnerWorkspace({ currentState, result, activeSourceStep }) {
  if (!currentState) return null;

  const { containerRef } = useNodeRegistry();
  const variables = currentState?.currentFrameVariables || {};
  const isLinkedList = !!currentState?.linkedList;
  const isArray = !!currentState?.array || !!currentState?.matrix;
  const isTree = !!currentState?.tree;

  // ── Source Mode Aggregation ──────────────────────────────────────
  const activeMicroSteps = useMemo(() => {
    if (activeSourceStep && result?.states) {
      return activeSourceStep.microStepIds
        .map(id => result.states.find(s => s.stepId === id))
        .filter(Boolean);
    }
    return [currentState].filter(Boolean);
  }, [activeSourceStep, currentState, result]);

  // ══════════════════════════════════════════════════════════════════
  // ARRAY POINTER DETECTION
  // ══════════════════════════════════════════════════════════════════
  const arrayPointers = useMemo(() => {
    const ptrs = [];
    if (!variables || !isArray) return ptrs;
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === "number" && value >= 0 && ARRAY_POINTER_NAMES.includes(key.toLowerCase())) {
        ptrs.push({ name: key, index: value });
      }
    }
    return ptrs;
  }, [variables, isArray]);

  // ══════════════════════════════════════════════════════════════════
  // LINKED LIST POINTER DETECTION
  // ══════════════════════════════════════════════════════════════════
  const llPointers = useMemo(() => {
    const ptrs = [];
    if (!variables || !isLinkedList) return ptrs;

    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === "string" && value.startsWith("node_")) {
        ptrs.push({ name: key, target: value, isMoving: false });
      }
    }

    // Apply ptrMoveEvent anticipation
    if (currentState?.ptrMoveEvent) {
      const { variable, nodeId } = currentState.ptrMoveEvent;
      const movingPtr = ptrs.find(p => p.name === variable);
      if (movingPtr) {
        movingPtr.target = nodeId;
        movingPtr.isMoving = true;
      } else {
        ptrs.push({ name: variable, target: nodeId, isMoving: true });
      }
    }

    return ptrs;
  }, [variables, isLinkedList, currentState]);

  // ══════════════════════════════════════════════════════════════════
  // ARRAY: LAYER 4 — Mutation Events
  // ══════════════════════════════════════════════════════════════════
  const arrayMutationEvents = useMemo(() => {
    const mutations = [];
    if (!isArray) return mutations;
    activeMicroSteps.forEach(step => {
      if (step.arrayEvent?.index) {
        const idx = Number(step.arrayEvent.index);
        const newValue = step.array?.[idx];

        const states = result?.states || [];
        const stepIdx = states.indexOf(step);
        let oldValue = "?";
        if (stepIdx > 0) {
          oldValue = states[stepIdx - 1].array?.[idx] ?? "?";
        }
        mutations.push({ index: idx, oldValue, newValue });
      }
    });
    return mutations;
  }, [activeMicroSteps, result, isArray]);

  // ══════════════════════════════════════════════════════════════════
  // ARRAY: LAYER 5 — Comparison Detection
  // ══════════════════════════════════════════════════════════════════
  const comparisonIndices = useMemo(() => {
    if (!isArray) return null;
    const allComparisons = new Set();
    activeMicroSteps.forEach(step => {
      if (step.type === "COND") {
        const expr = step.traceEvent?.expr;
        const indices = parseComparisonFromExpr(expr, variables);
        if (indices) indices.forEach(i => allComparisons.add(i));
      }
    });
    return allComparisons.size > 0 ? Array.from(allComparisons) : null;
  }, [activeMicroSteps, variables, isArray]);

  // ══════════════════════════════════════════════════════════════════
  // ARRAY: LAYER 3 — Execution Focus
  // ══════════════════════════════════════════════════════════════════
  const arrayExecutionFocus = useMemo(() => {
    if (!isArray) return null;
    const focused = new Set();
    arrayMutationEvents.forEach(m => focused.add(m.index));
    if (comparisonIndices) {
      comparisonIndices.forEach(idx => focused.add(idx));
    }
    return focused.size > 0 ? focused : null;
  }, [arrayMutationEvents, comparisonIndices, isArray]);

  // ══════════════════════════════════════════════════════════════════
  // LINKED LIST: Mutation & Rewire Detection
  // ══════════════════════════════════════════════════════════════════
  const llMutationEvent = useMemo(() => {
    if (!isLinkedList) return null;
    // Aggregate across micro steps for source mode parity
    for (const step of activeMicroSteps) {
      if (step.nodeMutateEvent) {
        return step.nodeMutateEvent;
      }
    }
    return null;
  }, [activeMicroSteps, isLinkedList]);

  // Derive the node whose value is mutating and the node whose edge is being rewired
  const llMutatingNodeId = llMutationEvent?.fromNodeId ?? null;
  const llMutatingEdgeId = llMutationEvent?.fromNodeId ?? null;

  // Rewire event: compute old and new targets for RewireOverlay
  const llRewireEvent = useMemo(() => {
    if (!llMutationEvent || !isLinkedList) return null;
    const { fromNodeId, toNodeId } = llMutationEvent;
    if (!fromNodeId) return null;

    // Find the previous .next target from the prior state
    const states = result?.states || [];
    const currentIdx = states.indexOf(currentState);
    let oldTargetNodeId = null;
    if (currentIdx > 0) {
      const prevLinkedList = states[currentIdx - 1]?.linkedList;
      if (prevLinkedList?.nodes?.[fromNodeId]) {
        oldTargetNodeId = prevLinkedList.nodes[fromNodeId].next || null;
      }
    }

    // Only show rewire if target actually changed
    if (oldTargetNodeId === toNodeId) return null;

    return {
      sourceNodeId: `ll-node-${fromNodeId}`,
      oldTargetNodeId: oldTargetNodeId ? `ll-node-${oldTargetNodeId}` : null,
      newTargetNodeId: toNodeId ? `ll-node-${toNodeId}` : null,
    };
  }, [llMutationEvent, isLinkedList, result, currentState]);

  // ══════════════════════════════════════════════════════════════════
  // LINKED LIST: Execution Focus
  // ══════════════════════════════════════════════════════════════════
  const llExecutionFocus = useMemo(() => {
    if (!isLinkedList) return null;
    const focused = new Set();

    // Nodes involved in mutations
    if (llMutatingNodeId) focused.add(llMutatingNodeId);

    // Nodes involved in pointer movement
    if (currentState?.ptrMoveEvent?.nodeId) {
      focused.add(currentState.ptrMoveEvent.nodeId);
    }

    // Nodes currently pointed to by ownership pointers
    llPointers.forEach(p => {
      if (p.target) focused.add(p.target);
    });

    return focused.size > 0 ? focused : null;
  }, [isLinkedList, llMutatingNodeId, currentState, llPointers]);

  // ══════════════════════════════════════════════════════════════════
  // TREE POINTER DETECTION
  // ══════════════════════════════════════════════════════════════════
  const treePointers = useMemo(() => {
    const ptrs = [];
    if (!variables || !isTree) return ptrs;

    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === "string" && value.startsWith("treeNode_")) {
        ptrs.push({ name: key, target: value, isMoving: false });
      }
    }

    return ptrs;
  }, [variables, isTree]);

  // ══════════════════════════════════════════════════════════════════
  // TREE: Visit / Mutation / Rewire Detection
  // ══════════════════════════════════════════════════════════════════

  // Accumulate all visited nodes across the entire execution history
  const treeVisitedNodes = useMemo(() => {
    if (!isTree) return null;
    const visited = new Set();
    const states = result?.states || [];
    const currentIdx = states.indexOf(currentState);
    for (let i = 0; i <= currentIdx; i++) {
      const step = states[i];
      if (step?.treeVisitEvent) {
        visited.add(step.treeVisitEvent.node);
      }
    }
    return visited.size > 0 ? visited : null;
  }, [isTree, result, currentState]);

  // Currently active node (being visited this step)
  const treeActiveNodeId = useMemo(() => {
    if (!isTree) return null;
    for (const step of activeMicroSteps) {
      if (step.treeVisitEvent) {
        return step.treeVisitEvent.node;
      }
    }
    return null;
  }, [activeMicroSteps, isTree]);

  // Tree mutation events (node value changes)
  const treeMutateEvent = useMemo(() => {
    if (!isTree) return null;
    for (const step of activeMicroSteps) {
      if (step.treeMutateEvent) {
        return step.treeMutateEvent;
      }
    }
    return null;
  }, [activeMicroSteps, isTree]);

  const treeMutatingNodeId = treeMutateEvent?.node ?? null;

  // Tree link events (edge rewiring — child reassignment)
  const treeLinkEvents = useMemo(() => {
    if (!isTree) return [];
    const links = [];
    for (const step of activeMicroSteps) {
      if (step.treeLinkEvent) {
        links.push(step.treeLinkEvent);
      }
    }
    return links;
  }, [activeMicroSteps, isTree]);

  // Set of parent nodeIds whose edges are mutating
  const treeMutatingEdges = useMemo(() => {
    if (treeLinkEvents.length === 0) return null;
    const edgeSet = new Set();
    treeLinkEvents.forEach(e => edgeSet.add(e.parent));
    return edgeSet;
  }, [treeLinkEvents]);

  // Tree rewire overlays (convert treeLinkEvents to RewireOverlay props)
  const treeRewireEvents = useMemo(() => {
    if (!isTree || treeLinkEvents.length === 0) return [];
    return treeLinkEvents.map(linkEvent => {
      const { parent, dir, child } = linkEvent;

      // Find old child from previous state
      const states = result?.states || [];
      const currentIdx = states.indexOf(currentState);
      let oldChild = null;
      if (currentIdx > 0) {
        const prevTree = states[currentIdx - 1]?.tree;
        if (prevTree?.nodes?.[parent]) {
          oldChild = prevTree.nodes[parent][dir] || null;
        }
      }

      // Only show rewire if the child actually changed
      if (oldChild === child) return null;

      return {
        sourceNodeId: `tree-node-${parent}`,
        oldTargetNodeId: oldChild ? `tree-node-${oldChild}` : null,
        newTargetNodeId: child ? `tree-node-${child}` : null,
      };
    }).filter(Boolean);
  }, [isTree, treeLinkEvents, result, currentState]);

  // ══════════════════════════════════════════════════════════════════
  // TREE: Execution Focus
  // ══════════════════════════════════════════════════════════════════
  const treeExecutionFocus = useMemo(() => {
    if (!isTree) return null;
    const focused = new Set();

    // Active node this step
    if (treeActiveNodeId) focused.add(treeActiveNodeId);

    // Nodes involved in mutations
    if (treeMutatingNodeId) focused.add(treeMutatingNodeId);

    // Nodes currently pointed to by ownership pointers
    treePointers.forEach(p => {
      if (p.target) focused.add(p.target);
    });

    return focused.size > 0 ? focused : null;
  }, [isTree, treeActiveNodeId, treeMutatingNodeId, treePointers]);

  // ══════════════════════════════════════════════════════════════════
  // VARIABLE SEMANTICS CLASSIFICATION
  // ══════════════════════════════════════════════════════════════════
  const { stateVars, accumulators, tempVars } = useMemo(() => {
    const sVars = [];
    const accs = [];
    const temps = [];

    if (variables) {
      const states = result?.states || [];
      const currentIdx = states.indexOf(currentState);
      const prevVariables = currentIdx > 0 ? states[currentIdx - 1].currentFrameVariables : {};

      const mutatedVarsInSource = new Set();
      activeMicroSteps.forEach(step => {
        if (step.type === "VAR") mutatedVarsInSource.add(step.name);
      });

      for (const [key, value] of Object.entries(variables)) {
        if (value === null || value === undefined) continue;
        if (typeof value !== "number" && typeof value !== "string" && typeof value !== "boolean") continue;
        
        const lowerKey = key.toLowerCase();
        
        // Skip ownership pointers (handled by PointerOverlay)
        if (ALL_POINTER_NAMES.has(lowerKey)) continue;

        // Skip linked list / tree node references (handled by PointerOverlay)
        if (typeof value === "string" && (value.startsWith("node_") || value.startsWith("treeNode_"))) continue;

        const prevValue = prevVariables ? prevVariables[key] : undefined;
        const isMutating = mutatedVarsInSource.has(key);

        if (ACC_NAMES.some(n => lowerKey.includes(n))) {
          accs.push({ name: key, value, prevValue, isMutating });
        } else if (TEMP_NAMES.some(n => lowerKey.includes(n))) {
          temps.push({ name: key, value, isActive: isMutating }); 
        } else {
          // Default to State variable
          sVars.push({ name: key, value });
        }
      }
    }
    return { stateVars: sVars, accumulators: accs, tempVars: temps };
  }, [currentState, result, variables, activeMicroSteps]);

  // ══════════════════════════════════════════════════════════════════
  // SEMANTIC MAPS (for SemanticChipOverlay)
  // ══════════════════════════════════════════════════════════════════
  const semanticFrames = result?.semanticFrames ?? [];
  const semanticMap = useMemo(() => {
    const m = new Map();
    for (const frame of semanticFrames) {
      m.set(frame.step, frame.semantics);
    }
    return m;
  }, [semanticFrames]);

  const currentSemantics = useMemo(() => {
    const s = [];
    activeMicroSteps.forEach(step => {
      const frameSem = semanticMap.get(step.step);
      if (frameSem) s.push(...frameSem);
    });
    return s;
  }, [activeMicroSteps, semanticMap]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6 relative w-full h-full">

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ARRAY SEMANTIC OVERLAYS                                   */}
      {/* ══════════════════════════════════════════════════════════ */}

      {/* Comparison Overlay (array only) */}
      {comparisonIndices && comparisonIndices.length === 2 && (
        <ComparisonOverlay
          nodeIdA={`array-cell-${comparisonIndices[0]}`}
          nodeIdB={`array-cell-${comparisonIndices[1]}`}
        />
      )}

      {/* Pointer Overlays (array — grouped by index) */}
      {(() => {
        const grouped = {};
        arrayPointers.forEach(p => {
          if (!grouped[p.index]) grouped[p.index] = [];
          grouped[p.index].push(p);
        });
        return Object.entries(grouped).map(([idx, activeP]) => (
          <PointerOverlay key={`arr-ptr-${idx}`} targetNodeId={`array-cell-${idx}`} activePointers={activeP} />
        ));
      })()}

      {/* Mutation Overlays (array) */}
      {arrayMutationEvents.map(m => (
        <MutationOverlay 
          key={`arr-mut-${m.index}`} 
          targetNodeId={`array-cell-${m.index}`} 
          oldValue={m.oldValue} 
          newValue={m.newValue} 
        />
      ))}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* LINKED LIST SEMANTIC OVERLAYS                             */}
      {/* ══════════════════════════════════════════════════════════ */}

      {/* Pointer Overlays (linked list — grouped by target node) */}
      {(() => {
        const grouped = {};
        llPointers.forEach(p => {
          if (!p.target) return;
          const targetId = `ll-node-${p.target}`;
          if (!grouped[targetId]) grouped[targetId] = [];
          grouped[targetId].push(p);
        });
        return Object.entries(grouped).map(([targetId, activeP]) => (
          <PointerOverlay key={`ll-ptr-${targetId}`} targetNodeId={targetId} activePointers={activeP} />
        ));
      })()}

      {/* Mutation Overlay (linked list node value change) */}
      {llMutatingNodeId && (
        <MutationOverlay
          targetNodeId={`ll-node-${llMutatingNodeId}`}
          oldValue="?"
          newValue="→"
        />
      )}

      {/* Rewire Overlay (linked list edge mutation) */}
      {llRewireEvent && (
        <RewireOverlay
          sourceNodeId={llRewireEvent.sourceNodeId}
          oldTargetNodeId={llRewireEvent.oldTargetNodeId}
          newTargetNodeId={llRewireEvent.newTargetNodeId}
        />
      )}

      {/* Semantic Chip Overlay (linked list semantics) */}
      {currentSemantics.length > 0 && (
        <SemanticChipOverlay semantics={currentSemantics} />
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TREE SEMANTIC OVERLAYS                                    */}
      {/* ══════════════════════════════════════════════════════════ */}

      {/* Pointer Overlays (tree — grouped by target node) */}
      {(() => {
        const grouped = {};
        treePointers.forEach(p => {
          if (!p.target) return;
          const targetId = `tree-node-${p.target}`;
          if (!grouped[targetId]) grouped[targetId] = [];
          grouped[targetId].push(p);
        });
        return Object.entries(grouped).map(([targetId, activeP]) => (
          <PointerOverlay key={`tree-ptr-${targetId}`} targetNodeId={targetId} activePointers={activeP} />
        ));
      })()}

      {/* Mutation Overlay (tree node value change) */}
      {treeMutatingNodeId && (
        <MutationOverlay
          targetNodeId={`tree-node-${treeMutatingNodeId}`}
          oldValue="?"
          newValue={treeMutateEvent?.to ?? "?"}
        />
      )}

      {/* Rewire Overlays (tree edge mutations — child reassignment) */}
      {treeRewireEvents.map((re, idx) => (
        <RewireOverlay
          key={`tree-rewire-${idx}`}
          sourceNodeId={re.sourceNodeId}
          oldTargetNodeId={re.oldTargetNodeId}
          newTargetNodeId={re.newTargetNodeId}
        />
      ))}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VARIABLE SEMANTICS LAYER                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <VariableSemanticsLayer 
        stateVars={stateVars} 
        accumulators={accumulators} 
        tempVars={tempVars} 
      />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STRUCTURAL VISUALIZERS                                    */}
      {/* ══════════════════════════════════════════════════════════ */}

      {currentState?.array && (
        <ArrayVisualizer
          currentStep={currentState}
          pointers={arrayPointers}
          executionFocus={arrayExecutionFocus}
        />
      )}

      {currentState?.linkedList && (
        <LinkedListVisualizer
          currentStep={currentState}
          executionFocus={llExecutionFocus}
          mutatingNodeId={llMutatingNodeId}
          mutatingEdgeId={llMutatingEdgeId}
        />
      )}

      {currentState?.tree && (
        <TreeVisualizer
          currentStep={currentState}
          executionFocus={treeExecutionFocus}
          visitedNodes={treeVisitedNodes}
          activeNodeId={treeActiveNodeId}
          mutatingNodeId={treeMutatingNodeId}
          mutatingEdges={treeMutatingEdges}
        />
      )}
    </div>
  );
}