"use strict";

function detectBFS(states, semantics) {
    const evidence = [];
    let confidence = "LOW";

    let hasQueueProgress = false;
    let hasLevelTransition = false;
    let maxQueueSize = 0;

    for (const state of states) {
        if (state.graph) {
            if (state.graph.traversalOwnership === "BFS") {
                hasQueueProgress = true;
            }
            if (state.graph.queue && state.graph.queue.length > maxQueueSize) {
                maxQueueSize = state.graph.queue.length;
            }
            if (state.graph.level > 0) {
                hasLevelTransition = true;
            }
        }
    }

    if (hasQueueProgress) {
        evidence.push("Queue-driven traversal ownership (BFS) observed.");
        confidence = "HIGH";
    }
    
    if (hasLevelTransition) {
        evidence.push("Iterative level boundaries (BFS_LEVEL_START) observed.");
        confidence = "HIGH";
    }
    
    if (maxQueueSize > 0 && !hasQueueProgress) {
        evidence.push("Queue frontier expansion observed.");
        confidence = confidence === "LOW" ? "MEDIUM" : confidence;
    }

    if (evidence.length > 0) {
        return {
            type: "BFS_PATTERN",
            confidence,
            evidence
        };
    }

    return null;
}

module.exports = { detectBFS };
