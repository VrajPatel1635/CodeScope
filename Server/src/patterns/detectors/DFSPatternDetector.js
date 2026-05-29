"use strict";

function detectDFS(states, semantics) {
    const evidence = [];
    let confidence = "LOW";

    // 1. Check Graph DFS Semantics
    if (semantics.graphSemanticFrames) {
        let hasDescent = false;
        let hasBacktrack = false;
        
        for (const frame of semantics.graphSemanticFrames) {
            for (const sem of (frame.semantics || [])) {
                if (sem.type === "DFS_DESCENT") hasDescent = true;
                if (sem.type === "DFS_BACKTRACK") hasBacktrack = true;
            }
        }
        
        if (hasDescent) {
            evidence.push("Graph DFS_DESCENT observed indicating deep traversal.");
            confidence = "HIGH";
        }
        if (hasBacktrack) {
            evidence.push("Graph DFS_BACKTRACK observed indicating recursive unwind.");
            confidence = "HIGH";
        }
    }

    // 2. Check Tree DFS Semantics
    if (semantics.treeSemanticFrames) {
        let hasInorder = false;
        let hasPostorder = false;
        
        for (const frame of semantics.treeSemanticFrames) {
            for (const sem of (frame.semantics || [])) {
                if (sem.type === "TREE_VISIT" && sem.phase === "INORDER") hasInorder = true;
                if (sem.type === "TREE_VISIT" && sem.phase === "POSTORDER") hasPostorder = true;
            }
        }
        
        if (hasInorder || hasPostorder) {
            evidence.push("Recursive TREE_VISIT phases (INORDER/POSTORDER) observed.");
            confidence = "HIGH";
        }
    }
    
    // 3. Fallback Check CallStack Semantics (recursion depth)
    if (confidence !== "HIGH" && semantics.callStackSemanticFrames) {
        let maxDepth = 0;
        for (const state of states) {
             const depth = (state.callStack || []).length;
             if (depth > maxDepth) maxDepth = depth;
        }
        if (maxDepth >= 4) {
             evidence.push("Deep call stack growth observed (Depth >= 4).");
             confidence = confidence === "LOW" ? "MEDIUM" : confidence;
        }
    }

    if (evidence.length > 0) {
        return {
            type: "DFS_PATTERN",
            confidence,
            evidence
        };
    }

    return null;
}

module.exports = { detectDFS };
