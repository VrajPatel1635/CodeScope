/**
 * PointerRelationshipAnalyzer.js
 *
 * Semantic Interpretation Layer — completely separate from TRACE, parser,
 * and state engine. Analyzes already-reconstructed states to derive
 * pointer relationship semantics without ever mutating execution state.
 *
 * Implemented semantic types (initial set):
 *   TRANSIENT_OVERLAP  — pointers equal for exactly one frame then diverge
 *   STABLE_MEET        — pointers remain equal across consecutive frames
 *   CONVERGING         — list-order distance between pointers decreasing
 *   DIVERGING          — list-order distance increasing
 *   FOLLOWING          — one pointer moves into locations recently vacated by another
 */

"use strict";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
 * Build a traversal-order array of node IDs from the linked list head.
 * Cycle-safe (stops at first revisit). Returns [] when no linked list.
 */
function getLinkedListOrder(state) {
  const ll = state?.linkedList;
  if (!ll || !ll.head || !ll.nodes) return [];

  const order = [];
  const seen = new Set();
  let cur = ll.head;
  while (cur && ll.nodes[cur] && !seen.has(cur)) {
    seen.add(cur);
    order.push(cur);
    cur = ll.nodes[cur].next;
  }
  return order;
}

/**
 * Return the forward distance (index difference) between two node IDs in
 * the traversal order. Returns null when either node is not in the order
 * (e.g. detached chain, cycle entry beyond head, not yet in list).
 */
function getDistance(nodeA, nodeB, order) {
  const ia = order.indexOf(nodeA);
  const ib = order.indexOf(nodeB);
  if (ia === -1 || ib === -1) return null;
  return Math.abs(ia - ib);
}

/**
 * Generate all unique unordered pairs from an array of names.
 * e.g. ["slow","fast","curr"] → [["slow","fast"],["slow","curr"],["fast","curr"]]
 */
function pairs(names) {
  const result = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      result.push([names[i], names[j]]);
    }
  }
  return result;
}

// ── Main analyzer ─────────────────────────────────────────────────────────────

/**
 * analyzePointerSemantics(states)
 *
 * Returns an array parallel to `states` (same length), where each entry is:
 *   { step: <number>, semantics: [ { type, ... } ] }
 *
 * The original `states` array is NEVER modified.
 */
function analyzePointerSemantics(states) {
  if (!Array.isArray(states) || states.length === 0) return [];

  const semanticFrames = [];

  // FOLLOWING tracker: per pointer name, a sliding window of recently
  // occupied node IDs (most-recent last). Window size = 5 frames.
  const recentPositions = {}; // { ptrName: string[] }

  for (let i = 0; i < states.length; i++) {
    const state     = states[i];
    const nextState = states[i + 1] ?? null;
    const prevState = states[i - 1] ?? null;

    const semantics = [];

    const ptrs     = getNodePointers(state);
    const ptrNames = Object.keys(ptrs);

    if (ptrNames.length < 2) {
      // Not enough node pointers to compare — still update FOLLOWING window
      for (const [name, nodeId] of Object.entries(ptrs)) {
        _pushRecent(recentPositions, name, nodeId);
      }
      semanticFrames.push({ step: state.step, semantics });
      continue;
    }

    const order      = getLinkedListOrder(state);
    const nextPtrs   = nextState ? getNodePointers(nextState)  : null;
    const prevPtrs   = prevState ? getNodePointers(prevState)  : null;

    for (const [nameA, nameB] of pairs(ptrNames)) {
      const nodeA = ptrs[nameA];
      const nodeB = ptrs[nameB];

      if (nodeA === nodeB) {
        // ── Overlap branch ────────────────────────────────────────────
        const nextA = nextPtrs?.[nameA];
        const nextB = nextPtrs?.[nameB];

        // Stable if NEXT frame they are still equal (or there is no next frame)
        const stableInNextFrame = !nextA || !nextB || nextA === nextB;

        if (stableInNextFrame) {
          semantics.push({
            type: "STABLE_MEET",
            pointers: [nameA, nameB],
            nodeId: nodeA,
          });
        } else {
          semantics.push({
            type: "TRANSIENT_OVERLAP",
            pointers: [nameA, nameB],
            nodeId: nodeA,
          });
        }
      } else {
        // ── Distance branch ───────────────────────────────────────────
        const dist = getDistance(nodeA, nodeB, order);

        if (dist !== null && prevPtrs) {
          const prevA = prevPtrs[nameA];
          const prevB = prevPtrs[nameB];

          if (prevA && prevB && prevA !== prevB) {
            const prevOrder = getLinkedListOrder(prevState);
            const prevDist  = getDistance(prevA, prevB, prevOrder);

            if (prevDist !== null && prevDist !== dist) {
              if (dist < prevDist) {
                semantics.push({
                  type: "CONVERGING",
                  pointers: [nameA, nameB],
                  distance: dist,
                  prevDistance: prevDist,
                });
              } else {
                semantics.push({
                  type: "DIVERGING",
                  pointers: [nameA, nameB],
                  distance: dist,
                  prevDistance: prevDist,
                });
              }
            }
          }
        }

        // ── FOLLOWING ─────────────────────────────────────────────────
        // Check if B is now at a position recently vacated by A
        const recentA = recentPositions[nameA] ?? [];
        const recentB = recentPositions[nameB] ?? [];

        if (recentA.includes(nodeB) && !recentA.at(-1) === nodeB) {
          // A was recently at nodeB, and B is there now → B follows A
          semantics.push({
            type: "FOLLOWING",
            leader: nameA,
            follower: nameB,
            nodeId: nodeB,
          });
        } else if (recentB.includes(nodeA) && recentB.at(-1) !== nodeA) {
          // B was recently at nodeA, and A is there now → A follows B
          semantics.push({
            type: "FOLLOWING",
            leader: nameB,
            follower: nameA,
            nodeId: nodeA,
          });
        }
      }
    }

    // Update FOLLOWING window for this frame
    for (const [name, nodeId] of Object.entries(ptrs)) {
      _pushRecent(recentPositions, name, nodeId);
    }

    semanticFrames.push({ step: state.step, semantics });
  }

  return semanticFrames;
}

/** Push a node ID into a pointer's recent-position sliding window (max 5). */
function _pushRecent(map, name, nodeId) {
  if (!map[name]) map[name] = [];
  // Avoid duplicate consecutive entries
  if (map[name][map[name].length - 1] !== nodeId) {
    map[name].push(nodeId);
  }
  if (map[name].length > 5) map[name].shift();
}

module.exports = { analyzePointerSemantics };
