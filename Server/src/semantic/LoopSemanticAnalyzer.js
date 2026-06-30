/**
 * LoopSemanticAnalyzer.js
 *
 * Semantic Analysis Layer for Loop behavior and iteration progression.
 * Operates purely on reconstructed states AFTER trace parsing.
 * NEVER mutates the underlying runtime execution state.
 */

"use strict";

/** Extract all node_* variable bindings from a state frame. */
function getNodePointers(state) {
  const vars = state?.currentFrameVariables || {};
  const result = {};
  for (const [k, descriptor] of Object.entries(vars)) {
    if (descriptor && descriptor.category === "pointer") {
      result[k] = descriptor.value;
    }
  }
  return result;
}

/**
 * analyzeLoopSemantics(states)
 * 
 * Returns a Map of step -> semantics array.
 * Semantics array contains: { type, pointer, ...etc }
 * 
 * Supported semantic types:
 * 1. ITERATION_ADVANCE
 * 2. REGION_PROCESSED
 * 3. REGION_UNPROCESSED
 * 4. POINTER_HANDOFF
 * 5. LOOP_PHASE_TRANSITION
 */
function analyzeLoopSemantics(states) {
  if (!Array.isArray(states) || states.length === 0) return new Map();

  const semanticMap = new Map();

  let currentLoopId = null;
  let activePointersInLoop = new Set();
  
  // Track pointer values to detect handoffs
  let lastPtrs = {};

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const step = state.step;
    const semantics = [];
    const vars = state?.currentFrameVariables || {};
    
    // Look for loop context
    // We assume state engine tracking loops populates state.loopContext somehow
    // Or we will rely purely on pointer movement inside block heuristics.
    
    const ptrs = getNodePointers(state);

    // Detect POINTER_HANDOFF
    if (i > 0) {
        for (const ptrA of Object.keys(ptrs)) {
            for (const ptrB of Object.keys(lastPtrs)) {
                if (ptrA !== ptrB && ptrs[ptrA] === lastPtrs[ptrB] && lastPtrs[ptrA] !== lastPtrs[ptrB] && ptrs[ptrA] !== null) {
                    // A took value of B from last frame (like prev = slow)
                    // Ensure it wasn't a general reset
                    semantics.push({
                        type: "POINTER_HANDOFF",
                        from: ptrB,
                        to: ptrA,
                        nodeId: ptrs[ptrA]
                    });
                }
            }
        }
    }

    // Heuristics for Loop Phase & Regions (like typical Linked List structures)
    
    // Reverse linked list idiom: prev, curr, nextTemp (or next)
    const hasPrev = "prev" in ptrs;
    const hasCurr = "curr" in ptrs || "slow" in ptrs || "head" in ptrs;
    
    if (hasPrev && ptrs["prev"]) {
        semantics.push({
            type: "REGION_PROCESSED",
            pointer: "prev",
            nodeId: ptrs["prev"]
        });
    }

    let activeCurr = ptrs["curr"] || ptrs["slow"];
    if (activeCurr) {
        semantics.push({
            type: "REGION_UNPROCESSED",
            pointer: "curr" in ptrs ? "curr" : "slow",
            nodeId: activeCurr
        });
    }

    // Detect ITERATION_ADVANCE (a pointer moved to its own next)
    // We already track PTR_MOVE event in state.ptrMoveEvent
    if (state.ptrMoveEvent) {
        semantics.push({
            type: "ITERATION_ADVANCE",
            pointer: state.ptrMoveEvent.variable,
            nodeId: state.ptrMoveEvent.nodeId
        });
    }

    lastPtrs = ptrs;
    
    if (semantics.length > 0) {
        semanticMap.set(step, semantics);
    }
  }

  return semanticMap;
}

module.exports = { analyzeLoopSemantics };
