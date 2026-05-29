/**
 * TreeMutationAnalyzer.js
 *
 * Semantic Interpretation Layer — analyzes states to derive Tree mutation
 * semantics (SUBTREE_DETACH, SUBTREE_REATTACH, BRANCH_INVERSION) without
 * mutating the underlying execution state.
 */

"use strict";

function analyzeTreeMutation(states) {
  if (!Array.isArray(states) || states.length === 0) return [];

  const semanticFrames = [];

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const semantics = [];

    if (state.treeMutateEvent) {
      const { node, field, to } = state.treeMutateEvent;

      if (to === "null") {
        semantics.push({
          type: "SUBTREE_DETACH",
          nodeId: node,
          field: field
        });
      } else {
        semantics.push({
          type: "SUBTREE_REATTACH",
          nodeId: node,
          field: field,
          targetNodeId: to
        });
      }

      // We can also infer BRANCH_INVERSION if we see consecutive mutations
      // swapping left and right, but that's complex to track across multiple frames.
      // We will stick to DETACH and REATTACH for foundational Phase D.4 semantics.
    }

    semanticFrames.push({ step: state.step, semantics });
  }

  return semanticFrames;
}

module.exports = { analyzeTreeMutation };
